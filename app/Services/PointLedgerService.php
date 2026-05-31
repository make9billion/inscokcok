<?php

namespace App\Services;

use App\Enums\PointLedgerType;
use App\Models\Consultation;
use App\Models\Event;
use App\Models\PointLedgerEntry;
use App\Models\PointMallOrder;
use App\Models\User;

class PointLedgerService
{
    public function grantSignupBonus(User $user): ?PointLedgerEntry
    {
        $event = $this->activeEvent('signup_bonus', 'member.registered');

        if (! $event) {
            return null;
        }

        $idempotencyKey = 'signup:'.$user->id;

        if (PointLedgerEntry::query()->where('idempotency_key', $idempotencyKey)->exists()) {
            return null;
        }

        $currentBalance = (int) $user->pointLedgerEntries()->sum('points');

        return PointLedgerEntry::create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'type' => PointLedgerType::Earned,
            'points' => $event->point_amount,
            'balance_after' => $currentBalance + $event->point_amount,
            'idempotency_key' => $idempotencyKey,
            'memo' => $event->name,
        ]);
    }

    public function grantConsultationCompletedBonus(Consultation $consultation): ?PointLedgerEntry
    {
        if (! $consultation->user_id) {
            return null;
        }

        $event = $this->activeEvent('consultation_completed_bonus', 'consultation.completed');

        if (! $event) {
            return null;
        }

        $idempotencyKey = 'consultation-completed:'.$consultation->id;

        if (PointLedgerEntry::query()->where('idempotency_key', $idempotencyKey)->exists()) {
            return null;
        }

        $user = $consultation->user;
        $currentBalance = (int) $user->pointLedgerEntries()->sum('points');

        return PointLedgerEntry::create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'type' => PointLedgerType::Earned,
            'points' => $event->point_amount,
            'balance_after' => $currentBalance + $event->point_amount,
            'idempotency_key' => $idempotencyKey,
            'memo' => $event->name,
        ]);
    }

    public function spendForPointMallOrder(PointMallOrder $order): ?PointLedgerEntry
    {
        if ($order->used_points <= 0) {
            return null;
        }

        $idempotencyKey = 'point-mall-order-spent:'.$order->id;

        if (PointLedgerEntry::query()->where('idempotency_key', $idempotencyKey)->exists()) {
            return null;
        }

        $user = $order->user;
        $currentBalance = (int) $user->pointLedgerEntries()->sum('points');

        return PointLedgerEntry::create([
            'user_id' => $user->id,
            'order_id' => $order->id,
            'type' => PointLedgerType::Spent,
            'points' => -$order->used_points,
            'balance_after' => $currentBalance - $order->used_points,
            'idempotency_key' => $idempotencyKey,
            'memo' => '포인트몰 주문 결제',
        ]);
    }

    public function refundForPointMallOrder(PointMallOrder $order): ?PointLedgerEntry
    {
        if ($order->used_points <= 0) {
            return null;
        }

        $idempotencyKey = 'point-mall-order-refund:'.$order->id;

        if (PointLedgerEntry::query()->where('idempotency_key', $idempotencyKey)->exists()) {
            return null;
        }

        $user = $order->user;
        $currentBalance = (int) $user->pointLedgerEntries()->sum('points');

        return PointLedgerEntry::create([
            'user_id' => $user->id,
            'order_id' => $order->id,
            'type' => PointLedgerType::Refunded,
            'points' => $order->used_points,
            'balance_after' => $currentBalance + $order->used_points,
            'idempotency_key' => $idempotencyKey,
            'memo' => '포인트몰 주문 취소 환불',
        ]);
    }

    private function activeEvent(string $slug, string $triggerType): ?Event
    {
        return Event::query()
            ->where('slug', $slug)
            ->where('trigger_type', $triggerType)
            ->where('is_active', true)
            ->where(fn ($query) => $query
                ->whereNull('starts_at')
                ->orWhere('starts_at', '<=', now()))
            ->where(fn ($query) => $query
                ->whereNull('ends_at')
                ->orWhere('ends_at', '>=', now()))
            ->first();
    }
}
