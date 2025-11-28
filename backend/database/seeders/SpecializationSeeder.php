<?php

namespace Database\Seeders;

use App\Models\Specialization;
use Illuminate\Database\Seeder;

class SpecializationSeeder extends Seeder
{
    public function run(): void
    {
        $specializations = [
            ['name' => 'Engine Repair', 'icon' => 'engine', 'description' => 'Engine diagnostics, repair, and overhaul'],
            ['name' => 'Transmission', 'icon' => 'transmission', 'description' => 'Manual and automatic transmission repair'],
            ['name' => 'Electrical Systems', 'icon' => 'electrical', 'description' => 'Wiring, alternators, starters, and electronics'],
            ['name' => 'Brake Systems', 'icon' => 'brake', 'description' => 'Brake pads, rotors, calipers, and ABS'],
            ['name' => 'Suspension', 'icon' => 'suspension', 'description' => 'Shocks, struts, and alignment'],
            ['name' => 'Air Conditioning', 'icon' => 'ac', 'description' => 'AC repair, recharge, and maintenance'],
            ['name' => 'Body Work', 'icon' => 'body', 'description' => 'Dent repair, painting, and collision repair'],
            ['name' => 'Oil Change', 'icon' => 'oil', 'description' => 'Oil changes and fluid services'],
            ['name' => 'Tire Services', 'icon' => 'tire', 'description' => 'Tire mounting, balancing, and rotation'],
            ['name' => 'Battery Services', 'icon' => 'battery', 'description' => 'Battery testing, replacement, and charging'],
            ['name' => 'Exhaust Systems', 'icon' => 'exhaust', 'description' => 'Mufflers, catalytic converters, and exhaust pipes'],
            ['name' => 'Fuel Systems', 'icon' => 'fuel', 'description' => 'Fuel pumps, injectors, and filters'],
            ['name' => 'Cooling Systems', 'icon' => 'cooling', 'description' => 'Radiators, thermostats, and water pumps'],
            ['name' => 'Diagnostics', 'icon' => 'diagnostic', 'description' => 'Computer diagnostics and fault code reading'],
            ['name' => 'Hybrid/Electric', 'icon' => 'ev', 'description' => 'Hybrid and electric vehicle specialist'],
            ['name' => 'Welding', 'icon' => 'welding', 'description' => 'Metal fabrication and welding repairs'],
            ['name' => 'Auto Glass', 'icon' => 'glass', 'description' => 'Windshield and window repair/replacement'],
            ['name' => 'Upholstery', 'icon' => 'upholstery', 'description' => 'Interior repair and reupholstering'],
            ['name' => 'Performance Tuning', 'icon' => 'tuning', 'description' => 'Engine tuning and performance upgrades'],
            ['name' => 'Towing', 'icon' => 'towing', 'description' => 'Emergency towing and roadside assistance'],
        ];

        foreach ($specializations as $spec) {
            Specialization::updateOrCreate(
                ['slug' => \Str::slug($spec['name'])],
                $spec
            );
        }
    }
}
