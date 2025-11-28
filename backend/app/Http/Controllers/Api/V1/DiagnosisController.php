<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\DiagnosisResource;
use App\Models\Diagnosis;
use App\Models\DiagnosisImage;
use App\Models\DeviceFingerprint;
use App\Services\AIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DiagnosisController extends Controller
{
    protected AIService $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/diagnoses",
     *     summary="List user diagnoses",
     *     tags={"Diagnoses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $diagnoses = $request->user()
            ->diagnoses()
            ->with(['vehicle', 'images'])
            ->latest()
            ->paginate(15);

        return $this->success(DiagnosisResource::collection($diagnoses));
    }

    /**
     * @OA\Post(
     *     path="/api/v1/diagnoses",
     *     summary="Create a new diagnosis",
     *     tags={"Diagnoses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="vehicle_id", type="integer"),
     *             @OA\Property(property="symptoms_description", type="string"),
     *             @OA\Property(property="region_id", type="integer"),
     *             @OA\Property(property="images", type="array", @OA\Items(type="string", format="binary"))
     *         )
     *     ),
     *     @OA\Response(response=201, description="Diagnosis created")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'symptoms_description' => 'required|string|min:10|max:2000',
            'region_id' => 'nullable|exists:regions,id',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg|max:5120',
        ]);

        $user = $request->user();
        $driverProfile = $user->driverProfile;

        // Check diagnosis quota
        if (!$driverProfile->hasDiagnosesRemaining()) {
            return $this->error('You have no diagnoses remaining. Please purchase a package.', 403);
        }

        // Determine if this is a free diagnosis
        $isFree = $driverProfile->free_diagnoses_remaining > 0;

        // Create diagnosis
        $diagnosis = Diagnosis::create([
            'user_id' => $user->id,
            'vehicle_id' => $validated['vehicle_id'] ?? null,
            'input_type' => $request->hasFile('images') ? 'text_image' : 'text',
            'symptoms_description' => $validated['symptoms_description'],
            'region_id' => $validated['region_id'] ?? null,
            'status' => 'processing',
            'is_free' => $isFree,
        ]);

        // Handle image uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('diagnoses/' . $diagnosis->id, 'public');

                DiagnosisImage::create([
                    'diagnosis_id' => $diagnosis->id,
                    'file_path' => $path,
                    'file_name' => $image->getClientOriginalName(),
                    'file_type' => $image->getMimeType(),
                    'file_size' => $image->getSize(),
                    'sort_order' => $index,
                ]);
            }
        }

        // Use diagnosis quota
        $driverProfile->useDiagnosis();

        // Get vehicle info for AI
        $vehicleData = null;
        if ($diagnosis->vehicle) {
            $vehicleData = [
                'make' => $diagnosis->vehicle->make_name,
                'model' => $diagnosis->vehicle->model_name,
                'year' => $diagnosis->vehicle->year,
                'mileage' => $diagnosis->vehicle->mileage,
                'fuel_type' => $diagnosis->vehicle->fuel_type,
            ];
        }

        // Call AI service
        $aiResult = $this->aiService->diagnoseVehicle([
            'vehicle' => $vehicleData,
            'symptoms' => $validated['symptoms_description'],
        ]);

        // Update diagnosis with AI results
        if ($aiResult['success']) {
            $diagnosis->update([
                'status' => 'completed',
                'ai_provider' => $aiResult['provider'],
                'ai_model' => $aiResult['model'],
                'ai_diagnosis' => $aiResult['diagnosis'],
                'ai_possible_causes' => $aiResult['possible_causes'],
                'ai_recommended_actions' => $aiResult['recommended_actions'],
                'ai_urgency_level' => $aiResult['urgency_level'],
                'ai_confidence_score' => $aiResult['confidence_score'],
                'ai_full_response' => $aiResult['full_response'],
            ]);
        } else {
            $diagnosis->update([
                'status' => 'failed',
                'error_message' => $aiResult['error'] ?? 'AI diagnosis failed',
            ]);
        }

        return $this->success(
            new DiagnosisResource($diagnosis->load(['vehicle', 'images'])),
            'Diagnosis created successfully',
            201
        );
    }

    /**
     * @OA\Get(
     *     path="/api/v1/diagnoses/guest/quota",
     *     summary="Check guest diagnosis quota",
     *     tags={"Diagnoses"},
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function guestQuota(Request $request): JsonResponse
    {
        $fingerprint = $request->get('device_fingerprint');

        if (!$fingerprint) {
            return $this->error('Device identification required.', 400);
        }

        $freeLimit = config('app.free_diagnoses_for_guests', 3);
        $remaining = max(0, $freeLimit - $fingerprint->diagnoses_used);

        return $this->success([
            'total_free' => $freeLimit,
            'used' => $fingerprint->diagnoses_used,
            'remaining' => $remaining,
            'can_diagnose' => $remaining > 0,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/diagnoses/guest",
     *     summary="Create a guest diagnosis",
     *     tags={"Diagnoses"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"symptoms_description"},
     *             @OA\Property(property="symptoms_description", type="string")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Diagnosis created")
     * )
     */
    public function guestDiagnosis(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'symptoms_description' => 'required|string|min:10|max:2000',
        ]);

        $fingerprint = $request->get('device_fingerprint');

        if (!$fingerprint) {
            return $this->error('Device identification required.', 400);
        }

        // Check guest diagnosis limit
        $freeLimit = config('app.free_diagnoses_for_guests', 3);
        if ($fingerprint->diagnoses_used >= $freeLimit) {
            return $this->error(
                'You have reached your free diagnosis limit. Please sign up to continue.',
                403,
                ['code' => 'GUEST_LIMIT_REACHED', 'limit' => $freeLimit]
            );
        }

        // Create diagnosis
        $diagnosis = Diagnosis::create([
            'device_fingerprint_id' => $fingerprint->id,
            'input_type' => 'text',
            'symptoms_description' => $validated['symptoms_description'],
            'status' => 'processing',
            'is_free' => true,
        ]);

        // Increment guest usage
        $fingerprint->incrementDiagnosesUsed();

        // Call AI service
        $aiResult = $this->aiService->diagnoseVehicle([
            'symptoms' => $validated['symptoms_description'],
        ]);

        // Update diagnosis
        if ($aiResult['success']) {
            $diagnosis->update([
                'status' => 'completed',
                'ai_provider' => $aiResult['provider'],
                'ai_model' => $aiResult['model'],
                'ai_diagnosis' => $aiResult['diagnosis'],
                'ai_possible_causes' => $aiResult['possible_causes'],
                'ai_recommended_actions' => $aiResult['recommended_actions'],
                'ai_urgency_level' => $aiResult['urgency_level'],
                'ai_confidence_score' => $aiResult['confidence_score'],
                'ai_full_response' => $aiResult['full_response'],
            ]);
        } else {
            $diagnosis->update([
                'status' => 'failed',
                'error_message' => $aiResult['error'] ?? 'AI diagnosis failed',
            ]);
        }

        return $this->success([
            'diagnosis' => new DiagnosisResource($diagnosis),
            'remaining_diagnoses' => $freeLimit - $fingerprint->diagnoses_used,
        ], 'Diagnosis created successfully', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/diagnoses/{id}",
     *     summary="Get diagnosis details",
     *     tags={"Diagnoses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $diagnosis = $request->user()
            ->diagnoses()
            ->with(['vehicle', 'images', 'leads.expert.expertProfile'])
            ->findOrFail($id);

        return $this->success(new DiagnosisResource($diagnosis));
    }

    /**
     * Get matching experts for a diagnosis.
     */
    public function matchingExperts(Request $request, int $id): JsonResponse
    {
        $diagnosis = $request->user()->diagnoses()->findOrFail($id);

        // Find experts based on region and availability
        $experts = \App\Models\User::where('role', 'expert')
            ->whereHas('expertProfile', function ($q) use ($diagnosis) {
                $q->where('is_available', true)
                    ->where('kyc_status', 'approved');

                if ($diagnosis->region_id) {
                    $q->whereHas('serviceRegions', function ($q2) use ($diagnosis) {
                        $q2->where('region_id', $diagnosis->region_id);
                    });
                }
            })
            ->with(['expertProfile.specializations', 'expertProfile.serviceRegions'])
            ->limit(10)
            ->get();

        return $this->success(\App\Http\Resources\ExpertResource::collection($experts));
    }
}
