<?php

namespace App\Enums;

enum ConsultationStatus: string
{
    case Received = 'received';
    case Assigned = 'assigned';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
}
