<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Alias middleware for easy use in routes
        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
            'driver' => \App\Http\Middleware\EnsureDriverRole::class,
            'expert' => \App\Http\Middleware\EnsureExpertRole::class,
            'admin' => \App\Http\Middleware\EnsureAdminRole::class,
            'onboarding.completed' => \App\Http\Middleware\EnsureOnboardingCompleted::class,
            'kyc.completed' => \App\Http\Middleware\EnsureKycCompleted::class,
            'track.device' => \App\Http\Middleware\TrackGuestDevice::class,
            'force.json' => \App\Http\Middleware\ForceJsonResponse::class,
        ]);

        // Append to API middleware group
        $middleware->api(prepend: [
            \App\Http\Middleware\ForceJsonResponse::class,
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Handle 404 for API routes
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Resource not found.',
                ], 404);
            }
        });

        // Handle validation exceptions for API
        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'errors' => $e->errors(),
                ], 422);
            }
        });

        // Handle authentication exceptions for API
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.',
                ], 401);
            }
        });
    })->create();
