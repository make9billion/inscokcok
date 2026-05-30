<?php

namespace App\Services;

use App\Enums\PointLedgerType;
use App\Models\Event;
use App\Models\PointLedgerEntry;
use App\Models\User;

class PointLedgerService
{
    public function grantSignupBonus(User $user): ?PointLedgerEntry
    {
        $event = Event::query()
            ->where('slug', 'signup_bonus')
            ->where('trigger_type', 'member.registered')
            ->where('is_active', true)
            ->where(fn ($query) => $query
                ->whereNull('starts_at')
                ->orWhere('starts_at', '<=', now()))
            ->where(fn ($query) => $query
                ->whereNull('ends_at')
                ->orWhere('ends_at', '>=', now()))
            ->first();

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
}
