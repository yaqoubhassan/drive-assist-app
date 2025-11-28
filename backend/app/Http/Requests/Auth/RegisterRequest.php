<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
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
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            // Exclude soft-deleted records from uniqueness check
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,NULL,id,deleted_at,NULL'],
            'phone' => ['nullable', 'string', 'max:20', 'unique:users,phone,NULL,id,deleted_at,NULL'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'role' => ['required', 'in:driver,expert'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'email.unique' => 'An account with this email already exists.',
            'phone.unique' => 'An account with this phone number already exists.',
            'role.in' => 'Please select a valid role (driver or expert).',
        ];
    }
}
