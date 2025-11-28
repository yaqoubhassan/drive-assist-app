<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\OtpCode;
use App\Models\UserPreference;
use App\Models\DriverProfile;
use App\Models\ExpertProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/v1/auth/register",
     *     summary="Register a new user",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"first_name","last_name","email","password","password_confirmation","role"},
     *             @OA\Property(property="first_name", type="string", example="John"),
     *             @OA\Property(property="last_name", type="string", example="Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com"),
     *             @OA\Property(property="phone", type="string", example="+233201234567"),
     *             @OA\Property(property="password", type="string", format="password", example="password123"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="password123"),
     *             @OA\Property(property="role", type="string", enum={"driver","expert"}, example="driver")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="User registered successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Registration successful"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="user", ref="#/components/schemas/User"),
     *                 @OA\Property(property="token", type="string")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        // Create user preferences
        UserPreference::createDefaults($user);

        // Create role-specific profile
        if ($user->isDriver()) {
            DriverProfile::create([
                'user_id' => $user->id,
                'free_diagnoses_remaining' => config('app.free_diagnoses_for_drivers', 5),
            ]);
        } elseif ($user->isExpert()) {
            ExpertProfile::create([
                'user_id' => $user->id,
                'free_leads_remaining' => config('app.free_leads_for_experts', 4),
            ]);
        }

        // Generate OTP for email verification
        $otp = OtpCode::generate($user->email, 'email_verification');

        // Log the OTP (since we're not sending actual emails)
        Log::channel('single')->info('Email Verification OTP', [
            'user_id' => $user->id,
            'email' => $user->email,
            'otp' => $otp->code,
            'expires_at' => $otp->expires_at,
        ]);

        // Create auth token
        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'user' => new UserResource($user->load(['driverProfile', 'expertProfile', 'preferences'])),
            'token' => $token,
        ], 'Registration successful. Please verify your email.', 201);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/login",
     *     summary="Login user",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password123"),
     *             @OA\Property(property="device_name", type="string", example="iPhone 15")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Login successful"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="user", ref="#/components/schemas/User"),
     *                 @OA\Property(property="token", type="string")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Invalid credentials")
     * )
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->is_active) {
            return $this->error('Your account has been deactivated. Please contact support.', 403);
        }

        // Revoke existing tokens (optional - for single device login)
        // $user->tokens()->delete();

        $deviceName = $validated['device_name'] ?? 'unknown';
        $token = $user->createToken($deviceName)->plainTextToken;

        return $this->success([
            'user' => new UserResource($user->load(['driverProfile', 'expertProfile', 'preferences', 'vehicles'])),
            'token' => $token,
        ], 'Login successful');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/logout",
     *     summary="Logout user",
     *     tags={"Authentication"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Logout successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Logged out successfully")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function logout(Request $request): JsonResponse
    {
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Logged out successfully');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/logout-all",
     *     summary="Logout from all devices",
     *     tags={"Authentication"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Logged out from all devices",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Logged out from all devices")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return $this->success(null, 'Logged out from all devices');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/auth/me",
     *     summary="Get authenticated user",
     *     tags={"Authentication"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="User data retrieved",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", ref="#/components/schemas/User")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load([
            'driverProfile',
            'expertProfile.specializations',
            'expertProfile.serviceRegions',
            'expertProfile.vehicleMakes',
            'preferences',
            'vehicles',
        ]);

        return $this->success(new UserResource($user));
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/forgot-password",
     *     summary="Request password reset OTP",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email"},
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="OTP sent successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Password reset OTP sent to your email")
     *         )
     *     ),
     *     @OA\Response(response=404, description="User not found")
     * )
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return $this->error('No account found with this email address.', 404);
        }

        // Generate OTP
        $otp = OtpCode::generate($user->email, 'password_reset');

        // Log the OTP (since we're not sending actual emails)
        Log::channel('single')->info('Password Reset OTP', [
            'user_id' => $user->id,
            'email' => $user->email,
            'otp' => $otp->code,
            'expires_at' => $otp->expires_at,
        ]);

        return $this->success(null, 'Password reset OTP has been sent to your email.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/verify-otp",
     *     summary="Verify OTP code",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","otp","type"},
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com"),
     *             @OA\Property(property="otp", type="string", example="123456"),
     *             @OA\Property(property="type", type="string", enum={"email_verification","password_reset"}, example="email_verification")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="OTP verified successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="OTP verified successfully")
     *         )
     *     ),
     *     @OA\Response(response=400, description="Invalid or expired OTP")
     * )
     */
    public function verifyOtp(VerifyOtpRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $isValid = OtpCode::verify($validated['email'], $validated['type'], $validated['otp']);

        if (!$isValid) {
            return $this->error('Invalid or expired OTP code.', 400);
        }

        // If email verification, mark email as verified
        if ($validated['type'] === 'email_verification') {
            $user = User::where('email', $validated['email'])->first();
            if ($user) {
                $user->update(['email_verified_at' => now()]);
            }
        }

        return $this->success(null, 'OTP verified successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/reset-password",
     *     summary="Reset password with OTP",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","otp","password","password_confirmation"},
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com"),
     *             @OA\Property(property="otp", type="string", example="123456"),
     *             @OA\Property(property="password", type="string", format="password", example="newpassword123"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="newpassword123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Password reset successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Password reset successful")
     *         )
     *     ),
     *     @OA\Response(response=400, description="Invalid or expired OTP")
     * )
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Verify OTP first
        $isValid = OtpCode::verify($validated['email'], 'password_reset', $validated['otp']);

        if (!$isValid) {
            return $this->error('Invalid or expired OTP code.', 400);
        }

        // Update password
        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return $this->error('User not found.', 404);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        // Revoke all tokens for security
        $user->tokens()->delete();

        return $this->success(null, 'Password has been reset successfully. Please login with your new password.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/resend-otp",
     *     summary="Resend OTP code",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","type"},
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com"),
     *             @OA\Property(property="type", type="string", enum={"email_verification","password_reset"}, example="email_verification")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="OTP resent successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="OTP has been resent")
     *         )
     *     )
     * )
     */
    public function resendOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'type' => 'required|in:email_verification,password_reset',
        ]);

        $user = User::where('email', $validated['email'])->first();

        // Generate new OTP
        $otp = OtpCode::generate($validated['email'], $validated['type']);

        // Log the OTP
        Log::channel('single')->info('Resend OTP', [
            'user_id' => $user->id,
            'email' => $user->email,
            'type' => $validated['type'],
            'otp' => $otp->code,
            'expires_at' => $otp->expires_at,
        ]);

        return $this->success(null, 'OTP has been resent to your email.');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/auth/update-fcm-token",
     *     summary="Update FCM token for push notifications",
     *     tags={"Authentication"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"fcm_token"},
     *             @OA\Property(property="fcm_token", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="FCM token updated",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="FCM token updated successfully")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function updateFcmToken(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'fcm_token' => 'required|string',
        ]);

        $request->user()->update(['fcm_token' => $validated['fcm_token']]);

        return $this->success(null, 'FCM token updated successfully.');
    }
}
