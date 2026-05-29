<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PointMallOrderItem extends Model
{
    protected $fillable = [
        'point_mall_order_id',
        'point_mall_product_id',
        'product_name',
        'point_price',
        'quantity',
        'line_total_points',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(PointMallOrder::class, 'point_mall_order_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(PointMallProduct::class, 'point_mall_product_id')->withTrashed();
    }
}
