<x-mail::message>
# Hello {{ $userName }}!

@if($purpose === 'email_verification')
Thank you for signing up with DriveAssist. Please use the following code to verify your email address:
@elseif($purpose === 'password_reset')
You have requested to reset your password. Use the following code to proceed:
@elseif($purpose === 'phone_verification')
Please use the following code to verify your phone number:
@else
Here is your verification code:
@endif

<x-mail::panel>
<div style="text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #3B82F6;">
{{ $otp }}
</div>
</x-mail::panel>

This code will expire in **{{ $expiresInMinutes }} minutes**.

@if($purpose === 'password_reset')
If you did not request a password reset, please ignore this email or contact support if you have concerns.
@endif

**Important:** Never share this code with anyone. DriveAssist staff will never ask for your verification code.

Thanks,<br>
{{ config('app.name') }}

<x-mail::subcopy>
If you're having trouble, please contact our support team.
</x-mail::subcopy>
</x-mail::message>
