<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\AppointmentService;
use App\Models\ServicePackage;
use App\Models\ExpertProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AppointmentController extends Controller
{
    /**
     * List driver's appointments.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Appointment::forDriver($user->id)
            ->with(['expert', 'expertProfile', 'vehicle', 'services', 'diagnosis']);

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'upcoming') {
                $query->upcoming();
            } elseif ($request->status === 'past') {
                $query->past();
            } elseif ($request->status === 'active') {
                $query->active();
            } else {
                $query->where('status', $request->status);
            }
        }

        $appointments = $query->orderBy('scheduled_date', 'desc')
            ->orderBy('scheduled_time', 'desc')
            ->paginate(15);

        return $this->success([
            'data' => $appointments->map(fn($apt) => $this->formatAppointment($apt)),
            'current_page' => $appointments->currentPage(),
            'last_page' => $appointments->lastPage(),
            'total' => $appointments->total(),
        ]);
    }

    /**
     * Get appointment details.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $appointment = Appointment::with(['expert', 'expertProfile', 'vehicle', 'services.servicePackage', 'diagnosis'])
            ->where(function ($q) use ($user) {
                $q->where('driver_id', $user->id)
                    ->orWhere('expert_id', $user->id);
            })
            ->findOrFail($id);

        return $this->success($this->formatAppointment($appointment, true));
    }

    /**
     * Create a new appointment (driver only).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'expert_id' => 'required|exists:users,id',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'diagnosis_id' => 'nullable|exists:diagnoses,id',
            'scheduled_date' => 'required|date|after_or_equal:today',
            'scheduled_time' => 'required|date_format:H:i',
            'service_type' => ['required', Rule::in(['diagnostic', 'repair', 'maintenance', 'inspection'])],
            'description' => 'nullable|string|max:1000',
            'notes' => 'nullable|string|max:500',
            'location_type' => ['nullable', Rule::in(['expert_shop', 'driver_location'])],
            'address' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'service_package_ids' => 'nullable|array',
            'service_package_ids.*' => 'exists:service_packages,id',
        ]);

        $user = $request->user();

        // Verify expert exists and is active
        $expertProfile = ExpertProfile::where('user_id', $validated['expert_id'])
            ->where('is_available', true)
            ->first();

        if (!$expertProfile) {
            return $this->error('Expert is not available', 400);
        }

        // Check for conflicting appointments
        $conflict = Appointment::where('expert_id', $validated['expert_id'])
            ->where('scheduled_date', $validated['scheduled_date'])
            ->where('scheduled_time', $validated['scheduled_time'])
            ->whereIn('status', [Appointment::STATUS_PENDING, Appointment::STATUS_CONFIRMED])
            ->exists();

        if ($conflict) {
            return $this->error('This time slot is not available', 400);
        }

        DB::beginTransaction();
        try {
            // Calculate estimated cost from service packages
            $estimatedCost = 0;
            $estimatedDuration = 60;

            if (!empty($validated['service_package_ids'])) {
                $packages = ServicePackage::whereIn('id', $validated['service_package_ids'])
                    ->where('expert_id', $validated['expert_id'])
                    ->get();

                $estimatedCost = $packages->sum('price');
                $estimatedDuration = $packages->sum('duration_minutes') ?: 60;
            }

            // Create appointment
            $appointment = Appointment::create([
                'driver_id' => $user->id,
                'expert_id' => $validated['expert_id'],
                'vehicle_id' => $validated['vehicle_id'] ?? null,
                'diagnosis_id' => $validated['diagnosis_id'] ?? null,
                'scheduled_date' => $validated['scheduled_date'],
                'scheduled_time' => $validated['scheduled_time'],
                'estimated_duration_minutes' => $estimatedDuration,
                'service_type' => $validated['service_type'],
                'description' => $validated['description'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'location_type' => $validated['location_type'] ?? 'expert_shop',
                'address' => $validated['address'] ?? $expertProfile->address,
                'latitude' => $validated['latitude'] ?? $expertProfile->latitude,
                'longitude' => $validated['longitude'] ?? $expertProfile->longitude,
                'status' => Appointment::STATUS_PENDING,
                'estimated_cost' => $estimatedCost,
            ]);

            // Add service line items
            if (!empty($validated['service_package_ids'])) {
                foreach ($packages as $package) {
                    AppointmentService::create([
                        'appointment_id' => $appointment->id,
                        'service_package_id' => $package->id,
                        'service_name' => $package->name,
                        'price' => $package->price,
                        'quantity' => 1,
                    ]);
                }
            }

            DB::commit();

            // TODO: Send notification to expert

            $appointment->load(['expert', 'expertProfile', 'vehicle', 'services']);

            return $this->success(
                $this->formatAppointment($appointment, true),
                'Appointment booked successfully. Awaiting expert confirmation.',
                201
            );
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to create appointment: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Cancel an appointment (driver).
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        $appointment = Appointment::where('driver_id', $user->id)
            ->findOrFail($id);

        if (!$appointment->canBeCancelled()) {
            return $this->error('This appointment cannot be cancelled', 400);
        }

        $appointment->cancel(
            $validated['reason'] ?? 'Cancelled by driver',
            'driver'
        );

        // TODO: Send notification to expert

        return $this->success(
            $this->formatAppointment($appointment->fresh()),
            'Appointment cancelled successfully'
        );
    }

    /**
     * Reschedule an appointment (driver).
     */
    public function reschedule(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'scheduled_date' => 'required|date|after_or_equal:today',
            'scheduled_time' => 'required|date_format:H:i',
        ]);

        $user = $request->user();

        $appointment = Appointment::where('driver_id', $user->id)
            ->findOrFail($id);

        if (!$appointment->canBeCancelled()) {
            return $this->error('This appointment cannot be rescheduled', 400);
        }

        // Check for conflicts
        $conflict = Appointment::where('expert_id', $appointment->expert_id)
            ->where('id', '!=', $appointment->id)
            ->where('scheduled_date', $validated['scheduled_date'])
            ->where('scheduled_time', $validated['scheduled_time'])
            ->whereIn('status', [Appointment::STATUS_PENDING, Appointment::STATUS_CONFIRMED])
            ->exists();

        if ($conflict) {
            return $this->error('This time slot is not available', 400);
        }

        $appointment->update([
            'scheduled_date' => $validated['scheduled_date'],
            'scheduled_time' => $validated['scheduled_time'],
            'status' => Appointment::STATUS_PENDING, // Reset to pending for re-confirmation
        ]);

        // TODO: Send notification to expert

        return $this->success(
            $this->formatAppointment($appointment->fresh()),
            'Appointment rescheduled successfully'
        );
    }

    /**
     * Get upcoming appointments count.
     */
    public function upcomingCount(Request $request): JsonResponse
    {
        $user = $request->user();

        $count = Appointment::forDriver($user->id)
            ->upcoming()
            ->count();

        return $this->success(['count' => $count]);
    }

    // ==================== Expert Endpoints ====================

    /**
     * List expert's appointments.
     */
    public function expertIndex(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Appointment::forExpert($user->id)
            ->with(['driver', 'vehicle', 'services', 'diagnosis']);

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'upcoming') {
                $query->upcoming();
            } elseif ($request->status === 'past') {
                $query->past();
            } elseif ($request->status === 'active') {
                $query->active();
            } else {
                $query->where('status', $request->status);
            }
        }

        $appointments = $query->orderBy('scheduled_date', 'asc')
            ->orderBy('scheduled_time', 'asc')
            ->paginate(15);

        return $this->success([
            'data' => $appointments->map(fn($apt) => $this->formatAppointmentForExpert($apt)),
            'current_page' => $appointments->currentPage(),
            'last_page' => $appointments->lastPage(),
            'total' => $appointments->total(),
        ]);
    }

    /**
     * Confirm an appointment (expert).
     */
    public function confirm(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $appointment = Appointment::where('expert_id', $user->id)
            ->findOrFail($id);

        if (!$appointment->confirm()) {
            return $this->error('This appointment cannot be confirmed', 400);
        }

        // TODO: Send notification to driver

        return $this->success(
            $this->formatAppointmentForExpert($appointment->fresh()),
            'Appointment confirmed'
        );
    }

    /**
     * Reject an appointment (expert).
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $user = $request->user();

        $appointment = Appointment::where('expert_id', $user->id)
            ->findOrFail($id);

        if (!$appointment->reject($validated['reason'])) {
            return $this->error('This appointment cannot be rejected', 400);
        }

        // TODO: Send notification to driver

        return $this->success(
            $this->formatAppointmentForExpert($appointment->fresh()),
            'Appointment rejected'
        );
    }

    /**
     * Start service (expert).
     */
    public function start(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $appointment = Appointment::where('expert_id', $user->id)
            ->findOrFail($id);

        if (!$appointment->start()) {
            return $this->error('This appointment cannot be started', 400);
        }

        // TODO: Send notification to driver

        return $this->success(
            $this->formatAppointmentForExpert($appointment->fresh()),
            'Service started'
        );
    }

    /**
     * Complete service (expert).
     */
    public function complete(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'final_cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();

        $appointment = Appointment::where('expert_id', $user->id)
            ->findOrFail($id);

        if (!$appointment->canBeCompleted()) {
            return $this->error('This appointment cannot be completed', 400);
        }

        $appointment->complete($validated['final_cost'] ?? null);

        if (isset($validated['notes'])) {
            $appointment->update(['notes' => $validated['notes']]);
        }

        // TODO: Send notification to driver
        // TODO: Create maintenance log if applicable

        return $this->success(
            $this->formatAppointmentForExpert($appointment->fresh()),
            'Service completed'
        );
    }

    /**
     * Format appointment for driver response.
     */
    private function formatAppointment(Appointment $appointment, bool $detailed = false): array
    {
        $data = [
            'id' => $appointment->id,
            'status' => $appointment->status,
            'scheduled_date' => $appointment->scheduled_date->format('Y-m-d'),
            'scheduled_time' => $appointment->scheduled_time->format('H:i'),
            'service_type' => $appointment->service_type,
            'estimated_duration_minutes' => $appointment->estimated_duration_minutes,
            'location_type' => $appointment->location_type,
            'estimated_cost' => $appointment->estimated_cost,
            'final_cost' => $appointment->final_cost,
            'currency' => $appointment->currency,
            'payment_status' => $appointment->payment_status,
            'expert' => $appointment->expert ? [
                'id' => $appointment->expert->id,
                'full_name' => $appointment->expert->full_name,
                'avatar' => $appointment->expert->avatar_url,
            ] : null,
            'expert_profile' => $appointment->expertProfile ? [
                'business_name' => $appointment->expertProfile->business_name,
                'rating' => $appointment->expertProfile->rating,
                'address' => $appointment->expertProfile->address,
                'city' => $appointment->expertProfile->city,
                'phone' => $appointment->expertProfile->whatsapp_number,
            ] : null,
            'vehicle' => $appointment->vehicle ? [
                'id' => $appointment->vehicle->id,
                'display_name' => $appointment->vehicle->display_name,
                'make' => $appointment->vehicle->make?->name,
                'model' => $appointment->vehicle->model,
                'year' => $appointment->vehicle->year,
            ] : null,
            'created_at' => $appointment->created_at->toIso8601String(),
        ];

        if ($detailed) {
            $data['description'] = $appointment->description;
            $data['notes'] = $appointment->notes;
            $data['address'] = $appointment->address;
            $data['latitude'] = $appointment->latitude;
            $data['longitude'] = $appointment->longitude;
            $data['confirmed_at'] = $appointment->confirmed_at?->toIso8601String();
            $data['started_at'] = $appointment->started_at?->toIso8601String();
            $data['completed_at'] = $appointment->completed_at?->toIso8601String();
            $data['cancelled_at'] = $appointment->cancelled_at?->toIso8601String();
            $data['cancellation_reason'] = $appointment->cancellation_reason;
            $data['services'] = $appointment->services->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->service_name,
                'price' => $s->price,
                'quantity' => $s->quantity,
                'total' => $s->total_price,
            ]);
            $data['diagnosis'] = $appointment->diagnosis ? [
                'id' => $appointment->diagnosis->id,
                'title' => $appointment->diagnosis->ai_diagnosis['title'] ?? 'Diagnosis',
                'urgency' => $appointment->diagnosis->urgency,
            ] : null;
        }

        return $data;
    }

    /**
     * Format appointment for expert response.
     */
    private function formatAppointmentForExpert(Appointment $appointment): array
    {
        return [
            'id' => $appointment->id,
            'status' => $appointment->status,
            'scheduled_date' => $appointment->scheduled_date->format('Y-m-d'),
            'scheduled_time' => $appointment->scheduled_time->format('H:i'),
            'service_type' => $appointment->service_type,
            'description' => $appointment->description,
            'estimated_duration_minutes' => $appointment->estimated_duration_minutes,
            'location_type' => $appointment->location_type,
            'address' => $appointment->address,
            'estimated_cost' => $appointment->estimated_cost,
            'final_cost' => $appointment->final_cost,
            'currency' => $appointment->currency,
            'payment_status' => $appointment->payment_status,
            'driver' => $appointment->driver ? [
                'id' => $appointment->driver->id,
                'full_name' => $appointment->driver->full_name,
                'avatar' => $appointment->driver->avatar_url,
                'phone' => $appointment->driver->phone,
            ] : null,
            'vehicle' => $appointment->vehicle ? [
                'id' => $appointment->vehicle->id,
                'display_name' => $appointment->vehicle->display_name,
                'make' => $appointment->vehicle->make?->name,
                'model' => $appointment->vehicle->model,
                'year' => $appointment->vehicle->year,
                'mileage' => $appointment->vehicle->mileage,
            ] : null,
            'diagnosis' => $appointment->diagnosis ? [
                'id' => $appointment->diagnosis->id,
                'category' => $appointment->diagnosis->category,
                'symptoms' => $appointment->diagnosis->symptoms,
                'ai_diagnosis' => $appointment->diagnosis->ai_diagnosis,
            ] : null,
            'services' => $appointment->services->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->service_name,
                'price' => $s->price,
                'quantity' => $s->quantity,
            ]),
            'confirmed_at' => $appointment->confirmed_at?->toIso8601String(),
            'started_at' => $appointment->started_at?->toIso8601String(),
            'completed_at' => $appointment->completed_at?->toIso8601String(),
            'created_at' => $appointment->created_at->toIso8601String(),
        ];
    }
}
