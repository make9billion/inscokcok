<?php

namespace App\Models;

use App\Enums\KnowledgeQuestionStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class KnowledgeQuestion extends Model
{
    /** @use HasFactory<\Database\Factories\KnowledgeQuestionFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'assigned_manager_id',
        'status',
        'title',
        'body',
        'answered_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => KnowledgeQuestionStatus::class,
            'answered_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedManager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_manager_id');
    }

    public function answer(): HasOne
    {
        return $this->hasOne(KnowledgeAnswer::class);
    }
}
