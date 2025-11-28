<?php

use App\Http\Controllers\Api\V1\ArticleController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\BroadcastController;
use App\Http\Controllers\Api\V1\DiagnosisController;
use App\Http\Controllers\Api\V1\ExpertController;
use App\Http\Controllers\Api\V1\KycController;
use App\Http\Controllers\Api\V1\LeadController;
use App\Http\Controllers\Api\V1\MaintenanceController;
use App\Http\Controllers\Api\V1\MessageController;
use App\Http\Controllers\Api\V1\OnboardingController;
use App\Http\Controllers\Api\V1\PackageController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\QuizController;
use App\Http\Controllers\Api\V1\RoadSignController;
use App\Http\Controllers\Api\V1\SettingsController;
use App\Http\Controllers\Api\V1\VehicleController;
use Illuminate\Support\Facades\Route;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group.
|
*/

// API Version 1
Route::prefix('v1')->group(function () {

    // ===========================================
    // Public Routes (No Authentication Required)
    // ===========================================

    // Authentication Routes
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('verify-otp', [AuthController::class, 'verifyOtp']);
        Route::post('reset-password', [AuthController::class, 'resetPassword']);
        Route::post('resend-otp', [AuthController::class, 'resendOtp']);
    });

    // Public Data Routes
    Route::get('regions', [SettingsController::class, 'regions']);
    Route::get('vehicle-makes', [VehicleController::class, 'makes']);
    Route::get('vehicle-makes/{make}/models', [VehicleController::class, 'modelsByMake']);
    Route::get('specializations', [ExpertController::class, 'specializations']);

    // Public Road Signs (for learning)
    Route::prefix('road-signs')->group(function () {
        Route::get('/', [RoadSignController::class, 'index']);
        Route::get('/categories', [RoadSignController::class, 'categories']);
        Route::get('/categories/{slug}', [RoadSignController::class, 'byCategory']);
        Route::get('/{slug}', [RoadSignController::class, 'show']);
    });

    // Public Articles
    Route::prefix('articles')->group(function () {
        Route::get('/', [ArticleController::class, 'index']);
        Route::get('/categories', [ArticleController::class, 'categories']);
        Route::get('/categories/{slug}', [ArticleController::class, 'byCategory']);
        Route::get('/{slug}', [ArticleController::class, 'show']);
    });

    // Public Quiz Routes
    Route::prefix('quiz')->group(function () {
        Route::get('/categories', [QuizController::class, 'categories']);
        Route::get('/questions/{category}', [QuizController::class, 'questions']);
    });

    // Public Packages Info
    Route::get('packages/diagnosis', [PackageController::class, 'diagnosisPackages']);
    Route::get('packages/lead', [PackageController::class, 'leadPackages']);
    Route::get('packages/subscription', [PackageController::class, 'subscriptionPlans']);

    // Maintenance Types
    Route::get('maintenance-types', [MaintenanceController::class, 'types']);

    // Guest Diagnosis (with device tracking)
    Route::middleware(['track.device'])->group(function () {
        Route::post('diagnoses/guest', [DiagnosisController::class, 'guestDiagnosis']);
    });

    // Public Expert Search (for guests to find nearby experts)
    Route::get('experts/nearby', [ExpertController::class, 'nearby']);

    // ===========================================
    // Authenticated Routes
    // ===========================================

    Route::middleware(['auth:sanctum'])->group(function () {

        // Auth Routes (Authenticated)
        Route::prefix('auth')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('logout-all', [AuthController::class, 'logoutAll']);
            Route::put('update-fcm-token', [AuthController::class, 'updateFcmToken']);
        });

        // Profile Routes
        Route::prefix('profile')->group(function () {
            Route::get('/', [ProfileController::class, 'show']);
            Route::put('/', [ProfileController::class, 'update']);
            Route::put('/password', [ProfileController::class, 'updatePassword']);
            Route::post('/avatar', [ProfileController::class, 'updateAvatar']);
            Route::delete('/avatar', [ProfileController::class, 'deleteAvatar']);
        });

        // User Preferences
        Route::prefix('preferences')->group(function () {
            Route::get('/', [ProfileController::class, 'preferences']);
            Route::put('/', [ProfileController::class, 'updatePreferences']);
        });

        // Quiz submission (authenticated)
        Route::post('quiz/submit', [QuizController::class, 'submit']);
        Route::get('quiz/history', [QuizController::class, 'history']);

        // Article Interactions
        Route::post('articles/{id}/like', [ArticleController::class, 'toggleLike']);
        Route::post('articles/{id}/bookmark', [ArticleController::class, 'toggleBookmark']);
        Route::get('articles/bookmarked', [ArticleController::class, 'bookmarked']);

        // ===========================================
        // Broadcasting Authentication
        // ===========================================

        Route::post('broadcasting/auth', [BroadcastController::class, 'authenticate']);

        // ===========================================
        // Messaging Routes (Real-time Chat)
        // ===========================================

        Route::prefix('messages')->group(function () {
            Route::get('/conversations', [MessageController::class, 'conversations']);
            Route::post('/conversations', [MessageController::class, 'getOrCreateConversation']);
            Route::get('/conversations/{id}', [MessageController::class, 'messages']);
            Route::post('/conversations/{id}', [MessageController::class, 'sendMessage']);
            Route::post('/conversations/{id}/read', [MessageController::class, 'markAsRead']);
            Route::post('/conversations/{id}/typing', [MessageController::class, 'typing']);
            Route::get('/unread-count', [MessageController::class, 'unreadCount']);
            Route::delete('/{id}', [MessageController::class, 'deleteMessage']);
        });

        // ===========================================
        // Driver Routes
        // ===========================================

        Route::middleware(['driver'])->group(function () {

            // Driver Onboarding
            Route::prefix('driver/onboarding')->group(function () {
                Route::get('/status', [OnboardingController::class, 'driverStatus']);
                Route::post('/complete', [OnboardingController::class, 'completeDriverOnboarding']);
            });

            // Vehicles
            Route::prefix('vehicles')->group(function () {
                Route::get('/', [VehicleController::class, 'index']);
                Route::post('/', [VehicleController::class, 'store']);
                Route::get('/{id}', [VehicleController::class, 'show']);
                Route::put('/{id}', [VehicleController::class, 'update']);
                Route::delete('/{id}', [VehicleController::class, 'destroy']);
                Route::put('/{id}/primary', [VehicleController::class, 'setPrimary']);
            });

            // Diagnoses (Driver)
            Route::prefix('diagnoses')->group(function () {
                Route::get('/', [DiagnosisController::class, 'index']);
                Route::post('/', [DiagnosisController::class, 'store']);
                Route::get('/{id}', [DiagnosisController::class, 'show']);
                Route::get('/{id}/experts', [DiagnosisController::class, 'matchingExperts']);
            });

            // Maintenance Reminders
            Route::prefix('maintenance')->group(function () {
                Route::get('/reminders', [MaintenanceController::class, 'index']);
                Route::post('/reminders', [MaintenanceController::class, 'store']);
                Route::get('/reminders/{id}', [MaintenanceController::class, 'show']);
                Route::put('/reminders/{id}', [MaintenanceController::class, 'update']);
                Route::delete('/reminders/{id}', [MaintenanceController::class, 'destroy']);
                Route::post('/reminders/{id}/complete', [MaintenanceController::class, 'complete']);
                Route::post('/reminders/{id}/snooze', [MaintenanceController::class, 'snooze']);
                Route::get('/logs', [MaintenanceController::class, 'logs']);
            });

            // Expert Search (for drivers)
            Route::get('experts', [ExpertController::class, 'index']);
            Route::get('experts/{id}', [ExpertController::class, 'show']);

            // Reviews
            Route::post('reviews', [ExpertController::class, 'submitReview']);

            // Driver Package Purchase
            Route::post('packages/diagnosis/purchase', [PackageController::class, 'purchaseDiagnosisPackage']);
        });

        // ===========================================
        // Expert Routes
        // ===========================================

        Route::middleware(['expert'])->group(function () {

            // Expert Onboarding
            Route::prefix('expert/onboarding')->group(function () {
                Route::get('/status', [OnboardingController::class, 'expertStatus']);
                Route::post('/profile', [OnboardingController::class, 'updateExpertProfile']);
                Route::post('/complete', [OnboardingController::class, 'completeExpertOnboarding']);
            });

            // Expert Profile
            Route::prefix('expert/profile')->group(function () {
                Route::get('/', [ExpertController::class, 'myProfile']);
                Route::put('/', [ExpertController::class, 'updateProfile']);
                Route::put('/availability', [ExpertController::class, 'updateAvailability']);
                Route::put('/working-hours', [ExpertController::class, 'updateWorkingHours']);
            });

            // KYC
            Route::prefix('kyc')->group(function () {
                Route::get('/status', [KycController::class, 'status']);
                Route::get('/documents', [KycController::class, 'documents']);
                Route::post('/documents', [KycController::class, 'uploadDocument']);
                Route::delete('/documents/{id}', [KycController::class, 'deleteDocument']);
                Route::post('/submit', [KycController::class, 'submit']);
            });

            // Expert Routes (requires onboarding + KYC)
            Route::middleware(['onboarding.completed', 'kyc.completed'])->group(function () {

                // Leads
                Route::prefix('leads')->group(function () {
                    Route::get('/', [LeadController::class, 'index']);
                    Route::get('/stats', [LeadController::class, 'stats']);
                    Route::get('/{id}', [LeadController::class, 'show']);
                    Route::put('/{id}/view', [LeadController::class, 'markViewed']);
                    Route::put('/{id}/contact', [LeadController::class, 'markContacted']);
                    Route::put('/{id}/convert', [LeadController::class, 'markConverted']);
                    Route::put('/{id}/close', [LeadController::class, 'close']);
                });

                // Reviews received
                Route::get('expert/reviews', [ExpertController::class, 'myReviews']);
                Route::post('expert/reviews/{id}/respond', [ExpertController::class, 'respondToReview']);

                // Expert Package Purchase
                Route::post('packages/lead/purchase', [PackageController::class, 'purchaseLeadPackage']);
                Route::post('packages/subscription/subscribe', [PackageController::class, 'subscribe']);
                Route::post('packages/subscription/cancel', [PackageController::class, 'cancelSubscription']);
            });
        });

        // ===========================================
        // Admin Routes (Future)
        // ===========================================

        Route::middleware(['admin'])->prefix('admin')->group(function () {
            // Admin routes will be added here
            Route::get('/dashboard', function () {
                return response()->json(['message' => 'Admin dashboard']);
            });
        });
    });
});
