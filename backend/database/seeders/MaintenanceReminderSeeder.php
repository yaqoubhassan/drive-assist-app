<?php

namespace Database\Seeders;

use App\Models\MaintenanceReminder;
use App\Models\MaintenanceType;
use App\Models\Vehicle;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class MaintenanceReminderSeeder extends Seeder
{
    public function run(): void
    {
        // Get user with ID 6 (test user)
        $user = User::find(6);

        if (!$user) {
            $this->command->info('User with ID 6 not found. Skipping maintenance reminders seeder.');
            return;
        }

        // Get user's vehicles
        $vehicles = Vehicle::where('user_id', $user->id)->get();

        if ($vehicles->isEmpty()) {
            $this->command->info('No vehicles found for user ID 6. Skipping maintenance reminders seeder.');
            return;
        }

        // Get maintenance types
        $maintenanceTypes = MaintenanceType::all()->keyBy('slug');

        if ($maintenanceTypes->isEmpty()) {
            $this->command->info('No maintenance types found. Please run MaintenanceTypeSeeder first.');
            return;
        }

        // Clear existing reminders for this user
        MaintenanceReminder::where('user_id', $user->id)->forceDelete();

        $today = Carbon::today();

        foreach ($vehicles as $vehicle) {
            $vehicleMileage = $vehicle->mileage ?? 45000;

            // Oil Change - Overdue (past due date)
            $this->createReminder($user, $vehicle, $maintenanceTypes['oil-change'], [
                'due_date' => $today->copy()->subDays(15),
                'due_mileage' => $vehicleMileage - 500,
                'last_completed_date' => $today->copy()->subMonths(4),
                'last_completed_mileage' => $vehicleMileage - 5500,
                'last_completed_cost' => 150.00,
                'interval_km' => 5000,
                'interval_months' => 3,
                'status' => 'overdue',
            ]);

            // Tire Rotation - Due Soon (within 7 days)
            $this->createReminder($user, $vehicle, $maintenanceTypes['tire-rotation'], [
                'due_date' => $today->copy()->addDays(5),
                'due_mileage' => $vehicleMileage + 1000,
                'last_completed_date' => $today->copy()->subMonths(5),
                'last_completed_mileage' => $vehicleMileage - 9000,
                'last_completed_cost' => 80.00,
                'interval_km' => 10000,
                'interval_months' => 6,
                'status' => 'due',
            ]);

            // Brake Inspection - Due (today or past)
            $this->createReminder($user, $vehicle, $maintenanceTypes['brake-inspection'], [
                'due_date' => $today,
                'due_mileage' => $vehicleMileage,
                'last_completed_date' => $today->copy()->subMonths(11),
                'last_completed_mileage' => $vehicleMileage - 18000,
                'last_completed_cost' => 250.00,
                'interval_km' => 20000,
                'interval_months' => 12,
                'status' => 'due',
            ]);

            // Air Filter - Upcoming (more than 7 days)
            $this->createReminder($user, $vehicle, $maintenanceTypes['air-filter'], [
                'due_date' => $today->copy()->addDays(45),
                'due_mileage' => $vehicleMileage + 5000,
                'last_completed_date' => $today->copy()->subMonths(10),
                'last_completed_mileage' => $vehicleMileage - 10000,
                'last_completed_cost' => 45.00,
                'interval_km' => 15000,
                'interval_months' => 12,
                'status' => 'upcoming',
            ]);

            // Battery Check - Upcoming
            $this->createReminder($user, $vehicle, $maintenanceTypes['battery-check'], [
                'due_date' => $today->copy()->addMonths(2),
                'due_mileage' => null,
                'last_completed_date' => $today->copy()->subMonths(4),
                'last_completed_mileage' => $vehicleMileage - 8000,
                'last_completed_cost' => 30.00,
                'interval_km' => null,
                'interval_months' => 6,
                'status' => 'upcoming',
            ]);

            // Insurance Renewal - Due Soon
            $this->createReminder($user, $vehicle, $maintenanceTypes['insurance-renewal'], [
                'due_date' => $today->copy()->addDays(10),
                'due_mileage' => null,
                'last_completed_date' => $today->copy()->subMonths(11)->subDays(20),
                'last_completed_mileage' => null,
                'last_completed_cost' => 1200.00,
                'interval_km' => null,
                'interval_months' => 12,
                'status' => 'due',
                'notes' => 'Comprehensive insurance with Star Assurance',
            ]);

            // Road Worthy - Upcoming
            $this->createReminder($user, $vehicle, $maintenanceTypes['road-worthy'], [
                'due_date' => $today->copy()->addMonths(3),
                'due_mileage' => null,
                'last_completed_date' => $today->copy()->subMonths(9),
                'last_completed_mileage' => null,
                'last_completed_cost' => 85.00,
                'interval_km' => null,
                'interval_months' => 12,
                'status' => 'upcoming',
            ]);

            // Coolant Flush - Upcoming (far out)
            $this->createReminder($user, $vehicle, $maintenanceTypes['coolant-flush'], [
                'due_date' => $today->copy()->addMonths(8),
                'due_mileage' => $vehicleMileage + 20000,
                'last_completed_date' => $today->copy()->subMonths(16),
                'last_completed_mileage' => $vehicleMileage - 30000,
                'last_completed_cost' => 120.00,
                'interval_km' => 50000,
                'interval_months' => 24,
                'status' => 'upcoming',
            ]);

            // Only add reminders to the first vehicle
            break;
        }

        $this->command->info('Maintenance reminders created for user ID 6.');
    }

    private function createReminder(
        User $user,
        Vehicle $vehicle,
        ?MaintenanceType $type,
        array $data
    ): ?MaintenanceReminder {
        if (!$type) {
            return null;
        }

        return MaintenanceReminder::create([
            'user_id' => $user->id,
            'vehicle_id' => $vehicle->id,
            'maintenance_type_id' => $type->id,
            'custom_title' => null,
            'notes' => $data['notes'] ?? null,
            'due_date' => $data['due_date'],
            'due_mileage' => $data['due_mileage'],
            'interval_km' => $data['interval_km'] ?? $type->default_interval_km,
            'interval_months' => $data['interval_months'] ?? $type->default_interval_months,
            'last_completed_date' => $data['last_completed_date'],
            'last_completed_mileage' => $data['last_completed_mileage'],
            'last_completed_cost' => $data['last_completed_cost'],
            'currency' => 'GHS',
            'status' => $data['status'],
            'notifications_enabled' => true,
            'notification_days' => [7, 3, 1],
            'is_recurring' => true,
        ]);
    }
}
