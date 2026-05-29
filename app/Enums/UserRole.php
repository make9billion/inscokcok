<?php

namespace App\Enums;

enum UserRole: string
{
    case Member = 'member';
    case Planner = 'planner';
    case ConsultationManager = 'consultation_manager';
    case Admin = 'admin';
}
