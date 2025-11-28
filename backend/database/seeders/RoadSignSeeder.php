<?php

namespace Database\Seeders;

use App\Models\RoadSignCategory;
use App\Models\RoadSign;
use Illuminate\Database\Seeder;

class RoadSignSeeder extends Seeder
{
    /**
     * Ghana DVLA Road Signs Seeder
     * Based on Ghana Road Traffic Regulations
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Warning Signs',
                'slug' => 'warning',
                'description' => 'Yellow/amber triangular signs that warn drivers of potential hazards ahead. These signs help drivers prepare for dangerous conditions.',
                'icon' => 'warning',
                'color' => '#F59E0B',
                'signs' => $this->getWarningSigns(),
            ],
            [
                'name' => 'Regulatory Signs',
                'slug' => 'regulatory',
                'description' => 'Red circular signs that indicate prohibitions, restrictions, and mandatory requirements. Failure to obey these signs is an offense.',
                'icon' => 'gavel',
                'color' => '#EF4444',
                'signs' => $this->getRegulatorySigns(),
            ],
            [
                'name' => 'Informational Signs',
                'slug' => 'informational',
                'description' => 'Blue or green rectangular signs that provide useful information about services, directions, and facilities.',
                'icon' => 'info',
                'color' => '#3B82F6',
                'signs' => $this->getInformationalSigns(),
            ],
            [
                'name' => 'Mandatory Signs',
                'slug' => 'mandatory',
                'description' => 'Blue circular signs that indicate actions drivers must take. These are compulsory directions.',
                'icon' => 'check-circle',
                'color' => '#10B981',
                'signs' => $this->getMandatorySigns(),
            ],
            [
                'name' => 'Temporary Signs',
                'slug' => 'temporary',
                'description' => 'Orange signs used for road works, diversions, and temporary traffic management.',
                'icon' => 'construction',
                'color' => '#F97316',
                'signs' => $this->getTemporarySigns(),
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

    /**
     * Warning Signs - Yellow triangular signs
     */
    private function getWarningSigns(): array
    {
        return [
            [
                'name' => 'Curve Ahead Right',
                'meaning' => 'A curve to the right is approaching. Reduce speed before entering the curve and maintain control of your vehicle.',
                'description' => 'Warns of a right curve in the road. Slow down and be prepared to steer.',
                'image' => $this->generateWarningSvg('<path d="M30 20 L50 25 L50 35 L40 35" stroke="black" stroke-width="4" fill="none"/>'),
            ],
            [
                'name' => 'Curve Ahead Left',
                'meaning' => 'A curve to the left is approaching. Reduce speed before entering the curve and keep your vehicle under control.',
                'description' => 'Warns of a left curve in the road. Reduce speed before the curve.',
                'image' => $this->generateWarningSvg('<path d="M50 20 L30 25 L30 35 L40 35" stroke="black" stroke-width="4" fill="none"/>'),
            ],
            [
                'name' => 'Double Curve',
                'meaning' => 'A series of curves is ahead, first to the right then to the left. Reduce speed and be prepared for changing road direction.',
                'description' => 'Series of curves ahead. Maintain reduced speed through the entire section.',
                'image' => $this->generateWarningSvg('<path d="M35 18 C45 22 45 28 35 32 C25 36 25 42 35 46" stroke="black" stroke-width="3" fill="none"/>'),
            ],
            [
                'name' => 'Slippery Road',
                'meaning' => 'Road surface may be slippery, especially when wet. Reduce speed significantly and avoid sudden braking or steering.',
                'description' => 'Road may be slippery. Reduce speed and avoid sudden movements.',
                'image' => $this->generateWarningSvg('<path d="M32 20 L32 28 L28 32 L40 40 L52 32 L48 28 L48 20" stroke="black" stroke-width="2" fill="none"/><path d="M35 42 Q40 48 45 42" stroke="black" stroke-width="2" fill="none"/>'),
            ],
            [
                'name' => 'Road Narrows',
                'meaning' => 'The road width decreases ahead. Slow down and be prepared to share the narrower space with oncoming vehicles.',
                'description' => 'Road becomes narrower ahead. Proceed with caution.',
                'image' => $this->generateWarningSvg('<path d="M28 45 L28 20 L35 20 L40 25 L45 20 L52 20 L52 45" stroke="black" stroke-width="2" fill="none"/>'),
            ],
            [
                'name' => 'Road Narrows on Left',
                'meaning' => 'The road narrows on the left side ahead. Keep right and be prepared for reduced road width.',
                'description' => 'Road narrows from the left. Stay to the right.',
                'image' => $this->generateWarningSvg('<path d="M28 45 L35 20 L35 20 L45 20 L45 45" stroke="black" stroke-width="2" fill="none"/>'),
            ],
            [
                'name' => 'Road Narrows on Right',
                'meaning' => 'The road narrows on the right side ahead. Keep left and watch for reduced road width.',
                'description' => 'Road narrows from the right. Stay to the left.',
                'image' => $this->generateWarningSvg('<path d="M35 45 L35 20 L45 20 L52 45" stroke="black" stroke-width="2" fill="none"/>'),
            ],
            [
                'name' => 'Pedestrian Crossing',
                'meaning' => 'A designated pedestrian crossing is ahead. Be prepared to stop for pedestrians who have the right of way.',
                'description' => 'Pedestrians may be crossing. Be prepared to stop.',
                'image' => $this->generateWarningSvg('<circle cx="40" cy="18" r="4" fill="black"/><path d="M40 22 L40 35 M32 28 L48 28 M40 35 L34 48 M40 35 L46 48" stroke="black" stroke-width="2" fill="none"/>'),
            ],
            [
                'name' => 'School Crossing',
                'meaning' => 'School zone ahead with children crossing. Reduce speed significantly and watch for children at all times.',
                'description' => 'School area with children crossing. Maximum caution required.',
                'image' => $this->generateWarningSvg('<circle cx="35" cy="18" r="3" fill="black"/><path d="M35 21 L35 30 M30 25 L40 25 M35 30 L31 40 M35 30 L39 40" stroke="black" stroke-width="2"/><circle cx="48" cy="20" r="3" fill="black"/><path d="M48 23 L48 32 M43 27 L53 27 M48 32 L44 42 M48 32 L52 42" stroke="black" stroke-width="2"/>'),
            ],
            [
                'name' => 'Children Crossing',
                'meaning' => 'Area where children may be crossing, such as near schools or playgrounds. Exercise extreme caution.',
                'description' => 'Children may be in or near the road. Drive slowly.',
                'image' => $this->generateWarningSvg('<circle cx="34" cy="20" r="4" fill="black"/><path d="M34 24 L34 34 M28 28 L40 28 M34 34 L30 45 M34 34 L38 45" stroke="black" stroke-width="2"/><circle cx="46" cy="22" r="3" fill="black"/><path d="M46 25 L46 33 M42 28 L50 28 M46 33 L43 42 M46 33 L49 42" stroke="black" stroke-width="2"/>'),
            ],
            [
                'name' => 'Cattle Crossing',
                'meaning' => 'Cattle or livestock may cross the road in this area. Stay alert and be ready to stop.',
                'description' => 'Farm animals may cross. Watch for livestock.',
                'image' => $this->generateWarningSvg('<ellipse cx="40" cy="30" rx="12" ry="8" stroke="black" stroke-width="2" fill="none"/><path d="M30 30 L28 38 M35 38 L35 45 M45 38 L45 45 M50 30 L52 38" stroke="black" stroke-width="2"/><circle cx="32" cy="25" r="3" stroke="black" stroke-width="1" fill="none"/><path d="M30 22 L28 18 M34 22 L36 18" stroke="black" stroke-width="2"/>'),
            ],
            [
                'name' => 'Wild Animals',
                'meaning' => 'Wild animals may cross the road in this area. Common in rural and forested areas. Be vigilant.',
                'description' => 'Wildlife crossing area. Watch for animals.',
                'image' => $this->generateWarningSvg('<path d="M28 42 L32 30 L35 35 L40 25 L45 35 L48 30 L52 42" stroke="black" stroke-width="2" fill="none"/><ellipse cx="40" cy="35" rx="6" ry="4" stroke="black" stroke-width="2" fill="none"/><path d="M36 32 L34 28 M44 32 L46 28" stroke="black" stroke-width="2"/>'),
            ],
            [
                'name' => 'Road Works Ahead',
                'meaning' => 'Construction or road maintenance is in progress. Slow down, follow signs, and watch for workers and equipment.',
                'description' => 'Road construction ahead. Expect delays and follow instructions.',
                'image' => $this->generateWarningSvg('<circle cx="40" cy="18" r="4" fill="black"/><path d="M40 22 L40 32 M34 26 L46 26 M40 32 L36 44 M40 32 L44 44" stroke="black" stroke-width="2"/><path d="M30 40 L50 25" stroke="black" stroke-width="3"/>'),
            ],
            [
                'name' => 'Traffic Signals Ahead',
                'meaning' => 'Traffic lights are ahead. Be prepared to stop if the light is red or changing.',
                'description' => 'Traffic signals ahead. Prepare to obey signals.',
                'image' => $this->generateWarningSvg('<rect x="35" y="15" width="10" height="30" rx="2" stroke="black" stroke-width="2" fill="none"/><circle cx="40" cy="21" r="3" fill="#EF4444"/><circle cx="40" cy="30" r="3" fill="#F59E0B"/><circle cx="40" cy="39" r="3" fill="#10B981"/>'),
            ],
            [
                'name' => 'Intersection Ahead',
                'meaning' => 'A junction or crossroads is ahead. Be prepared for traffic from other directions.',
                'description' => 'Crossroads ahead. Watch for traffic from all directions.',
                'image' => $this->generateWarningSvg('<path d="M40 15 L40 50 M25 32 L55 32" stroke="black" stroke-width="4"/>'),
            ],
            [
                'name' => 'T-Junction Ahead',
                'meaning' => 'The road ends at a T-junction. You must turn left or right.',
                'description' => 'T-junction ahead. Prepare to turn left or right.',
                'image' => $this->generateWarningSvg('<path d="M40 20 L40 38 M28 38 L52 38" stroke="black" stroke-width="4"/>'),
            ],
            [
                'name' => 'Side Road Right',
                'meaning' => 'A side road joins from the right. Watch for vehicles entering from that direction.',
                'description' => 'Side road on right. Watch for joining traffic.',
                'image' => $this->generateWarningSvg('<path d="M40 15 L40 50 M40 32 L52 32" stroke="black" stroke-width="4"/>'),
            ],
            [
                'name' => 'Side Road Left',
                'meaning' => 'A side road joins from the left. Watch for vehicles entering from that direction.',
                'description' => 'Side road on left. Watch for joining traffic.',
                'image' => $this->generateWarningSvg('<path d="M40 15 L40 50 M28 32 L40 32" stroke="black" stroke-width="4"/>'),
            ],
            [
                'name' => 'Roundabout Ahead',
                'meaning' => 'A roundabout is approaching. Slow down and give way to traffic already in the roundabout.',
                'description' => 'Roundabout ahead. Yield to traffic in the roundabout.',
                'image' => $this->generateWarningSvg('<circle cx="40" cy="32" r="10" stroke="black" stroke-width="2" fill="none"/><path d="M40 22 L40 15 M50 32 L55 32 M40 42 L40 50" stroke="black" stroke-width="3"/><path d="M35 24 L40 22 L45 24" stroke="black" stroke-width="2" fill="none"/>'),
            ],
            [
                'name' => 'Steep Hill Downward',
                'meaning' => 'A steep downhill gradient is ahead. Use a lower gear and check your brakes.',
                'description' => 'Steep descent ahead. Use low gear.',
                'image' => $this->generateWarningSvg('<path d="M30 20 L50 40" stroke="black" stroke-width="3"/><text x="35" y="38" font-size="12" font-weight="bold">10%</text>'),
            ],
            [
                'name' => 'Steep Hill Upward',
                'meaning' => 'A steep uphill gradient is ahead. Use appropriate gear and maintain momentum.',
                'description' => 'Steep ascent ahead. Prepare for climb.',
                'image' => $this->generateWarningSvg('<path d="M30 40 L50 20" stroke="black" stroke-width="3"/><text x="35" y="38" font-size="12" font-weight="bold">10%</text>'),
            ],
            [
                'name' => 'Uneven Road',
                'meaning' => 'The road surface is uneven or has bumps ahead. Reduce speed to maintain control.',
                'description' => 'Bumpy or uneven road surface ahead.',
                'image' => $this->generateWarningSvg('<path d="M25 35 Q32 25 40 35 Q48 45 55 35" stroke="black" stroke-width="3" fill="none"/>'),
            ],
            [
                'name' => 'Speed Bumps',
                'meaning' => 'Speed bumps or humps are installed ahead. Slow down significantly before crossing.',
                'description' => 'Speed bumps ahead. Reduce speed.',
                'image' => $this->generateWarningSvg('<path d="M28 40 L28 35 Q40 20 52 35 L52 40" stroke="black" stroke-width="2" fill="none"/>'),
            ],
            [
                'name' => 'Two-Way Traffic',
                'meaning' => 'The road ahead has traffic moving in both directions. Stay in your lane.',
                'description' => 'Two-way traffic ahead. Keep to your side.',
                'image' => $this->generateWarningSvg('<path d="M35 20 L35 45 M35 20 L30 28 M35 20 L40 28 M45 45 L45 20 M45 45 L40 37 M45 45 L50 37" stroke="black" stroke-width="2"/>'),
            ],
            [
                'name' => 'Falling Rocks',
                'meaning' => 'Risk of falling rocks from hillside or cliff. Do not stop in this area.',
                'description' => 'Danger of falling rocks. Do not stop.',
                'image' => $this->generateWarningSvg('<path d="M30 45 L30 25 L50 25 L50 45" stroke="black" stroke-width="2" fill="none"/><circle cx="35" cy="38" r="3" fill="black"/><circle cx="42" cy="42" r="2" fill="black"/><circle cx="45" cy="35" r="4" fill="black"/><path d="M43 28 L43 32 M46 30 L43 32 L40 30" stroke="black" stroke-width="1"/>'),
            ],
            [
                'name' => 'Low Flying Aircraft',
                'meaning' => 'Aircraft may fly low in this area, typically near airports. Sudden noise may occur.',
                'description' => 'Low flying aircraft. Do not be startled.',
                'image' => $this->generateWarningSvg('<path d="M25 32 L40 28 L55 32 M40 28 L40 38 M35 38 L45 38 L40 45 L35 38" stroke="black" stroke-width="2" fill="none"/>'),
            ],
            [
                'name' => 'Height Restriction',
                'meaning' => 'Maximum vehicle height allowed ahead. Vehicles exceeding this height must not proceed.',
                'description' => 'Height limit ahead. Check your vehicle height.',
                'image' => $this->generateWarningSvg('<path d="M30 45 L30 20 L50 20 L50 45" stroke="black" stroke-width="2" fill="none"/><text x="33" y="38" font-size="14" font-weight="bold">3.5m</text><path d="M35 25 L45 25 M35 25 L38 22 M35 25 L38 28 M45 25 L42 22 M45 25 L42 28" stroke="black" stroke-width="1"/>'),
            ],
        ];
    }

    /**
     * Regulatory Signs - Red circular signs
     */
    private function getRegulatorySigns(): array
    {
        return [
            [
                'name' => 'Stop',
                'meaning' => 'You must come to a complete stop at this sign. Check for traffic and pedestrians before proceeding when safe.',
                'description' => 'Come to a complete stop. Yield before proceeding.',
                'image' => $this->generateStopSign(),
            ],
            [
                'name' => 'Give Way',
                'meaning' => 'Slow down and give way to traffic on the main road. Stop if necessary before entering.',
                'description' => 'Yield to traffic on the main road.',
                'image' => $this->generateYieldSign(),
            ],
            [
                'name' => 'No Entry',
                'meaning' => 'Entry is prohibited for all vehicles. This road may be one-way or restricted access.',
                'description' => 'Entry prohibited. Do not enter.',
                'image' => $this->generateRegulatorySvg('<rect x="20" y="35" width="40" height="8" fill="white"/>'),
            ],
            [
                'name' => 'Speed Limit 30',
                'meaning' => 'Maximum speed limit of 30 km/h. Common in school zones and residential areas.',
                'description' => 'Maximum speed 30 km/h.',
                'image' => $this->generateSpeedLimitSvg('30'),
            ],
            [
                'name' => 'Speed Limit 50',
                'meaning' => 'Maximum speed limit of 50 km/h. Standard urban speed limit in Ghana.',
                'description' => 'Maximum speed 50 km/h.',
                'image' => $this->generateSpeedLimitSvg('50'),
            ],
            [
                'name' => 'Speed Limit 60',
                'meaning' => 'Maximum speed limit of 60 km/h. Common on major urban roads.',
                'description' => 'Maximum speed 60 km/h.',
                'image' => $this->generateSpeedLimitSvg('60'),
            ],
            [
                'name' => 'Speed Limit 80',
                'meaning' => 'Maximum speed limit of 80 km/h. Typical for highways and major roads.',
                'description' => 'Maximum speed 80 km/h.',
                'image' => $this->generateSpeedLimitSvg('80'),
            ],
            [
                'name' => 'Speed Limit 100',
                'meaning' => 'Maximum speed limit of 100 km/h. For expressways and motorways.',
                'description' => 'Maximum speed 100 km/h.',
                'image' => $this->generateSpeedLimitSvg('100'),
            ],
            [
                'name' => 'No Overtaking',
                'meaning' => 'Overtaking other vehicles is prohibited in this area due to limited visibility or dangerous conditions.',
                'description' => 'Overtaking prohibited.',
                'image' => $this->generateRegulatorySvg('<path d="M28 35 L28 30 C28 25 32 22 36 22 C40 22 44 25 44 30 L44 45" fill="black" stroke="black" stroke-width="1"/><path d="M36 35 L36 30 C36 27 39 25 42 25 C45 25 48 27 48 30 L48 45" fill="red" stroke="red" stroke-width="1"/>', false),
            ],
            [
                'name' => 'No Parking',
                'meaning' => 'Parking is not allowed in this area. Brief stopping to drop off passengers may be permitted.',
                'description' => 'No parking allowed.',
                'image' => $this->generateRegulatorySvg('<text x="40" y="48" font-size="24" font-weight="bold" text-anchor="middle" fill="black">P</text><line x1="25" y1="55" x2="55" y2="25" stroke="red" stroke-width="4"/>'),
            ],
            [
                'name' => 'No Stopping',
                'meaning' => 'Stopping is completely prohibited. You may not stop for any reason except emergencies.',
                'description' => 'No stopping allowed.',
                'image' => $this->generateRegulatorySvg('<line x1="25" y1="25" x2="55" y2="55" stroke="red" stroke-width="4"/><line x1="55" y1="25" x2="25" y2="55" stroke="red" stroke-width="4"/>'),
            ],
            [
                'name' => 'No U-Turn',
                'meaning' => 'Making a U-turn is prohibited at this location. Continue and find an alternative route.',
                'description' => 'U-turns prohibited.',
                'image' => $this->generateRegulatorySvg('<path d="M45 48 L45 35 C45 28 40 25 35 25 C30 25 25 28 25 35 L25 38" stroke="black" stroke-width="3" fill="none"/><path d="M25 38 L21 33 L29 33 Z" fill="black"/><line x1="25" y1="55" x2="55" y2="25" stroke="red" stroke-width="4"/>'),
            ],
            [
                'name' => 'No Left Turn',
                'meaning' => 'Turning left is not permitted at this junction. Continue straight or turn right.',
                'description' => 'Left turn prohibited.',
                'image' => $this->generateRegulatorySvg('<path d="M45 48 L45 35 L30 35" stroke="black" stroke-width="3" fill="none"/><path d="M30 35 L35 30 L35 40 Z" fill="black"/><line x1="25" y1="55" x2="55" y2="25" stroke="red" stroke-width="4"/>'),
            ],
            [
                'name' => 'No Right Turn',
                'meaning' => 'Turning right is not permitted at this junction. Continue straight or turn left.',
                'description' => 'Right turn prohibited.',
                'image' => $this->generateRegulatorySvg('<path d="M35 48 L35 35 L50 35" stroke="black" stroke-width="3" fill="none"/><path d="M50 35 L45 30 L45 40 Z" fill="black"/><line x1="25" y1="55" x2="55" y2="25" stroke="red" stroke-width="4"/>'),
            ],
            [
                'name' => 'No Horns',
                'meaning' => 'Use of vehicle horn is prohibited in this area. Common in hospital zones and quiet areas.',
                'description' => 'Horn use prohibited.',
                'image' => $this->generateRegulatorySvg('<path d="M30 35 C30 30 35 28 40 28 L50 35 L50 45 L40 52 C35 52 30 50 30 45 Z" stroke="black" stroke-width="2" fill="none"/><path d="M28 32 Q25 40 28 48" stroke="black" stroke-width="2" fill="none"/><line x1="25" y1="55" x2="55" y2="25" stroke="red" stroke-width="4"/>'),
            ],
            [
                'name' => 'No Pedestrians',
                'meaning' => 'Pedestrians are not allowed on this road. Use designated pedestrian paths.',
                'description' => 'Pedestrians prohibited.',
                'image' => $this->generateRegulatorySvg('<circle cx="40" cy="28" r="5" fill="black"/><path d="M40 33 L40 45 M33 38 L47 38 M40 45 L35 55 M40 45 L45 55" stroke="black" stroke-width="2"/><line x1="25" y1="55" x2="55" y2="25" stroke="red" stroke-width="4"/>'),
            ],
            [
                'name' => 'No Bicycles',
                'meaning' => 'Bicycles are not permitted on this road. Cyclists must use alternative routes.',
                'description' => 'Bicycles prohibited.',
                'image' => $this->generateRegulatorySvg('<circle cx="33" cy="45" r="7" stroke="black" stroke-width="2" fill="none"/><circle cx="47" cy="45" r="7" stroke="black" stroke-width="2" fill="none"/><path d="M33 45 L40 32 L47 45 M40 32 L40 28 L45 28" stroke="black" stroke-width="2" fill="none"/><line x1="25" y1="55" x2="55" y2="25" stroke="red" stroke-width="4"/>'),
            ],
            [
                'name' => 'No Heavy Vehicles',
                'meaning' => 'Heavy goods vehicles or trucks are not permitted on this road.',
                'description' => 'Heavy vehicles prohibited.',
                'image' => $this->generateRegulatorySvg('<rect x="28" y="30" width="24" height="15" rx="2" stroke="black" stroke-width="2" fill="none"/><rect x="28" y="35" width="10" height="10" stroke="black" stroke-width="1" fill="none"/><circle cx="33" cy="48" r="3" stroke="black" stroke-width="2" fill="none"/><circle cx="47" cy="48" r="3" stroke="black" stroke-width="2" fill="none"/><line x1="25" y1="55" x2="55" y2="25" stroke="red" stroke-width="4"/>'),
            ],
            [
                'name' => 'One Way',
                'meaning' => 'Traffic moves in one direction only. Driving against the flow is illegal.',
                'description' => 'One-way traffic only.',
                'image' => $this->generateRectangularSign('ONE WAY', '#3B82F6', 'white', '<path d="M70 25 L85 35 L70 45 Z" fill="white"/>'),
            ],
            [
                'name' => 'End of Restriction',
                'meaning' => 'The previously signed restriction (speed limit, no overtaking, etc.) ends here.',
                'description' => 'End of previous restriction.',
                'image' => $this->generateEndRestrictionSvg(),
            ],
        ];
    }

    /**
     * Informational Signs - Blue/Green rectangular signs
     */
    private function getInformationalSigns(): array
    {
        return [
            [
                'name' => 'Hospital',
                'meaning' => 'A hospital or medical facility is located in the direction indicated. Follow for medical emergencies.',
                'description' => 'Hospital or medical facility nearby.',
                'image' => $this->generateInfoSvg('<path d="M35 25 L35 35 L25 35 L25 45 L35 45 L35 55 L45 55 L45 45 L55 45 L55 35 L45 35 L45 25 Z" fill="white"/>'),
            ],
            [
                'name' => 'Fuel Station',
                'meaning' => 'A petrol/fuel station is available in the direction indicated.',
                'description' => 'Fuel station available.',
                'image' => $this->generateInfoSvg('<rect x="30" y="28" width="15" height="25" rx="2" fill="white"/><rect x="45" y="35" width="8" height="4" fill="white"/><path d="M50 39 L50 50 L55 50" stroke="white" stroke-width="2" fill="none"/><rect x="33" y="31" width="9" height="8" fill="#3B82F6"/>'),
            ],
            [
                'name' => 'Parking Area',
                'meaning' => 'A parking area or car park is available in the direction indicated.',
                'description' => 'Parking available.',
                'image' => $this->generateInfoSvg('<text x="40" y="48" font-size="28" font-weight="bold" text-anchor="middle" fill="white">P</text>'),
            ],
            [
                'name' => 'Airport',
                'meaning' => 'An airport is located in the direction indicated.',
                'description' => 'Airport direction.',
                'image' => $this->generateInfoSvg('<path d="M40 25 L43 35 L55 38 L55 42 L43 40 L43 50 L48 53 L48 56 L40 54 L32 56 L32 53 L37 50 L37 40 L25 42 L25 38 L37 35 Z" fill="white"/>'),
            ],
            [
                'name' => 'Bus Station',
                'meaning' => 'A bus station or bus stop is located in the direction indicated.',
                'description' => 'Bus station nearby.',
                'image' => $this->generateInfoSvg('<rect x="25" y="32" width="30" height="18" rx="3" fill="white"/><rect x="28" y="35" width="8" height="6" fill="#3B82F6"/><rect x="44" y="35" width="8" height="6" fill="#3B82F6"/><circle cx="32" cy="52" r="4" fill="white"/><circle cx="48" cy="52" r="4" fill="white"/>'),
            ],
            [
                'name' => 'Restaurant',
                'meaning' => 'Food services and restaurants are available in the direction indicated.',
                'description' => 'Restaurant or food available.',
                'image' => $this->generateInfoSvg('<path d="M30 25 L30 40 M30 30 C30 25 35 25 35 30 L35 40 M45 25 L45 55 M50 25 C55 25 55 35 50 35 L45 35" stroke="white" stroke-width="3" fill="none"/>'),
            ],
            [
                'name' => 'Hotel/Lodging',
                'meaning' => 'Accommodation or hotel is available in the direction indicated.',
                'description' => 'Hotel or accommodation nearby.',
                'image' => $this->generateInfoSvg('<rect x="28" y="30" width="24" height="25" rx="2" fill="white"/><rect x="32" y="35" width="6" height="6" fill="#3B82F6"/><rect x="42" y="35" width="6" height="6" fill="#3B82F6"/><rect x="37" y="45" width="6" height="10" fill="#3B82F6"/>'),
            ],
            [
                'name' => 'Information Center',
                'meaning' => 'A tourist information center where you can get maps and local information.',
                'description' => 'Tourist information available.',
                'image' => $this->generateInfoSvg('<circle cx="40" cy="30" r="4" fill="white"/><rect x="37" y="38" width="6" height="15" rx="1" fill="white"/>'),
            ],
            [
                'name' => 'Telephone',
                'meaning' => 'A public telephone is available for emergency calls.',
                'description' => 'Public telephone available.',
                'image' => $this->generateInfoSvg('<path d="M30 55 C25 50 25 35 30 30 L35 32 L33 40 L37 42 C40 48 42 48 45 45 L48 42 L52 50 C48 55 38 58 30 55" fill="white"/>'),
            ],
            [
                'name' => 'First Aid',
                'meaning' => 'First aid or emergency medical assistance is available here.',
                'description' => 'First aid station nearby.',
                'image' => $this->generateInfoSvg('<rect x="28" y="28" width="24" height="24" rx="3" fill="white"/><path d="M35 33 L35 47 M28 40 L48 40" stroke="#EF4444" stroke-width="4"/>'),
            ],
            [
                'name' => 'Police Station',
                'meaning' => 'A police station is located in the direction indicated.',
                'description' => 'Police station nearby.',
                'image' => $this->generateInfoSvg('<path d="M40 25 L52 35 L52 55 L28 55 L28 35 Z" fill="white"/><circle cx="40" cy="42" r="6" fill="#3B82F6"/><rect x="38" y="50" width="4" height="5" fill="#3B82F6"/>'),
            ],
            [
                'name' => 'Restroom',
                'meaning' => 'Public restroom facilities are available.',
                'description' => 'Restroom facilities available.',
                'image' => $this->generateInfoSvg('<circle cx="33" cy="30" r="4" fill="white"/><path d="M33 34 L33 42 L30 55 M33 42 L36 55 M28 38 L38 38" stroke="white" stroke-width="2"/><circle cx="47" cy="30" r="4" fill="white"/><path d="M47 34 L47 40 M42 40 L52 40 L52 55 L42 55 Z" fill="white"/>'),
            ],
        ];
    }

    /**
     * Mandatory Signs - Blue circular signs
     */
    private function getMandatorySigns(): array
    {
        return [
            [
                'name' => 'Turn Left Ahead',
                'meaning' => 'You must turn left at this junction. Going straight or right is not permitted.',
                'description' => 'Left turn mandatory.',
                'image' => $this->generateMandatorySvg('<path d="M45 45 L45 35 L35 35" stroke="white" stroke-width="4" fill="none"/><path d="M35 35 L40 30 L40 40 Z" fill="white"/>'),
            ],
            [
                'name' => 'Turn Right Ahead',
                'meaning' => 'You must turn right at this junction. Going straight or left is not permitted.',
                'description' => 'Right turn mandatory.',
                'image' => $this->generateMandatorySvg('<path d="M35 45 L35 35 L45 35" stroke="white" stroke-width="4" fill="none"/><path d="M45 35 L40 30 L40 40 Z" fill="white"/>'),
            ],
            [
                'name' => 'Proceed Straight',
                'meaning' => 'You must continue straight. Turning is not permitted.',
                'description' => 'Straight ahead only.',
                'image' => $this->generateMandatorySvg('<path d="M40 50 L40 25" stroke="white" stroke-width="4"/><path d="M40 25 L35 32 L45 32 Z" fill="white"/>'),
            ],
            [
                'name' => 'Keep Left',
                'meaning' => 'You must pass on the left side of the obstacle or island.',
                'description' => 'Keep to the left.',
                'image' => $this->generateMandatorySvg('<path d="M50 40 L30 40" stroke="white" stroke-width="4"/><path d="M30 40 L37 35 L37 45 Z" fill="white"/>'),
            ],
            [
                'name' => 'Keep Right',
                'meaning' => 'You must pass on the right side of the obstacle or island.',
                'description' => 'Keep to the right.',
                'image' => $this->generateMandatorySvg('<path d="M30 40 L50 40" stroke="white" stroke-width="4"/><path d="M50 40 L43 35 L43 45 Z" fill="white"/>'),
            ],
            [
                'name' => 'Roundabout Direction',
                'meaning' => 'You must proceed around the roundabout in the direction indicated.',
                'description' => 'Follow roundabout direction.',
                'image' => $this->generateMandatorySvg('<circle cx="40" cy="40" r="12" stroke="white" stroke-width="3" fill="none"/><path d="M40 28 L36 33 L40 28 L44 33" stroke="white" stroke-width="2"/><path d="M52 40 L47 36 L52 40 L47 44" stroke="white" stroke-width="2"/><path d="M40 52 L44 47 L40 52 L36 47" stroke="white" stroke-width="2"/>'),
            ],
            [
                'name' => 'Pass Either Side',
                'meaning' => 'You may pass on either the left or right side of the obstacle.',
                'description' => 'Pass on either side.',
                'image' => $this->generateMandatorySvg('<path d="M40 25 L40 35 M40 35 L30 45 M40 35 L50 45" stroke="white" stroke-width="4" fill="none"/><path d="M30 45 L35 40 L35 50 Z" fill="white"/><path d="M50 45 L45 40 L45 50 Z" fill="white"/>'),
            ],
            [
                'name' => 'Minimum Speed 40',
                'meaning' => 'You must maintain at least 40 km/h unless conditions require slower speeds.',
                'description' => 'Minimum speed 40 km/h.',
                'image' => $this->generateMandatorySvg('<text x="40" y="48" font-size="20" font-weight="bold" text-anchor="middle" fill="white">40</text>'),
            ],
            [
                'name' => 'Pedestrians Only',
                'meaning' => 'This path is for pedestrians only. Vehicles are not permitted.',
                'description' => 'Pedestrian path only.',
                'image' => $this->generateMandatorySvg('<circle cx="40" cy="28" r="5" fill="white"/><path d="M40 33 L40 45 M33 38 L47 38 M40 45 L35 55 M40 45 L45 55" stroke="white" stroke-width="3"/>'),
            ],
            [
                'name' => 'Bicycles Only',
                'meaning' => 'This lane or path is designated for bicycles only.',
                'description' => 'Bicycle path only.',
                'image' => $this->generateMandatorySvg('<circle cx="33" cy="45" r="8" stroke="white" stroke-width="2" fill="none"/><circle cx="47" cy="45" r="8" stroke="white" stroke-width="2" fill="none"/><path d="M33 45 L40 30 L47 45 M40 30 L40 25 L47 25" stroke="white" stroke-width="2" fill="none"/>'),
            ],
            [
                'name' => 'Shared Path',
                'meaning' => 'This path is shared by pedestrians and cyclists. Both must give way to each other.',
                'description' => 'Shared pedestrian and cycle path.',
                'image' => $this->generateMandatorySvg('<circle cx="32" cy="28" r="4" fill="white"/><path d="M32 32 L32 40 M28 35 L36 35 M32 40 L29 48 M32 40 L35 48" stroke="white" stroke-width="2"/><circle cx="42" cy="48" r="5" stroke="white" stroke-width="1.5" fill="none"/><circle cx="52" cy="48" r="5" stroke="white" stroke-width="1.5" fill="none"/><path d="M42 48 L47 38 L52 48" stroke="white" stroke-width="1.5" fill="none"/>'),
            ],
        ];
    }

    /**
     * Temporary Signs - Orange signs for road works
     */
    private function getTemporarySigns(): array
    {
        return [
            [
                'name' => 'Road Work Ahead',
                'meaning' => 'Road construction or maintenance work is in progress ahead. Slow down and be prepared for workers.',
                'description' => 'Construction work ahead.',
                'image' => $this->generateTemporarySvg('<circle cx="40" cy="22" r="5" fill="black"/><path d="M40 27 L40 40 M33 32 L47 32 M40 40 L35 55 M40 40 L45 55" stroke="black" stroke-width="2"/><path d="M28 50 L52 30" stroke="black" stroke-width="4"/>'),
            ],
            [
                'name' => 'Detour',
                'meaning' => 'The normal route is closed. Follow the detour signs to find an alternative route.',
                'description' => 'Follow detour route.',
                'image' => $this->generateTemporarySvg('<path d="M30 40 L40 25 L50 40 L40 55 Z" fill="black"/><path d="M38 35 L42 35 L42 45 L45 45 L40 52 L35 45 L38 45 Z" fill="#F97316"/>'),
            ],
            [
                'name' => 'Lane Closed',
                'meaning' => 'One or more lanes are closed ahead. Merge safely into the open lane.',
                'description' => 'Lane closure ahead.',
                'image' => $this->generateTemporarySvg('<path d="M30 25 L30 55 M40 25 L40 55 M50 25 L50 55" stroke="black" stroke-width="2"/><line x1="35" y1="55" x2="55" y2="25" stroke="black" stroke-width="4"/>'),
            ],
            [
                'name' => 'Road Closed',
                'meaning' => 'The road ahead is completely closed. You must find an alternative route.',
                'description' => 'Road closed ahead.',
                'image' => $this->generateTemporarySvg('<text x="40" y="35" font-size="12" font-weight="bold" text-anchor="middle" fill="black">ROAD</text><text x="40" y="50" font-size="12" font-weight="bold" text-anchor="middle" fill="black">CLOSED</text>'),
            ],
            [
                'name' => 'Slow Down',
                'meaning' => 'Reduce your speed due to temporary road conditions ahead.',
                'description' => 'Reduce speed.',
                'image' => $this->generateTemporarySvg('<text x="40" y="35" font-size="11" font-weight="bold" text-anchor="middle" fill="black">SLOW</text><text x="40" y="50" font-size="11" font-weight="bold" text-anchor="middle" fill="black">DOWN</text>'),
            ],
            [
                'name' => 'Single Lane',
                'meaning' => 'Traffic is reduced to a single lane. Be prepared to give way.',
                'description' => 'Single lane traffic.',
                'image' => $this->generateTemporarySvg('<path d="M32 25 L40 25 L40 55 L32 55 Z" fill="black"/><path d="M35 30 L35 40 M35 30 L32 35 M35 30 L38 35" stroke="#F97316" stroke-width="2"/><path d="M35 50 L35 45 M35 50 L32 47 M35 50 L38 47" stroke="#F97316" stroke-width="2"/>'),
            ],
            [
                'name' => 'Temporary Speed Limit',
                'meaning' => 'Temporary reduced speed limit due to road works. Obey until end of works.',
                'description' => 'Temporary speed restriction.',
                'image' => $this->generateTemporarySvg('<circle cx="40" cy="40" r="15" stroke="black" stroke-width="2" fill="#F97316"/><text x="40" y="46" font-size="14" font-weight="bold" text-anchor="middle" fill="black">30</text>'),
            ],
            [
                'name' => 'Loose Gravel',
                'meaning' => 'Loose stones or gravel on road surface. Reduce speed and maintain distance.',
                'description' => 'Loose surface ahead.',
                'image' => $this->generateTemporarySvg('<circle cx="35" cy="35" r="3" fill="black"/><circle cx="45" cy="38" r="2" fill="black"/><circle cx="38" cy="45" r="3" fill="black"/><circle cx="48" cy="48" r="2" fill="black"/><circle cx="32" cy="48" r="2" fill="black"/><circle cx="42" cy="52" r="2" fill="black"/>'),
            ],
        ];
    }

    /**
     * Generate warning sign SVG (yellow triangle)
     */
    private function generateWarningSvg(string $content): string
    {
        return "data:image/svg+xml," . rawurlencode('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 70"><polygon points="40,5 75,65 5,65" fill="#F59E0B" stroke="black" stroke-width="3"/>' . $content . '</svg>');
    }

    /**
     * Generate regulatory sign SVG (red circle)
     */
    private function generateRegulatorySvg(string $content, bool $redBorder = true): string
    {
        $border = $redBorder ? '<circle cx="40" cy="40" r="35" fill="white" stroke="#EF4444" stroke-width="6"/>' : '<circle cx="40" cy="40" r="35" fill="white" stroke="#EF4444" stroke-width="6"/>';
        return "data:image/svg+xml," . rawurlencode('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">' . $border . $content . '</svg>');
    }

    /**
     * Generate speed limit sign SVG
     */
    private function generateSpeedLimitSvg(string $speed): string
    {
        $fontSize = strlen($speed) > 2 ? '22' : '28';
        return "data:image/svg+xml," . rawurlencode('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><circle cx="40" cy="40" r="35" fill="white" stroke="#EF4444" stroke-width="6"/><text x="40" y="50" font-size="' . $fontSize . '" font-weight="bold" text-anchor="middle" fill="black">' . $speed . '</text></svg>');
    }

    /**
     * Generate stop sign SVG (red octagon)
     */
    private function generateStopSign(): string
    {
        return "data:image/svg+xml," . rawurlencode('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><polygon points="25,10 55,10 70,25 70,55 55,70 25,70 10,55 10,25" fill="#EF4444" stroke="white" stroke-width="3"/><text x="40" y="48" font-size="18" font-weight="bold" text-anchor="middle" fill="white">STOP</text></svg>');
    }

    /**
     * Generate yield sign SVG (inverted triangle)
     */
    private function generateYieldSign(): string
    {
        return "data:image/svg+xml," . rawurlencode('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 70"><polygon points="40,65 5,5 75,5" fill="white" stroke="#EF4444" stroke-width="5"/><text x="40" y="30" font-size="10" font-weight="bold" text-anchor="middle" fill="black">GIVE</text><text x="40" y="45" font-size="10" font-weight="bold" text-anchor="middle" fill="black">WAY</text></svg>');
    }

    /**
     * Generate mandatory sign SVG (blue circle)
     */
    private function generateMandatorySvg(string $content): string
    {
        return "data:image/svg+xml," . rawurlencode('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><circle cx="40" cy="40" r="35" fill="#3B82F6" stroke="white" stroke-width="3"/>' . $content . '</svg>');
    }

    /**
     * Generate informational sign SVG (blue square)
     */
    private function generateInfoSvg(string $content): string
    {
        return "data:image/svg+xml," . rawurlencode('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect x="5" y="5" width="70" height="70" rx="5" fill="#3B82F6" stroke="white" stroke-width="2"/>' . $content . '</svg>');
    }

    /**
     * Generate temporary sign SVG (orange)
     */
    private function generateTemporarySvg(string $content): string
    {
        return "data:image/svg+xml," . rawurlencode('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 70"><polygon points="40,5 75,65 5,65" fill="#F97316" stroke="black" stroke-width="3"/>' . $content . '</svg>');
    }

    /**
     * Generate rectangular sign SVG
     */
    private function generateRectangularSign(string $text, string $bgColor, string $textColor, string $extraContent = ''): string
    {
        return "data:image/svg+xml," . rawurlencode('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><rect x="2" y="2" width="96" height="46" rx="3" fill="' . $bgColor . '" stroke="white" stroke-width="2"/><text x="45" y="33" font-size="14" font-weight="bold" text-anchor="middle" fill="' . $textColor . '">' . $text . '</text>' . $extraContent . '</svg>');
    }

    /**
     * Generate end of restriction sign SVG
     */
    private function generateEndRestrictionSvg(): string
    {
        return "data:image/svg+xml," . rawurlencode('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><circle cx="40" cy="40" r="35" fill="white" stroke="black" stroke-width="2"/><line x1="15" y1="15" x2="65" y2="65" stroke="black" stroke-width="3"/><line x1="20" y1="20" x2="60" y2="60" stroke="black" stroke-width="3"/><line x1="25" y1="25" x2="55" y2="55" stroke="black" stroke-width="3"/></svg>');
    }
}
