<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KnowledgeAnswer extends Model
{
    /** @use HasFactory<\Database\Factories\KnowledgeAnswerFactory> */
    use HasFactory;

    protected $fillable = [
        'knowledge_question_id',
        'manager_id',
        'body',
    ];

    public function question(): BelongsTo
    {
        return $this->belongsTo(KnowledgeQuestion::class, 'knowledge_question_id');
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }
}
