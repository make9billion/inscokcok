<?php

namespace App\Http\Controllers;

use App\Models\PointLedgerEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MemberPointController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('MyPage/Points', [
            'pointBalance' => (int) $user->pointLedgerEntries()->sum('points'),
            'entries' => $user->pointLedgerEntries()
                ->latest()
                ->take(50)
                ->get()
                ->map(fn (PointLedgerEntry $entry) => [
                    'id' => $entry->id,
                    'type' => $entry->type->value,
                    'points' => $entry->points,
                    'balanceAfter' => $entry->balance_after,
                    'memo' => $entry->memo,
                    'createdAt' => $entry->created_at?->format('Y-m-d H:i'),
                ]),
        ]);
    }
}
