<?php

namespace App\Models;

use App\Enums\ConsultationStatus;
use App\Enums\ConsultationType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Consultation extends Model
{
    /** @use HasFactory<\Database\Factories\ConsultationFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'assigned_planner_id',
        'type',
        'source',
        'status',
        'applicant_name',
        'phone',
        'birth_date',
        'current_monthly_premium',
        'interested_product',
        'preferred_contact_time',
        'memo',
        'privacy_agreed_at',
        'third_party_agreed_at',
        'completed_at',
        'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'type' => ConsultationType::class,
            'status' => ConsultationStatus::class,
            'birth_date' => 'date',
            'privacy_agreed_at' => 'datetime',
            'third_party_agreed_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedPlanner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_planner_id');
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(ConsultationStatusLog::class);
    }
}
