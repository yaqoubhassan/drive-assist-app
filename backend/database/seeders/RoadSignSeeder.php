<?php

namespace Database\Seeders;

use App\Models\RoadSignCategory;
use App\Models\RoadSign;
use Illuminate\Database\Seeder;

class RoadSignSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Warning Signs',
                'slug' => 'warning',
                'description' => 'Signs that warn drivers of potential hazards ahead',
                'icon' => 'alert-triangle',
                'color' => '#F59E0B',
                'signs' => [
                    ['name' => 'Curve Ahead', 'description' => 'Warns of a curve in the road ahead. Slow down and be prepared to adjust steering.', 'image' => 'https://cdn-icons-png.flaticon.com/512/5765/5765094.png'],
                    ['name' => 'Slippery Road', 'description' => 'Road may be slippery when wet. Reduce speed and avoid sudden movements.', 'image' => 'https://cdn-icons-png.flaticon.com/512/5765/5765110.png'],
                    ['name' => 'Road Narrows', 'description' => 'The road ahead becomes narrower. Be prepared to share space with oncoming traffic.', 'image' => 'https://cdn-icons-png.flaticon.com/512/5765/5765098.png'],
                    ['name' => 'Pedestrian Crossing', 'description' => 'Pedestrians may be crossing ahead. Be prepared to stop.', 'image' => 'https://cdn-icons-png.flaticon.com/512/5765/5765088.png'],
                    ['name' => 'School Zone', 'description' => 'School area ahead. Watch for children and reduce speed.', 'image' => 'https://cdn-icons-png.flaticon.com/512/5765/5765106.png'],
                    ['name' => 'Animals Crossing', 'description' => 'Animals may cross the road. Stay alert and be prepared to stop.', 'image' => 'https://cdn-icons-png.flaticon.com/512/5765/5765078.png'],
                    ['name' => 'Road Works', 'description' => 'Construction or maintenance work ahead. Slow down and follow directions.', 'image' => 'https://cdn-icons-png.flaticon.com/512/5765/5765102.png'],
                    ['name' => 'Steep Hill', 'description' => 'Steep gradient ahead. Use appropriate gear and check brakes.', 'image' => 'https://cdn-icons-png.flaticon.com/512/5765/5765112.png'],
                ],
            ],
            [
                'name' => 'Regulatory Signs',
                'slug' => 'regulatory',
                'description' => 'Signs that indicate laws and regulations drivers must follow',
                'icon' => 'shield',
                'color' => '#EF4444',
                'signs' => [
                    ['name' => 'Stop', 'description' => 'Come to a complete stop. Yield to traffic and pedestrians before proceeding.', 'image' => 'https://cdn-icons-png.flaticon.com/512/4821/4821336.png'],
                    ['name' => 'Give Way/Yield', 'description' => 'Slow down and give way to traffic on the main road.', 'image' => 'https://cdn-icons-png.flaticon.com/512/4821/4821330.png'],
                    ['name' => 'No Entry', 'description' => 'Entry prohibited for all vehicles. Do not enter this road.', 'image' => 'https://cdn-icons-png.flaticon.com/512/4821/4821319.png'],
                    ['name' => 'Speed Limit', 'description' => 'Maximum speed allowed on this road. Do not exceed the posted limit.', 'image' => 'https://cdn-icons-png.flaticon.com/512/4821/4821332.png'],
                    ['name' => 'No Overtaking', 'description' => 'Overtaking other vehicles is prohibited in this area.', 'image' => 'https://cdn-icons-png.flaticon.com/512/4821/4821317.png'],
                    ['name' => 'No Parking', 'description' => 'Parking is not allowed in this area.', 'image' => 'https://cdn-icons-png.flaticon.com/512/4821/4821315.png'],
                    ['name' => 'No U-Turn', 'description' => 'U-turns are prohibited at this location.', 'image' => 'https://cdn-icons-png.flaticon.com/512/4821/4821321.png'],
                    ['name' => 'One Way', 'description' => 'Traffic flows in one direction only. Do not drive against traffic.', 'image' => 'https://cdn-icons-png.flaticon.com/512/4821/4821323.png'],
                ],
            ],
            [
                'name' => 'Informational Signs',
                'slug' => 'informational',
                'description' => 'Signs that provide useful information to drivers',
                'icon' => 'info',
                'color' => '#3B82F6',
                'signs' => [
                    ['name' => 'Hospital', 'description' => 'Hospital or medical facility ahead or nearby.', 'image' => 'https://cdn-icons-png.flaticon.com/512/3063/3063176.png'],
                    ['name' => 'Fuel Station', 'description' => 'Fuel/petrol station available ahead.', 'image' => 'https://cdn-icons-png.flaticon.com/512/3063/3063098.png'],
                    ['name' => 'Parking', 'description' => 'Parking area available.', 'image' => 'https://cdn-icons-png.flaticon.com/512/3063/3063189.png'],
                    ['name' => 'Airport', 'description' => 'Airport direction or nearby.', 'image' => 'https://cdn-icons-png.flaticon.com/512/3063/3063045.png'],
                    ['name' => 'Restaurant', 'description' => 'Food services available ahead.', 'image' => 'https://cdn-icons-png.flaticon.com/512/3063/3063207.png'],
                    ['name' => 'Rest Area', 'description' => 'Rest stop or rest area ahead.', 'image' => 'https://cdn-icons-png.flaticon.com/512/3063/3063198.png'],
                    ['name' => 'Telephone', 'description' => 'Public telephone available.', 'image' => 'https://cdn-icons-png.flaticon.com/512/3063/3063230.png'],
                    ['name' => 'Tourist Information', 'description' => 'Tourist information center ahead.', 'image' => 'https://cdn-icons-png.flaticon.com/512/3063/3063237.png'],
                ],
            ],
            [
                'name' => 'Mandatory Signs',
                'slug' => 'mandatory',
                'description' => 'Signs that indicate actions drivers must take',
                'icon' => 'arrow-right-circle',
                'color' => '#10B981',
                'signs' => [
                    ['name' => 'Turn Left', 'description' => 'You must turn left at this junction.', 'image' => 'https://cdn-icons-png.flaticon.com/512/6211/6211480.png'],
                    ['name' => 'Turn Right', 'description' => 'You must turn right at this junction.', 'image' => 'https://cdn-icons-png.flaticon.com/512/6211/6211490.png'],
                    ['name' => 'Straight Ahead Only', 'description' => 'You must continue straight ahead.', 'image' => 'https://cdn-icons-png.flaticon.com/512/6211/6211488.png'],
                    ['name' => 'Keep Left', 'description' => 'Keep to the left side of the road or obstacle.', 'image' => 'https://cdn-icons-png.flaticon.com/512/6211/6211478.png'],
                    ['name' => 'Keep Right', 'description' => 'Keep to the right side of the road or obstacle.', 'image' => 'https://cdn-icons-png.flaticon.com/512/6211/6211484.png'],
                    ['name' => 'Roundabout', 'description' => 'Roundabout ahead. Give way to traffic already in the roundabout.', 'image' => 'https://cdn-icons-png.flaticon.com/512/6211/6211486.png'],
                    ['name' => 'Minimum Speed', 'description' => 'You must maintain at least this speed.', 'image' => 'https://cdn-icons-png.flaticon.com/512/6211/6211482.png'],
                    ['name' => 'Pass Either Side', 'description' => 'You may pass on either side of an obstacle.', 'image' => 'https://cdn-icons-png.flaticon.com/512/6211/6211476.png'],
                ],
            ],
        ];

        foreach ($categories as $index => $categoryData) {
            $signs = $categoryData['signs'];
            unset($categoryData['signs']);

            $category = RoadSignCategory::updateOrCreate(
                ['slug' => $categoryData['slug']],
                array_merge($categoryData, ['sort_order' => $index])
            );

            foreach ($signs as $signIndex => $sign) {
                RoadSign::updateOrCreate(
                    ['road_sign_category_id' => $category->id, 'slug' => \Str::slug($sign['name'])],
                    array_merge($sign, ['sort_order' => $signIndex])
                );
            }
        }
    }
}
