<?php

namespace App\Enums;

enum UserRole: string
{
    case Member = 'member';
    case Planner = 'planner';
    case Admin = 'admin';
}
