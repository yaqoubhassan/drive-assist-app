<?php

namespace Database\Seeders;

use App\Models\ArticleCategory;
use App\Models\Article;
use Illuminate\Database\Seeder;

class ArticleSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Safety Tips',
                'slug' => 'safety-tips',
                'description' => 'Essential safety information for drivers',
                'icon' => 'shield-check',
                'color' => '#EF4444',
                'articles' => [
                    [
                        'title' => 'Essential Safety Checks Before Every Drive',
                        'slug' => 'essential-safety-checks',
                        'excerpt' => 'Learn the crucial safety checks every driver should perform before hitting the road.',
                        'content' => "# Essential Safety Checks Before Every Drive\n\nBefore you start your journey, taking a few minutes to perform basic safety checks can prevent breakdowns and accidents.\n\n## Walk-Around Inspection\n\nStart with a quick visual inspection of your vehicle:\n\n### Tires\n- Check for proper inflation (use a pressure gauge monthly)\n- Look for cuts, bulges, or excessive wear\n- Ensure tread depth is adequate (use the coin test)\n\n### Lights\n- Test all headlights, taillights, and turn signals\n- Check brake lights (ask someone to help)\n- Ensure reverse lights work\n\n### Fluid Levels\n- Engine oil\n- Coolant/antifreeze\n- Brake fluid\n- Windshield washer fluid\n\n### Wipers and Mirrors\n- Test wiper blades for streaking\n- Adjust all mirrors properly\n- Clean windows for clear visibility\n\n## Interior Checks\n\n- Ensure seatbelts work properly\n- Adjust your seat and steering wheel\n- Check that all warning lights turn off after starting\n- Test your horn\n\n## Monthly Deep Checks\n\nOnce a month, perform these additional checks:\n- Battery terminals for corrosion\n- Air filter condition\n- Belt condition (look for cracks)\n- Tire rotation schedule\n\nRemember: A few minutes of prevention can save hours of roadside trouble!",
                        'image' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
                        'read_time' => 5,
                    ],
                    [
                        'title' => 'Driving in Heavy Rain: A Complete Guide',
                        'slug' => 'driving-in-heavy-rain',
                        'excerpt' => 'Stay safe during Ghana\'s rainy season with these essential tips.',
                        'content' => "# Driving in Heavy Rain: A Complete Guide\n\nGhana's rainy season brings unique challenges for drivers. Here's how to stay safe.\n\n## Before the Rain\n\n### Prepare Your Vehicle\n- Replace worn wiper blades\n- Check tire tread depth (minimum 3mm for wet conditions)\n- Ensure all lights work properly\n- Test your defogger and AC\n\n## During Heavy Rain\n\n### Reduce Speed\n- Reduce speed by at least 30%\n- Increase following distance to 4-6 seconds\n- Avoid sudden braking or acceleration\n\n### Visibility\n- Turn on headlights (low beam)\n- Use wipers at appropriate speed\n- Keep windows defogged\n- Turn off cruise control\n\n### Road Hazards\n- Watch for flooded areas\n- Be extra careful at intersections\n- Avoid standing water (hydroplaning risk)\n- Stay away from large vehicles (spray)\n\n## If You Hydroplane\n\n1. Don't panic\n2. Ease off the accelerator\n3. Don't brake suddenly\n4. Steer straight until traction returns\n5. Gently correct your direction\n\n## Flooded Roads\n\nNever attempt to cross flooded roads:\n- Just 15cm of water can cause loss of control\n- 30cm can float most vehicles\n- 60cm can sweep vehicles away\n\n**Remember: Turn around, don't drown!**",
                        'image' => 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800',
                        'read_time' => 6,
                    ],
                ],
            ],
            [
                'name' => 'Maintenance',
                'slug' => 'maintenance',
                'description' => 'Vehicle maintenance guides and tips',
                'icon' => 'wrench',
                'color' => '#3B82F6',
                'articles' => [
                    [
                        'title' => 'Understanding Your Car\'s Warning Lights',
                        'slug' => 'warning-lights-guide',
                        'excerpt' => 'Know what each dashboard warning light means and when to take action.',
                        'content' => "# Understanding Your Car's Warning Lights\n\nModern vehicles have numerous warning lights. Here's what they mean.\n\n## Critical Warning Lights (Stop Immediately)\n\n### 🔴 Oil Pressure Warning\n**What it means:** Low oil pressure or oil level\n**Action:** Stop immediately, check oil level, do not drive if light stays on\n\n### 🔴 Temperature Warning\n**What it means:** Engine is overheating\n**Action:** Stop safely, let engine cool, check coolant level\n\n### 🔴 Brake System Warning\n**What it means:** Brake system problem or low brake fluid\n**Action:** Check brake fluid, test brakes carefully, seek immediate service\n\n### 🔴 Battery Warning\n**What it means:** Charging system problem\n**Action:** Check battery connections, may need alternator service\n\n## Cautionary Lights (Service Soon)\n\n### 🟡 Check Engine Light\n**What it means:** Engine or emissions system issue\n**Action:** Get diagnostic scan, don't ignore even if car runs fine\n\n### 🟡 ABS Warning\n**What it means:** Anti-lock brake system issue\n**Action:** Regular brakes work, but ABS needs service\n\n### 🟡 Tire Pressure (TPMS)\n**What it means:** One or more tires low on pressure\n**Action:** Check and adjust tire pressure\n\n## Informational Lights\n\n### 🟢/🔵 High Beam Indicator\n### 🟢 Turn Signal Indicators\n### ⚪ Cruise Control Active\n\n## Pro Tips\n\n1. Never ignore a red warning light\n2. Yellow lights mean service needed soon\n3. Keep your owner's manual handy\n4. Regular maintenance prevents many warnings",
                        'image' => 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
                        'read_time' => 7,
                    ],
                    [
                        'title' => 'DIY Maintenance Every Driver Should Know',
                        'slug' => 'diy-maintenance-basics',
                        'excerpt' => 'Simple maintenance tasks you can do yourself to keep your car running smoothly.',
                        'content' => "# DIY Maintenance Every Driver Should Know\n\nSave money and keep your car healthy with these basic maintenance tasks.\n\n## 1. Checking and Adding Oil\n\n### What you need:\n- Clean cloth or paper towel\n- Correct oil type for your car\n- Funnel\n\n### Steps:\n1. Park on level ground, engine warm but off\n2. Wait 5 minutes for oil to settle\n3. Remove dipstick, wipe clean\n4. Reinsert fully, remove and check level\n5. Add oil if below minimum mark\n6. Check level again after adding\n\n## 2. Checking Tire Pressure\n\n### What you need:\n- Tire pressure gauge\n- Air compressor or pump\n\n### Steps:\n1. Check pressure when tires are cold\n2. Find recommended pressure on door jamb sticker\n3. Remove valve cap and press gauge firmly\n4. Add or release air as needed\n5. Don't forget the spare tire!\n\n## 3. Replacing Wiper Blades\n\n### What you need:\n- New wiper blades (correct size)\n\n### Steps:\n1. Lift wiper arm away from windshield\n2. Press release tab and slide off old blade\n3. Slide new blade until it clicks\n4. Lower arm gently\n\n## 4. Checking Coolant Level\n\n⚠️ **Never open radiator cap when hot!**\n\n### Steps:\n1. Locate coolant reservoir (translucent tank)\n2. Check level against min/max marks\n3. Add 50/50 coolant mix if low\n\n## 5. Replacing Air Filter\n\n### Steps:\n1. Locate air filter box (usually near engine top)\n2. Unclip or unscrew cover\n3. Remove old filter, note orientation\n4. Insert new filter same way\n5. Secure cover\n\n## When to Call a Professional\n\n- Any brake work beyond pad inspection\n- Transmission issues\n- Electrical problems\n- Engine repairs\n- Airbag systems",
                        'image' => 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800',
                        'read_time' => 8,
                    ],
                ],
            ],
            [
                'name' => 'Driving Skills',
                'slug' => 'driving-skills',
                'description' => 'Improve your driving techniques',
                'icon' => 'car',
                'color' => '#10B981',
                'articles' => [
                    [
                        'title' => 'Mastering Parallel Parking',
                        'slug' => 'parallel-parking-guide',
                        'excerpt' => 'Step-by-step guide to perfect parallel parking every time.',
                        'content' => "# Mastering Parallel Parking\n\nParallel parking doesn't have to be stressful. Follow this guide to park like a pro.\n\n## Finding the Right Spot\n\n- Look for a space at least 1.5 times your car's length\n- Ensure it's legal to park there\n- Check for fire hydrants, driveways, or restricted zones\n\n## The Step-by-Step Method\n\n### Step 1: Signal and Position\n- Signal your intention\n- Pull up alongside the car in front\n- Align your side mirrors with theirs\n- Keep about 60cm between vehicles\n\n### Step 2: Start Reversing\n- Check all mirrors and blind spots\n- Turn steering wheel fully toward curb\n- Reverse slowly until 45-degree angle\n\n### Step 3: Straighten and Continue\n- When your front bumper clears their rear bumper\n- Straighten the wheel\n- Continue reversing slowly\n\n### Step 4: Complete the Turn\n- When close to the car behind (check mirrors!)\n- Turn wheel away from curb\n- Continue until parallel\n\n### Step 5: Center Yourself\n- Pull forward to center in space\n- Keep about 30cm from curb\n- Straighten wheels before leaving\n\n## Common Mistakes\n\n❌ Cutting in too early\n❌ Not checking blind spots\n❌ Getting too close to curb\n❌ Rushing the maneuver\n\n## Pro Tips\n\n✅ Practice in an empty lot first\n✅ Use reference points on your car\n✅ Go slowly - speed doesn't help\n✅ It's okay to pull out and try again\n\n## Using Backup Cameras\n\nModern cameras help but remember:\n- Don't rely solely on the camera\n- Check mirrors and look over shoulder\n- Camera may not show everything",
                        'image' => 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800',
                        'read_time' => 6,
                    ],
                    [
                        'title' => 'Fuel-Efficient Driving Techniques',
                        'slug' => 'fuel-efficient-driving',
                        'excerpt' => 'Save money on fuel with these proven driving techniques.',
                        'content' => "# Fuel-Efficient Driving Techniques\n\nWith rising fuel prices, these techniques can save you significant money.\n\n## Driving Habits\n\n### Smooth Acceleration\n- Accelerate gently from stops\n- Imagine an egg under the pedal\n- Reach cruising speed gradually\n- Aggressive acceleration uses 33% more fuel\n\n### Maintain Steady Speed\n- Use cruise control on highways\n- Avoid unnecessary speed changes\n- Anticipate traffic flow\n- Each 10 km/h over 90 reduces efficiency by 10%\n\n### Coast When Possible\n- Lift off accelerator early when approaching stops\n- Let the car slow naturally\n- Engine braking uses zero fuel in modern cars\n- Avoid harsh braking\n\n## Vehicle Care\n\n### Tire Pressure\n- Check monthly\n- Underinflated tires increase fuel use by 3%\n- Use manufacturer's recommended pressure\n\n### Regular Maintenance\n- Replace air filters as needed\n- Use recommended oil grade\n- Keep engine tuned\n- Fix oxygen sensor issues\n\n### Reduce Weight and Drag\n- Remove roof racks when not in use\n- Clear unnecessary items from trunk\n- Keep windows closed at highway speeds\n- Use AC moderately\n\n## Planning\n\n### Combine Trips\n- A warm engine is more efficient\n- Short trips use more fuel per km\n- Plan errands efficiently\n\n### Avoid Rush Hour\n- Idling wastes fuel\n- Stop-and-go traffic is inefficient\n- Use navigation for traffic updates\n\n## Quick Tips Summary\n\n| Action | Fuel Savings |\n|--------|-------------|\n| Smooth driving | Up to 33% |\n| Proper tire pressure | 3% |\n| Remove roof rack | 5-25% |\n| Regular maintenance | 4% |\n| Avoid excessive idling | Varies |\n\n**Bottom line:** Gentle, consistent driving can reduce fuel consumption by up to 25%!",
                        'image' => 'https://images.unsplash.com/photo-1611068256452-bf47f5b942de?w=800',
                        'read_time' => 7,
                    ],
                ],
            ],
            [
                'name' => 'Ghana Roads',
                'slug' => 'ghana-roads',
                'description' => 'Specific tips for driving in Ghana',
                'icon' => 'map-pin',
                'color' => '#8B5CF6',
                'articles' => [
                    [
                        'title' => 'Navigating Accra Traffic: Insider Tips',
                        'slug' => 'accra-traffic-tips',
                        'excerpt' => 'Survive and thrive in Accra\'s challenging traffic conditions.',
                        'content' => "# Navigating Accra Traffic: Insider Tips\n\nAccra's traffic is legendary. Here's how to handle it like a local.\n\n## Understanding Accra Traffic Patterns\n\n### Peak Hours\n- Morning rush: 6:30 AM - 9:30 AM\n- Evening rush: 4:00 PM - 8:00 PM\n- Friday evenings are worst\n- Monday mornings are heavy\n\n### Known Bottlenecks\n- Kwame Nkrumah Circle\n- 37 Military Hospital area\n- Tema Motorway (both directions)\n- Graphic Road junction\n- Madina-Adenta stretch\n- Mallam Junction\n\n## Strategies for Success\n\n### Timing\n- Leave early (before 6 AM) or late (after 9:30 AM)\n- For evening, leave before 3:30 PM or after 8 PM\n- Avoid traveling on Friday evenings if possible\n\n### Route Planning\n- Learn alternative routes\n- Use Google Maps or Waze for real-time updates\n- Some longer routes are actually faster\n- Know the back streets in your frequent areas\n\n### Fuel Management\n- Never let tank go below quarter\n- Fill up at less busy times\n- Keep traffic fuel consumption in mind\n\n## Staying Safe\n\n### General Safety\n- Keep doors locked and windows up in traffic\n- Stay alert even when stopped\n- Keep valuables out of sight\n- Maintain safe following distance\n\n### Dealing with Hawkers\n- A polite \"no\" or wave is sufficient\n- Don't display money or phones\n- It's okay to ignore persistent sellers\n\n## Rainy Season Considerations\n\n- Many roads flood during heavy rain\n- Know which areas to avoid\n- Circle underpass floods frequently\n- Odaw River areas are problematic\n- Allow extra time during rains\n\n## Pro Tips\n\n1. Keep water and snacks in the car\n2. Maintain your AC - it gets hot\n3. Have a phone charger ready\n4. Listen to local radio for traffic updates\n5. Patience is your best friend",
                        'image' => 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
                        'read_time' => 8,
                    ],
                    [
                        'title' => 'Understanding DVLA Vehicle Registration',
                        'slug' => 'dvla-registration-guide',
                        'excerpt' => 'Complete guide to registering your vehicle with Ghana DVLA.',
                        'content' => "# Understanding DVLA Vehicle Registration\n\nA comprehensive guide to vehicle registration in Ghana.\n\n## What is DVLA?\n\nThe Driver and Vehicle Licensing Authority (DVLA) is responsible for:\n- Vehicle registration\n- Driver licensing\n- Vehicle roadworthiness certification\n- Driving schools regulation\n\n## Types of Registration\n\n### New Vehicle Registration\nFor brand new vehicles from dealers.\n\n### Re-registration\nFor imported used vehicles.\n\n### Change of Ownership\nWhen purchasing a used vehicle locally.\n\n## Required Documents\n\n### For New Vehicles\n1. Customs entry form (Form C)\n2. Bill of lading or airway bill\n3. Purchase invoice\n4. Insurance certificate\n5. Passport/Ghana Card\n6. TIN number\n\n### For Used Imports\n1. Bill of entry\n2. Original title/registration (from origin country)\n3. Passport/Ghana Card\n4. Insurance certificate\n5. Pre-shipment inspection certificate\n\n## Registration Process\n\n### Step 1: Document Verification\n- Visit DVLA office\n- Submit all required documents\n- Pay processing fees\n\n### Step 2: Vehicle Inspection\n- DVLA inspects the vehicle\n- VIN verification\n- Basic roadworthiness check\n\n### Step 3: Number Plate Allocation\n- Regular or fancy numbers available\n- Fancy numbers cost extra\n\n### Step 4: Certificate Issuance\n- Vehicle registration certificate\n- License plates\n\n## Fees (Subject to Change)\n\n| Service | Approximate Cost |\n|---------|------------------|\n| New registration | GH₵500-800 |\n| Re-registration | GH₵400-600 |\n| Ownership transfer | GH₵300-400 |\n| Fancy numbers | GH₵5,000+ |\n\n## Roadworthiness Certificate\n\nRequired annually for all vehicles:\n1. Book appointment online or walk-in\n2. Vehicle inspection (brakes, lights, emissions)\n3. Pay fee\n4. Receive sticker if passed\n\n## DVLA Locations\n\n- Accra (Head Office): Near 37 Hospital\n- Kumasi: Adum\n- Tema: Community 1\n- Other regional offices available\n\n## Online Services\n\nSome services available at: dvla.gov.gh\n- Appointment booking\n- Verification of documents\n- Status checking\n\n## Tips\n\n- Go early to avoid long queues\n- Ensure all documents are original\n- Budget for unexpected fees\n- Keep copies of all documents\n- Vehicle must be physically present for inspection",
                        'image' => 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
                        'read_time' => 9,
                    ],
                ],
            ],
            [
                'name' => 'Insurance',
                'slug' => 'insurance',
                'description' => 'Understanding vehicle insurance in Ghana',
                'icon' => 'shield',
                'color' => '#06B6D4',
                'articles' => [
                    [
                        'title' => 'Vehicle Insurance in Ghana: What You Need to Know',
                        'slug' => 'ghana-vehicle-insurance',
                        'excerpt' => 'Essential guide to vehicle insurance types and requirements in Ghana.',
                        'content' => "# Vehicle Insurance in Ghana: What You Need to Know\n\nVehicle insurance is mandatory in Ghana. Here's what every driver should know.\n\n## Legal Requirement\n\nUnder Ghana's Motor Vehicles (Third Party Insurance) Act, all vehicles must have at least third-party insurance.\n\nPenalties for no insurance:\n- Fines\n- Vehicle impoundment\n- Court prosecution\n\n## Types of Coverage\n\n### Third Party Only (Mandatory)\n\n**Covers:**\n- Damage to other vehicles\n- Injury to other people\n- Damage to property\n\n**Doesn't cover:**\n- Your vehicle\n- Your injuries\n- Theft of your vehicle\n\n**Best for:** Older vehicles, tight budgets\n\n### Third Party, Fire & Theft\n\n**Covers everything above plus:**\n- Fire damage to your vehicle\n- Theft of your vehicle\n\n**Doesn't cover:**\n- Accident damage to your vehicle\n\n**Best for:** Mid-range vehicles, moderate budgets\n\n### Comprehensive\n\n**Covers everything above plus:**\n- Accident damage to your vehicle\n- Windscreen damage\n- Personal accident for driver\n- Often includes towing\n\n**Best for:** Newer vehicles, complete protection\n\n## Factors Affecting Premium\n\n- Vehicle value\n- Vehicle age\n- Engine capacity\n- Driver's age and experience\n- Claim history\n- Security features\n- Usage (personal vs commercial)\n\n## Major Insurance Companies\n\n1. SIC Insurance\n2. Enterprise Insurance\n3. Star Assurance\n4. Hollard Ghana\n5. Activa International\n6. Metropolitan Insurance\n7. Vanguard Assurance\n\n## Making a Claim\n\n### After an Accident:\n1. Ensure everyone's safety\n2. Don't admit fault\n3. Exchange information with other party\n4. Take photos of damage\n5. Get police report if needed\n6. Notify insurer within 24-48 hours\n\n### Required for Claims:\n- Completed claim form\n- Police report (for accidents)\n- Photos of damage\n- Repair estimates\n- Driver's license copy\n\n## Tips for Better Rates\n\n- Compare multiple insurers\n- Maintain claim-free record\n- Install security devices\n- Pay annually vs monthly\n- Ask about discounts\n\n## Digital Insurance\n\nMany insurers now offer:\n- Online quotes\n- Mobile apps for claims\n- Digital proof of insurance\n- Electronic renewals\n\n**Remember:** Cheapest isn't always best. Consider the insurer's claim settlement reputation.",
                        'image' => 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
                        'read_time' => 10,
                    ],
                ],
            ],
        ];

        foreach ($categories as $index => $categoryData) {
            $articles = $categoryData['articles'];
            unset($categoryData['articles']);

            $category = ArticleCategory::updateOrCreate(
                ['slug' => $categoryData['slug']],
                array_merge($categoryData, ['sort_order' => $index])
            );

            foreach ($articles as $articleIndex => $article) {
                Article::updateOrCreate(
                    ['slug' => $article['slug']],
                    array_merge($article, [
                        'article_category_id' => $category->id,
                        'author' => 'DriveAssist Team',
                        'is_published' => true,
                        'published_at' => now(),
                        'view_count' => rand(50, 500),
                        'like_count' => rand(10, 100),
                    ])
                );
            }
        }
    }
}
