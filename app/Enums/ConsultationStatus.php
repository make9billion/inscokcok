<?php

namespace App\Enums;

enum ConsultationStatus: string
{
    case Received = 'received';
    case NoAnswer = 'no_answer';
    case Recall = 'recall';
    case Assigned = 'assigned';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case ConsultationCancelled = 'consultation_cancelled';
}
