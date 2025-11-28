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
                    ['name' => 'Curve Ahead', 'meaning' => 'A curve in the road is approaching. Reduce your speed before entering the curve and maintain control of your vehicle.', 'description' => 'Warns of a curve in the road ahead. Slow down and be prepared to adjust steering.', 'image' => 'https://cdn-icons-png.flaticon.com/512/5765/5765094.png'],
                    ['name' => 'Slippery Road', 'meaning' => 'Road surface may be slippery, especially when wet. Reduce speed significantly and avoid sudden braking, acceleration, or steering.', 'description' => 'Road may be slippery when wet. Reduce speed and avoid sudden movements.', 'image' => 'https://cdn-icons-png.flaticon.com/512/5765/5765110.png'],
                    ['name' => 'Road Narrows', 'meaning' => 'The road width decreases ahead. Slow down and be prepared to share the narrower road space with oncoming vehicles.', 'description' => 'The road ahead becomes narrower. Be prepared to share space with oncoming traffic.', 'image' => 'https://cdn-icons-png.flaticon.com/512/5765/5765098.png'],
                    ['name' => 'Pedestrian Crossing', 'meaning' => 'A designated pedestrian crossing area is ahead. Be prepared to stop for pedestrians who have the right of way.', 'description' => 'Pedestrians may be crossing ahead. Be prepared to stop.', 'image' => 'https://cdn-icons-png.flaticon.com/512/5765/5765088.png'],
                    ['name' => 'School Zone', 'meaning' => 'You are entering a school area. Reduce speed significantly, watch for children, and be prepared to stop at any moment.', 'description' => 'School area ahead. Watch for children and reduce speed.', 'image' => 'https://cdn-icons-png.flaticon.com/512/5765/5765106.png'],
                    ['name' => 'Animals Crossing', 'meaning' => 'Wild or domestic animals may cross the road in this area. Stay alert and be ready to stop to avoid collision.', 'description' => 'Animals may cross the road. Stay alert and be prepared to stop.', 'image' => 'https://cdn-icons-png.flaticon.com/512/5765/5765078.png'],
                    ['name' => 'Road Works', 'meaning' => 'Construction or road maintenance is in progress. Slow down, follow temporary signs, and be prepared for workers and equipment.', 'description' => 'Construction or maintenance work ahead. Slow down and follow directions.', 'image' => 'https://cdn-icons-png.flaticon.com/512/5765/5765102.png'],
                    ['name' => 'Steep Hill', 'meaning' => 'A steep gradient is ahead. Use a lower gear to maintain control and check your brakes. Heavy vehicles should use caution.', 'description' => 'Steep gradient ahead. Use appropriate gear and check brakes.', 'image' => 'https://cdn-icons-png.flaticon.com/512/5765/5765112.png'],
                ],
            ],
            [
                'name' => 'Regulatory Signs',
                'slug' => 'regulatory',
                'description' => 'Signs that indicate laws and regulations drivers must follow',
                'icon' => 'shield',
                'color' => '#EF4444',
                'signs' => [
                    ['name' => 'Stop', 'meaning' => 'You must come to a complete stop at this sign. Check for traffic and pedestrians before proceeding when safe.', 'description' => 'Come to a complete stop. Yield to traffic and pedestrians before proceeding.', 'image' => 'https://cdn-icons-png.flaticon.com/512/4821/4821336.png'],
                    ['name' => 'Give Way/Yield', 'meaning' => 'Slow down and yield the right of way to vehicles on the main road. Stop if necessary before entering.', 'description' => 'Slow down and give way to traffic on the main road.', 'image' => 'https://cdn-icons-png.flaticon.com/512/4821/4821330.png'],
                    ['name' => 'No Entry', 'meaning' => 'Entry is prohibited for all vehicles. This road may be one-way in the opposite direction or restricted access.', 'description' => 'Entry prohibited for all vehicles. Do not enter this road.', 'image' => 'https://cdn-icons-png.flaticon.com/512/4821/4821319.png'],
                    ['name' => 'Speed Limit', 'meaning' => 'This indicates the maximum legal speed on this road. Exceeding this limit is an offense and may result in fines.', 'description' => 'Maximum speed allowed on this road. Do not exceed the posted limit.', 'image' => 'https://cdn-icons-png.flaticon.com/512/4821/4821332.png'],
                    ['name' => 'No Overtaking', 'meaning' => 'Overtaking or passing other vehicles is prohibited in this area due to limited visibility or road conditions.', 'description' => 'Overtaking other vehicles is prohibited in this area.', 'image' => 'https://cdn-icons-png.flaticon.com/512/4821/4821317.png'],
                    ['name' => 'No Parking', 'meaning' => 'Parking is prohibited in this area. Stopping briefly to drop off passengers may be allowed, but not waiting.', 'description' => 'Parking is not allowed in this area.', 'image' => 'https://cdn-icons-png.flaticon.com/512/4821/4821315.png'],
                    ['name' => 'No U-Turn', 'meaning' => 'Making a U-turn is prohibited at this location. Continue forward and find an alternative route to change direction.', 'description' => 'U-turns are prohibited at this location.', 'image' => 'https://cdn-icons-png.flaticon.com/512/4821/4821321.png'],
                    ['name' => 'One Way', 'meaning' => 'Traffic on this road moves in one direction only. Driving against the flow of traffic is illegal and dangerous.', 'description' => 'Traffic flows in one direction only. Do not drive against traffic.', 'image' => 'https://cdn-icons-png.flaticon.com/512/4821/4821323.png'],
                ],
            ],
            [
                'name' => 'Informational Signs',
                'slug' => 'informational',
                'description' => 'Signs that provide useful information to drivers',
                'icon' => 'info',
                'color' => '#3B82F6',
                'signs' => [
                    ['name' => 'Hospital', 'meaning' => 'A hospital or medical facility is located in the direction indicated. Follow this sign in case of medical emergencies.', 'description' => 'Hospital or medical facility ahead or nearby.', 'image' => 'https://cdn-icons-png.flaticon.com/512/3063/3063176.png'],
                    ['name' => 'Fuel Station', 'meaning' => 'A petrol/fuel station is available in the direction indicated. Useful for refueling during long journeys.', 'description' => 'Fuel/petrol station available ahead.', 'image' => 'https://cdn-icons-png.flaticon.com/512/3063/3063098.png'],
                    ['name' => 'Parking', 'meaning' => 'A parking area or facility is available in the direction indicated. May be free or paid parking.', 'description' => 'Parking area available.', 'image' => 'https://cdn-icons-png.flaticon.com/512/3063/3063189.png'],
                    ['name' => 'Airport', 'meaning' => 'An airport is located in the direction indicated. Follow these signs for airport access.', 'description' => 'Airport direction or nearby.', 'image' => 'https://cdn-icons-png.flaticon.com/512/3063/3063045.png'],
                    ['name' => 'Restaurant', 'meaning' => 'Food services and restaurants are available in the direction indicated.', 'description' => 'Food services available ahead.', 'image' => 'https://cdn-icons-png.flaticon.com/512/3063/3063207.png'],
                    ['name' => 'Rest Area', 'meaning' => 'A rest area with facilities for travelers is available ahead. Good for breaks during long journeys.', 'description' => 'Rest stop or rest area ahead.', 'image' => 'https://cdn-icons-png.flaticon.com/512/3063/3063198.png'],
                    ['name' => 'Telephone', 'meaning' => 'A public telephone is available in the direction indicated. Useful for emergency calls.', 'description' => 'Public telephone available.', 'image' => 'https://cdn-icons-png.flaticon.com/512/3063/3063230.png'],
                    ['name' => 'Tourist Information', 'meaning' => 'A tourist information center is available ahead where you can get maps and local information.', 'description' => 'Tourist information center ahead.', 'image' => 'https://cdn-icons-png.flaticon.com/512/3063/3063237.png'],
                ],
            ],
            [
                'name' => 'Mandatory Signs',
                'slug' => 'mandatory',
                'description' => 'Signs that indicate actions drivers must take',
                'icon' => 'arrow-right-circle',
                'color' => '#10B981',
                'signs' => [
                    ['name' => 'Turn Left', 'meaning' => 'You are required to turn left at this junction. Going straight or turning right is not permitted.', 'description' => 'You must turn left at this junction.', 'image' => 'https://cdn-icons-png.flaticon.com/512/6211/6211480.png'],
                    ['name' => 'Turn Right', 'meaning' => 'You are required to turn right at this junction. Going straight or turning left is not permitted.', 'description' => 'You must turn right at this junction.', 'image' => 'https://cdn-icons-png.flaticon.com/512/6211/6211490.png'],
                    ['name' => 'Straight Ahead Only', 'meaning' => 'You must continue straight ahead. Turning left or right is not permitted at this location.', 'description' => 'You must continue straight ahead.', 'image' => 'https://cdn-icons-png.flaticon.com/512/6211/6211488.png'],
                    ['name' => 'Keep Left', 'meaning' => 'You must pass on the left side of an obstacle or island. Passing on the right is not permitted.', 'description' => 'Keep to the left side of the road or obstacle.', 'image' => 'https://cdn-icons-png.flaticon.com/512/6211/6211478.png'],
                    ['name' => 'Keep Right', 'meaning' => 'You must pass on the right side of an obstacle or island. Passing on the left is not permitted.', 'description' => 'Keep to the right side of the road or obstacle.', 'image' => 'https://cdn-icons-png.flaticon.com/512/6211/6211484.png'],
                    ['name' => 'Roundabout', 'meaning' => 'A roundabout is ahead. You must drive around it in the direction indicated and yield to traffic already in the roundabout.', 'description' => 'Roundabout ahead. Give way to traffic already in the roundabout.', 'image' => 'https://cdn-icons-png.flaticon.com/512/6211/6211486.png'],
                    ['name' => 'Minimum Speed', 'meaning' => 'You must maintain at least the speed shown. Driving slower than this limit is not permitted unless road conditions require it.', 'description' => 'You must maintain at least this speed.', 'image' => 'https://cdn-icons-png.flaticon.com/512/6211/6211482.png'],
                    ['name' => 'Pass Either Side', 'meaning' => 'You may pass on either the left or right side of an obstacle or traffic island.', 'description' => 'You may pass on either side of an obstacle.', 'image' => 'https://cdn-icons-png.flaticon.com/512/6211/6211476.png'],
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
                    ['slug' => \Str::slug($sign['name'])],
                    array_merge($sign, [
                        'road_sign_category_id' => $category->id,
                        'sort_order' => $signIndex
                    ])
                );
            }
        }
    }
}
