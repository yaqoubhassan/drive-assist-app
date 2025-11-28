<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class VerifyOtpRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email', 'exists:users,email'],
            'otp' => ['required', 'string', 'size:6'],
            'type' => ['required', 'in:email_verification,password_reset,phone_verification'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'email.exists' => 'No account found with this email address.',
            'otp.size' => 'OTP must be exactly 6 digits.',
            'type.in' => 'Invalid OTP type.',
        ];
    }
}
