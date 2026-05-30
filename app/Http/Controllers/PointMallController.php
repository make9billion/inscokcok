<?php

namespace App\Http\Controllers;

use App\Models\PointMallCategory;
use App\Models\PointMallProduct;
use Inertia\Inertia;
use Inertia\Response;

class PointMallController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('PointMall/Index', [
            'categories' => PointMallCategory::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'name', 'slug'])
                ->map(fn (PointMallCategory $category) => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                ]),
            'products' => PointMallProduct::query()
                ->with('category')
                ->where('is_active', true)
                ->latest()
                ->get()
                ->map(fn (PointMallProduct $product) => $this->serializeProduct($product)),
        ]);
    }

    public function show(string $slug): Response
    {
        $product = PointMallProduct::query()
            ->with('category')
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return Inertia::render('PointMall/Show', [
            'product' => $this->serializeProduct($product) + [
                'description' => $product->description,
            ],
        ]);
    }

    private function serializeProduct(PointMallProduct $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'summary' => $product->summary,
            'imagePath' => $product->image_path,
            'pointPrice' => $product->point_price,
            'stockQuantity' => $product->stock_quantity,
            'isFeatured' => $product->is_featured,
            'categoryName' => $product->category?->name,
        ];
    }
}
