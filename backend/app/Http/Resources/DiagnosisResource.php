<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @OA\Schema(
 *     schema="Diagnosis",
 *     type="object",
 *     @OA\Property(property="id", type="integer"),
 *     @OA\Property(property="uuid", type="string"),
 *     @OA\Property(property="input_type", type="string"),
 *     @OA\Property(property="symptoms_description", type="string"),
 *     @OA\Property(property="status", type="string"),
 *     @OA\Property(property="ai_diagnosis", type="string"),
 *     @OA\Property(property="ai_possible_causes", type="array", @OA\Items(type="string")),
 *     @OA\Property(property="ai_recommended_actions", type="array", @OA\Items(type="object")),
 *     @OA\Property(property="ai_urgency_level", type="string"),
 *     @OA\Property(property="ai_confidence_score", type="number"),
 *     @OA\Property(property="is_free", type="boolean"),
 *     @OA\Property(property="created_at", type="string", format="date-time")
 * )
 */
class DiagnosisResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'input_type' => $this->input_type,
            'symptoms_description' => $this->symptoms_description,
            'voice_transcription' => $this->voice_transcription,
            'status' => $this->status,
            'ai_diagnosis' => $this->ai_diagnosis,
            'ai_possible_causes' => $this->ai_possible_causes,
            'ai_recommended_actions' => $this->ai_recommended_actions,
            'ai_urgency_level' => $this->ai_urgency_level,
            'urgency_color' => $this->urgency_color,
            'ai_confidence_score' => $this->ai_confidence_score,
            'ai_provider' => $this->ai_provider,
            'is_free' => $this->is_free,
            'expert_contact_unlocked' => $this->expert_contact_unlocked,
            'error_message' => $this->error_message,
            'created_at' => $this->created_at,
            'vehicle' => $this->when($this->relationLoaded('vehicle'), function () {
                return new VehicleResource($this->vehicle);
            }),
            'images' => $this->when($this->relationLoaded('images'), function () {
                return $this->images->map(fn($img) => [
                    'id' => $img->id,
                    'url' => $img->url,
                    'thumbnail_url' => $img->thumbnail_url,
                    'file_name' => $img->file_name,
                ]);
            }),
        ];
    }
}
