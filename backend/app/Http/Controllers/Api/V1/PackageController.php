<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DiagnosisPackage;
use App\Models\LeadPackage;
use App\Models\SubscriptionPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    public function diagnosisPackages(): JsonResponse
    {
        $packages = DiagnosisPackage::active()->orderBy('sort_order')->get();
        return $this->success($packages);
    }

    public function leadPackages(): JsonResponse
    {
        $packages = LeadPackage::active()->orderBy('sort_order')->get();
        return $this->success($packages);
    }

    public function subscriptionPlans(): JsonResponse
    {
        $plans = SubscriptionPlan::active()->orderBy('sort_order')->get();
        return $this->success($plans);
    }

    public function purchaseDiagnosisPackage(Request $request): JsonResponse
    {
        // Placeholder - would integrate with payment provider
        return $this->success(null, 'Payment integration pending');
    }

    public function purchaseLeadPackage(Request $request): JsonResponse
    {
        // Placeholder - would integrate with payment provider
        return $this->success(null, 'Payment integration pending');
    }

    public function subscribe(Request $request): JsonResponse
    {
        // Placeholder - would integrate with payment provider
        return $this->success(null, 'Payment integration pending');
    }

    public function cancelSubscription(Request $request): JsonResponse
    {
        // Placeholder
        return $this->success(null, 'Subscription cancellation pending');
    }
}
