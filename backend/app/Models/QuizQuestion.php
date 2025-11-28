<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'road_sign_category_id',
        'road_sign_id',
        'question',
        'image',
        'options',
        'correct_answer_index',
        'explanation',
        'difficulty',
        'is_active',
        'times_answered',
        'times_correct',
    ];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'correct_answer_index' => 'integer',
            'is_active' => 'boolean',
            'times_answered' => 'integer',
            'times_correct' => 'integer',
        ];
    }

    /**
     * Get the category.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(RoadSignCategory::class, 'road_sign_category_id');
    }

    /**
     * Get the related road sign.
     */
    public function roadSign(): BelongsTo
    {
        return $this->belongsTo(RoadSign::class);
    }

    /**
     * Get the correct answer.
     */
    public function getCorrectAnswerAttribute(): ?string
    {
        return $this->options[$this->correct_answer_index] ?? null;
    }

    /**
     * Check if the given answer index is correct.
     */
    public function isCorrectAnswer(int $answerIndex): bool
    {
        return $answerIndex === $this->correct_answer_index;
    }

    /**
     * Record an answer.
     */
    public function recordAnswer(bool $isCorrect): void
    {
        $this->increment('times_answered');
        if ($isCorrect) {
            $this->increment('times_correct');
        }
    }

    /**
     * Get success rate.
     */
    public function getSuccessRateAttribute(): float
    {
        if ($this->times_answered === 0) {
            return 0;
        }

        return round(($this->times_correct / $this->times_answered) * 100, 2);
    }

    /**
     * Scope to active questions.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope by difficulty.
     */
    public function scopeByDifficulty($query, string $difficulty)
    {
        return $query->where('difficulty', $difficulty);
    }

    /**
     * Scope for a specific category.
     */
    public function scopeForCategory($query, $categoryId)
    {
        return $query->where('road_sign_category_id', $categoryId);
    }
}
