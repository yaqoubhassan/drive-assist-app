<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Lead packages for experts
        Schema::create('lead_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->integer('leads_count');
            $table->decimal('price', 10, 2);
            $table->string('currency')->default('GHS');
            $table->decimal('price_per_lead', 10, 2)->nullable();
            $table->integer('validity_days')->nullable(); // How long the leads are valid
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Diagnosis packages for drivers
        Schema::create('diagnosis_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->integer('diagnoses_count');
            $table->decimal('price', 10, 2);
            $table->string('currency')->default('GHS');
            $table->decimal('price_per_diagnosis', 10, 2)->nullable();
            $table->boolean('includes_images')->default(true);
            $table->boolean('includes_voice')->default(true);
            $table->boolean('includes_expert_contact')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Subscription plans for experts
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->enum('billing_period', ['monthly', 'quarterly', 'yearly']);
            $table->decimal('price', 10, 2);
            $table->string('currency')->default('GHS');
            $table->integer('leads_per_month')->nullable(); // Null means unlimited
            $table->boolean('priority_listing')->default(false);
            $table->boolean('featured_profile')->default(false);
            $table->boolean('analytics_access')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->json('features')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
        Schema::dropIfExists('diagnosis_packages');
        Schema::dropIfExists('lead_packages');
    }
};
