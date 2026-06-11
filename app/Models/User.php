<?php

namespace App\Models;

use App\Enums\UserRole;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'name',
        'email',
        'role',
        'admin_approval_status',
        'admin_requested_role',
        'admin_approved_at',
        'admin_approved_by',
        'phone',
        'organization',
        'birth_date',
        'gender',
        'postal_code',
        'address_line1',
        'address_line2',
        'withdrawn_at',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'role' => UserRole::class,
            'admin_approved_at' => 'datetime',
            'birth_date' => 'date',
            'withdrawn_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isMember(): bool
    {
        return $this->role === UserRole::Member;
    }

    public function isPlanner(): bool
    {
        return $this->role === UserRole::Planner;
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function canAccessAdmin(): bool
    {
        return $this->admin_approval_status === 'approved'
            && ($this->isPlanner() || $this->isAdmin());
    }

    public function consultations(): HasMany
    {
        return $this->hasMany(Consultation::class);
    }

    public function assignedConsultations(): HasMany
    {
        return $this->hasMany(Consultation::class, 'assigned_planner_id');
    }

    public function knowledgeQuestions(): HasMany
    {
        return $this->hasMany(KnowledgeQuestion::class);
    }

    public function assignedKnowledgeQuestions(): HasMany
    {
        return $this->hasMany(KnowledgeQuestion::class, 'assigned_manager_id');
    }

    public function knowledgeAnswers(): HasMany
    {
        return $this->hasMany(KnowledgeAnswer::class, 'manager_id');
    }

    public function pointLedgerEntries(): HasMany
    {
        return $this->hasMany(PointLedgerEntry::class);
    }

    public function pointMallCart(): HasOne
    {
        return $this->hasOne(PointMallCart::class);
    }

    public function pointMallOrders(): HasMany
    {
        return $this->hasMany(PointMallOrder::class);
    }

    public function adminAuditLogs(): HasMany
    {
        return $this->hasMany(AdminAuditLog::class, 'actor_id');
    }
}
