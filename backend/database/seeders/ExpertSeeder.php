<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\ExpertProfile;
use App\Models\Region;
use App\Models\Specialization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ExpertSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates 10 test experts at different locations around Accra, Ghana
     * for testing location-based expert search functionality.
     *
     * User's test location: Lat 5.5545, Lng -0.1902
     */
    public function run(): void
    {
        $greaterAccraRegion = Region::where('code', 'GAR')->first();
        $ashantiRegion = Region::where('code', 'ASH')->first();

        if (!$greaterAccraRegion) {
            $this->command->warn('Greater Accra region not found. Run RegionSeeder first.');
            return;
        }

        // Get specializations for assigning to experts
        $specializations = Specialization::pluck('id')->toArray();

        // Expert data with real Accra coordinates at various distances from user (5.5545, -0.1902)
        $experts = [
            [
                // ~1.0 km away - Airport Residential Area
                'first_name' => 'Kwame',
                'last_name' => 'Asante',
                'email' => 'kwame.asante@expert.test',
                'phone' => '+233240000001',
                'business_name' => 'Kwame Auto Works',
                'bio' => 'Certified mechanic specializing in Japanese vehicles. Over 15 years experience with Toyota, Honda, and Nissan.',
                'city' => 'Airport Residential Area',
                'address' => '25 Airport Bypass Road',
                'latitude' => 5.5580,
                'longitude' => -0.1850,
                'experience_years' => 15,
                'rating' => 4.8,
                'rating_count' => 156,
                'jobs_completed' => 420,
                'specializations' => [1, 2, 6], // Engine, Transmission, AC
            ],
            [
                // ~1.5 km away - Osu
                'first_name' => 'Yaw',
                'last_name' => 'Mensah',
                'email' => 'yaw.mensah@expert.test',
                'phone' => '+233240000002',
                'business_name' => 'Osu Auto Clinic',
                'bio' => 'Full-service auto repair shop. We diagnose and fix all makes and models. Quick turnaround time guaranteed.',
                'city' => 'Osu',
                'address' => '12 Oxford Street',
                'latitude' => 5.5606,
                'longitude' => -0.1824,
                'experience_years' => 12,
                'rating' => 4.6,
                'rating_count' => 89,
                'jobs_completed' => 280,
                'specializations' => [4, 5, 14], // Brakes, Suspension, Diagnostics
            ],
            [
                // ~2.3 km away - Labone
                'first_name' => 'Kofi',
                'last_name' => 'Adjei',
                'email' => 'kofi.adjei@expert.test',
                'phone' => '+233240000003',
                'business_name' => 'Labone Premium Auto Care',
                'bio' => 'Premium auto care for luxury vehicles. Specialized in Mercedes, BMW, and Audi. Factory-trained technicians.',
                'city' => 'Labone',
                'address' => '8 La Bypass',
                'latitude' => 5.5688,
                'longitude' => -0.1748,
                'experience_years' => 18,
                'rating' => 4.9,
                'rating_count' => 203,
                'jobs_completed' => 550,
                'is_priority_listed' => true,
                'specializations' => [1, 3, 14], // Engine, Electrical, Diagnostics
            ],
            [
                // ~2.8 km away - Adabraka
                'first_name' => 'Ama',
                'last_name' => 'Owusu',
                'email' => 'ama.owusu@expert.test',
                'phone' => '+233240000004',
                'business_name' => 'Sister Ama Auto Services',
                'bio' => 'Woman-owned garage providing honest and transparent service. Specializing in general repairs and maintenance.',
                'city' => 'Adabraka',
                'address' => '45 Kojo Thompson Road',
                'latitude' => 5.5610,
                'longitude' => -0.2160,
                'experience_years' => 8,
                'rating' => 4.5,
                'rating_count' => 67,
                'jobs_completed' => 180,
                'specializations' => [8, 9, 10], // Oil Change, Tire, Battery
            ],
            [
                // ~4.5 km away - Cantonments
                'first_name' => 'Emmanuel',
                'last_name' => 'Tetteh',
                'email' => 'emmanuel.tetteh@expert.test',
                'phone' => '+233240000005',
                'business_name' => 'Cantonments Car Care',
                'bio' => 'Complete car care solutions. From minor repairs to major overhauls. Customer satisfaction is our priority.',
                'city' => 'Cantonments',
                'address' => '33 Josif Broz Tito Avenue',
                'latitude' => 5.5861,
                'longitude' => -0.1764,
                'experience_years' => 10,
                'rating' => 4.4,
                'rating_count' => 45,
                'jobs_completed' => 125,
                'specializations' => [6, 13, 12], // AC, Cooling, Fuel Systems
            ],
            [
                // ~6.5 km away - Dzorwulu
                'first_name' => 'Samuel',
                'last_name' => 'Ofori',
                'email' => 'samuel.ofori@expert.test',
                'phone' => '+233240000006',
                'business_name' => 'Dzorwulu Engine Masters',
                'bio' => 'Engine specialists. We rebuild and repair all types of engines. Diesel and petrol expertise.',
                'city' => 'Dzorwulu',
                'address' => '7 Dzorwulu Highway',
                'latitude' => 5.6110,
                'longitude' => -0.1950,
                'experience_years' => 20,
                'rating' => 4.7,
                'rating_count' => 178,
                'jobs_completed' => 600,
                'specializations' => [1, 2, 11], // Engine, Transmission, Exhaust
            ],
            [
                // ~10 km away - East Legon
                'first_name' => 'Grace',
                'last_name' => 'Appiah',
                'email' => 'grace.appiah@expert.test',
                'phone' => '+233240000007',
                'business_name' => 'East Legon Auto Hub',
                'bio' => 'Modern auto workshop with state-of-the-art diagnostic equipment. Specialists in European vehicles.',
                'city' => 'East Legon',
                'address' => '15 Boundary Road',
                'latitude' => 5.6379,
                'longitude' => -0.1612,
                'experience_years' => 14,
                'rating' => 4.6,
                'rating_count' => 134,
                'jobs_completed' => 380,
                'is_priority_listed' => true,
                'specializations' => [3, 14, 15], // Electrical, Diagnostics, Hybrid/Electric
            ],
            [
                // ~8 km away - Achimota
                'first_name' => 'Daniel',
                'last_name' => 'Boateng',
                'email' => 'daniel.boateng@expert.test',
                'phone' => '+233240000008',
                'business_name' => 'Achimota Auto Repairs',
                'bio' => 'Affordable auto repairs without compromising quality. Serving the community for over a decade.',
                'city' => 'Achimota',
                'address' => '89 Nsawam Road',
                'latitude' => 5.6120,
                'longitude' => -0.2220,
                'experience_years' => 11,
                'rating' => 4.3,
                'rating_count' => 92,
                'jobs_completed' => 290,
                'specializations' => [4, 5, 7], // Brakes, Suspension, Body Work
            ],
            [
                // ~14 km away - Madina
                'first_name' => 'Michael',
                'last_name' => 'Frimpong',
                'email' => 'michael.frimpong@expert.test',
                'phone' => '+233240000009',
                'business_name' => 'Madina Quick Fix Auto',
                'bio' => 'Quick and reliable auto services. Specializing in emergency repairs and roadside assistance.',
                'city' => 'Madina',
                'address' => '56 Madina-Adenta Highway',
                'latitude' => 5.6720,
                'longitude' => -0.1710,
                'experience_years' => 7,
                'rating' => 4.2,
                'rating_count' => 54,
                'jobs_completed' => 150,
                'specializations' => [10, 20, 8], // Battery, Towing, Oil Change
            ],
            [
                // ~8.5 km away - Dansoman
                'first_name' => 'Isaac',
                'last_name' => 'Ankrah',
                'email' => 'isaac.ankrah@expert.test',
                'phone' => '+233240000010',
                'business_name' => 'Dansoman Auto Solutions',
                'bio' => 'Complete automotive solutions under one roof. Paint, body work, and mechanical repairs.',
                'city' => 'Dansoman',
                'address' => '23 High Street, Dansoman',
                'latitude' => 5.5490,
                'longitude' => -0.2650,
                'experience_years' => 9,
                'rating' => 4.4,
                'rating_count' => 76,
                'jobs_completed' => 210,
                'specializations' => [7, 17, 16], // Body Work, Auto Glass, Welding
            ],
        ];

        foreach ($experts as $expertData) {
            // Create or update user
            $user = User::updateOrCreate(
                ['email' => $expertData['email']],
                [
                    'first_name' => $expertData['first_name'],
                    'last_name' => $expertData['last_name'],
                    'phone' => $expertData['phone'],
                    'password' => Hash::make('password'),
                    'role' => 'expert',
                    'onboarding_completed' => true,
                    'email_verified_at' => now(),
                ]
            );

            // Create or update expert profile
            $expertProfile = ExpertProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'business_name' => $expertData['business_name'],
                    'bio' => $expertData['bio'],
                    'region_id' => $greaterAccraRegion->id,
                    'city' => $expertData['city'],
                    'address' => $expertData['address'],
                    'latitude' => $expertData['latitude'],
                    'longitude' => $expertData['longitude'],
                    'whatsapp_number' => $expertData['phone'],
                    'experience_years' => $expertData['experience_years'],
                    'rating' => $expertData['rating'],
                    'rating_count' => $expertData['rating_count'],
                    'jobs_completed' => $expertData['jobs_completed'],
                    'kyc_status' => 'approved',
                    'kyc_approved_at' => now(),
                    'free_leads_remaining' => 4,
                    'is_available' => true,
                    'is_priority_listed' => $expertData['is_priority_listed'] ?? false,
                    'working_hours' => [
                        'monday' => ['start' => '08:00', 'end' => '18:00'],
                        'tuesday' => ['start' => '08:00', 'end' => '18:00'],
                        'wednesday' => ['start' => '08:00', 'end' => '18:00'],
                        'thursday' => ['start' => '08:00', 'end' => '18:00'],
                        'friday' => ['start' => '08:00', 'end' => '18:00'],
                        'saturday' => ['start' => '09:00', 'end' => '14:00'],
                        'sunday' => null,
                    ],
                ]
            );

            // Sync specializations
            $expertSpecs = array_filter($expertData['specializations'], fn($id) => in_array($id, $specializations));
            if (!empty($expertSpecs)) {
                $expertProfile->specializations()->sync($expertSpecs);
            }

            // Assign service region (Greater Accra)
            $expertProfile->serviceRegions()->sync([$greaterAccraRegion->id]);

            $this->command->info("Created expert: {$expertData['business_name']} in {$expertData['city']}");
        }

        $this->command->info('Successfully created 10 test experts with locations.');
    }
}
