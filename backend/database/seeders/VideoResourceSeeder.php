<?php

namespace Database\Seeders;

use App\Models\VideoCategory;
use App\Models\VideoResource;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class VideoResourceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create video categories
        $categories = [
            [
                'name' => 'Driving Tips & Tutorials',
                'slug' => 'driving-tips',
                'description' => 'Essential driving tips and techniques for beginners and experienced drivers',
                'icon' => 'directions-car',
                'color' => '#3B82F6',
                'sort_order' => 1,
            ],
            [
                'name' => 'Car Maintenance',
                'slug' => 'car-maintenance',
                'description' => 'Learn how to maintain your vehicle and perform basic DIY repairs',
                'icon' => 'build',
                'color' => '#10B981',
                'sort_order' => 2,
            ],
            [
                'name' => 'Road Safety',
                'slug' => 'road-safety',
                'description' => 'Road safety education and defensive driving techniques',
                'icon' => 'security',
                'color' => '#F59E0B',
                'sort_order' => 3,
            ],
            [
                'name' => 'Engine & Diagnostics',
                'slug' => 'engine-diagnostics',
                'description' => 'Understanding your car engine and diagnosing common problems',
                'icon' => 'engineering',
                'color' => '#EF4444',
                'sort_order' => 4,
            ],
            [
                'name' => 'Tires & Brakes',
                'slug' => 'tires-brakes',
                'description' => 'Tire maintenance, brake care, and replacement guides',
                'icon' => 'tire-repair',
                'color' => '#8B5CF6',
                'sort_order' => 5,
            ],
        ];

        foreach ($categories as $categoryData) {
            VideoCategory::updateOrCreate(
                ['slug' => $categoryData['slug']],
                $categoryData
            );
        }

        // Videos for each category
        $videos = [
            // Driving Tips & Tutorials
            'driving-tips' => [
                [
                    'title' => 'How to Drive a Manual Car for Beginners',
                    'youtube_id' => 'waeOibnmuJk',
                    'description' => 'Complete guide to driving a manual transmission car. Learn clutch control, gear shifting, and smooth driving techniques.',
                    'channel_name' => 'Conquer Driving',
                    'duration_formatted' => '18:45',
                    'duration_seconds' => 1125,
                    'is_featured' => true,
                ],
                [
                    'title' => 'Parallel Parking Made Easy',
                    'youtube_id' => '1j4WbflxmyA',
                    'description' => 'Master parallel parking with this simple step-by-step technique. Perfect for driving tests and tight city parking.',
                    'channel_name' => 'Driving TV',
                    'duration_formatted' => '8:32',
                    'duration_seconds' => 512,
                    'is_featured' => true,
                ],
                [
                    'title' => 'Roundabout Rules and Tips',
                    'youtube_id' => 'VvJA1VfmtGA',
                    'description' => 'Learn how to navigate roundabouts safely and confidently. Understand lane discipline and right-of-way rules.',
                    'channel_name' => 'Driving Instructor',
                    'duration_formatted' => '10:15',
                    'duration_seconds' => 615,
                    'is_featured' => false,
                ],
                [
                    'title' => 'Highway Driving Tips for Beginners',
                    'youtube_id' => 'Ds1lcT4Ks-k',
                    'description' => 'Essential tips for driving on highways and motorways. Learn merging, lane changes, and safe overtaking.',
                    'channel_name' => 'Smart Drive Test',
                    'duration_formatted' => '15:22',
                    'duration_seconds' => 922,
                    'is_featured' => false,
                ],
                [
                    'title' => 'Night Driving Safety Tips',
                    'youtube_id' => 'BHFub5rf97Y',
                    'description' => 'Stay safe when driving at night. Learn proper headlight use, dealing with glare, and visibility techniques.',
                    'channel_name' => 'AAA',
                    'duration_formatted' => '5:48',
                    'duration_seconds' => 348,
                    'is_featured' => false,
                ],
                [
                    'title' => 'Reverse Parking Step by Step',
                    'youtube_id' => 'HxlGbiMZZjY',
                    'description' => 'Learn how to reverse park perfectly every time with this easy method using reference points.',
                    'channel_name' => 'Conquer Driving',
                    'duration_formatted' => '12:30',
                    'duration_seconds' => 750,
                    'is_featured' => false,
                ],
            ],

            // Car Maintenance
            'car-maintenance' => [
                [
                    'title' => 'How to Check Your Car Engine Oil',
                    'youtube_id' => 'VjntN648fVw',
                    'description' => 'Learn how to check your engine oil level properly and understand when you need an oil change.',
                    'channel_name' => 'ChrisFix',
                    'duration_formatted' => '6:15',
                    'duration_seconds' => 375,
                    'is_featured' => true,
                ],
                [
                    'title' => 'How to Change Your Car Oil',
                    'youtube_id' => 'O1hF25Cowv8',
                    'description' => 'Complete DIY guide to changing your car engine oil at home. Save money with this simple maintenance task.',
                    'channel_name' => 'ChrisFix',
                    'duration_formatted' => '14:30',
                    'duration_seconds' => 870,
                    'is_featured' => true,
                ],
                [
                    'title' => 'How to Jump Start a Car',
                    'youtube_id' => 'HStq4vV_mMg',
                    'description' => 'Step-by-step guide to jump starting a dead battery safely. Essential knowledge for every driver.',
                    'channel_name' => 'ChrisFix',
                    'duration_formatted' => '8:45',
                    'duration_seconds' => 525,
                    'is_featured' => true,
                ],
                [
                    'title' => 'Car Maintenance Tips Every Owner Should Know',
                    'youtube_id' => 'LVEVv2HOhyE',
                    'description' => '10 essential maintenance tips to keep your car running smoothly and avoid expensive repairs.',
                    'channel_name' => 'Scotty Kilmer',
                    'duration_formatted' => '11:20',
                    'duration_seconds' => 680,
                    'is_featured' => false,
                ],
                [
                    'title' => 'How to Check and Add Coolant',
                    'youtube_id' => 'Bj_nwJXczfY',
                    'description' => 'Learn to check your coolant level and add antifreeze properly to prevent engine overheating.',
                    'channel_name' => 'ChrisFix',
                    'duration_formatted' => '7:30',
                    'duration_seconds' => 450,
                    'is_featured' => false,
                ],
                [
                    'title' => 'How to Replace Windshield Wipers',
                    'youtube_id' => 'KFm0MKo4ukQ',
                    'description' => 'Easy DIY guide to replacing worn windshield wiper blades for clear visibility in rain.',
                    'channel_name' => 'AutoZone',
                    'duration_formatted' => '4:15',
                    'duration_seconds' => 255,
                    'is_featured' => false,
                ],
                [
                    'title' => 'How to Check Your Car Battery',
                    'youtube_id' => 'LGB6ZEjGm7A',
                    'description' => 'Learn to test your car battery health and know when its time for a replacement.',
                    'channel_name' => 'ChrisFix',
                    'duration_formatted' => '9:45',
                    'duration_seconds' => 585,
                    'is_featured' => false,
                ],
            ],

            // Road Safety
            'road-safety' => [
                [
                    'title' => 'Defensive Driving Techniques',
                    'youtube_id' => '4L3lRBmqWSk',
                    'description' => 'Learn defensive driving techniques to anticipate hazards and avoid accidents on the road.',
                    'channel_name' => 'Smart Drive Test',
                    'duration_formatted' => '16:40',
                    'duration_seconds' => 1000,
                    'is_featured' => true,
                ],
                [
                    'title' => 'How to Drive in Heavy Rain',
                    'youtube_id' => '44vx7X0ADWI',
                    'description' => 'Safety tips for driving in heavy rain and wet road conditions. Avoid hydroplaning and stay safe.',
                    'channel_name' => 'AAA',
                    'duration_formatted' => '6:20',
                    'duration_seconds' => 380,
                    'is_featured' => true,
                ],
                [
                    'title' => 'Understanding Road Signs',
                    'youtube_id' => 'oHg5SJYRHA0',
                    'description' => 'Complete guide to understanding road signs, their meanings, and why they matter for safe driving.',
                    'channel_name' => 'Driving School',
                    'duration_formatted' => '12:00',
                    'duration_seconds' => 720,
                    'is_featured' => false,
                ],
                [
                    'title' => 'Safe Following Distance Explained',
                    'youtube_id' => 'QJHl1WRz8uE',
                    'description' => 'Learn the 3-second rule and how to maintain safe following distance in different conditions.',
                    'channel_name' => 'Driving TV',
                    'duration_formatted' => '7:15',
                    'duration_seconds' => 435,
                    'is_featured' => false,
                ],
                [
                    'title' => 'Avoiding Distracted Driving',
                    'youtube_id' => 'E9swS1Vl6Ok',
                    'description' => 'The dangers of distracted driving and tips to stay focused on the road.',
                    'channel_name' => 'NHTSA',
                    'duration_formatted' => '5:30',
                    'duration_seconds' => 330,
                    'is_featured' => false,
                ],
            ],

            // Engine & Diagnostics
            'engine-diagnostics' => [
                [
                    'title' => 'What Does the Check Engine Light Mean?',
                    'youtube_id' => 'ggqpSLIIBTI',
                    'description' => 'Understanding your check engine light and common causes. Learn when to worry and when its minor.',
                    'channel_name' => 'ChrisFix',
                    'duration_formatted' => '15:30',
                    'duration_seconds' => 930,
                    'is_featured' => true,
                ],
                [
                    'title' => 'How to Read OBD2 Codes',
                    'youtube_id' => '3Qy1jNJGvLk',
                    'description' => 'Learn to use an OBD2 scanner to read diagnostic trouble codes and understand what they mean.',
                    'channel_name' => 'ChrisFix',
                    'duration_formatted' => '12:45',
                    'duration_seconds' => 765,
                    'is_featured' => true,
                ],
                [
                    'title' => 'Car Engine Explained',
                    'youtube_id' => 'ZQvfHyfgBtA',
                    'description' => 'How a car engine works - simple explanation of the internal combustion engine.',
                    'channel_name' => 'Learn Engineering',
                    'duration_formatted' => '9:20',
                    'duration_seconds' => 560,
                    'is_featured' => false,
                ],
                [
                    'title' => 'Why Is My Car Overheating?',
                    'youtube_id' => 'RxIVGkTQHSw',
                    'description' => 'Common causes of engine overheating and how to diagnose and fix the problem.',
                    'channel_name' => 'Scotty Kilmer',
                    'duration_formatted' => '8:00',
                    'duration_seconds' => 480,
                    'is_featured' => false,
                ],
                [
                    'title' => 'Strange Car Noises and What They Mean',
                    'youtube_id' => '9K_SVT9mCHI',
                    'description' => 'Identify common car noises like squealing, grinding, and knocking, and what they indicate.',
                    'channel_name' => 'Scotty Kilmer',
                    'duration_formatted' => '10:15',
                    'duration_seconds' => 615,
                    'is_featured' => false,
                ],
            ],

            // Tires & Brakes
            'tires-brakes' => [
                [
                    'title' => 'How to Change a Flat Tire',
                    'youtube_id' => 'joBmbh0AGSQ',
                    'description' => 'Step-by-step guide to changing a flat tire safely on the roadside. Every driver should know this!',
                    'channel_name' => 'ChrisFix',
                    'duration_formatted' => '11:00',
                    'duration_seconds' => 660,
                    'is_featured' => true,
                ],
                [
                    'title' => 'How to Check Tire Pressure',
                    'youtube_id' => 'Y2bCrVIy_gE',
                    'description' => 'Learn to check and adjust your tire pressure for better fuel economy and safety.',
                    'channel_name' => 'ChrisFix',
                    'duration_formatted' => '6:30',
                    'duration_seconds' => 390,
                    'is_featured' => true,
                ],
                [
                    'title' => 'How to Check Brake Pads',
                    'youtube_id' => 'wXy6XOEM5U4',
                    'description' => 'Learn to inspect your brake pads and know when they need replacement.',
                    'channel_name' => 'ChrisFix',
                    'duration_formatted' => '8:20',
                    'duration_seconds' => 500,
                    'is_featured' => false,
                ],
                [
                    'title' => 'Understanding Tire Wear Patterns',
                    'youtube_id' => 'E1QE6VoJxn0',
                    'description' => 'What different tire wear patterns tell you about your cars alignment and suspension.',
                    'channel_name' => 'Tire Rack',
                    'duration_formatted' => '7:45',
                    'duration_seconds' => 465,
                    'is_featured' => false,
                ],
                [
                    'title' => 'When to Replace Your Tires',
                    'youtube_id' => 'S3RdBs5EYag',
                    'description' => 'How to know when your tires need replacing. Check tread depth and tire age.',
                    'channel_name' => 'Tire Rack',
                    'duration_formatted' => '5:15',
                    'duration_seconds' => 315,
                    'is_featured' => false,
                ],
                [
                    'title' => 'How to Replace Brake Pads',
                    'youtube_id' => '6RQ9UabOIPg',
                    'description' => 'DIY brake pad replacement guide. Save money by doing this common maintenance yourself.',
                    'channel_name' => 'ChrisFix',
                    'duration_formatted' => '18:30',
                    'duration_seconds' => 1110,
                    'is_featured' => false,
                ],
            ],
        ];

        // Create videos for each category
        foreach ($videos as $categorySlug => $categoryVideos) {
            $category = VideoCategory::where('slug', $categorySlug)->first();

            if (!$category) {
                continue;
            }

            foreach ($categoryVideos as $index => $videoData) {
                $slug = Str::slug($videoData['title']);
                $youtubeId = $videoData['youtube_id'];

                VideoResource::updateOrCreate(
                    ['slug' => $slug],
                    [
                        'video_category_id' => $category->id,
                        'title' => $videoData['title'],
                        'slug' => $slug,
                        'description' => $videoData['description'],
                        'youtube_id' => $youtubeId,
                        'youtube_url' => "https://www.youtube.com/watch?v={$youtubeId}",
                        'thumbnail_url' => "https://img.youtube.com/vi/{$youtubeId}/hqdefault.jpg",
                        'channel_name' => $videoData['channel_name'],
                        'channel_url' => null,
                        'duration_seconds' => $videoData['duration_seconds'],
                        'duration_formatted' => $videoData['duration_formatted'],
                        'views_count' => rand(100, 5000),
                        'likes_count' => rand(10, 500),
                        'sort_order' => $index,
                        'is_featured' => $videoData['is_featured'] ?? false,
                        'is_published' => true,
                    ]
                );
            }
        }

        $this->command->info('Video resources seeded successfully!');
    }
}
