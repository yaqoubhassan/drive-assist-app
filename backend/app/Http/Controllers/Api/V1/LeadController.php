<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Lead::forExpert($request->user()->id)->with(['diagnosis.vehicle', 'driver']);

        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        $leads = $query->latest()->paginate(15);

        return $this->success($leads);
    }

    public function stats(Request $request): JsonResponse
    {
        $expertId = $request->user()->id;

        $stats = [
            'total' => Lead::forExpert($expertId)->count(),
            'new' => Lead::forExpert($expertId)->new()->count(),
            'viewed' => Lead::forExpert($expertId)->where('status', 'viewed')->count(),
            'contacted' => Lead::forExpert($expertId)->where('status', 'contacted')->count(),
            'converted' => Lead::forExpert($expertId)->where('status', 'converted')->count(),
            'this_month' => Lead::forExpert($expertId)->whereMonth('created_at', now()->month)->count(),
        ];

        return $this->success($stats);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $lead = Lead::forExpert($request->user()->id)
            ->with(['diagnosis.vehicle', 'diagnosis.images', 'driver', 'activities', 'review'])
            ->findOrFail($id);

        return $this->success($lead);
    }

    public function markViewed(Request $request, int $id): JsonResponse
    {
        $lead = Lead::forExpert($request->user()->id)->findOrFail($id);
        $lead->markAsViewed();
        return $this->success($lead->fresh(), 'Lead marked as viewed');
    }

    public function markContacted(Request $request, int $id): JsonResponse
    {
        $lead = Lead::forExpert($request->user()->id)->findOrFail($id);
        $lead->markAsContacted();
        return $this->success($lead->fresh(), 'Lead marked as contacted');
    }

    public function markConverted(Request $request, int $id): JsonResponse
    {
        $lead = Lead::forExpert($request->user()->id)->findOrFail($id);
        $lead->markAsConverted();
        return $this->success($lead->fresh(), 'Lead marked as converted');
    }

    public function close(Request $request, int $id): JsonResponse
    {
        $lead = Lead::forExpert($request->user()->id)->findOrFail($id);
        $validated = $request->validate(['reason' => 'nullable|string|max:500']);
        $lead->markAsClosed($validated['reason'] ?? null);
        return $this->success($lead->fresh(), 'Lead closed');
    }
}
