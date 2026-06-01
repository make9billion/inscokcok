<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PointMallOrderStatus;
use App\Http\Controllers\Controller;
use App\Models\PointMallOrder;
use App\Models\PointMallOrderItem;
use App\Services\PointMallOrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PointMallOrderManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAdmin($request);

        return Inertia::render('Admin/PointMall/Orders', [
            'orders' => PointMallOrder::query()
                ->with(['user', 'items'])
                ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
                ->when($request->filled('search'), function ($query) use ($request) {
                    $keyword = $request->string('search')->toString();

                    $query->where(function ($query) use ($keyword) {
                        $query->where('order_number', 'like', "%{$keyword}%")
                            ->orWhere('recipient_name', 'like', "%{$keyword}%")
                            ->orWhereHas('user', fn ($userQuery) => $userQuery
                                ->where('name', 'like', "%{$keyword}%")
                                ->orWhere('email', 'like', "%{$keyword}%"));
                    });
                })
                ->latest()
                ->take(100)
                ->get()
                ->map(fn (PointMallOrder $order) => $this->serializeOrder($order)),
            'filters' => [
                'status' => $request->string('status')->toString(),
                'search' => $request->string('search')->toString(),
            ],
            'statusOptions' => collect([
                PointMallOrderStatus::Pending,
                PointMallOrderStatus::Paid,
                PointMallOrderStatus::Preparing,
                PointMallOrderStatus::Shipped,
                PointMallOrderStatus::Delivered,
            ])->map(fn (PointMallOrderStatus $status) => [
                'value' => $status->value,
                'label' => $this->statusLabel($status),
            ]),
        ]);
    }

    public function updateStatus(Request $request, PointMallOrder $order, PointMallOrderService $orders): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'status' => ['required', Rule::in([
                PointMallOrderStatus::Pending->value,
                PointMallOrderStatus::Paid->value,
                PointMallOrderStatus::Preparing->value,
                PointMallOrderStatus::Shipped->value,
                PointMallOrderStatus::Delivered->value,
            ])],
        ]);

        if (in_array($order->status, [PointMallOrderStatus::Cancelled, PointMallOrderStatus::Refunded], true)) {
            return back()->withErrors(['status' => '취소/환불 완료된 주문은 상태를 변경할 수 없습니다.']);
        }

        $toStatus = PointMallOrderStatus::from($validated['status']);

        if ($order->status === PointMallOrderStatus::Pending && $toStatus !== PointMallOrderStatus::Paid) {
            return back()->withErrors(['status' => '결제대기 주문은 결제완료 처리 후 배송 상태로 이동할 수 있습니다.']);
        }

        if ($toStatus === PointMallOrderStatus::Paid) {
            $orders->markPaid($order);

            return redirect()
                ->route('admin.point-mall.orders.index')
                ->with('success', '주문이 결제완료로 확정되었습니다.');
        }

        $order->update([
            'status' => $toStatus,
        ]);

        return redirect()
            ->route('admin.point-mall.orders.index')
            ->with('success', '주문 상태가 변경되었습니다.');
    }

    public function cancel(Request $request, PointMallOrder $order, PointMallOrderService $orders): RedirectResponse
    {
        $this->authorizeAdmin($request);

        if (in_array($order->status, [
            PointMallOrderStatus::Shipped,
            PointMallOrderStatus::Delivered,
            PointMallOrderStatus::Cancelled,
            PointMallOrderStatus::Refunded,
        ], true)) {
            return back()->withErrors(['order' => '배송 시작 이후 또는 이미 취소된 주문은 취소할 수 없습니다.']);
        }

        $orders->cancelAndRefund($order);

        return redirect()
            ->route('admin.point-mall.orders.index')
            ->with('success', '주문이 취소되었고 사용 포인트가 환불되었습니다.');
    }

    private function serializeOrder(PointMallOrder $order): array
    {
        return [
            'id' => $order->id,
            'orderNumber' => $order->order_number,
            'memberName' => $order->user?->name,
            'memberEmail' => $order->user?->email,
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
            'address' => trim($order->postal_code.' '.$order->address_line1.' '.($order->address_line2 ?? '')),
            'deliveryMemo' => $order->delivery_memo,
            'orderedAt' => $order->ordered_at?->format('Y-m-d H:i'),
            'cancelledAt' => $order->cancelled_at?->format('Y-m-d H:i'),
            'canCancel' => in_array($order->status, [PointMallOrderStatus::Paid, PointMallOrderStatus::Preparing], true),
            'canUpdateStatus' => ! in_array($order->status, [PointMallOrderStatus::Cancelled, PointMallOrderStatus::Refunded], true),
            'items' => $order->items->map(fn (PointMallOrderItem $item) => [
                'name' => $item->product_name,
                'quantity' => $item->quantity,
                'lineTotalPoints' => $item->line_total_points,
            ])->values(),
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

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->isAdmin(), 403);
    }
}
