<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PointMallCartItem extends Model
{
    protected $fillable = [
        'point_mall_cart_id',
        'point_mall_product_id',
        'quantity',
    ];

    public function cart(): BelongsTo
    {
        return $this->belongsTo(PointMallCart::class, 'point_mall_cart_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(PointMallProduct::class, 'point_mall_product_id');
    }
}
