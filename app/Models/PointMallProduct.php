<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PointMallProduct extends Model
{
    /** @use HasFactory<\Database\Factories\PointMallProductFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'point_mall_category_id',
        'name',
        'slug',
        'summary',
        'description',
        'image_path',
        'point_price',
        'stock_quantity',
        'is_featured',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(PointMallCategory::class, 'point_mall_category_id');
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(PointMallCartItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(PointMallOrderItem::class);
    }
}
