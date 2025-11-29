<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    protected string $provider;
    protected string $apiKey;
    protected string $apiUrl;
    protected string $model;

    public function __construct(?string $provider = null)
    {
        $this->provider = $provider ?? config('services.ai.default_provider', 'groq');
        $this->loadProviderConfig();
    }

    /**
     * Load configuration for the selected provider.
     */
    protected function loadProviderConfig(): void
    {
        $config = match ($this->provider) {
            'groq' => [
                'api_key' => config('services.ai.groq.api_key'),
                'api_url' => config('services.ai.groq.api_url'),
                'model' => config('services.ai.groq.model'),
            ],
            'openai' => [
                'api_key' => config('services.ai.openai.api_key'),
                'api_url' => config('services.ai.openai.api_url'),
                'model' => config('services.ai.openai.model'),
            ],
            'anthropic' => [
                'api_key' => config('services.ai.anthropic.api_key'),
                'api_url' => config('services.ai.anthropic.api_url'),
                'model' => config('services.ai.anthropic.model'),
            ],
            default => throw new \InvalidArgumentException("Unsupported AI provider: {$this->provider}"),
        };

        $this->apiKey = $config['api_key'];
        $this->apiUrl = $config['api_url'];
        $this->model = $config['model'];
    }

    /**
     * Set a specific provider.
     */
    public function useProvider(string $provider): self
    {
        $this->provider = $provider;
        $this->loadProviderConfig();
        return $this;
    }

    /**
     * Diagnose vehicle issues based on symptoms.
     */
    public function diagnoseVehicle(array $data): array
    {
        $prompt = $this->buildDiagnosisPrompt($data);

        try {
            $response = $this->chat($prompt);

            return [
                'success' => true,
                'provider' => $this->provider,
                'model' => $this->model,
                'diagnosis' => $response['diagnosis'] ?? null,
                'possible_causes' => $response['possible_causes'] ?? [],
                'recommended_actions' => $response['recommended_actions'] ?? [],
                'urgency_level' => $response['urgency_level'] ?? 'medium',
                'confidence_score' => $response['confidence_score'] ?? 0.7,
                'full_response' => $response,
            ];
        } catch (\Exception $e) {
            Log::error('AI Diagnosis Error', [
                'provider' => $this->provider,
                'error' => $e->getMessage(),
                'data' => $data,
            ]);

            return [
                'success' => false,
                'provider' => $this->provider,
                'model' => $this->model,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Build the diagnosis prompt.
     */
    protected function buildDiagnosisPrompt(array $data): string
    {
        $vehicleInfo = '';
        if (!empty($data['vehicle'])) {
            $vehicle = $data['vehicle'];
            $vehicleInfo = "Vehicle Information:\n";
            $vehicleInfo .= "- Make: " . ($vehicle['make'] ?? 'Unknown') . "\n";
            $vehicleInfo .= "- Model: " . ($vehicle['model'] ?? 'Unknown') . "\n";
            $vehicleInfo .= "- Year: " . ($vehicle['year'] ?? 'Unknown') . "\n";
            $vehicleInfo .= "- Mileage: " . ($vehicle['mileage'] ?? 'Unknown') . " km\n";
            $vehicleInfo .= "- Fuel Type: " . ($vehicle['fuel_type'] ?? 'Unknown') . "\n";
        }

        $symptoms = $data['symptoms'] ?? 'No symptoms provided';

        $prompt = <<<PROMPT
You are an expert automotive mechanic and diagnostic specialist. Analyze the following vehicle symptoms and provide a detailed diagnosis.

{$vehicleInfo}

Reported Symptoms:
{$symptoms}

Please provide your diagnosis in the following JSON format:
{
    "diagnosis": "A clear, concise summary of the likely issue (2-3 sentences)",
    "possible_causes": [
        "List of possible causes for these symptoms",
        "Most likely cause first",
        "Include 3-5 causes"
    ],
    "recommended_actions": [
        {
            "action": "Specific action to take",
            "priority": "high/medium/low",
            "estimated_cost_range": "GHS X - GHS Y (if applicable)"
        }
    ],
    "urgency_level": "critical/high/medium/low",
    "confidence_score": 0.0 to 1.0,
    "safety_warnings": ["Any immediate safety concerns"],
    "additional_info": "Any other relevant information for the driver"
}

Important guidelines:
- Be specific about potential issues based on the vehicle make/model if provided
- Consider common issues for vehicles in Ghana (dust, heat, road conditions)
- Provide cost estimates in Ghana Cedis (GHS) where applicable
- If the symptoms suggest a critical safety issue, clearly indicate this
- Consider that the driver may be in Ghana where certain parts/services might be harder to find
PROMPT;

        return $prompt;
    }

    /**
     * Send a chat request to the AI provider.
     */
    public function chat(string $prompt, ?string $systemPrompt = null): array
    {
        if ($this->provider === 'anthropic') {
            return $this->chatAnthropic($prompt, $systemPrompt);
        }

        // OpenAI-compatible format (works for Groq and OpenAI)
        return $this->chatOpenAIFormat($prompt, $systemPrompt);
    }

    /**
     * Chat using OpenAI-compatible format (Groq, OpenAI).
     */
    protected function chatOpenAIFormat(string $prompt, ?string $systemPrompt = null): array
    {
        $messages = [];

        if ($systemPrompt) {
            $messages[] = ['role' => 'system', 'content' => $systemPrompt];
        }

        $messages[] = ['role' => 'user', 'content' => $prompt];

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type' => 'application/json',
        ])->timeout(60)->post($this->apiUrl, [
            'model' => $this->model,
            'messages' => $messages,
            'temperature' => 0.7,
            'max_tokens' => 2000,
        ]);

        if (!$response->successful()) {
            throw new \Exception('AI API Error: ' . $response->body());
        }

        $result = $response->json();
        $content = $result['choices'][0]['message']['content'] ?? '';

        // Try to parse JSON from response
        return $this->parseJsonResponse($content);
    }

    /**
     * Chat using Anthropic format.
     */
    protected function chatAnthropic(string $prompt, ?string $systemPrompt = null): array
    {
        $body = [
            'model' => $this->model,
            'max_tokens' => 2000,
            'messages' => [
                ['role' => 'user', 'content' => $prompt],
            ],
        ];

        if ($systemPrompt) {
            $body['system'] = $systemPrompt;
        }

        $response = Http::withHeaders([
            'x-api-key' => $this->apiKey,
            'anthropic-version' => '2023-06-01',
            'Content-Type' => 'application/json',
        ])->timeout(60)->post($this->apiUrl, $body);

        if (!$response->successful()) {
            throw new \Exception('Anthropic API Error: ' . $response->body());
        }

        $result = $response->json();
        $content = $result['content'][0]['text'] ?? '';

        return $this->parseJsonResponse($content);
    }

    /**
     * Parse JSON from AI response.
     */
    protected function parseJsonResponse(string $content): array
    {
        // Try to extract JSON from the response
        if (preg_match('/\{[\s\S]*\}/', $content, $matches)) {
            $json = json_decode($matches[0], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $json;
            }
        }

        // If no valid JSON found, return the raw content
        return ['raw_response' => $content];
    }

    /**
     * Transcribe voice to text using Whisper API.
     * Uses Groq's Whisper API (fast and affordable) or OpenAI's Whisper.
     */
    public function transcribeVoice(string $audioPath): string
    {
        Log::info('Voice transcription requested', ['path' => $audioPath]);

        // Use Groq's Whisper API (faster and more affordable than OpenAI)
        $groqApiKey = config('services.ai.groq.api_key');

        if (!$groqApiKey) {
            // Fallback to OpenAI if Groq key not available
            return $this->transcribeWithOpenAI($audioPath);
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $groqApiKey,
            ])->timeout(120)->attach(
                'file',
                file_get_contents($audioPath),
                basename($audioPath)
            )->post('https://api.groq.com/openai/v1/audio/transcriptions', [
                'model' => 'whisper-large-v3-turbo',
                'language' => 'en',
                'response_format' => 'json',
            ]);

            if (!$response->successful()) {
                Log::error('Groq Whisper transcription failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw new \Exception('Transcription failed: ' . $response->body());
            }

            $result = $response->json();
            $transcription = $result['text'] ?? '';

            Log::info('Voice transcription successful', [
                'length' => strlen($transcription),
            ]);

            return $transcription;
        } catch (\Exception $e) {
            Log::error('Voice transcription error', ['error' => $e->getMessage()]);
            throw new \Exception('Failed to transcribe voice recording: ' . $e->getMessage());
        }
    }

    /**
     * Transcribe using OpenAI's Whisper API as fallback.
     */
    protected function transcribeWithOpenAI(string $audioPath): string
    {
        $openaiApiKey = config('services.ai.openai.api_key');

        if (!$openaiApiKey) {
            throw new \Exception('No API key available for voice transcription');
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $openaiApiKey,
        ])->timeout(120)->attach(
            'file',
            file_get_contents($audioPath),
            basename($audioPath)
        )->post('https://api.openai.com/v1/audio/transcriptions', [
            'model' => 'whisper-1',
            'language' => 'en',
            'response_format' => 'json',
        ]);

        if (!$response->successful()) {
            throw new \Exception('OpenAI transcription failed: ' . $response->body());
        }

        return $response->json()['text'] ?? '';
    }

    /**
     * Analyze image for vehicle issues (placeholder).
     */
    public function analyzeImage(string $imagePath): array
    {
        // This would integrate with a vision AI model
        // For now, return a placeholder
        Log::info('Image analysis requested', ['path' => $imagePath]);

        return [
            'success' => false,
            'message' => 'Image analysis not yet implemented',
        ];
    }
}
