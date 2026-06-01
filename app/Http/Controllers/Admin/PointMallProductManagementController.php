<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PointMallProduct;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PointMallProductManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAdmin($request);

        return Inertia::render('Admin/PointMall/Products', [
            'products' => PointMallProduct::query()
                ->with('category')
                ->latest()
                ->take(100)
                ->get()
                ->map(fn (PointMallProduct $product) => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'summary' => $product->summary,
                    'categoryName' => $product->category?->name,
                    'pointPrice' => $product->point_price,
                    'stockQuantity' => $product->stock_quantity,
                    'deliveryType' => $product->delivery_type,
                    'deliveryFee' => $product->delivery_fee,
                    'isFeatured' => $product->is_featured,
                    'isActive' => $product->is_active,
                ]),
        ]);
    }

    public function update(Request $request, PointMallProduct $product): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'summary' => ['nullable', 'string', 'max:255'],
            'point_price' => ['required', 'integer', 'min:0', 'max:10000000'],
            'stock_quantity' => ['required', 'integer', 'min:0', 'max:100000'],
            'delivery_type' => ['required', Rule::in(['free', 'paid'])],
            'delivery_fee' => ['nullable', 'integer', 'min:0', 'max:1000000'],
            'is_featured' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
        ]);

        $product->update([
            'name' => $validated['name'],
            'summary' => $validated['summary'] ?? null,
            'point_price' => $validated['point_price'],
            'stock_quantity' => $validated['stock_quantity'],
            'delivery_type' => $validated['delivery_type'],
            'delivery_fee' => $validated['delivery_type'] === 'paid'
                ? (int) ($validated['delivery_fee'] ?? 0)
                : 0,
            'is_featured' => $validated['is_featured'],
            'is_active' => $validated['is_active'],
        ]);

        return redirect()
            ->route('admin.point-mall.products.index')
            ->with('success', '포인트몰 상품 정보가 저장되었습니다.');
    }

    public function updateDelivery(Request $request, PointMallProduct $product): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'delivery_type' => ['required', Rule::in(['free', 'paid'])],
            'delivery_fee' => ['nullable', 'integer', 'min:0', 'max:1000000'],
        ]);

        $product->update([
            'delivery_type' => $validated['delivery_type'],
            'delivery_fee' => $validated['delivery_type'] === 'paid'
                ? (int) ($validated['delivery_fee'] ?? 0)
                : 0,
        ]);

        return redirect()
            ->route('admin.point-mall.products.index')
            ->with('success', '배송 설정이 변경되었습니다.');
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->isAdmin(), 403);
    }
}
