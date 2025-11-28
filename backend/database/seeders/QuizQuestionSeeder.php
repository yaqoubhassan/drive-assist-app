<?php

namespace Database\Seeders;

use App\Models\QuizQuestion;
use Illuminate\Database\Seeder;

class QuizQuestionSeeder extends Seeder
{
    public function run(): void
    {
        $questions = [
            // Road Signs Category
            [
                'category' => 'road_signs',
                'question' => 'What does a triangular road sign with a red border typically indicate?',
                'options' => ['Warning', 'Information', 'Mandatory action', 'Prohibition'],
                'correct_answer' => 0,
                'explanation' => 'Triangular signs with red borders are warning signs that alert drivers to potential hazards ahead.',
            ],
            [
                'category' => 'road_signs',
                'question' => 'A circular sign with a red border and diagonal line means:',
                'options' => ['You must do something', 'You must not do something', 'Information only', 'Warning ahead'],
                'correct_answer' => 1,
                'explanation' => 'Circular signs with red borders and diagonal lines indicate prohibition - something you must NOT do.',
            ],
            [
                'category' => 'road_signs',
                'question' => 'What does a blue circular sign indicate?',
                'options' => ['Warning', 'Prohibition', 'Mandatory instruction', 'Information'],
                'correct_answer' => 2,
                'explanation' => 'Blue circular signs give mandatory instructions - actions you MUST take.',
            ],
            [
                'category' => 'road_signs',
                'question' => 'A stop sign requires you to:',
                'options' => ['Slow down and proceed if clear', 'Come to a complete stop', 'Stop only if there is traffic', 'Yield to oncoming traffic'],
                'correct_answer' => 1,
                'explanation' => 'A stop sign always requires a complete stop, regardless of whether there is other traffic.',
            ],
            [
                'category' => 'road_signs',
                'question' => 'What should you do when you see a "Give Way" (Yield) sign?',
                'options' => ['Stop completely', 'Slow down and give way to traffic on main road', 'Speed up to merge', 'Honk and proceed'],
                'correct_answer' => 1,
                'explanation' => 'A Give Way sign means slow down and yield to traffic that has the right of way.',
            ],

            // Traffic Rules Category
            [
                'category' => 'traffic_rules',
                'question' => 'In Ghana, vehicles drive on which side of the road?',
                'options' => ['Left side', 'Right side', 'Either side', 'Center'],
                'correct_answer' => 1,
                'explanation' => 'Ghana follows right-hand traffic, meaning vehicles drive on the right side of the road.',
            ],
            [
                'category' => 'traffic_rules',
                'question' => 'When approaching a roundabout in Ghana, you should:',
                'options' => ['Speed up to enter quickly', 'Give way to traffic already in the roundabout', 'Always stop before entering', 'Enter from any direction'],
                'correct_answer' => 1,
                'explanation' => 'Traffic already in the roundabout has the right of way. Wait for a safe gap before entering.',
            ],
            [
                'category' => 'traffic_rules',
                'question' => 'The legal blood alcohol limit for driving in Ghana is:',
                'options' => ['0.05%', '0.08%', '0.00%', '0.10%'],
                'correct_answer' => 1,
                'explanation' => 'The legal blood alcohol content (BAC) limit in Ghana is 0.08%. However, the safest approach is not to drink and drive at all.',
            ],
            [
                'category' => 'traffic_rules',
                'question' => 'When can you overtake another vehicle on the left in Ghana?',
                'options' => ['Anytime', 'When the vehicle ahead is turning right', 'Never', 'When in a hurry'],
                'correct_answer' => 2,
                'explanation' => 'In right-hand traffic countries like Ghana, overtaking should be done on the left. Overtaking on the right (inside) is generally prohibited.',
            ],
            [
                'category' => 'traffic_rules',
                'question' => 'What is the maximum speed limit on highways in Ghana?',
                'options' => ['80 km/h', '100 km/h', '120 km/h', '140 km/h'],
                'correct_answer' => 1,
                'explanation' => 'The maximum speed limit on highways in Ghana is 100 km/h unless otherwise posted.',
            ],

            // Safety Category
            [
                'category' => 'safety',
                'question' => 'When should you use your hazard lights?',
                'options' => ['When parking illegally', 'When your vehicle is stationary and causing an obstruction', 'When driving in rain', 'When overtaking'],
                'correct_answer' => 1,
                'explanation' => 'Hazard lights should be used when your vehicle is stationary and may pose a danger to other road users.',
            ],
            [
                'category' => 'safety',
                'question' => 'What is the recommended following distance in normal conditions?',
                'options' => ['1 second', '2 seconds', '3 seconds', '5 seconds'],
                'correct_answer' => 1,
                'explanation' => 'The 2-second rule provides a safe following distance in normal conditions. Increase this in poor weather.',
            ],
            [
                'category' => 'safety',
                'question' => 'What should you do if your brakes fail while driving?',
                'options' => ['Turn off the engine immediately', 'Pump the brakes, downshift, and use parking brake', 'Jump out of the vehicle', 'Close your eyes and hope'],
                'correct_answer' => 1,
                'explanation' => 'Pump the brake pedal rapidly, shift to lower gears to use engine braking, and carefully apply the parking brake.',
            ],
            [
                'category' => 'safety',
                'question' => 'When driving in heavy rain, you should:',
                'options' => ['Increase speed to get through quickly', 'Use high beam headlights', 'Reduce speed and increase following distance', 'Drive in the center of the road'],
                'correct_answer' => 2,
                'explanation' => 'Reduce speed, increase following distance, and use low beam headlights in heavy rain.',
            ],
            [
                'category' => 'safety',
                'question' => 'What is the purpose of ABS (Anti-lock Braking System)?',
                'options' => ['Makes the car go faster', 'Prevents wheels from locking during hard braking', 'Reduces fuel consumption', 'Makes the engine quieter'],
                'correct_answer' => 1,
                'explanation' => 'ABS prevents wheel lock-up during emergency braking, allowing you to maintain steering control.',
            ],

            // Vehicle Knowledge Category
            [
                'category' => 'vehicle_knowledge',
                'question' => 'What does the oil pressure warning light indicate?',
                'options' => ['Time for an oil change', 'Oil is too hot', 'Low oil pressure - stop immediately', 'Oil filter needs replacement'],
                'correct_answer' => 2,
                'explanation' => 'The oil pressure warning light indicates critically low oil pressure. Stop immediately to prevent engine damage.',
            ],
            [
                'category' => 'vehicle_knowledge',
                'question' => 'How often should you check your tire pressure?',
                'options' => ['Once a year', 'Every 6 months', 'At least monthly and before long trips', 'Only when tires look flat'],
                'correct_answer' => 2,
                'explanation' => 'Check tire pressure at least monthly and before long trips. Proper inflation improves safety and fuel economy.',
            ],
            [
                'category' => 'vehicle_knowledge',
                'question' => 'What should you do if your temperature gauge shows overheating?',
                'options' => ['Keep driving to the nearest garage', 'Turn on the heater and pull over safely', 'Pour cold water on the engine immediately', 'Turn off the engine immediately without stopping'],
                'correct_answer' => 1,
                'explanation' => 'Turn on the heater to draw heat from the engine, pull over safely, and let the engine cool before checking coolant.',
            ],
            [
                'category' => 'vehicle_knowledge',
                'question' => 'Which fluid should never be low in your vehicle?',
                'options' => ['Windshield washer fluid', 'Brake fluid', 'Power steering fluid', 'All of the above are equally important'],
                'correct_answer' => 1,
                'explanation' => 'While all fluids are important, brake fluid is critical for safety. Low brake fluid can cause brake failure.',
            ],
            [
                'category' => 'vehicle_knowledge',
                'question' => 'What is the minimum legal tire tread depth?',
                'options' => ['0.5mm', '1.0mm', '1.6mm', '3.0mm'],
                'correct_answer' => 2,
                'explanation' => 'The minimum legal tread depth is typically 1.6mm, but for safety, replace tires at 3mm, especially for wet conditions.',
            ],

            // Driving Situations Category
            [
                'category' => 'driving_situations',
                'question' => 'You are at a junction and an ambulance with sirens approaches from behind. You should:',
                'options' => ['Speed through the junction', 'Stop in the junction', 'Pull over safely when possible to let it pass', 'Ignore it and proceed normally'],
                'correct_answer' => 2,
                'explanation' => 'Pull over safely when it is safe to do so. Do not stop in an intersection or block the emergency vehicle.',
            ],
            [
                'category' => 'driving_situations',
                'question' => 'When parking on a hill facing downward, you should turn your wheels:',
                'options' => ['Toward the curb', 'Away from the curb', 'Keep them straight', 'It does not matter'],
                'correct_answer' => 0,
                'explanation' => 'Turn wheels toward the curb when facing downhill, so the car rolls into the curb if brakes fail.',
            ],
            [
                'category' => 'driving_situations',
                'question' => 'At night, when should you use high beam headlights?',
                'options' => ['Always', 'Only in the city', 'On dark roads with no oncoming traffic', 'Never'],
                'correct_answer' => 2,
                'explanation' => 'Use high beams on dark roads when there is no oncoming traffic. Switch to low beams when approaching other vehicles.',
            ],
            [
                'category' => 'driving_situations',
                'question' => 'What should you do if you experience a tire blowout while driving?',
                'options' => ['Brake hard immediately', 'Grip steering wheel firmly, ease off accelerator, steer straight', 'Accelerate to maintain control', 'Turn sharply to the side of the road'],
                'correct_answer' => 1,
                'explanation' => 'Hold the steering wheel firmly, gradually release the accelerator, and steer straight while slowing down naturally.',
            ],
            [
                'category' => 'driving_situations',
                'question' => 'When approaching a pedestrian crossing where people are waiting:',
                'options' => ['Speed up to pass before they cross', 'Honk to warn them', 'Slow down and prepare to stop', 'Flash your lights at them'],
                'correct_answer' => 2,
                'explanation' => 'Always slow down and be prepared to stop for pedestrians at crossings. They have the right of way.',
            ],

            // More Road Signs
            [
                'category' => 'road_signs',
                'question' => 'What does a green rectangular sign typically indicate?',
                'options' => ['Warning of danger', 'Direction or distance information', 'Mandatory action', 'Prohibition'],
                'correct_answer' => 1,
                'explanation' => 'Green rectangular signs provide directional information, including destinations and distances.',
            ],
            [
                'category' => 'road_signs',
                'question' => 'A sign showing "P" with a red cross through it means:',
                'options' => ['Parking allowed', 'No parking', 'Paid parking', 'Police station nearby'],
                'correct_answer' => 1,
                'explanation' => 'A "P" with a red cross indicates no parking is allowed in that area.',
            ],

            // More Traffic Rules
            [
                'category' => 'traffic_rules',
                'question' => 'When turning right at a junction, you should:',
                'options' => ['Turn from the left lane', 'Position in the right lane and yield to oncoming traffic', 'Stop in the middle of the road', 'Speed through to avoid traffic'],
                'correct_answer' => 1,
                'explanation' => 'Position yourself in the appropriate lane and yield to oncoming traffic and pedestrians before turning.',
            ],
            [
                'category' => 'traffic_rules',
                'question' => 'What does a broken white line in the center of the road mean?',
                'options' => ['No overtaking', 'You may overtake if safe', 'Road is closing', 'Pedestrian crossing ahead'],
                'correct_answer' => 1,
                'explanation' => 'A broken white center line indicates you may cross to overtake if it is safe to do so.',
            ],

            // More Safety
            [
                'category' => 'safety',
                'question' => 'Before starting a long journey, you should:',
                'options' => ['Skip the vehicle check to save time', 'Check tires, fluids, lights, and plan your route', 'Only fill up with fuel', 'Nothing special is needed'],
                'correct_answer' => 1,
                'explanation' => 'A pre-journey check including tires, fluids, and lights helps ensure a safe trip.',
            ],
            [
                'category' => 'safety',
                'question' => 'If you witness a road accident, you should:',
                'options' => ['Drive past quickly', 'Stop safely, call emergency services, and help if qualified', 'Take videos for social media', 'Blame the drivers involved'],
                'correct_answer' => 1,
                'explanation' => 'Stop safely, call emergency services (191 or 112), and only provide first aid if you are trained to do so.',
            ],
        ];

        foreach ($questions as $index => $question) {
            QuizQuestion::updateOrCreate(
                [
                    'question' => $question['question'],
                ],
                [
                    'category' => $question['category'],
                    'options' => $question['options'],
                    'correct_answer' => $question['correct_answer'],
                    'explanation' => $question['explanation'],
                    'difficulty' => $this->getDifficulty($index),
                    'points' => $this->getPoints($index),
                    'is_active' => true,
                ]
            );
        }
    }

    private function getDifficulty(int $index): string
    {
        $difficulties = ['easy', 'easy', 'medium', 'medium', 'hard'];
        return $difficulties[$index % count($difficulties)];
    }

    private function getPoints(int $index): int
    {
        $difficulty = $this->getDifficulty($index);
        return match($difficulty) {
            'easy' => 10,
            'medium' => 15,
            'hard' => 20,
            default => 10,
        };
    }
}
