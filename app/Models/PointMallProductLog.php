<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PointMallProductLog extends Model
{
    protected $fillable = [
        'point_mall_product_id',
        'actor_id',
        'action',
        'before',
        'after',
        'memo',
    ];

    protected function casts(): array
    {
        return [
            'before' => 'array',
            'after' => 'array',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(PointMallProduct::class, 'point_mall_product_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
