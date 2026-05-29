<?php

namespace App\Enums;

enum KnowledgeQuestionStatus: string
{
    case Open = 'open';
    case Answered = 'answered';
    case Closed = 'closed';
}
