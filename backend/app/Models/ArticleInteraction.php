<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArticleInteraction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'article_id',
        'liked',
        'bookmarked',
    ];

    protected function casts(): array
    {
        return [
            'liked' => 'boolean',
            'bookmarked' => 'boolean',
        ];
    }

    /**
     * Get the user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the article.
     */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    /**
     * Toggle like status.
     */
    public function toggleLike(): bool
    {
        $this->liked = !$this->liked;
        $this->save();

        // Update article likes count
        if ($this->liked) {
            $this->article->increment('likes_count');
        } else {
            $this->article->decrement('likes_count');
        }

        return $this->liked;
    }

    /**
     * Toggle bookmark status.
     */
    public function toggleBookmark(): bool
    {
        $this->bookmarked = !$this->bookmarked;
        $this->save();

        return $this->bookmarked;
    }
}
