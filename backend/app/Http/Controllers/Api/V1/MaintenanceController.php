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
    /**
     * Get all maintenance types (system + user's custom types).
     */
    public function types(Request $request): JsonResponse
    {
        $userId = $request->user()?->id;

        $types = MaintenanceType::active()
            ->forUser($userId)
            ->ordered()
            ->get();

        return $this->success($types);
    }

    /**
     * Create a custom maintenance type.
     */
    public function storeType(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:20',
            'default_interval_km' => 'nullable|integer|min:0',
            'default_interval_months' => 'nullable|integer|min:1|max:60',
            'is_critical' => 'boolean',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['is_active'] = true;
        $validated['sort_order'] = MaintenanceType::max('sort_order') + 1;

        $type = MaintenanceType::create($validated);

        return $this->success($type, 'Custom maintenance type created', 201);
    }

    /**
     * Update a custom maintenance type.
     */
    public function updateType(Request $request, int $id): JsonResponse
    {
        $type = MaintenanceType::findOrFail($id);

        // Check if user can edit this type
        if (!$type->canBeEditedBy($request->user()->id)) {
            return $this->error('You cannot edit system maintenance types', 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:20',
            'default_interval_km' => 'nullable|integer|min:0',
            'default_interval_months' => 'nullable|integer|min:1|max:60',
            'is_critical' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $type->update($validated);

        return $this->success($type->fresh(), 'Custom maintenance type updated');
    }

    /**
     * Delete a custom maintenance type.
     */
    public function destroyType(Request $request, int $id): JsonResponse
    {
        $type = MaintenanceType::findOrFail($id);

        // Check if user can delete this type
        if (!$type->canBeDeletedBy($request->user()->id)) {
            return $this->error('You cannot delete system maintenance types', 403);
        }

        // Check if there are reminders using this type
        $remindersCount = $type->reminders()->count();
        if ($remindersCount > 0) {
            return $this->error(
                "Cannot delete this maintenance type. It is being used by {$remindersCount} reminder(s). Please delete or reassign those reminders first.",
                422
            );
        }

        $type->delete();

        return $this->success(null, 'Custom maintenance type deleted');
    }

    public function index(Request $request): JsonResponse
    {
        $reminders = $request->user()
            ->maintenanceReminders()
            ->with(['vehicle.make', 'vehicle.model', 'maintenanceType'])
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
