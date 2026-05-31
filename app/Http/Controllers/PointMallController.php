<?php

namespace App\Http\Controllers;

use App\Enums\PointMallOrderStatus;
use App\Models\PointMallCart;
use App\Models\PointMallCartItem;
use App\Models\PointMallCategory;
use App\Models\PointMallOrder;
use App\Models\PointMallOrderItem;
use App\Models\PointMallProduct;
use App\Services\PointLedgerService;
use App\Services\PointMallOrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
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

    public function addToCart(Request $request, string $slug): RedirectResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $product = PointMallProduct::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        if ($validated['quantity'] > $product->stock_quantity) {
            return back()->withErrors(['quantity' => '재고보다 많은 수량은 담을 수 없습니다.']);
        }

        $cart = PointMallCart::firstOrCreate(['user_id' => $request->user()->id]);
        $item = PointMallCartItem::query()
            ->firstOrNew([
                'point_mall_cart_id' => $cart->id,
                'point_mall_product_id' => $product->id,
            ]);

        $item->quantity = min($product->stock_quantity, ($item->quantity ?? 0) + $validated['quantity']);
        $item->save();

        return redirect()
            ->route('point-mall.cart.show')
            ->with('success', '장바구니에 담았습니다.');
    }

    public function cart(Request $request): Response
    {
        $cart = $this->cartFor($request);

        return Inertia::render('PointMall/Cart', [
            'cart' => $this->serializeCart($cart, $request->user()),
        ]);
    }

    public function checkout(Request $request, PointLedgerService $pointLedger): RedirectResponse
    {
        $validated = $request->validate([
            'recipient_name' => ['required', 'string', 'max:80'],
            'recipient_phone' => ['required', 'string', 'max:30'],
            'postal_code' => ['required', 'string', 'max:20'],
            'address_line1' => ['required', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'delivery_memo' => ['nullable', 'string', 'max:255'],
        ]);

        $cart = $this->cartFor($request);

        if ($cart->items->isEmpty()) {
            return back()->withErrors(['cart' => '장바구니가 비어 있습니다.']);
        }

        foreach ($cart->items as $item) {
            if (! $item->product?->is_active || $item->quantity > $item->product->stock_quantity) {
                return back()->withErrors(['cart' => '재고가 부족한 상품이 있습니다.']);
            }
        }

        $user = $request->user();
        $summary = $this->cartSummary($cart, $user);

        $order = DB::transaction(function () use ($cart, $pointLedger, $summary, $user, $validated) {
            $requiresCashPayment = $summary['cashPaymentAmount'] > 0;
            $orderNumber = 'PM'.now()->format('YmdHis').Str::upper(Str::random(6));

            $order = PointMallOrder::create([
                'user_id' => $user->id,
                'status' => $requiresCashPayment ? PointMallOrderStatus::Pending : PointMallOrderStatus::Paid,
                'order_number' => $orderNumber,
                'total_points' => $summary['totalPoints'],
                'used_points' => $summary['usedPoints'],
                'delivery_fee' => $summary['deliveryFee'],
                'cash_payment_amount' => $summary['cashPaymentAmount'],
                'payment_provider' => $requiresCashPayment ? 'toss_payments' : null,
                'payment_status' => $requiresCashPayment ? 'ready' : 'not_required',
                'payment_order_id' => $requiresCashPayment ? $orderNumber : null,
                'payment_requested_at' => $requiresCashPayment ? now() : null,
                'recipient_name' => $validated['recipient_name'],
                'recipient_phone' => $validated['recipient_phone'],
                'postal_code' => $validated['postal_code'],
                'address_line1' => $validated['address_line1'],
                'address_line2' => $validated['address_line2'] ?? null,
                'delivery_memo' => $validated['delivery_memo'] ?? null,
                'ordered_at' => now(),
            ]);

            foreach ($cart->items as $item) {
                PointMallOrderItem::create([
                    'point_mall_order_id' => $order->id,
                    'point_mall_product_id' => $item->product->id,
                    'product_name' => $item->product->name,
                    'point_price' => $item->product->point_price,
                    'quantity' => $item->quantity,
                    'line_total_points' => $item->product->point_price * $item->quantity,
                ]);

                $item->product->decrement('stock_quantity', $item->quantity);
            }

            if (! $requiresCashPayment) {
                $pointLedger->spendForPointMallOrder($order);
            }
            $cart->items()->delete();

            return $order;
        });

        return redirect()
            ->route('mypage.point-mall.orders')
            ->with('success', "주문 {$order->order_number}이 접수되었습니다.");
    }

    public function orders(Request $request): Response
    {
        return Inertia::render('MyPage/PointMallOrders', [
            'orders' => $request->user()
                ->pointMallOrders()
                ->with('items')
                ->latest()
                ->take(50)
                ->get()
                ->map(fn (PointMallOrder $order) => $this->serializeOrder($order)),
        ]);
    }

    public function cancelOrder(Request $request, PointMallOrder $order, PointMallOrderService $orders): RedirectResponse
    {
        abort_unless($order->user_id === $request->user()->id, 404);

        if (! in_array($order->status, [PointMallOrderStatus::Pending, PointMallOrderStatus::Paid], true)) {
            return back()->withErrors(['order' => '주문 접수 상태에서만 직접 취소할 수 있습니다.']);
        }

        $orders->cancelAndRefund($order);

        return redirect()
            ->route('mypage.point-mall.orders')
            ->with('success', '주문이 취소되었고 사용 포인트가 환불되었습니다.');
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
            'deliveryType' => $product->delivery_type,
            'deliveryFee' => $product->delivery_fee,
            'isFeatured' => $product->is_featured,
            'categoryName' => $product->category?->name,
        ];
    }

    private function serializeOrder(PointMallOrder $order): array
    {
        return [
            'id' => $order->id,
            'orderNumber' => $order->order_number,
            'status' => $order->status->value,
            'statusLabel' => $this->statusLabel($order->status),
            'totalPoints' => $order->total_points,
            'usedPoints' => $order->used_points,
            'deliveryFee' => $order->delivery_fee,
            'cashPaymentAmount' => $order->cash_payment_amount,
            'paymentStatus' => $order->payment_status,
            'paymentProvider' => $order->payment_provider,
            'paymentOrderId' => $order->payment_order_id,
            'orderedAt' => $order->ordered_at?->format('Y-m-d H:i'),
            'cancelledAt' => $order->cancelled_at?->format('Y-m-d H:i'),
            'canCancel' => in_array($order->status, [PointMallOrderStatus::Pending, PointMallOrderStatus::Paid], true),
            'cashRefundNotice' => $order->cash_payment_amount > 0
                && in_array($order->status, [PointMallOrderStatus::Cancelled, PointMallOrderStatus::Refunded], true),
            'items' => $order->items->map(fn (PointMallOrderItem $item) => [
                'name' => $item->product_name,
                'quantity' => $item->quantity,
                'lineTotalPoints' => $item->line_total_points,
            ]),
        ];
    }

    private function statusLabel(PointMallOrderStatus $status): string
    {
        return match ($status) {
            PointMallOrderStatus::Pending => '결제대기',
            PointMallOrderStatus::Paid => '주문접수',
            PointMallOrderStatus::Preparing => '상품준비중',
            PointMallOrderStatus::Shipped => '배송중',
            PointMallOrderStatus::Delivered => '배송완료',
            PointMallOrderStatus::Cancelled => '취소완료',
            PointMallOrderStatus::Refunded => '환불완료',
        };
    }

    private function cartFor(Request $request): PointMallCart
    {
        return PointMallCart::firstOrCreate(['user_id' => $request->user()->id])
            ->load('items.product.category');
    }

    private function serializeCart(PointMallCart $cart, $user): array
    {
        return [
            'items' => $cart->items->map(fn (PointMallCartItem $item) => [
                'id' => $item->id,
                'quantity' => $item->quantity,
                'product' => $this->serializeProduct($item->product),
                'lineTotalPoints' => $item->quantity * $item->product->point_price,
            ])->values(),
            'summary' => $this->cartSummary($cart, $user),
        ];
    }

    private function cartSummary(PointMallCart $cart, $user): array
    {
        $totalPoints = (int) $cart->items->sum(fn (PointMallCartItem $item) => $item->quantity * $item->product->point_price);
        $deliveryFee = (int) $cart->items->sum(fn (PointMallCartItem $item) => $item->product->delivery_type === 'paid' ? $item->product->delivery_fee : 0);
        $pointBalance = (int) $user->pointLedgerEntries()->sum('points');
        $usedPoints = min($pointBalance, $totalPoints);
        $pointShortfall = max($totalPoints - $usedPoints, 0);

        return [
            'pointBalance' => $pointBalance,
            'totalPoints' => $totalPoints,
            'usedPoints' => $usedPoints,
            'pointShortfall' => $pointShortfall,
            'deliveryFee' => $deliveryFee,
            'cashPaymentAmount' => $pointShortfall + $deliveryFee,
        ];
    }
}
