<?php

namespace App\Jobs;

use App\Models\Diagnosis;
use App\Services\AIService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessDiagnosisJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public Diagnosis $diagnosis;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 30;

    /**
     * Create a new job instance.
     */
    public function __construct(Diagnosis $diagnosis)
    {
        $this->diagnosis = $diagnosis;
    }

    /**
     * Execute the job.
     */
    public function handle(AIService $aiService): void
    {
        Log::info('Processing diagnosis', ['diagnosis_id' => $this->diagnosis->id]);

        try {
            // Update status to processing
            $this->diagnosis->update(['status' => 'processing']);

            // Get vehicle info if available
            $vehicleInfo = null;
            if ($this->diagnosis->vehicle) {
                $vehicle = $this->diagnosis->vehicle;
                $vehicleInfo = [
                    'make' => $vehicle->make?->name,
                    'model' => $vehicle->model?->name,
                    'year' => $vehicle->year,
                    'mileage' => $vehicle->mileage,
                ];
            }

            // Perform AI diagnosis
            $result = $aiService->diagnoseVehicle(
                $this->diagnosis->symptoms,
                $vehicleInfo
            );

            // Update diagnosis with AI response
            $this->diagnosis->update([
                'ai_response' => $result['diagnosis'] ?? $result,
                'possible_causes' => $result['possible_causes'] ?? [],
                'recommended_actions' => $result['recommended_actions'] ?? [],
                'urgency_level' => $result['urgency_level'] ?? 'medium',
                'estimated_cost_range' => $result['estimated_cost_range'] ?? null,
                'status' => 'completed',
                'processed_at' => now(),
            ]);

            Log::info('Diagnosis completed', [
                'diagnosis_id' => $this->diagnosis->id,
                'urgency' => $result['urgency_level'] ?? 'medium',
            ]);

        } catch (\Exception $e) {
            Log::error('Diagnosis processing failed', [
                'diagnosis_id' => $this->diagnosis->id,
                'error' => $e->getMessage(),
            ]);

            $this->diagnosis->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Diagnosis job failed permanently', [
            'diagnosis_id' => $this->diagnosis->id,
            'error' => $exception->getMessage(),
        ]);

        $this->diagnosis->update([
            'status' => 'failed',
            'error_message' => 'Processing failed after multiple attempts: ' . $exception->getMessage(),
        ]);
    }
}
