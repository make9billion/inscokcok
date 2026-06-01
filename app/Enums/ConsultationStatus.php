<?php

namespace App\Enums;

enum ConsultationStatus: string
{
    case Received = 'received';
    case NoAnswer = 'no_answer';
    case Recall = 'recall';
    case Cancelled = 'cancelled';
    case Assigned = 'assigned';
    case Completed = 'completed';
    case ConsultationCancelled = 'consultation_cancelled';
}
