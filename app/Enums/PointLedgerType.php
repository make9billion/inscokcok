<?php

namespace App\Enums;

enum PointLedgerType: string
{
    case Earned = 'earned';
    case Spent = 'spent';
    case Refunded = 'refunded';
    case Adjusted = 'adjusted';
    case Expired = 'expired';
}
