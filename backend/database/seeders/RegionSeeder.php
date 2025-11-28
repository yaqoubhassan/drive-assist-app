<?php

namespace Database\Seeders;

use App\Models\Region;
use Illuminate\Database\Seeder;

class RegionSeeder extends Seeder
{
    public function run(): void
    {
        $regions = [
            ['name' => 'Greater Accra', 'code' => 'GAR'],
            ['name' => 'Ashanti', 'code' => 'ASH'],
            ['name' => 'Western', 'code' => 'WES'],
            ['name' => 'Eastern', 'code' => 'EAS'],
            ['name' => 'Central', 'code' => 'CEN'],
            ['name' => 'Volta', 'code' => 'VOL'],
            ['name' => 'Northern', 'code' => 'NOR'],
            ['name' => 'Upper East', 'code' => 'UER'],
            ['name' => 'Upper West', 'code' => 'UWR'],
            ['name' => 'Brong Ahafo', 'code' => 'BAR'],
            ['name' => 'Western North', 'code' => 'WNR'],
            ['name' => 'Ahafo', 'code' => 'AHF'],
            ['name' => 'Bono East', 'code' => 'BER'],
            ['name' => 'Oti', 'code' => 'OTI'],
            ['name' => 'North East', 'code' => 'NER'],
            ['name' => 'Savannah', 'code' => 'SAV'],
        ];

        foreach ($regions as $region) {
            Region::updateOrCreate(
                ['code' => $region['code']],
                ['name' => $region['name'], 'country' => 'Ghana']
            );
        }
    }
}
