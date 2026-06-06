<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PointMallCategory;
use App\Models\PointMallProduct;
use App\Models\PointMallProductLog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PointMallProductManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAdmin($request);

        $filters = $this->filters($request);
        $products = PointMallProduct::query()
            ->with('category')
            ->when($filters['search'], fn (Builder $query, string $search) => $query
                ->where(fn (Builder $nested) => $nested
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('summary', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")))
            ->when($filters['category_id'], fn (Builder $query, string $categoryId) => $query
                ->where('point_mall_category_id', $categoryId))
            ->when($filters['status'] === 'active', fn (Builder $query) => $query->where('is_active', true))
            ->when($filters['status'] === 'inactive', fn (Builder $query) => $query->where('is_active', false))
            ->when($filters['stock'] === 'in_stock', fn (Builder $query) => $query->where('stock_quantity', '>', 0))
            ->when($filters['stock'] === 'out_of_stock', fn (Builder $query) => $query->where('stock_quantity', 0))
            ->when($filters['stock'] === 'low_stock', fn (Builder $query) => $query
                ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
                ->where('low_stock_threshold', '>', 0))
            ->when($filters['featured'] === '1', fn (Builder $query) => $query->where('is_featured', true))
            ->when($filters['main_visible'] === '1', fn (Builder $query) => $query->where('is_main_visible', true))
            ->orderBy('sort_order')
            ->latest()
            ->take(150)
            ->get();

        return Inertia::render('Admin/PointMall/Products', [
            'products' => $products->map(fn (PointMallProduct $product) => $this->serializeProduct($product)),
            'categories' => $this->categories(),
            'filters' => $filters,
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorizeAdmin($request);

        return Inertia::render('Admin/PointMall/ProductCreate', [
            'categories' => $this->categories(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $this->validateProduct($request);
        unset($validated['image']);
        $validated['slug'] = $this->uniqueSlug($validated['name']);
        $validated['delivery_fee'] = $validated['delivery_type'] === 'paid'
            ? (int) ($validated['delivery_fee'] ?? 0)
            : 0;

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('point-mall-products', 'public');
        }

        $product = PointMallProduct::create($validated);
        $this->log($request, 'created', $product, null, $this->trackedSnapshot($product));

        return redirect()
            ->route('admin.point-mall.products.index')
            ->with('success', '포인트몰 상품을 등록했습니다.');
    }

    public function uploadDescriptionImage(Request $request)
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'image' => ['required', 'image', 'max:10240'],
        ]);

        $path = $validated['image']->store('point-mall-description-images', 'public');

        return response()->json([
            'url' => "/storage/{$path}",
        ]);
    }

    public function show(Request $request, PointMallProduct $product): Response
    {
        $this->authorizeAdmin($request);

        $product->load(['category', 'logs.actor']);

        return Inertia::render('Admin/PointMall/ProductShow', [
            'product' => $this->serializeProduct($product) + [
                'description' => $product->description,
                'imagePath' => $product->image_path,
            ],
            'categories' => $this->categories(),
            'logs' => $product->logs()
                ->with('actor')
                ->latest()
                ->take(50)
                ->get()
                ->map(fn (PointMallProductLog $log) => [
                    'id' => $log->id,
                    'action' => $log->action,
                    'actionLabel' => $this->actionLabel($log->action),
                    'actorName' => $log->actor?->name,
                    'memo' => $log->memo,
                    'before' => $log->before,
                    'after' => $log->after,
                    'createdAt' => $log->created_at?->format('Y-m-d H:i'),
                ]),
        ]);
    }

    public function update(Request $request, PointMallProduct $product): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $before = $this->trackedSnapshot($product);
        $validated = $this->validateProduct($request, $product);
        unset($validated['image']);
        $validated['delivery_fee'] = $validated['delivery_type'] === 'paid'
            ? (int) ($validated['delivery_fee'] ?? 0)
            : 0;

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('point-mall-products', 'public');
        }

        $product->update($validated);
        $product->refresh();
        $after = $this->trackedSnapshot($product);

        if ($before !== $after) {
            $this->log($request, 'updated', $product, $before, $after);
        }

        return redirect()
            ->route('admin.point-mall.products.show', $product)
            ->with('success', '포인트몰 상품 정보를 저장했습니다.');
    }

    public function destroy(Request $request, PointMallProduct $product): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $before = $this->trackedSnapshot($product);
        $this->log($request, 'deleted', $product, $before, null);
        $product->delete();

        return redirect()
            ->route('admin.point-mall.products.index')
            ->with('success', '포인트몰 상품을 삭제했습니다.');
    }

    public function updateDelivery(Request $request, PointMallProduct $product): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $before = $this->trackedSnapshot($product);
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

        $this->log($request, 'delivery_updated', $product, $before, $this->trackedSnapshot($product->refresh()));

        return redirect()
            ->route('admin.point-mall.products.index')
            ->with('success', '배송 설정을 변경했습니다.');
    }

    public function storeCategory(Request $request): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:100000'],
            'is_active' => ['required', 'boolean'],
        ]);

        PointMallCategory::create([
            'name' => $validated['name'],
            'slug' => $this->uniqueCategorySlug($validated['name']),
            'sort_order' => $validated['sort_order'],
            'is_active' => $validated['is_active'],
        ]);

        return redirect()
            ->route('admin.point-mall.products.index')
            ->with('success', '포인트몰 카테고리를 등록했습니다.');
    }

    public function updateCategory(Request $request, PointMallCategory $category): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:100000'],
            'is_active' => ['required', 'boolean'],
        ]);

        $category->update($validated);

        return redirect()
            ->route('admin.point-mall.products.index')
            ->with('success', '포인트몰 카테고리를 저장했습니다.');
    }

    private function validateProduct(Request $request, ?PointMallProduct $product = null): array
    {
        return $request->validate([
            'point_mall_category_id' => ['required', 'integer', 'exists:point_mall_categories,id'],
            'name' => ['required', 'string', 'max:120'],
            'summary' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'point_price' => ['required', 'integer', 'min:0', 'max:10000000'],
            'stock_quantity' => ['required', 'integer', 'min:0', 'max:100000'],
            'low_stock_threshold' => ['required', 'integer', 'min:0', 'max:100000'],
            'delivery_type' => ['required', Rule::in(['free', 'paid'])],
            'delivery_fee' => ['nullable', 'integer', 'min:0', 'max:1000000'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:100000'],
            'is_featured' => ['required', 'boolean'],
            'is_main_visible' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
            'image' => [$product ? 'nullable' : 'nullable', 'image', 'max:10240'],
        ]);
    }

    private function filters(Request $request): array
    {
        return [
            'search' => (string) $request->query('search', ''),
            'category_id' => (string) $request->query('category_id', ''),
            'status' => (string) $request->query('status', ''),
            'stock' => (string) $request->query('stock', ''),
            'featured' => (string) $request->query('featured', ''),
            'main_visible' => (string) $request->query('main_visible', ''),
        ];
    }

    private function categories()
    {
        return PointMallCategory::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'sort_order', 'is_active'])
            ->map(fn (PointMallCategory $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'sortOrder' => $category->sort_order,
                'isActive' => $category->is_active,
            ]);
    }

    private function serializeProduct(PointMallProduct $product): array
    {
        return [
            'id' => $product->id,
            'categoryId' => $product->point_mall_category_id,
            'name' => $product->name,
            'slug' => $product->slug,
            'summary' => $product->summary,
            'description' => $product->description,
            'imagePath' => $product->image_path,
            'categoryName' => $product->category?->name,
            'pointPrice' => $product->point_price,
            'stockQuantity' => $product->stock_quantity,
            'lowStockThreshold' => $product->low_stock_threshold,
            'deliveryType' => $product->delivery_type,
            'deliveryFee' => $product->delivery_fee,
            'sortOrder' => $product->sort_order,
            'isFeatured' => $product->is_featured,
            'isMainVisible' => $product->is_main_visible,
            'isActive' => $product->is_active,
            'createdAt' => $product->created_at?->format('Y-m-d H:i'),
            'updatedAt' => $product->updated_at?->format('Y-m-d H:i'),
        ];
    }

    private function trackedSnapshot(PointMallProduct $product): array
    {
        return Arr::only($product->toArray(), [
            'point_mall_category_id',
            'name',
            'summary',
            'description',
            'image_path',
            'point_price',
            'stock_quantity',
            'low_stock_threshold',
            'delivery_type',
            'delivery_fee',
            'sort_order',
            'is_featured',
            'is_main_visible',
            'is_active',
        ]);
    }

    private function log(Request $request, string $action, PointMallProduct $product, ?array $before, ?array $after): void
    {
        PointMallProductLog::create([
            'point_mall_product_id' => $product->id,
            'actor_id' => $request->user()?->id,
            'action' => $action,
            'before' => $before,
            'after' => $after,
        ]);
    }

    private function uniqueSlug(string $name): string
    {
        return $this->uniqueSlugFor(PointMallProduct::class, $name);
    }

    private function uniqueCategorySlug(string $name): string
    {
        return $this->uniqueSlugFor(PointMallCategory::class, $name);
    }

    private function uniqueSlugFor(string $model, string $name): string
    {
        $base = Str::slug($name) ?: 'item';
        $slug = $base;
        $index = 2;

        while ($this->slugExists($model, $slug)) {
            $slug = "{$base}-{$index}";
            $index++;
        }

        return $slug;
    }

    private function slugExists(string $model, string $slug): bool
    {
        $query = in_array(SoftDeletes::class, class_uses_recursive($model), true)
            ? $model::withTrashed()
            : $model::query();

        return $query->where('slug', $slug)->exists();
    }

    private function actionLabel(string $action): string
    {
        return match ($action) {
            'created' => '상품 등록',
            'updated' => '상품 수정',
            'delivery_updated' => '배송 설정 변경',
            default => $action,
        };
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->isAdmin(), 403);
    }
}
