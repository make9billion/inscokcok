<?php

namespace App\Services;

use App\Enums\PointMallOrderStatus;
use App\Models\PointMallOrder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PointMallOrderService
{
    public function __construct(private readonly PointLedgerService $pointLedger)
    {
    }

    public function cancelAndRefund(PointMallOrder $order): PointMallOrder
    {
        $order->loadMissing(['items.product', 'user']);

        $this->cancelTossPaymentIfNeeded($order);

        return DB::transaction(function () use ($order) {
            $order->refresh()->loadMissing(['items.product', 'user']);

            if (in_array($order->status, [PointMallOrderStatus::Cancelled, PointMallOrderStatus::Refunded], true)) {
                return $order;
            }

            foreach ($order->items as $item) {
                $item->product?->increment('stock_quantity', $item->quantity);
            }

            if ($order->status !== PointMallOrderStatus::Pending) {
                $this->pointLedger->refundForPointMallOrder($order);
            }

            $order->update([
                'status' => $order->status === PointMallOrderStatus::Pending
                    ? PointMallOrderStatus::Cancelled
                    : ($order->used_points > 0
                    ? PointMallOrderStatus::Refunded
                    : PointMallOrderStatus::Cancelled),
                'payment_status' => $order->payment_key
                    ? 'cancelled'
                    : (in_array($order->payment_status, ['ready', 'requested'], true)
                    ? 'cancelled'
                    : $order->payment_status),
                'cancelled_at' => now(),
            ]);

            return $order->refresh();
        });
    }

    public function markPaid(PointMallOrder $order, array $paymentData = []): PointMallOrder
    {
        return DB::transaction(function () use ($order, $paymentData) {
            $order->loadMissing('user');

            if ($order->status === PointMallOrderStatus::Paid) {
                $this->pointLedger->spendForPointMallOrder($order);

                return $order->refresh();
            }

            if ($order->status !== PointMallOrderStatus::Pending) {
                return $order;
            }

            $this->pointLedger->spendForPointMallOrder($order);

            $order->update([
                'status' => PointMallOrderStatus::Paid,
                'payment_status' => $order->cash_payment_amount > 0 ? 'paid' : 'not_required',
                'payment_key' => $paymentData['payment_key'] ?? $order->payment_key,
                'payment_method' => $paymentData['payment_method'] ?? $order->payment_method,
                'payment_approved_at' => $paymentData['payment_approved_at'] ?? now(),
            ]);

            return $order->refresh();
        });
    }

    private function cancelTossPaymentIfNeeded(PointMallOrder $order): void
    {
        if ($order->cash_payment_amount <= 0 || ! $order->payment_key) {
            return;
        }

        if (in_array($order->payment_status, ['cancelled', 'canceled'], true)) {
            return;
        }

        $secretKey = config('services.toss_payments.secret_key');

        if (! $secretKey) {
            throw ValidationException::withMessages([
                'order' => '토스페이먼츠 시크릿 키가 설정되어 있지 않아 결제 취소를 진행할 수 없습니다.',
            ]);
        }

        $response = Http::withHeaders([
            'Authorization' => 'Basic '.base64_encode($secretKey.':'),
            'Idempotency-Key' => 'point-mall-cancel-'.$order->id.'-'.Str::uuid(),
        ])->post("https://api.tosspayments.com/v1/payments/{$order->payment_key}/cancel", [
            'cancelReason' => '포인트몰 주문 취소',
        ]);

        if ($response->failed()) {
            throw ValidationException::withMessages([
                'order' => $response->json('message') ?? '토스페이먼츠 결제 취소에 실패했습니다.',
            ]);
        }
    }
}
