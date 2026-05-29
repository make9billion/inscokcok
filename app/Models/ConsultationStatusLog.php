<?php

namespace App\Models;

use App\Enums\ConsultationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConsultationStatusLog extends Model
{
    protected $fillable = [
        'consultation_id',
        'actor_id',
        'from_status',
        'to_status',
        'memo',
    ];

    protected function casts(): array
    {
        return [
            'from_status' => ConsultationStatus::class,
            'to_status' => ConsultationStatus::class,
        ];
    }

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
