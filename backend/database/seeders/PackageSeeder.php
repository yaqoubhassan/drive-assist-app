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
                'diagnoses_count' => 10,
                'price' => 49.99,
                'currency' => 'GHS',
                'price_per_diagnosis' => 4.99,
                'includes_images' => true,
                'includes_voice' => false,
                'includes_expert_contact' => true,
                'is_featured' => false,
                'sort_order' => 0,
            ],
            [
                'name' => 'Value Pack',
                'slug' => 'value-pack',
                'description' => 'Best value for regular drivers',
                'diagnoses_count' => 15,
                'price' => 69.99,
                'currency' => 'GHS',
                'price_per_diagnosis' => 4.67,
                'includes_images' => true,
                'includes_voice' => true,
                'includes_expert_contact' => true,
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Pro Pack',
                'slug' => 'pro-pack',
                'description' => 'For fleet owners and frequent users',
                'diagnoses_count' => 25,
                'price' => 99.99,
                'currency' => 'GHS',
                'price_per_diagnosis' => 4.00,
                'includes_images' => true,
                'includes_voice' => true,
                'includes_expert_contact' => true,
                'is_featured' => false,
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
                'leads_count' => 5,
                'price' => 29.99,
                'currency' => 'GHS',
                'price_per_lead' => 6.00,
                'validity_days' => 30,
                'is_featured' => false,
                'sort_order' => 0,
            ],
            [
                'name' => 'Growth Pack',
                'slug' => 'growth-pack',
                'description' => 'Grow your customer base effectively',
                'leads_count' => 10,
                'price' => 49.99,
                'currency' => 'GHS',
                'price_per_lead' => 5.00,
                'validity_days' => 45,
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Business Pack',
                'slug' => 'business-pack',
                'description' => 'Maximum leads for serious businesses',
                'leads_count' => 20,
                'price' => 89.99,
                'currency' => 'GHS',
                'price_per_lead' => 4.50,
                'validity_days' => 60,
                'is_featured' => false,
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
                'billing_period' => 'monthly',
                'price' => 99.99,
                'currency' => 'GHS',
                'leads_per_month' => 15,
                'priority_listing' => false,
                'featured_profile' => false,
                'analytics_access' => false,
                'features' => [
                    '15 leads per month',
                    'Profile verification badge',
                    'Customer messaging',
                    'Basic analytics',
                ],
                'sort_order' => 0,
            ],
            [
                'name' => 'Monthly Pro',
                'slug' => 'monthly-pro',
                'description' => 'Full features for growing businesses',
                'billing_period' => 'monthly',
                'price' => 179.99,
                'currency' => 'GHS',
                'leads_per_month' => 30,
                'priority_listing' => true,
                'featured_profile' => true,
                'analytics_access' => true,
                'features' => [
                    '30 leads per month',
                    'Profile verification badge',
                    'Customer messaging',
                    'Advanced analytics',
                    'Priority in search results',
                    'Promotional banner',
                ],
                'sort_order' => 1,
            ],
            [
                'name' => 'Quarterly Pro',
                'slug' => 'quarterly-pro',
                'description' => 'Save 15% with quarterly billing',
                'billing_period' => 'quarterly',
                'price' => 459.99,
                'currency' => 'GHS',
                'leads_per_month' => 30,
                'priority_listing' => true,
                'featured_profile' => true,
                'analytics_access' => true,
                'features' => [
                    '30 leads per month',
                    'Profile verification badge',
                    'Customer messaging',
                    'Advanced analytics',
                    'Priority in search results',
                    'Promotional banner',
                    '15% savings',
                ],
                'sort_order' => 2,
            ],
            [
                'name' => 'Annual Pro',
                'slug' => 'annual-pro',
                'description' => 'Best value - Save 25% yearly',
                'billing_period' => 'yearly',
                'price' => 1619.99,
                'currency' => 'GHS',
                'leads_per_month' => 30,
                'priority_listing' => true,
                'featured_profile' => true,
                'analytics_access' => true,
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
