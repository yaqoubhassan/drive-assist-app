<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @OA\Schema(
 *     schema="UserPreference",
 *     type="object",
 *     @OA\Property(property="language", type="string", example="en"),
 *     @OA\Property(property="region", type="string", example="GH"),
 *     @OA\Property(property="currency", type="string", example="GHS"),
 *     @OA\Property(property="distance_unit", type="string", example="km"),
 *     @OA\Property(property="push_notifications", type="boolean"),
 *     @OA\Property(property="email_notifications", type="boolean"),
 *     @OA\Property(property="sms_notifications", type="boolean"),
 *     @OA\Property(property="maintenance_reminders", type="boolean"),
 *     @OA\Property(property="marketing_emails", type="boolean"),
 *     @OA\Property(property="theme", type="string", enum={"light","dark","system"})
 * )
 */
class UserPreferenceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'language' => $this->language,
            'region' => $this->region,
            'currency' => $this->currency,
            'distance_unit' => $this->distance_unit,
            'push_notifications' => $this->push_notifications,
            'email_notifications' => $this->email_notifications,
            'sms_notifications' => $this->sms_notifications,
            'maintenance_reminders' => $this->maintenance_reminders,
            'marketing_emails' => $this->marketing_emails,
            'theme' => $this->theme,
        ];
    }
}
