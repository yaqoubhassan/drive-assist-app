<?php

namespace Database\Seeders;

use App\Models\MaintenanceType;
use Illuminate\Database\Seeder;

class MaintenanceTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            [
                'name' => 'Oil Change',
                'icon' => 'oil-can',
                'color' => '#F59E0B',
                'description' => 'Regular engine oil and filter replacement',
                'default_interval_km' => 5000,
                'default_interval_months' => 3,
                'is_critical' => false,
            ],
            [
                'name' => 'Tire Rotation',
                'icon' => 'tire',
                'color' => '#3B82F6',
                'description' => 'Rotate tires for even wear',
                'default_interval_km' => 10000,
                'default_interval_months' => 6,
                'is_critical' => false,
            ],
            [
                'name' => 'Brake Inspection',
                'icon' => 'brake-disc',
                'color' => '#EF4444',
                'description' => 'Check brake pads, rotors, and fluid',
                'default_interval_km' => 20000,
                'default_interval_months' => 12,
                'is_critical' => true,
            ],
            [
                'name' => 'Air Filter',
                'icon' => 'air-filter',
                'color' => '#10B981',
                'description' => 'Replace engine air filter',
                'default_interval_km' => 15000,
                'default_interval_months' => 12,
                'is_critical' => false,
            ],
            [
                'name' => 'Coolant Flush',
                'icon' => 'coolant',
                'color' => '#06B6D4',
                'description' => 'Replace engine coolant/antifreeze',
                'default_interval_km' => 50000,
                'default_interval_months' => 24,
                'is_critical' => true,
            ],
            [
                'name' => 'Transmission Fluid',
                'icon' => 'transmission',
                'color' => '#8B5CF6',
                'description' => 'Check and replace transmission fluid',
                'default_interval_km' => 60000,
                'default_interval_months' => 36,
                'is_critical' => true,
            ],
            [
                'name' => 'Spark Plugs',
                'icon' => 'spark-plug',
                'color' => '#F97316',
                'description' => 'Replace spark plugs',
                'default_interval_km' => 40000,
                'default_interval_months' => 36,
                'is_critical' => false,
            ],
            [
                'name' => 'Battery Check',
                'icon' => 'battery',
                'color' => '#FBBF24',
                'description' => 'Test battery and clean terminals',
                'default_interval_km' => null,
                'default_interval_months' => 6,
                'is_critical' => false,
            ],
            [
                'name' => 'Timing Belt',
                'icon' => 'belt',
                'color' => '#DC2626',
                'description' => 'Replace timing belt/chain',
                'default_interval_km' => 100000,
                'default_interval_months' => 60,
                'is_critical' => true,
            ],
            [
                'name' => 'Wheel Alignment',
                'icon' => 'wheel',
                'color' => '#6366F1',
                'description' => 'Check and adjust wheel alignment',
                'default_interval_km' => 20000,
                'default_interval_months' => 12,
                'is_critical' => false,
            ],
            [
                'name' => 'AC Service',
                'icon' => 'snowflake',
                'color' => '#0EA5E9',
                'description' => 'Air conditioning check and recharge',
                'default_interval_km' => null,
                'default_interval_months' => 12,
                'is_critical' => false,
            ],
            [
                'name' => 'Fuel Filter',
                'icon' => 'filter',
                'color' => '#84CC16',
                'description' => 'Replace fuel filter',
                'default_interval_km' => 30000,
                'default_interval_months' => 24,
                'is_critical' => false,
            ],
            [
                'name' => 'Brake Fluid',
                'icon' => 'brake-fluid',
                'color' => '#EC4899',
                'description' => 'Flush and replace brake fluid',
                'default_interval_km' => 40000,
                'default_interval_months' => 24,
                'is_critical' => true,
            ],
            [
                'name' => 'Power Steering Fluid',
                'icon' => 'steering',
                'color' => '#14B8A6',
                'description' => 'Check and replace power steering fluid',
                'default_interval_km' => 50000,
                'default_interval_months' => 36,
                'is_critical' => false,
            ],
            [
                'name' => 'Cabin Air Filter',
                'icon' => 'cabin-filter',
                'color' => '#A3E635',
                'description' => 'Replace cabin air filter',
                'default_interval_km' => 15000,
                'default_interval_months' => 12,
                'is_critical' => false,
            ],
            [
                'name' => 'Insurance Renewal',
                'icon' => 'shield',
                'color' => '#4F46E5',
                'description' => 'Renew vehicle insurance',
                'default_interval_km' => null,
                'default_interval_months' => 12,
                'is_critical' => true,
            ],
            [
                'name' => 'Road Worthy',
                'icon' => 'certificate',
                'color' => '#059669',
                'description' => 'Renew roadworthiness certificate',
                'default_interval_km' => null,
                'default_interval_months' => 12,
                'is_critical' => true,
            ],
        ];

        foreach ($types as $index => $type) {
            MaintenanceType::updateOrCreate(
                ['slug' => \Str::slug($type['name'])],
                array_merge($type, ['sort_order' => $index])
            );
        }
    }
}
