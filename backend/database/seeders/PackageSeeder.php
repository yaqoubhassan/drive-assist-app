<?php

namespace Database\Seeders;

use App\Models\DiagnosisPackage;
use App\Models\LeadPackage;
use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        // Diagnosis Packages for Drivers
        $diagnosisPackages = [
            [
                'name' => 'Starter Pack',
                'slug' => 'starter-pack',
                'description' => 'Perfect for occasional diagnostics needs',
                'diagnosis_count' => 10,
                'price' => 49.99,
                'currency' => 'GHS',
                'features' => [
                    'AI-powered diagnostics',
                    'Expert matching',
                    'Photo analysis',
                    '30-day validity',
                ],
                'is_popular' => false,
                'validity_days' => 30,
                'sort_order' => 0,
            ],
            [
                'name' => 'Value Pack',
                'slug' => 'value-pack',
                'description' => 'Best value for regular drivers',
                'diagnosis_count' => 15,
                'price' => 69.99,
                'currency' => 'GHS',
                'features' => [
                    'AI-powered diagnostics',
                    'Expert matching',
                    'Photo analysis',
                    'Priority support',
                    '60-day validity',
                ],
                'is_popular' => true,
                'validity_days' => 60,
                'sort_order' => 1,
            ],
            [
                'name' => 'Pro Pack',
                'slug' => 'pro-pack',
                'description' => 'For fleet owners and frequent users',
                'diagnosis_count' => 25,
                'price' => 99.99,
                'currency' => 'GHS',
                'features' => [
                    'AI-powered diagnostics',
                    'Expert matching',
                    'Photo analysis',
                    'Priority support',
                    'Detailed reports',
                    '90-day validity',
                ],
                'is_popular' => false,
                'validity_days' => 90,
                'sort_order' => 2,
            ],
        ];

        foreach ($diagnosisPackages as $package) {
            DiagnosisPackage::updateOrCreate(
                ['slug' => $package['slug']],
                array_merge($package, ['is_active' => true])
            );
        }

        // Lead Packages for Experts
        $leadPackages = [
            [
                'name' => 'Basic Leads',
                'slug' => 'basic-leads',
                'description' => 'Get started with new customer leads',
                'lead_count' => 5,
                'price' => 29.99,
                'currency' => 'GHS',
                'features' => [
                    'Verified customer leads',
                    'Contact information',
                    'Issue description',
                    '30-day validity',
                ],
                'is_popular' => false,
                'validity_days' => 30,
                'sort_order' => 0,
            ],
            [
                'name' => 'Growth Pack',
                'slug' => 'growth-pack',
                'description' => 'Grow your customer base effectively',
                'lead_count' => 10,
                'price' => 49.99,
                'currency' => 'GHS',
                'features' => [
                    'Verified customer leads',
                    'Contact information',
                    'Issue description',
                    'Vehicle details',
                    'Priority matching',
                    '45-day validity',
                ],
                'is_popular' => true,
                'validity_days' => 45,
                'sort_order' => 1,
            ],
            [
                'name' => 'Business Pack',
                'slug' => 'business-pack',
                'description' => 'Maximum leads for serious businesses',
                'lead_count' => 20,
                'price' => 89.99,
                'currency' => 'GHS',
                'features' => [
                    'Verified customer leads',
                    'Contact information',
                    'Issue description',
                    'Vehicle details',
                    'Priority matching',
                    'Lead analytics',
                    '60-day validity',
                ],
                'is_popular' => false,
                'validity_days' => 60,
                'sort_order' => 2,
            ],
        ];

        foreach ($leadPackages as $package) {
            LeadPackage::updateOrCreate(
                ['slug' => $package['slug']],
                array_merge($package, ['is_active' => true])
            );
        }

        // Subscription Plans for Experts
        $subscriptionPlans = [
            [
                'name' => 'Monthly Basic',
                'slug' => 'monthly-basic',
                'description' => 'Essential features for new experts',
                'duration_months' => 1,
                'price' => 99.99,
                'currency' => 'GHS',
                'leads_per_month' => 15,
                'features' => [
                    '15 leads per month',
                    'Profile verification badge',
                    'Customer messaging',
                    'Basic analytics',
                ],
                'is_popular' => false,
                'sort_order' => 0,
            ],
            [
                'name' => 'Monthly Pro',
                'slug' => 'monthly-pro',
                'description' => 'Full features for growing businesses',
                'duration_months' => 1,
                'price' => 179.99,
                'currency' => 'GHS',
                'leads_per_month' => 30,
                'features' => [
                    '30 leads per month',
                    'Profile verification badge',
                    'Customer messaging',
                    'Advanced analytics',
                    'Priority in search results',
                    'Promotional banner',
                ],
                'is_popular' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Quarterly Pro',
                'slug' => 'quarterly-pro',
                'description' => 'Save 15% with quarterly billing',
                'duration_months' => 3,
                'price' => 459.99,
                'currency' => 'GHS',
                'leads_per_month' => 30,
                'features' => [
                    '30 leads per month',
                    'Profile verification badge',
                    'Customer messaging',
                    'Advanced analytics',
                    'Priority in search results',
                    'Promotional banner',
                    '15% savings',
                ],
                'is_popular' => false,
                'sort_order' => 2,
            ],
            [
                'name' => 'Annual Pro',
                'slug' => 'annual-pro',
                'description' => 'Best value - Save 25% yearly',
                'duration_months' => 12,
                'price' => 1619.99,
                'currency' => 'GHS',
                'leads_per_month' => 30,
                'features' => [
                    '30 leads per month',
                    'Profile verification badge',
                    'Customer messaging',
                    'Advanced analytics',
                    'Priority in search results',
                    'Promotional banner',
                    '25% savings',
                    'Dedicated support',
                ],
                'is_popular' => false,
                'sort_order' => 3,
            ],
        ];

        foreach ($subscriptionPlans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['slug' => $plan['slug']],
                array_merge($plan, ['is_active' => true])
            );
        }
    }
}
