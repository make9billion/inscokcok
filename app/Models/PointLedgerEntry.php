<?php

namespace App\Models;

use App\Enums\PointLedgerType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PointLedgerEntry extends Model
{
    /** @use HasFactory<\Database\Factories\PointLedgerEntryFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event_id',
        'order_id',
        'created_by_id',
        'type',
        'points',
        'balance_after',
        'idempotency_key',
        'memo',
    ];

    protected function casts(): array
    {
        return [
            'type' => PointLedgerType::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo('App\\Models\\PointMallOrder', 'order_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }
}
