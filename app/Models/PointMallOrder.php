<?php

namespace App\Models;

use App\Enums\PointMallOrderStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PointMallOrder extends Model
{
    /** @use HasFactory<\Database\Factories\PointMallOrderFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'status',
        'order_number',
        'total_points',
        'used_points',
        'delivery_fee',
        'cash_payment_amount',
        'payment_provider',
        'payment_status',
        'payment_order_id',
        'payment_key',
        'payment_method',
        'payment_requested_at',
        'payment_approved_at',
        'recipient_name',
        'recipient_phone',
        'postal_code',
        'address_line1',
        'address_line2',
        'delivery_memo',
        'ordered_at',
        'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => PointMallOrderStatus::class,
            'payment_requested_at' => 'datetime',
            'payment_approved_at' => 'datetime',
            'ordered_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'total_points' => 'integer',
            'used_points' => 'integer',
            'delivery_fee' => 'integer',
            'cash_payment_amount' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PointMallOrderItem::class);
    }
}
