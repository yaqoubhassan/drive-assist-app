<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MaintenanceType;
use App\Models\MaintenanceReminder;
use App\Models\MaintenanceLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MaintenanceController extends Controller
{
    public function types(): JsonResponse
    {
        $types = MaintenanceType::active()->ordered()->get();
        return $this->success($types);
    }

    public function index(Request $request): JsonResponse
    {
        $reminders = $request->user()
            ->maintenanceReminders()
            ->with(['vehicle', 'maintenanceType'])
            ->orderByRaw("FIELD(status, 'overdue', 'due', 'upcoming', 'snoozed', 'completed')")
            ->orderBy('due_date')
            ->paginate(20);

        return $this->success($reminders);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'maintenance_type_id' => 'required|exists:maintenance_types,id',
            'custom_title' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'due_date' => 'nullable|date|after:today',
            'due_mileage' => 'nullable|integer|min:0',
            'interval_km' => 'nullable|integer|min:0',
            'interval_months' => 'nullable|integer|min:1|max:60',
            'notifications_enabled' => 'boolean',
            'notification_days' => 'nullable|array',
            'is_recurring' => 'boolean',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['status'] = 'upcoming';

        $reminder = MaintenanceReminder::create($validated);

        return $this->success($reminder->load(['vehicle', 'maintenanceType']), 'Reminder created', 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $reminder = $request->user()->maintenanceReminders()
            ->with(['vehicle', 'maintenanceType', 'logs'])
            ->findOrFail($id);

        return $this->success($reminder);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $reminder = $request->user()->maintenanceReminders()->findOrFail($id);

        $validated = $request->validate([
            'custom_title' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'due_date' => 'nullable|date',
            'due_mileage' => 'nullable|integer|min:0',
            'interval_km' => 'nullable|integer|min:0',
            'interval_months' => 'nullable|integer|min:1|max:60',
            'notifications_enabled' => 'boolean',
            'notification_days' => 'nullable|array',
            'is_recurring' => 'boolean',
        ]);

        $reminder->update($validated);

        return $this->success($reminder->fresh()->load(['vehicle', 'maintenanceType']), 'Reminder updated');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $reminder = $request->user()->maintenanceReminders()->findOrFail($id);
        $reminder->delete();

        return $this->success(null, 'Reminder deleted');
    }

    public function complete(Request $request, int $id): JsonResponse
    {
        $reminder = $request->user()->maintenanceReminders()->findOrFail($id);

        $validated = $request->validate([
            'completed_date' => 'nullable|date|before_or_equal:today',
            'mileage' => 'nullable|integer|min:0',
            'cost' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:5',
            'service_provider' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'parts_replaced' => 'nullable|array',
        ]);

        $log = $reminder->markAsCompleted($validated);

        return $this->success([
            'reminder' => $reminder->fresh()->load(['vehicle', 'maintenanceType']),
            'log' => $log,
        ], 'Maintenance marked as completed');
    }

    public function snooze(Request $request, int $id): JsonResponse
    {
        $reminder = $request->user()->maintenanceReminders()->findOrFail($id);

        $validated = $request->validate([
            'days' => 'nullable|integer|min:1|max:30',
        ]);

        $reminder->snooze($validated['days'] ?? 7);

        return $this->success($reminder->fresh(), 'Reminder snoozed');
    }

    public function logs(Request $request): JsonResponse
    {
        $logs = MaintenanceLog::where('user_id', $request->user()->id)
            ->with(['vehicle', 'maintenanceType'])
            ->latest('completed_date')
            ->paginate(20);

        return $this->success($logs);
    }
}
