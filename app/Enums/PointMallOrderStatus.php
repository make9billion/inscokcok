<?php

namespace App\Enums;

enum PointMallOrderStatus: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case Preparing = 'preparing';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';
    case Refunded = 'refunded';
    case ExchangeRequested = 'exchange_requested';
    case ReturnRequested = 'return_requested';
}
