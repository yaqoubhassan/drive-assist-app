<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\KycDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class KycController extends Controller
{
    public function status(Request $request): JsonResponse
    {
        $profile = $request->user()->expertProfile;

        return $this->success([
            'kyc_status' => $profile->kyc_status,
            'kyc_submitted_at' => $profile->kyc_submitted_at,
            'kyc_approved_at' => $profile->kyc_approved_at,
            'kyc_rejection_reason' => $profile->kyc_rejection_reason,
            'documents_count' => $request->user()->kycDocuments()->count(),
            'approved_documents' => $request->user()->kycDocuments()->approved()->count(),
        ]);
    }

    public function documents(Request $request): JsonResponse
    {
        $documents = $request->user()->kycDocuments()->latest()->get();
        return $this->success($documents);
    }

    public function uploadDocument(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'document_type' => 'required|in:national_id,passport,drivers_license,voter_id,business_registration,tax_clearance,professional_certificate,proof_of_address,selfie,other',
            'document_number' => 'nullable|string|max:100',
            'file' => 'required|file|mimes:jpeg,png,jpg,pdf|max:10240',
            'expiry_date' => 'nullable|date|after:today',
        ]);

        $file = $request->file('file');
        $path = $file->store('kyc/' . $request->user()->id, 'private');

        $document = KycDocument::create([
            'user_id' => $request->user()->id,
            'document_type' => $validated['document_type'],
            'document_number' => $validated['document_number'],
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'expiry_date' => $validated['expiry_date'] ?? null,
        ]);

        return $this->success($document, 'Document uploaded', 201);
    }

    public function deleteDocument(Request $request, int $id): JsonResponse
    {
        $document = $request->user()->kycDocuments()->where('status', 'pending')->findOrFail($id);

        Storage::disk('private')->delete($document->file_path);
        $document->delete();

        return $this->success(null, 'Document deleted');
    }

    public function submit(Request $request): JsonResponse
    {
        $profile = $request->user()->expertProfile;

        // Require minimum documents
        $requiredTypes = ['national_id', 'selfie'];
        $uploadedTypes = $request->user()->kycDocuments()->pluck('document_type')->toArray();

        foreach ($requiredTypes as $type) {
            if (!in_array($type, $uploadedTypes)) {
                return $this->error("Please upload your {$type} document.", 422);
            }
        }

        $profile->update([
            'kyc_status' => 'submitted',
            'kyc_submitted_at' => now(),
        ]);

        return $this->success(null, 'KYC documents submitted for review');
    }
}
