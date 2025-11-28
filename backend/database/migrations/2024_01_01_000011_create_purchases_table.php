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
        // Expert subscriptions
        Schema::create('expert_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('subscription_plan_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['active', 'cancelled', 'expired', 'pending'])->default('pending');
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->timestamp('cancelled_at')->nullable();
            $table->boolean('auto_renew')->default(true);
            $table->timestamps();
        });

        // Lead package purchases
        Schema::create('lead_package_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('lead_package_id')->constrained()->onDelete('cascade');
            $table->integer('leads_purchased');
            $table->integer('leads_remaining');
            $table->decimal('amount_paid', 10, 2);
            $table->string('currency')->default('GHS');
            $table->enum('status', ['active', 'exhausted', 'expired'])->default('active');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        // Diagnosis package purchases
        Schema::create('diagnosis_package_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('diagnosis_package_id')->constrained()->onDelete('cascade');
            $table->integer('diagnoses_purchased');
            $table->integer('diagnoses_remaining');
            $table->decimal('amount_paid', 10, 2);
            $table->string('currency')->default('GHS');
            $table->enum('status', ['active', 'exhausted'])->default('active');
            $table->timestamps();
        });

        // Payment transactions
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->morphs('payable'); // Polymorphic: subscription, lead_package_purchase, diagnosis_package_purchase
            $table->string('payment_reference')->unique();
            $table->string('provider')->default('paystack'); // paystack, momo, card, etc.
            $table->string('provider_reference')->nullable();
            $table->decimal('amount', 10, 2);
            $table->string('currency')->default('GHS');
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            $table->json('provider_response')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('diagnosis_package_purchases');
        Schema::dropIfExists('lead_package_purchases');
        Schema::dropIfExists('expert_subscriptions');
    }
};
