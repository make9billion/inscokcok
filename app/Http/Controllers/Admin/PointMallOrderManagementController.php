<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PointMallOrderStatus;
use App\Http\Controllers\Controller;
use App\Models\PointMallOrder;
use App\Models\PointMallOrderItem;
use App\Services\PointMallOrderService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PointMallOrderManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAdmin($request);

        return Inertia::render('Admin/PointMall/Orders', [
            'orders' => $this->ordersQuery($request)
                ->latest()
                ->take(100)
                ->get()
                ->map(fn (PointMallOrder $order) => $this->serializeOrder($order)),
            'filters' => $this->filters($request),
            'statusOptions' => $this->statusOptions(),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $this->authorizeAdmin($request);

        $orders = $this->ordersQuery($request)
            ->latest()
            ->get();

        $filename = 'point-mall-orders-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($orders) {
            $handle = fopen('php://output', 'w');

            fputs($handle, "\xEF\xBB\xBF");
            fputcsv($handle, [
                '주문번호',
                '회원명',
                '회원이메일',
                '상태',
                '결제상태',
                '결제수단',
                '상품포인트',
                '사용포인트',
                '배송비',
                '추가결제금액',
                '수령인',
                '연락처',
                '주소',
                '송장번호',
                '배송메모',
                '주문상품',
                '수량',
                '주문일',
                '취소일',
            ]);

            foreach ($orders as $order) {
                fputcsv($handle, [
                    $order->order_number,
                    $order->user?->name,
                    $order->user?->email,
                    $this->statusLabel($order->status),
                    $order->payment_status,
                    $order->payment_method,
                    $order->total_points,
                    $order->used_points,
                    $order->delivery_fee,
                    $order->cash_payment_amount,
                    $order->recipient_name,
                    $order->recipient_phone,
                    trim($order->postal_code.' '.$order->address_line1.' '.($order->address_line2 ?? '')),
                    $order->tracking_number,
                    $order->delivery_memo,
                    $order->items
                        ->map(fn (PointMallOrderItem $item) => $item->product_name)
                        ->implode(' / '),
                    $order->items
                        ->map(fn (PointMallOrderItem $item) => $item->quantity)
                        ->implode(' / '),
                    $order->ordered_at?->format('Y-m-d H:i'),
                    $order->cancelled_at?->format('Y-m-d H:i'),
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function updateStatus(Request $request, PointMallOrder $order, PointMallOrderService $orders): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'status' => ['required', Rule::in($this->statusOptions()->pluck('value')->all())],
        ]);

        if (in_array($order->status, [PointMallOrderStatus::Cancelled, PointMallOrderStatus::Refunded], true)) {
            return back()->withErrors(['status' => '취소/환불 완료된 주문은 상태를 변경할 수 없습니다.']);
        }

        $toStatus = PointMallOrderStatus::from($validated['status']);

        if ($order->status === PointMallOrderStatus::Pending && ! in_array($toStatus, [PointMallOrderStatus::Paid, PointMallOrderStatus::Cancelled], true)) {
            return back()->withErrors(['status' => '결제대기 주문은 결제완료 처리 후 배송 상태로 이동할 수 있습니다.']);
        }

        if ($toStatus === PointMallOrderStatus::Cancelled) {
            $orders->cancelAndRefund($order);

            return back()->with('success', '주문을 취소완료로 처리했습니다.');
        }

        if ($toStatus === PointMallOrderStatus::Paid) {
            $orders->markPaid($order);

            return back()->with('success', '주문을 결제완료로 확정했습니다.');
        }

        $order->update([
            'status' => $toStatus,
        ]);

        return back()->with('success', '주문 상태가 변경되었습니다.');
    }

    public function updateTracking(Request $request, PointMallOrder $order): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'tracking_number' => ['required', 'string', 'max:80'],
        ]);

        if (in_array($order->status, [PointMallOrderStatus::Cancelled, PointMallOrderStatus::Refunded], true)) {
            return back()->withErrors(['tracking_number' => '취소/환불 완료된 주문에는 송장번호를 입력할 수 없습니다.']);
        }

        $order->update([
            'tracking_number' => $validated['tracking_number'],
            'status' => PointMallOrderStatus::Shipped,
        ]);

        return back()->with('success', '송장번호를 저장하고 배송중으로 변경했습니다.');
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

        return back()->with('success', '주문을 취소하고 결제/포인트 환불을 처리했습니다.');
    }

    private function ordersQuery(Request $request): Builder
    {
        return PointMallOrder::query()
            ->with(['user', 'items'])
            ->when($request->filled('status'), fn (Builder $query) => $query->where('status', $request->string('status')->toString()))
            ->when($request->filled('search'), function (Builder $query) use ($request) {
                $keyword = $request->string('search')->toString();

                $query->where(function (Builder $query) use ($keyword) {
                    $query->where('order_number', 'like', "%{$keyword}%")
                        ->orWhere('recipient_name', 'like', "%{$keyword}%")
                        ->orWhere('recipient_phone', 'like', "%{$keyword}%")
                        ->orWhere('tracking_number', 'like', "%{$keyword}%")
                        ->orWhereHas('user', fn (Builder $userQuery) => $userQuery
                            ->where('name', 'like', "%{$keyword}%")
                            ->orWhere('email', 'like', "%{$keyword}%"));
                });
            });
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
            'trackingNumber' => $order->tracking_number,
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

    private function filters(Request $request): array
    {
        return [
            'status' => $request->string('status')->toString(),
            'search' => $request->string('search')->toString(),
        ];
    }

    private function statusOptions()
    {
        return collect([
            PointMallOrderStatus::Pending,
            PointMallOrderStatus::Paid,
            PointMallOrderStatus::Preparing,
            PointMallOrderStatus::Shipped,
            PointMallOrderStatus::Delivered,
            PointMallOrderStatus::Cancelled,
            PointMallOrderStatus::ExchangeRequested,
            PointMallOrderStatus::ReturnRequested,
        ])->map(fn (PointMallOrderStatus $status) => [
            'value' => $status->value,
            'label' => $this->statusLabel($status),
        ]);
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

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->isAdmin(), 403);
    }
}
