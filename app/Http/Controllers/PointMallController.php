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
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PointMallController extends Controller
{
    public function index(Request $request): Response
    {
        $selectedCategory = $request->query('category');
        $products = PointMallProduct::query()
            ->with('category')
            ->where('is_active', true)
            ->when($selectedCategory, function ($query, string $category) {
                $query->whereHas('category', fn ($categoryQuery) => $categoryQuery->where('slug', $category));
            })
            ->latest()
            ->get();

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
            'selectedCategory' => $selectedCategory,
            'products' => $products->map(fn (PointMallProduct $product) => $this->serializeProduct($product)),
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

    public function updateCartItem(Request $request, PointMallCartItem $item): RedirectResponse
    {
        abort_unless($item->cart?->user_id === $request->user()->id, 404);

        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $item->load('product');

        if (! $item->product?->is_active) {
            $item->delete();

            return back()->withErrors(['cart' => '판매가 종료된 상품을 장바구니에서 제외했습니다.']);
        }

        if ($validated['quantity'] > $item->product->stock_quantity) {
            return back()->withErrors(['quantity' => '구매 가능한 수량을 초과했습니다.']);
        }

        $item->update(['quantity' => $validated['quantity']]);

        return back()->with('success', '장바구니 수량을 변경했습니다.');
    }

    public function destroyCartItem(Request $request, PointMallCartItem $item): RedirectResponse
    {
        abort_unless($item->cart?->user_id === $request->user()->id, 404);

        $item->delete();

        return back()->with('success', '상품을 장바구니에서 삭제했습니다.');
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
            $orderNumber = $this->generateOrderNumber();

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

        if ($order->cash_payment_amount > 0) {
            return redirect()
                ->route('point-mall.orders.payment', $order)
                ->with('success', '주문이 접수되었습니다. 추가 결제를 진행해 주세요.');
        }

        return redirect()
            ->route('mypage.point-mall.orders')
            ->with('success', "주문 {$order->order_number}이 접수되었습니다.");
    }

    private function generateOrderNumber(): string
    {
        do {
            $orderNumber = 'PM'.now()->format('ymd').random_int(100000, 999999);
        } while (PointMallOrder::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }

    public function payment(Request $request, PointMallOrder $order): Response|RedirectResponse
    {
        abort_unless($order->user_id === $request->user()->id, 404);

        if ($order->cash_payment_amount <= 0 || $order->status === PointMallOrderStatus::Paid) {
            return redirect()->route('mypage.point-mall.orders');
        }

        $order->load('items');

        return Inertia::render('PointMall/Payment', [
            'clientKey' => config('services.toss_payments.client_key'),
            'order' => $this->serializeOrder($order) + [
                'orderName' => $this->paymentOrderName($order),
                'customerName' => $order->recipient_name,
                'customerEmail' => $request->user()->email,
                'customerMobilePhone' => preg_replace('/\D/', '', $order->recipient_phone),
            ],
        ]);
    }

    public function paymentSuccess(Request $request, PointLedgerService $pointLedger): RedirectResponse
    {
        $validated = $request->validate([
            'paymentKey' => ['required', 'string', 'max:200'],
            'orderId' => ['required', 'string', 'max:80'],
            'amount' => ['required', 'integer', 'min:1'],
        ]);

        $order = PointMallOrder::query()
            ->with('user')
            ->where('payment_order_id', $validated['orderId'])
            ->firstOrFail();

        abort_unless($order->user_id === $request->user()->id, 404);

        if ($order->status === PointMallOrderStatus::Paid && $order->payment_key) {
            return redirect()
                ->route('mypage.point-mall.orders')
                ->with('success', '이미 결제가 완료된 주문입니다.');
        }

        if ((int) $validated['amount'] !== (int) $order->cash_payment_amount) {
            $order->update(['payment_status' => 'amount_mismatch']);

            return redirect()
                ->route('point-mall.orders.payment', $order)
                ->withErrors(['payment' => '결제 금액이 주문 금액과 일치하지 않습니다.']);
        }

        $secretKey = config('services.toss_payments.secret_key');

        if (! $secretKey) {
            return redirect()
                ->route('point-mall.orders.payment', $order)
                ->withErrors(['payment' => '토스페이먼츠 시크릿 키가 설정되어 있지 않습니다.']);
        }

        $response = Http::withHeaders([
            'Authorization' => 'Basic '.base64_encode($secretKey.':'),
            'Idempotency-Key' => (string) Str::uuid(),
        ])->post('https://api.tosspayments.com/v1/payments/confirm', [
            'paymentKey' => $validated['paymentKey'],
            'orderId' => $order->payment_order_id,
            'amount' => $order->cash_payment_amount,
        ]);

        if ($response->failed()) {
            $order->update(['payment_status' => 'failed']);

            return redirect()
                ->route('point-mall.orders.payment', $order)
                ->withErrors(['payment' => $response->json('message') ?? '결제 승인에 실패했습니다.']);
        }

        $payment = $response->json();
        $paymentStatus = $payment['status'] ?? 'approved';

        DB::transaction(function () use ($order, $payment, $paymentStatus, $validated, $pointLedger) {
            $order->refresh();

            $order->update([
                'status' => $paymentStatus === 'DONE' ? PointMallOrderStatus::Paid : PointMallOrderStatus::Pending,
                'payment_status' => strtolower($paymentStatus),
                'payment_key' => $validated['paymentKey'],
                'payment_method' => $payment['method'] ?? null,
                'payment_approved_at' => $paymentStatus === 'DONE' ? now() : null,
            ]);

            if ($paymentStatus === 'DONE') {
                $pointLedger->spendForPointMallOrder($order);
            }
        });

        return redirect()
            ->route('mypage.point-mall.orders')
            ->with('success', $paymentStatus === 'DONE' ? '결제가 완료되었습니다.' : '결제 요청이 접수되었습니다.');
    }

    public function paymentFail(Request $request): RedirectResponse
    {
        $orderId = $request->string('orderId')->toString();
        $message = $request->string('message')->toString() ?: '결제가 취소되었거나 실패했습니다.';

        $order = PointMallOrder::query()
            ->where('payment_order_id', $orderId)
            ->first();

        if ($order && $order->user_id === $request->user()->id) {
            $order->update(['payment_status' => 'failed']);

            return redirect()
                ->route('point-mall.orders.payment', $order)
                ->withErrors(['payment' => $message]);
        }

        return redirect()
            ->route('mypage.point-mall.orders')
            ->withErrors(['payment' => $message]);
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
            'paymentKey' => $order->payment_key,
            'paymentMethod' => $order->payment_method,
            'paymentRequestedAt' => $order->payment_requested_at?->format('Y-m-d H:i'),
            'paymentApprovedAt' => $order->payment_approved_at?->format('Y-m-d H:i'),
            'recipientName' => $order->recipient_name,
            'recipientPhone' => $order->recipient_phone,
            'postalCode' => $order->postal_code,
            'addressLine1' => $order->address_line1,
            'addressLine2' => $order->address_line2,
            'address' => trim($order->postal_code.' '.$order->address_line1.' '.($order->address_line2 ?? '')),
            'deliveryMemo' => $order->delivery_memo,
            'trackingNumber' => $order->tracking_number,
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

    private function paymentOrderName(PointMallOrder $order): string
    {
        $firstItem = $order->items->first();

        if (! $firstItem) {
            return '보험콕콕 포인트몰 주문';
        }

        $extraCount = max($order->items->count() - 1, 0);

        return $extraCount > 0
            ? "{$firstItem->product_name} 외 {$extraCount}건"
            : $firstItem->product_name;
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
            PointMallOrderStatus::ExchangeRequested => '교환신청',
            PointMallOrderStatus::ReturnRequested => '반품신청',
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
