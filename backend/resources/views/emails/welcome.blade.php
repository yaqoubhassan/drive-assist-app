<x-mail::message>
# Welcome to DriveAssist, {{ $user->first_name }}!

@if($role === 'driver')
Thank you for joining DriveAssist! You now have access to:

- **AI-Powered Diagnostics:** Get instant help understanding your vehicle issues
- **Expert Network:** Connect with verified mechanics in your area
- **Road Safety Resources:** Access our library of road signs and driving guides
- **Vehicle Management:** Track maintenance and manage your vehicles

You have **5 free diagnoses** to get started. Start by describing any issues you're experiencing with your vehicle!

<x-mail::button :url="config('app.frontend_url') . '/diagnose'">
Start Your First Diagnosis
</x-mail::button>

@elseif($role === 'expert')
Thank you for joining DriveAssist as an expert! Here's what you need to do next:

1. **Complete Your Profile:** Add your business details and specializations
2. **Verify Your Identity:** Submit KYC documents for verification
3. **Start Receiving Leads:** Once verified, you'll receive customer leads

After completing onboarding and KYC verification, you'll receive **4 free leads** to help you get started!

<x-mail::button :url="config('app.frontend_url') . '/expert/onboarding'">
Complete Your Profile
</x-mail::button>

@endif

## Need Help?

Our support team is here to assist you:
- Email: support@driveassist.com
- WhatsApp: +233 XX XXX XXXX

Thanks for choosing DriveAssist!<br>
{{ config('app.name') }}
</x-mail::message>
