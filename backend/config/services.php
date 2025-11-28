<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | AI Services Configuration
    |--------------------------------------------------------------------------
    |
    | Configure AI service providers for vehicle diagnostics.
    | Supported providers: groq, openai, anthropic
    |
    */

    'ai' => [
        'default_provider' => env('AI_DEFAULT_PROVIDER', 'groq'),

        'groq' => [
            'api_key' => env('GROQ_API_KEY'),
            'api_url' => env('GROQ_API_URL', 'https://api.groq.com/openai/v1/chat/completions'),
            'model' => env('GROQ_MODEL', 'llama-3.3-70b-versatile'),
        ],

        'openai' => [
            'api_key' => env('OPENAI_API_KEY'),
            'api_url' => env('OPENAI_API_URL', 'https://api.openai.com/v1/chat/completions'),
            'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
        ],

        'anthropic' => [
            'api_key' => env('ANTHROPIC_API_KEY'),
            'api_url' => env('ANTHROPIC_API_URL', 'https://api.anthropic.com/v1/messages'),
            'model' => env('ANTHROPIC_MODEL', 'claude-3-5-sonnet-20241022'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Services Configuration
    |--------------------------------------------------------------------------
    |
    | Configure payment providers for subscription and package purchases.
    |
    */

    'paystack' => [
        'public_key' => env('PAYSTACK_PUBLIC_KEY'),
        'secret_key' => env('PAYSTACK_SECRET_KEY'),
        'payment_url' => env('PAYSTACK_PAYMENT_URL', 'https://api.paystack.co'),
        'webhook_secret' => env('PAYSTACK_WEBHOOK_SECRET'),
    ],

];
