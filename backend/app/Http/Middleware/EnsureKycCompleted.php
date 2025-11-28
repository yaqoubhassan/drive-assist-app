<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureKycCompleted
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Only check KYC for experts
        if ($request->user()->isExpert()) {
            $expertProfile = $request->user()->expertProfile;

            if (!$expertProfile || $expertProfile->kyc_status !== 'approved') {
                return response()->json([
                    'success' => false,
                    'message' => 'Please complete your KYC verification first.',
                    'code' => 'KYC_REQUIRED',
                    'kyc_status' => $expertProfile?->kyc_status ?? 'pending',
                ], 403);
            }
        }

        return $next($request);
    }
}
