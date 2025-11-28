<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\DriverProfile;
use App\Models\ExpertProfile;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed reference data first
        $this->call([
            RegionSeeder::class,
            VehicleMakeSeeder::class,
            SpecializationSeeder::class,
            MaintenanceTypeSeeder::class,
            RoadSignSeeder::class,
            ArticleSeeder::class,
            QuizQuestionSeeder::class,
            PackageSeeder::class,
            VideoResourceSeeder::class,
        ]);

        // Create test users in non-production environments
        if (app()->environment(['local', 'staging', 'testing'])) {
            $this->createTestUsers();
            $this->call([
                ExpertSeeder::class,
            ]);
        }
    }

    /**
     * Create test users for development/testing.
     */
    private function createTestUsers(): void
    {
        // Create Admin User
        $admin = User::updateOrCreate(
            ['email' => 'admin@driveassist.com'],
            [
                'first_name' => 'Admin',
                'last_name' => 'User',
                'phone' => '+233200000000',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'onboarding_completed' => true,
                'email_verified_at' => now(),
            ]
        );

        // Create Test Driver
        $driver = User::updateOrCreate(
            ['email' => 'driver@driveassist.com'],
            [
                'first_name' => 'Test',
                'last_name' => 'Driver',
                'phone' => '+233200000001',
                'password' => Hash::make('password'),
                'role' => 'driver',
                'onboarding_completed' => true,
                'email_verified_at' => now(),
            ]
        );

        // Create driver profile
        DriverProfile::updateOrCreate(
            ['user_id' => $driver->id],
            [
                'region_id' => 1, // Greater Accra
                'city' => 'Accra',
                'free_diagnoses_remaining' => 5,
            ]
        );

        // Create Test Expert
        $expert = User::updateOrCreate(
            ['email' => 'expert@driveassist.com'],
            [
                'first_name' => 'Test',
                'last_name' => 'Expert',
                'phone' => '+233200000002',
                'password' => Hash::make('password'),
                'role' => 'expert',
                'onboarding_completed' => true,
                'email_verified_at' => now(),
            ]
        );

        // Create expert profile
        $expertProfile = ExpertProfile::updateOrCreate(
            ['user_id' => $expert->id],
            [
                'business_name' => 'Test Auto Repairs',
                'bio' => 'Experienced auto mechanic with over 10 years of experience.',
                'region_id' => 1, // Greater Accra
                'city' => 'Accra',
                'address' => '123 Main Street, East Legon',
                'whatsapp_number' => '+233200000002',
                'experience_years' => 10,
                'rating' => 4.5,
                'rating_count' => 25,
                'jobs_completed' => 150,
                'kyc_status' => 'approved',
                'free_leads_remaining' => 4,
                'is_available' => true,
            ]
        );

        // Attach some specializations to expert
        $expertProfile->specializations()->sync([1, 2, 3, 4]); // First 4 specializations
        $expertProfile->serviceRegions()->sync([1, 2]); // Greater Accra, Ashanti
    }
}
