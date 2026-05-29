<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PointMallCategorySeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        DB::table('point_mall_categories')->upsert([
            [
                'name' => '주방용품',
                'slug' => 'kitchen',
                'sort_order' => 10,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => '건강식품',
                'slug' => 'health-food',
                'sort_order' => 20,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => '휴대폰 주변기기',
                'slug' => 'mobile-accessories',
                'sort_order' => 30,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => '잡화',
                'slug' => 'goods',
                'sort_order' => 40,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ], ['slug'], ['name', 'sort_order', 'is_active', 'updated_at']);
    }
}
