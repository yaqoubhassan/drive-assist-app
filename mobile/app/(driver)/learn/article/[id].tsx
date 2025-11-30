import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Share, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../src/context/ThemeContext';
import { Badge, Button, SkeletonArticleDetail } from '../../../../src/components/common';
import { articlesService, Article as ApiArticle } from '../../../../src/services/learn';

const articles: Record<string, {
  id: string;
  title: string;
  category: string;
  readTime: string;
  author: string;
  date: string;
  image: string;
  content: string[];
  relatedArticles: { id: string; title: string; image: string }[];
}> = {
  // FEATURED ARTICLES (1-5)
  '1': {
    id: '1',
    title: 'Harmattan Season Car Prep Checklist',
    category: 'Maintenance',
    readTime: '5 min read',
    author: 'DriveAssist Team',
    date: 'Nov 20, 2024',
    image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800',
    content: [
      'As the harmattan season approaches in Ghana, it\'s essential to prepare your vehicle for the dusty, dry conditions. While we don\'t experience snow, the harmattan brings its own challenges for your car.',
      '## Check Your Air Filter',
      'The dusty harmattan winds can clog your air filter quickly. A clean air filter ensures optimal engine performance and fuel efficiency. Check it monthly during harmattan season and replace if necessary.',
      '## Battery Maintenance',
      'Extreme temperature fluctuations can affect battery performance. Have your battery tested to ensure it\'s holding charge properly. Clean any corrosion from terminals using a mixture of baking soda and water.',
      '## Windshield and Wipers',
      'Dust accumulation on your windshield can impair visibility. Ensure your windshield washer fluid is full and your wipers are in good condition. Consider using a rain repellent treatment for easier cleaning.',
      '## Tire Pressure Check',
      'Temperature changes affect tire pressure. Check your tires weekly and maintain the recommended PSI found on your door jamb sticker. Properly inflated tires improve fuel economy and safety.',
      '## Cooling System',
      'Despite cooler mornings, afternoons can still be hot. Ensure your coolant level is adequate and the radiator is functioning properly. Overheating is a common issue year-round in Ghana.',
      '## Interior Protection',
      'Use sunshades when parked and consider seat covers to protect your interior from dust and UV damage. Regular interior cleaning during harmattan helps maintain your vehicle\'s value.',
    ],
    relatedArticles: [
      { id: '2', title: 'Understanding Dashboard Warning Lights', image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=400' },
      { id: '20', title: 'Oil Change: Step by Step Guide', image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400' },
    ],
  },
  '2': {
    id: '2',
    title: 'Understanding Dashboard Warning Lights',
    category: 'Education',
    readTime: '8 min read',
    author: 'DriveAssist Team',
    date: 'Nov 18, 2024',
    image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800',
    content: [
      'Your car\'s dashboard warning lights are its way of communicating with you. Understanding what each light means can help you address issues before they become serious problems.',
      '## Check Engine Light',
      'This is perhaps the most common and most misunderstood warning light. It can indicate anything from a loose gas cap to a serious engine problem. When this light comes on, don\'t panic, but do get it checked soon.',
      '## Oil Pressure Warning',
      'If this light comes on while driving, pull over safely and turn off your engine immediately. Low oil pressure can cause severe engine damage. Check your oil level and add if necessary before restarting.',
      '## Battery/Charging Alert',
      'This light indicates an issue with your vehicle\'s charging system. It could be a failing battery, alternator, or loose connection. Have it checked to avoid being stranded.',
      '## Temperature Warning',
      'An overheating engine can cause catastrophic damage. If this light comes on, pull over safely, turn off your engine, and let it cool before checking coolant levels. Never remove the radiator cap when hot.',
      '## Brake System Warning',
      'This could indicate low brake fluid, worn brake pads, or a more serious brake system issue. Don\'t ignore this light - your brakes are critical for safety.',
      '## ABS Warning',
      'The Anti-lock Braking System light indicates an issue with this safety feature. Your regular brakes should still work, but have the ABS system checked soon.',
      '## Tire Pressure Monitor',
      'Modern vehicles monitor tire pressure. This light indicates one or more tires are significantly under-inflated. Check and inflate all tires to the recommended pressure.',
    ],
    relatedArticles: [
      { id: '12', title: 'Diagnosing Check Engine Light', image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400' },
      { id: '13', title: 'Battery Problems and Fixes', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400' },
    ],
  },
  '3': {
    id: '3',
    title: 'How to Check Your Oil Level',
    category: 'Beginner',
    readTime: '4 min read',
    author: 'DriveAssist Team',
    date: 'Nov 15, 2024',
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800',
    content: [
      'Checking your oil level is one of the most basic yet important maintenance tasks you can perform. Regular checks can prevent costly engine damage.',
      '## When to Check',
      'Check your oil at least once a month, or before long trips. Always check when the engine is cool or has been off for at least 10 minutes to allow oil to settle.',
      '## Step 1: Locate the Dipstick',
      'Open your hood and find the dipstick - it usually has a yellow or orange handle marked with an oil can symbol. Pull it out completely.',
      '## Step 2: Clean and Reinsert',
      'Wipe the dipstick clean with a rag or paper towel. Insert it fully back into its tube, then pull it out again to get an accurate reading.',
      '## Step 3: Read the Level',
      'The dipstick has markers indicating minimum and maximum levels. Your oil should be between these marks. If it\'s near or below the minimum, add oil.',
      '## Step 4: Check Oil Condition',
      'While you\'re at it, note the oil\'s color and consistency. Fresh oil is amber and transparent. Dark, gritty oil may indicate it\'s time for a change.',
      '## Adding Oil',
      'If needed, add oil through the oil filler cap (not the dipstick tube). Add a little at a time and recheck the level. Don\'t overfill - too much oil can cause problems too.',
      '## Pro Tip',
      'Keep a log of your oil checks and additions. This helps you track if your car is consuming oil, which could indicate a problem.',
    ],
    relatedArticles: [
      { id: '20', title: 'Oil Change: Step by Step Guide', image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400' },
      { id: '21', title: 'Tire Rotation Explained', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
    ],
  },
  '4': {
    id: '4',
    title: 'Tire Pressure: Why It Matters',
    category: 'Safety',
    readTime: '3 min read',
    author: 'DriveAssist Team',
    date: 'Nov 12, 2024',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    content: [
      'Proper tire pressure is crucial for safety, fuel efficiency, and tire longevity. Yet it\'s one of the most overlooked aspects of car maintenance.',
      '## Safety First',
      'Under-inflated tires increase stopping distances and can cause loss of vehicle control. Over-inflated tires reduce the contact patch with the road, decreasing grip.',
      '## Fuel Economy',
      'Properly inflated tires can improve fuel efficiency by up to 3%. With fuel prices in Ghana, this translates to significant savings over time.',
      '## Tire Life',
      'Incorrect pressure causes uneven tire wear. Under-inflation wears the edges, over-inflation wears the center. Either way, you\'ll need new tires sooner.',
      '## How to Check',
      'Use a reliable tire pressure gauge. Check pressure when tires are cold (haven\'t been driven for at least 3 hours). The recommended pressure is on a sticker inside your driver\'s door.',
      '## Check All Four',
      'Don\'t forget to check all four tires, plus your spare. Pressure can vary between tires, even on the same car.',
      '## Temperature Effects',
      'Tire pressure changes with temperature - about 1 PSI for every 10°F change. In Ghana\'s varying temperatures, check more frequently during harmattan season.',
    ],
    relatedArticles: [
      { id: '21', title: 'Tire Rotation Explained', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
      { id: '23', title: 'Brake Pad Inspection Guide', image: 'https://images.unsplash.com/photo-1580273916550-e323e7a39554?w=400' },
    ],
  },
  '5': {
    id: '5',
    title: 'Signs Your Brakes Need Attention',
    category: 'Safety',
    readTime: '6 min read',
    author: 'DriveAssist Team',
    date: 'Nov 10, 2024',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800',
    content: [
      'Your brakes are the most critical safety system in your vehicle. Recognizing the signs of brake problems can prevent accidents and costly repairs.',
      '## Squealing or Squeaking',
      'A high-pitched squeal when braking usually indicates worn brake pads. Most pads have wear indicators that make this sound when it\'s time for replacement.',
      '## Grinding Sounds',
      'If squealing has progressed to grinding, your brake pads are completely worn and metal is contacting metal. This is dangerous and damages rotors. Get this fixed immediately.',
      '## Vibration or Pulsation',
      'If your brake pedal or steering wheel vibrates when braking, you likely have warped rotors. This happens from excessive heat, often from hard braking.',
      '## Soft or Spongy Pedal',
      'If the brake pedal feels soft or goes further down than usual, you may have air in the brake lines or a brake fluid leak. This is a serious safety concern.',
      '## Car Pulls to One Side',
      'If your car pulls left or right when braking, you may have uneven brake wear, a stuck caliper, or a brake fluid issue on one side.',
      '## Warning Light',
      'Never ignore your brake warning light. It could indicate low brake fluid, worn pads, or a system malfunction.',
      '## Burning Smell',
      'A burning smell after repeated hard braking indicates overheated brakes. Pull over and let them cool. If it persists, have them checked.',
    ],
    relatedArticles: [
      { id: '23', title: 'Brake Pad Inspection Guide', image: 'https://images.unsplash.com/photo-1580273916550-e323e7a39554?w=400' },
      { id: '2', title: 'Understanding Dashboard Warning Lights', image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=400' },
    ],
  },

  // COMMON CAR ISSUES (10-13)
  '10': {
    id: '10',
    title: 'Engine Overheating: Causes & Solutions',
    category: 'Car Issues',
    readTime: '6 min read',
    author: 'DriveAssist Team',
    date: 'Nov 25, 2024',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800',
    content: [
      'Engine overheating is a common problem in Ghana\'s hot climate. Understanding the causes and knowing how to respond can save your engine from serious damage.',
      '## Common Causes',
      'Low coolant level is the most frequent cause. Other causes include a faulty thermostat, broken water pump, clogged radiator, or failed cooling fan.',
      '## Warning Signs',
      'Watch for: temperature gauge in the red zone, steam from under the hood, sweet smell from coolant, or reduced engine power.',
      '## What to Do When Overheating',
      'Turn off the AC and turn on the heater to draw heat from the engine. If the temperature continues to rise, safely pull over and turn off the engine. Never open the radiator cap when hot.',
      '## Coolant System Check',
      'Regularly check coolant levels when the engine is cold. The reservoir should be between MIN and MAX marks. Use the correct coolant type for your vehicle.',
      '## Radiator Maintenance',
      'Keep the radiator clean. Dust, bugs, and debris can block airflow. In Ghana\'s dusty conditions, consider cleaning the radiator more frequently.',
      '## Prevention Tips',
      'Regular maintenance is key. Have your cooling system flushed every 2 years. Check hoses for cracks and the water pump for leaks. Replace the thermostat every 50,000 km.',
      '## When to See a Mechanic',
      'If overheating persists after adding coolant, or if you notice coolant leaks, have your vehicle inspected immediately. Continuing to drive can cause head gasket failure.',
    ],
    relatedArticles: [
      { id: '2', title: 'Understanding Dashboard Warning Lights', image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=400' },
      { id: '11', title: 'Strange Noises and What They Mean', image: 'https://images.unsplash.com/photo-1580273916550-e323e7a39554?w=400' },
    ],
  },
  '11': {
    id: '11',
    title: 'Strange Noises and What They Mean',
    category: 'Car Issues',
    readTime: '8 min read',
    author: 'DriveAssist Team',
    date: 'Nov 24, 2024',
    image: 'https://images.unsplash.com/photo-1580273916550-e323e7a39554?w=800',
    content: [
      'Your car talks to you through sounds. Learning to interpret these noises can help you catch problems early and avoid costly repairs.',
      '## Squealing When Starting',
      'A high-pitched squeal when you start the car usually indicates a worn or loose serpentine belt. This belt drives important components like the alternator and power steering pump.',
      '## Grinding When Braking',
      'Metal-on-metal grinding means your brake pads are completely worn. This is a safety hazard and will also damage your rotors, making repairs more expensive.',
      '## Clicking When Turning',
      'A clicking or popping sound when turning often indicates worn CV joints. These are part of your drivetrain and need attention before they fail completely.',
      '## Knocking from the Engine',
      'Engine knock can indicate low-quality fuel, carbon buildup, or more serious issues like worn bearings. Try premium fuel first; if it persists, see a mechanic.',
      '## Hissing Under the Hood',
      'A hissing sound could indicate a vacuum leak, overheating engine, or coolant leak. Check under the hood for visible leaks or steam.',
      '## Humming or Droning',
      'A constant humming that changes with speed often points to worn wheel bearings. The sound typically gets louder when turning in one direction.',
      '## Rattling Underneath',
      'Loose heat shields or exhaust components can cause rattling. While often not dangerous, it\'s annoying and should be fixed.',
      '## Whining in Transmission',
      'A whining sound that changes with gear shifts could indicate low transmission fluid or a worn transmission. Check fluid level first.',
    ],
    relatedArticles: [
      { id: '12', title: 'Diagnosing Check Engine Light', image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400' },
      { id: '23', title: 'Brake Pad Inspection Guide', image: 'https://images.unsplash.com/photo-1580273916550-e323e7a39554?w=400' },
    ],
  },
  '12': {
    id: '12',
    title: 'Diagnosing Check Engine Light',
    category: 'Car Issues',
    readTime: '10 min read',
    author: 'DriveAssist Team',
    date: 'Nov 23, 2024',
    image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800',
    content: [
      'The check engine light is your car\'s way of saying something needs attention. Understanding it can save you from panic and help you make informed decisions.',
      '## Solid vs. Flashing',
      'A solid light indicates a non-critical issue that should be checked soon. A flashing light indicates a serious problem - reduce speed and get to a mechanic immediately.',
      '## Common Triggers',
      'Loose gas cap is the most common and simplest cause. Other common triggers include oxygen sensor failure, catalytic converter issues, mass airflow sensor problems, and spark plug issues.',
      '## OBD-II Scanner',
      'All cars made after 1996 have an OBD-II port. A scanner (available at auto parts stores or affordable to buy) can read the diagnostic codes telling you exactly what triggered the light.',
      '## Understanding Codes',
      'Codes like P0420 (catalytic converter) or P0171 (fuel mixture lean) give mechanics starting points. Understanding basic codes helps you communicate with your mechanic.',
      '## Don\'t Ignore It',
      'Ignoring the check engine light can turn minor issues into major repairs. A small oxygen sensor problem can eventually damage your expensive catalytic converter.',
      '## DIY Checks',
      'Before panicking: check your gas cap is tight, listen for unusual sounds, check for visible leaks, and note any changes in performance or fuel economy.',
      '## Professional Diagnosis',
      'Some issues require professional equipment to diagnose properly. A mechanic can perform more detailed tests to pinpoint the exact problem.',
    ],
    relatedArticles: [
      { id: '2', title: 'Understanding Dashboard Warning Lights', image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=400' },
      { id: '10', title: 'Engine Overheating: Causes & Solutions', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400' },
    ],
  },
  '13': {
    id: '13',
    title: 'Battery Problems and Fixes',
    category: 'Car Issues',
    readTime: '5 min read',
    author: 'DriveAssist Team',
    date: 'Nov 22, 2024',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800',
    content: [
      'Battery issues are one of the most common reasons for breakdown calls. In Ghana\'s heat, batteries face extra stress. Here\'s what you need to know.',
      '## Signs of a Dying Battery',
      'Slow engine cranking, dim headlights, electrical issues, swollen battery case, or the battery warning light are all signs your battery may be failing.',
      '## Heat Kills Batteries',
      'While cold weather gets blamed, heat actually causes more battery damage. Ghana\'s climate can significantly shorten battery life to 2-3 years instead of the typical 4-5.',
      '## Terminal Corrosion',
      'White or bluish buildup on terminals disrupts the connection. Clean with a mixture of baking soda and water, then apply petroleum jelly to prevent future corrosion.',
      '## Testing Your Battery',
      'Most auto parts stores will test your battery for free. A battery should read at least 12.6 volts when fully charged. Below 12.4 volts indicates it needs charging or replacement.',
      '## Jump Starting Safely',
      'Connect positive to positive, then negative to a ground point (not the dead battery\'s negative terminal). Let the good car run for a few minutes before starting the dead one.',
      '## When to Replace',
      'If your battery is over 3 years old and showing signs of weakness, replace it proactively rather than getting stranded.',
      '## Choosing a New Battery',
      'Get the correct size and Cold Cranking Amps (CCA) for your vehicle. In Ghana\'s heat, consider a battery with higher heat resistance ratings.',
    ],
    relatedArticles: [
      { id: '2', title: 'Understanding Dashboard Warning Lights', image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=400' },
      { id: '12', title: 'Diagnosing Check Engine Light', image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400' },
    ],
  },

  // MAINTENANCE GUIDES (20-23)
  '20': {
    id: '20',
    title: 'Oil Change: Step by Step Guide',
    category: 'Maintenance',
    readTime: '7 min read',
    author: 'DriveAssist Team',
    date: 'Nov 21, 2024',
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800',
    content: [
      'Regular oil changes are the single most important thing you can do to extend your engine\'s life. Here\'s how to do it yourself or what to expect from a professional service.',
      '## When to Change Oil',
      'Follow your owner\'s manual recommendations. Generally, change every 5,000 km for conventional oil or 10,000 km for synthetic. In Ghana\'s dusty, hot conditions, consider changing more frequently.',
      '## Gather Your Supplies',
      'You\'ll need: new oil (correct type and amount), new oil filter, drain pan, wrench for drain plug, oil filter wrench, funnel, and rags.',
      '## Step 1: Warm Up',
      'Run your engine for a few minutes. Warm oil drains more completely and carries more contaminants out with it.',
      '## Step 2: Drain Old Oil',
      'Position the drain pan under the oil pan. Remove the drain plug and let all oil drain out. This takes about 5-10 minutes.',
      '## Step 3: Replace Filter',
      'Remove the old oil filter. Apply a thin layer of new oil to the gasket of the new filter. Hand-tighten the new filter - don\'t over-tighten.',
      '## Step 4: Add New Oil',
      'Replace and tighten the drain plug. Add new oil through the filler cap. Start with slightly less than specified, check the level, and add more as needed.',
      '## Step 5: Check for Leaks',
      'Run the engine for a minute, then turn it off and check under the car for leaks. Recheck the oil level after the engine has been off for a few minutes.',
      '## Dispose of Old Oil Properly',
      'Never dump used oil. Take it to a recycling center or auto parts store that accepts used oil.',
    ],
    relatedArticles: [
      { id: '3', title: 'How to Check Your Oil Level', image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400' },
      { id: '22', title: 'Air Filter Replacement', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400' },
    ],
  },
  '21': {
    id: '21',
    title: 'Tire Rotation Explained',
    category: 'Maintenance',
    readTime: '5 min read',
    author: 'DriveAssist Team',
    date: 'Nov 20, 2024',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    content: [
      'Tire rotation helps ensure even wear across all four tires, extending their life and maintaining optimal handling. It\'s a simple but often neglected maintenance task.',
      '## Why Rotate Tires',
      'Front and rear tires wear differently. Front tires handle steering and bear more weight in front-wheel-drive cars. Rotation evens out this wear.',
      '## How Often',
      'Rotate tires every 8,000-10,000 km, or with every other oil change. Check your owner\'s manual for specific recommendations.',
      '## Rotation Patterns',
      'For front-wheel drive: front tires go straight to the back, rear tires cross to the front. For rear-wheel drive: opposite pattern. For all-wheel drive: follow manufacturer recommendations.',
      '## Directional Tires',
      'Some tires are designed to rotate in one direction only (marked with an arrow). These can only be moved front to back on the same side.',
      '## DIY vs. Professional',
      'Tire rotation requires lifting the car safely. If you have proper jack stands, it\'s a doable DIY job. Most tire shops include free rotation with tire purchase.',
      '## Check While Rotating',
      'Use this opportunity to check tread depth (use the 2mm minimum rule), look for uneven wear patterns, and check for damage or embedded objects.',
      '## Don\'t Forget the Spare',
      'If you have a full-size spare, include it in your rotation pattern to ensure it\'s ready when needed.',
    ],
    relatedArticles: [
      { id: '4', title: 'Tire Pressure: Why It Matters', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
      { id: '23', title: 'Brake Pad Inspection Guide', image: 'https://images.unsplash.com/photo-1580273916550-e323e7a39554?w=400' },
    ],
  },
  '22': {
    id: '22',
    title: 'Air Filter Replacement',
    category: 'Maintenance',
    readTime: '4 min read',
    author: 'DriveAssist Team',
    date: 'Nov 19, 2024',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800',
    content: [
      'A clean air filter is essential for engine performance and fuel efficiency. In Ghana\'s dusty conditions, this simple maintenance task becomes even more important.',
      '## What It Does',
      'The air filter prevents dust, dirt, and debris from entering your engine. A dirty filter restricts airflow, reducing power and fuel efficiency.',
      '## When to Replace',
      'Check every 10,000 km and replace every 20,000 km under normal conditions. In dusty Ghana conditions, especially during harmattan, check monthly and replace more frequently.',
      '## Signs of a Dirty Filter',
      'Reduced acceleration, decreased fuel economy, misfiring engine, unusual engine sounds, or a visibly dirty filter are all signs it\'s time for replacement.',
      '## Finding the Air Filter',
      'The air filter is usually in a black plastic box near the top of the engine. Consult your owner\'s manual for the exact location.',
      '## DIY Replacement',
      'This is one of the easiest DIY jobs. Open the air filter housing (usually just clips), remove the old filter, note its orientation, and insert the new one the same way.',
      '## Choosing the Right Filter',
      'Always use the correct size and type for your vehicle. Consider a high-quality filter for better filtration in dusty conditions.',
      '## Cabin Air Filter Too',
      'Don\'t forget your cabin air filter, which cleans the air in your passenger compartment. Replace it at similar intervals for better air quality inside your car.',
    ],
    relatedArticles: [
      { id: '20', title: 'Oil Change: Step by Step Guide', image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400' },
      { id: '1', title: 'Harmattan Season Car Prep Checklist', image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400' },
    ],
  },
  '23': {
    id: '23',
    title: 'Brake Pad Inspection Guide',
    category: 'Maintenance',
    readTime: '8 min read',
    author: 'DriveAssist Team',
    date: 'Nov 18, 2024',
    image: 'https://images.unsplash.com/photo-1580273916550-e323e7a39554?w=800',
    content: [
      'Brake pads are wear items that need regular inspection. Catching worn pads early prevents damage to rotors and ensures your safety.',
      '## How Brakes Work',
      'When you press the brake pedal, calipers squeeze brake pads against rotors to slow your wheels. The friction material on the pads wears down over time.',
      '## Visual Inspection',
      'You can often see brake pads through the wheel spokes. Look for the pad material thickness - if less than 3mm, it\'s time to replace.',
      '## Listen for Warnings',
      'Most pads have wear indicators - small metal tabs that make a high-pitched squeal when pads are worn. If you hear this, get your brakes checked soon.',
      '## Other Warning Signs',
      'Vibration when braking, longer stopping distances, the car pulling to one side, or a soft brake pedal all indicate brake problems.',
      '## DIY Inspection',
      'If comfortable removing wheels, you can inspect pad thickness directly. Also check for even wear - uneven wear indicates caliper problems.',
      '## Rotor Condition',
      'While inspecting pads, check rotors too. Look for grooves, cracks, or a lip at the edge. Severely worn rotors need replacement.',
      '## When to Replace',
      'Replace pads when they reach 3mm thickness. Waiting too long damages rotors and increases repair costs significantly.',
      '## Choosing Brake Pads',
      'Options include organic, semi-metallic, and ceramic pads. For typical driving in Ghana, semi-metallic offer good performance and value.',
    ],
    relatedArticles: [
      { id: '5', title: 'Signs Your Brakes Need Attention', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400' },
      { id: '21', title: 'Tire Rotation Explained', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
    ],
  },

  // DRIVING TIPS (30-33)
  '30': {
    id: '30',
    title: 'Defensive Driving Techniques',
    category: 'Driving Tips',
    readTime: '10 min read',
    author: 'DriveAssist Team',
    date: 'Nov 17, 2024',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800',
    content: [
      'Defensive driving is about anticipating hazards and making safe decisions. These skills are especially important on Ghana\'s busy roads.',
      '## Stay Alert and Focused',
      'Avoid distractions like phones. Keep your eyes moving - check mirrors every 5-8 seconds. Anticipate what other drivers might do.',
      '## Maintain Safe Following Distance',
      'Use the 3-second rule: pick a fixed point, when the car ahead passes it, you should reach it in at least 3 seconds. Increase this in rain or at night.',
      '## Expect the Unexpected',
      'Assume other drivers may make mistakes. Be prepared for sudden stops, lane changes without signals, and pedestrians entering the road.',
      '## Control Your Speed',
      'Speed limits exist for a reason. Higher speeds reduce reaction time and increase stopping distance dramatically. In traffic, moderate speed is often faster anyway.',
      '## Use Your Signals',
      'Always signal your intentions early. Let other drivers know what you\'re going to do before you do it.',
      '## Be Visible',
      'Use headlights in low light conditions. Position yourself where other drivers can see you. Avoid blind spots of larger vehicles.',
      '## Manage Intersections',
      'Intersections are the most dangerous areas. Look both ways even on green lights. Watch for red-light runners and turning vehicles.',
      '## Handle Aggressive Drivers',
      'Don\'t engage with aggressive drivers. Let them pass. Your safety is more important than being right. Report dangerous driving to authorities.',
      '## Continuous Learning',
      'Consider taking an advanced driving course. Even experienced drivers benefit from refreshing their skills and learning new techniques.',
    ],
    relatedArticles: [
      { id: '31', title: 'Driving in Heavy Rain', image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400' },
      { id: '32', title: 'Night Driving Safety Tips', image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=400' },
    ],
  },
  '31': {
    id: '31',
    title: 'Driving in Heavy Rain',
    category: 'Driving Tips',
    readTime: '6 min read',
    author: 'DriveAssist Team',
    date: 'Nov 16, 2024',
    image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800',
    content: [
      'Ghana\'s rainy season brings challenging driving conditions. Heavy downpours can significantly reduce visibility and road grip.',
      '## Slow Down',
      'Reduce your speed by at least one-third in rain. Wet roads are slippery, and stopping distances increase. Hydroplaning is a real risk at higher speeds.',
      '## Increase Following Distance',
      'Double your normal following distance. You\'ll need more time and distance to stop safely on wet roads.',
      '## Turn On Headlights',
      'Turn on your headlights (not high beams) even in daylight rain. This helps you see and be seen by others.',
      '## Avoid Standing Water',
      'Don\'t drive through flooded areas - you can\'t see how deep it is or what\'s underneath. Water over your exhaust can stall your engine; water reaching electrical components can cause serious damage.',
      '## Handle Hydroplaning',
      'If you feel your tires lose contact with the road, don\'t panic. Ease off the accelerator, keep the steering wheel steady, and don\'t brake suddenly. Wait for tires to regain traction.',
      '## Use Air Conditioning',
      'AC helps clear foggy windows. Direct vents toward the windshield. Use the defrost setting if needed.',
      '## Avoid Sudden Movements',
      'Brake gently, accelerate smoothly, and turn gradually. Sudden inputs can cause skids on slippery roads.',
      '## Know When to Stop',
      'If rain is too heavy to see clearly, pull over safely and wait it out. Many Ghana rainstorms pass quickly.',
    ],
    relatedArticles: [
      { id: '30', title: 'Defensive Driving Techniques', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400' },
      { id: '33', title: 'Fuel Efficient Driving', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400' },
    ],
  },
  '32': {
    id: '32',
    title: 'Night Driving Safety Tips',
    category: 'Driving Tips',
    readTime: '5 min read',
    author: 'DriveAssist Team',
    date: 'Nov 15, 2024',
    image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800',
    content: [
      'Night driving presents unique challenges - reduced visibility, glare from oncoming lights, and increased fatigue. Here\'s how to stay safe.',
      '## Ensure Proper Lighting',
      'Keep headlights, taillights, and signal lights clean and functioning. Replace dim bulbs. Properly aimed headlights improve your visibility without blinding others.',
      '## Use High Beams Wisely',
      'Use high beams on dark roads without streetlights. Switch to low beams when following or meeting other vehicles to avoid blinding other drivers.',
      '## Manage Glare',
      'If blinded by oncoming lights, look toward the right edge of your lane. Don\'t stare at bright lights. Keep your windshield and glasses clean.',
      '## Adjust Your Speed',
      'Drive within the range of your headlights. You should be able to stop within the distance you can see.',
      '## Watch for Pedestrians',
      'Pedestrians are harder to see at night, especially those wearing dark clothing. Pay extra attention near crosswalks and in residential areas.',
      '## Combat Fatigue',
      'Fatigue impairs driving as much as alcohol. Take breaks every 2 hours. If drowsy, stop and rest - coffee is only a temporary fix.',
      '## Keep Windows Clean',
      'Dirty windows increase glare and reduce visibility. Clean inside and outside surfaces regularly.',
      '## Prepare for Emergencies',
      'Carry a flashlight and reflective warning triangles. If you break down at night, make your vehicle visible to other drivers.',
    ],
    relatedArticles: [
      { id: '30', title: 'Defensive Driving Techniques', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400' },
      { id: '31', title: 'Driving in Heavy Rain', image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400' },
    ],
  },
  '33': {
    id: '33',
    title: 'Fuel Efficient Driving',
    category: 'Driving Tips',
    readTime: '7 min read',
    author: 'DriveAssist Team',
    date: 'Nov 14, 2024',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800',
    content: [
      'With fuel prices in Ghana, improving your fuel economy makes a real difference. Small changes in driving habits can significantly reduce fuel consumption.',
      '## Smooth Acceleration',
      'Aggressive acceleration wastes fuel. Accelerate gently and smoothly. Pretend there\'s an egg under your accelerator pedal.',
      '## Maintain Steady Speeds',
      'Constant speed is efficient. Use cruise control on highways. Avoid unnecessary speed variations.',
      '## Anticipate Traffic',
      'Look ahead and anticipate stops. Coast to red lights instead of accelerating and then braking hard. Smooth driving saves fuel and brakes.',
      '## Avoid Excessive Idling',
      'If you\'ll be stopped for more than a minute, turn off your engine. Idling gets zero km per liter.',
      '## Check Tire Pressure',
      'Under-inflated tires increase rolling resistance and fuel consumption. Check pressure monthly and maintain recommended levels.',
      '## Remove Excess Weight',
      'Extra weight requires more fuel. Remove unnecessary items from your car, especially heavy ones.',
      '## Plan Your Trips',
      'Combine multiple errands into one trip. A warm engine is more fuel-efficient than starting cold multiple times.',
      '## Use AC Wisely',
      'Air conditioning uses fuel. At low speeds, open windows. At high speeds, AC is more efficient than drag from open windows.',
      '## Regular Maintenance',
      'A well-maintained car runs more efficiently. Keep up with oil changes, air filter replacements, and tune-ups.',
    ],
    relatedArticles: [
      { id: '20', title: 'Oil Change: Step by Step Guide', image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400' },
      { id: '4', title: 'Tire Pressure: Why It Matters', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
    ],
  },

  // ELECTRIC VEHICLES (40-43)
  '40': {
    id: '40',
    title: 'EV Basics: How They Work',
    category: 'Electric Vehicles',
    readTime: '8 min read',
    author: 'DriveAssist Team',
    date: 'Nov 13, 2024',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
    content: [
      'Electric vehicles (EVs) are gaining popularity worldwide, including in Ghana. Understanding how they work helps you make informed decisions about whether an EV is right for you.',
      '## How EVs Differ',
      'Instead of an internal combustion engine, EVs use electric motors powered by rechargeable battery packs. No fuel, no exhaust, no oil changes.',
      '## Types of EVs',
      'Battery Electric Vehicles (BEVs) are fully electric. Plug-in Hybrids (PHEVs) have both electric motors and small gas engines. Hybrids use regenerative braking but can\'t plug in.',
      '## The Battery Pack',
      'Large lithium-ion battery packs store energy. Modern EVs typically offer 300-500 km range. Battery capacity is measured in kilowatt-hours (kWh).',
      '## Electric Motors',
      'Electric motors are simpler than engines with far fewer moving parts. They provide instant torque and smooth acceleration.',
      '## Regenerative Braking',
      'When you slow down, the motor works as a generator, recovering energy back to the battery. This extends range and reduces brake wear.',
      '## Charging',
      'EVs can charge from standard outlets (slow), dedicated home chargers (faster), or public DC fast chargers (fastest). Charging infrastructure in Ghana is growing.',
      '## Maintenance Advantages',
      'EVs need less maintenance: no oil changes, fewer brake repairs, no transmission service, no exhaust system issues.',
      '## Considerations for Ghana',
      'Key factors: charging availability, electricity reliability, vehicle cost, and battery performance in hot climates.',
    ],
    relatedArticles: [
      { id: '41', title: 'Charging Your EV: Complete Guide', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
      { id: '43', title: 'Cost Comparison: EV vs Gas', image: 'https://images.unsplash.com/photo-1580273916550-e323e7a39554?w=400' },
    ],
  },
  '41': {
    id: '41',
    title: 'Charging Your EV: Complete Guide',
    category: 'Electric Vehicles',
    readTime: '12 min read',
    author: 'DriveAssist Team',
    date: 'Nov 12, 2024',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    content: [
      'Understanding EV charging is crucial for EV ownership. Here\'s everything you need to know about keeping your electric vehicle powered up.',
      '## Charging Levels Explained',
      'Level 1: Standard household outlet (2-5 km range per hour). Level 2: Dedicated home charger (15-50 km per hour). Level 3/DC Fast: Public stations (100+ km in 30 minutes).',
      '## Home Charging',
      'Most EV owners do 80% of charging at home. Install a Level 2 charger for convenience. Charge overnight during off-peak electricity hours if possible.',
      '## Public Charging',
      'Public chargers are appearing at malls, offices, and fuel stations in Ghana. Apps help locate available chargers and show pricing.',
      '## Charging Best Practices',
      'Keep battery between 20-80% for daily use. Only charge to 100% for long trips. Avoid letting battery drop very low regularly.',
      '## Charging in Hot Weather',
      'Ghana\'s heat affects charging speed and battery life. Charge in shade when possible. Some EVs have battery cooling systems that activate during charging.',
      '## Cost of Charging',
      'Home charging costs depend on your electricity rate. Public chargers vary in pricing. Overall, electricity costs less than fuel per kilometer.',
      '## Range Anxiety',
      'Plan long trips around charging stops. Modern EVs have sufficient range for most daily driving without charging during the day.',
      '## Future of Charging',
      'Charging infrastructure is expanding rapidly. Faster chargers and more locations will make EV ownership increasingly convenient.',
    ],
    relatedArticles: [
      { id: '40', title: 'EV Basics: How They Work', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400' },
      { id: '42', title: 'EV Battery Care Tips', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400' },
    ],
  },
  '42': {
    id: '42',
    title: 'EV Battery Care Tips',
    category: 'Electric Vehicles',
    readTime: '6 min read',
    author: 'DriveAssist Team',
    date: 'Nov 11, 2024',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800',
    content: [
      'The battery is the heart of your EV and its most expensive component. Proper care can extend its life significantly.',
      '## Avoid Extreme Charge Levels',
      'Don\'t regularly charge to 100% or let it drop to 0%. Keeping between 20-80% for daily driving extends battery life.',
      '## Manage Heat Exposure',
      'Heat degrades batteries faster than cold. Park in shade when possible. Precondition your car while still plugged in to reduce battery stress.',
      '## Use Fast Charging Sparingly',
      'DC fast charging is convenient but generates heat. Use it when needed, but regular home charging is gentler on the battery.',
      '## Let It Cool Before Charging',
      'After driving hard or in extreme heat, let the battery cool a bit before charging, especially fast charging.',
      '## Keep It Plugged In When Possible',
      'Unlike phone batteries, EV batteries benefit from being plugged in, even at home. The car\'s systems can manage temperature and optimize charging.',
      '## Regular Software Updates',
      'Manufacturers release updates that can improve battery management. Keep your EV\'s software current.',
      '## Winter and Heat Considerations',
      'Extreme temperatures reduce range temporarily. This is normal and the battery recovers when temperatures normalize.',
      '## Battery Warranty',
      'Most EVs come with 8-year battery warranties. Understand what\'s covered and maintain your vehicle according to manufacturer recommendations.',
    ],
    relatedArticles: [
      { id: '41', title: 'Charging Your EV: Complete Guide', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
      { id: '40', title: 'EV Basics: How They Work', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400' },
    ],
  },
  '43': {
    id: '43',
    title: 'Cost Comparison: EV vs Gas',
    category: 'Electric Vehicles',
    readTime: '10 min read',
    author: 'DriveAssist Team',
    date: 'Nov 10, 2024',
    image: 'https://images.unsplash.com/photo-1580273916550-e323e7a39554?w=800',
    content: [
      'Is an EV cheaper to own than a gas car? The answer depends on several factors. Let\'s break down the true cost of ownership.',
      '## Purchase Price',
      'EVs typically cost more upfront than comparable gas cars. However, the gap is narrowing, and incentives may be available.',
      '## Fuel vs. Electricity',
      'Electricity for EVs costs significantly less per kilometer than fuel. The exact savings depend on local electricity and fuel prices.',
      '## Maintenance Costs',
      'EVs need less maintenance: no oil changes, fewer brake repairs, no transmission service. This adds up to significant savings over time.',
      '## Insurance',
      'EV insurance may be slightly higher due to higher vehicle value and specialized repair requirements. Shop around for competitive rates.',
      '## Depreciation',
      'EV depreciation has historically been higher but is improving as the market matures and charging infrastructure expands.',
      '## Total Cost of Ownership',
      'Over 5-10 years of ownership, EVs often cost less than gas cars when you factor in fuel and maintenance savings.',
      '## Break-Even Point',
      'Calculate your specific break-even point based on how much you drive and local electricity/fuel prices.',
      '## Considerations for Ghana',
      'Factor in local fuel prices, electricity costs and reliability, and availability of charging and service facilities.',
    ],
    relatedArticles: [
      { id: '40', title: 'EV Basics: How They Work', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400' },
      { id: '33', title: 'Fuel Efficient Driving', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400' },
    ],
  },

  // E-BIKES & SCOOTERS (50-53)
  '50': {
    id: '50',
    title: 'E-Bike Buying Guide',
    category: 'E-Bikes & Scooters',
    readTime: '10 min read',
    author: 'DriveAssist Team',
    date: 'Nov 9, 2024',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    content: [
      'E-bikes offer an affordable, eco-friendly transportation option. With growing traffic in Ghana\'s cities, they\'re increasingly popular.',
      '## Types of E-Bikes',
      'Pedal-assist bikes amplify your pedaling. Throttle bikes can move without pedaling. Many offer both options. Consider your needs and local regulations.',
      '## Motor Power',
      'Motors typically range from 250W to 750W. Higher wattage means more power for hills and cargo. 250-500W is sufficient for most urban use.',
      '## Battery Capacity',
      'Battery size (measured in Wh) determines range. Expect 40-80 km per charge for most e-bikes. Consider your daily distance needs.',
      '## Frame Style',
      'Step-through frames offer easy mounting. Traditional frames provide more stiffness. Folding bikes work well for mixed commutes.',
      '## Quality Matters',
      'Invest in a quality e-bike from a reputable brand. Cheap e-bikes often have poor batteries and motors that fail quickly.',
      '## Test Ride First',
      'E-bikes feel different from regular bikes. Test ride to check comfort, motor response, and handling.',
      '## After-Sales Support',
      'Choose a brand with local service availability. E-bikes need specialized maintenance and parts.',
      '## Accessories',
      'Budget for helmet, lights, lock, and fenders. Good lights are essential for Ghana\'s roads. A quality lock protects your investment.',
    ],
    relatedArticles: [
      { id: '51', title: 'E-Scooter Safety Tips', image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400' },
      { id: '52', title: 'Maintenance for E-Bikes', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400' },
    ],
  },
  '51': {
    id: '51',
    title: 'E-Scooter Safety Tips',
    category: 'E-Bikes & Scooters',
    readTime: '5 min read',
    author: 'DriveAssist Team',
    date: 'Nov 8, 2024',
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800',
    content: [
      'E-scooters are convenient for short trips but require attention to safety. Their small wheels and standing position create unique risks.',
      '## Always Wear a Helmet',
      'Head injuries are the most serious risk. A proper helmet can save your life. Many e-scooter injuries involve the head.',
      '## Inspect Before Riding',
      'Check brakes, lights, and tire condition before each ride. Ensure the handlebars are secure and the battery is charged.',
      '## Watch for Road Hazards',
      'Small wheels are vulnerable to potholes, debris, and uneven surfaces. Stay alert and avoid hazards that cars would easily pass.',
      '## Ride Defensively',
      'Assume drivers don\'t see you. Make eye contact at intersections. Be extra cautious around turning vehicles.',
      '## Stay Visible',
      'Use lights at night - front and rear. Wear bright or reflective clothing. Don\'t ride in drivers\' blind spots.',
      '## One Rider Only',
      'E-scooters are designed for one person. Carrying passengers affects balance and braking and is dangerous.',
      '## Mind Your Speed',
      'Many e-scooters can reach 25+ km/h. This is fast on small wheels. Slow down on unfamiliar routes and in busy areas.',
      '## Know the Rules',
      'Understand local regulations about where e-scooters can be ridden. Respect pedestrians on sidewalks.',
    ],
    relatedArticles: [
      { id: '50', title: 'E-Bike Buying Guide', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
      { id: '53', title: 'Commuting with E-Bikes', image: 'https://images.unsplash.com/photo-1580273916550-e323e7a39554?w=400' },
    ],
  },
  '52': {
    id: '52',
    title: 'Maintenance for E-Bikes',
    category: 'E-Bikes & Scooters',
    readTime: '7 min read',
    author: 'DriveAssist Team',
    date: 'Nov 7, 2024',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800',
    content: [
      'E-bikes need regular maintenance to stay safe and reliable. Most tasks are similar to regular bikes, with some electric-specific additions.',
      '## Battery Care',
      'Store the battery in a cool, dry place. Don\'t let it fully discharge. Charge regularly even when not in use. Avoid extreme temperatures.',
      '## Tire Maintenance',
      'Check tire pressure weekly. Under-inflated tires reduce range and are more prone to flats. Keep them at the recommended pressure.',
      '## Brake Inspection',
      'E-bikes are heavier and faster than regular bikes, putting more stress on brakes. Check pad wear and brake adjustment monthly.',
      '## Chain Care',
      'Keep the chain clean and lubricated. A dirty, dry chain wears faster and reduces efficiency. Clean and oil every 2-4 weeks.',
      '## Electrical Connections',
      'Check connections periodically for corrosion or damage. Keep connectors clean and dry. Most are water-resistant but not waterproof.',
      '## Cleaning Your E-Bike',
      'Avoid high-pressure water near electrical components. Wipe down with a damp cloth. Dry thoroughly after riding in rain.',
      '## Professional Service',
      'Have your e-bike professionally serviced annually. They\'ll check motor function, battery health, and safety systems.',
      '## Store Properly',
      'If storing long-term, charge the battery to 60-70%. Store in a cool, dry place. Check battery monthly and top up if needed.',
    ],
    relatedArticles: [
      { id: '50', title: 'E-Bike Buying Guide', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
      { id: '51', title: 'E-Scooter Safety Tips', image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400' },
    ],
  },
  '53': {
    id: '53',
    title: 'Commuting with E-Bikes',
    category: 'E-Bikes & Scooters',
    readTime: '6 min read',
    author: 'DriveAssist Team',
    date: 'Nov 6, 2024',
    image: 'https://images.unsplash.com/photo-1580273916550-e323e7a39554?w=800',
    content: [
      'E-bikes can transform your daily commute, especially in congested areas like Accra. Here\'s how to make e-bike commuting work for you.',
      '## Plan Your Route',
      'Scout routes with bike lanes or less traffic. Avoid the busiest roads. Sometimes a slightly longer route is safer and more pleasant.',
      '## Charge Strategically',
      'Know your commute distance and battery range. Charge overnight at home. Consider a workplace charging option for longer commutes.',
      '## Dress Smart',
      'E-bikes let you arrive without sweating. Wear normal clothes with bright colors for visibility. Keep rain gear handy.',
      '## Secure Your Bike',
      'Invest in a quality lock. Use two locks of different types for maximum security. Register your bike and note the serial number.',
      '## Timing Benefits',
      'E-bikes often beat cars in rush hour traffic. You can use routes inaccessible to cars and skip traffic jams.',
      '## Carry Your Stuff',
      'Use a rear rack and pannier bags rather than a backpack. This is more comfortable and keeps weight low for better handling.',
      '## Weather Preparation',
      'Rain happens. Have a plan - waterproof bag for electronics, fenders to keep spray off you, and lights for visibility.',
      '## Health Benefits',
      'Even with electric assist, you\'re exercising. Regular e-bike commuting improves fitness and mental health.',
      '## Save Money',
      'Calculate your savings vs. fuel and transport costs. E-bike commuting typically costs a fraction of driving.',
    ],
    relatedArticles: [
      { id: '50', title: 'E-Bike Buying Guide', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
      { id: '33', title: 'Fuel Efficient Driving', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400' },
    ],
  },
};

// Type for combined article (API or hardcoded)
interface DisplayArticle {
  id: string;
  title: string;
  category: string;
  readTime: string;
  author: string;
  date: string;
  image: string;
  content: string[];
  relatedArticles: { id: string; title: string; image: string }[];
}

// Transform API article to display format
function transformApiArticle(apiArticle: ApiArticle): DisplayArticle {
  // Parse content - split by double newlines or use as single paragraph
  const contentParagraphs = apiArticle.content
    ? apiArticle.content.split(/\n\n+/).filter(p => p.trim())
    : [apiArticle.excerpt];

  return {
    id: apiArticle.id.toString(),
    title: apiArticle.title,
    category: apiArticle.category?.name || 'Article',
    readTime: `${apiArticle.read_time_minutes} min read`,
    author: 'DriveAssist Team',
    date: new Date(apiArticle.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    image: apiArticle.featured_image || 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800',
    content: contentParagraphs,
    relatedArticles: [],
  };
}

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<DisplayArticle | null>(null);

  useEffect(() => {
    async function loadArticle() {
      if (!id) {
        setLoading(false);
        return;
      }

      // First check if it's a hardcoded article (numeric ID)
      const hardcodedArticle = articles[id];
      if (hardcodedArticle) {
        setArticle(hardcodedArticle);
        setLoading(false);
        return;
      }

      // Try to fetch from API (could be a slug or numeric ID)
      try {
        const apiArticle = await articlesService.getArticle(id);
        setArticle(transformApiArticle(apiArticle));
      } catch (error) {
        console.error('Failed to fetch article:', error);
        // Article not found
        setArticle(null);
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`} edges={['top']}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <SkeletonArticleDetail />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!article) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        <View className="flex-1 items-center justify-center p-6">
          <MaterialIcons name="article" size={64} color={isDark ? '#475569' : '#94A3B8'} />
          <Text className={`text-lg mt-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Article not found
          </Text>
          <Text className={`text-center mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            The article you're looking for doesn't exist or has been removed.
          </Text>
          <Button title="Go Back" onPress={() => router.back()} className="mt-6" />
        </View>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this article: ${article.title} - DriveAssist`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const renderContent = (content: string[]) => {
    return content.map((paragraph, index) => {
      if (paragraph.startsWith('## ')) {
        return (
          <Text
            key={index}
            className={`text-xl font-bold mt-6 mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}
          >
            {paragraph.replace('## ', '')}
          </Text>
        );
      }
      return (
        <Text
          key={index}
          className={`text-base leading-7 mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
        >
          {paragraph}
        </Text>
      );
    });
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`} edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View className="relative">
          <Image
            source={{ uri: article.image }}
            className="w-full h-64"
            resizeMode="cover"
          />
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-4 h-10 w-10 rounded-full bg-black/30 items-center justify-center"
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {/* Action Buttons */}
          <View className="absolute top-4 right-4 flex-row gap-2">
            <TouchableOpacity
              onPress={() => setIsBookmarked(!isBookmarked)}
              className="h-10 w-10 rounded-full bg-black/30 items-center justify-center"
            >
              <MaterialIcons
                name={isBookmarked ? 'bookmark' : 'bookmark-border'}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShare}
              className="h-10 w-10 rounded-full bg-black/30 items-center justify-center"
            >
              <MaterialIcons name="share" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View className="px-4 py-6">
          {/* Category & Read Time */}
          <View className="flex-row items-center gap-3 mb-3">
            <Badge label={article.category} variant="primary" size="sm" />
            <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {article.readTime}
            </Text>
          </View>

          {/* Title */}
          <Text className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {article.title}
          </Text>

          {/* Author & Date */}
          <View className="flex-row items-center mb-6">
            <View className="h-10 w-10 rounded-full bg-primary-500 items-center justify-center mr-3">
              <MaterialIcons name="auto-stories" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {article.author}
              </Text>
              <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {article.date}
              </Text>
            </View>
          </View>

          {/* Article Content */}
          <View className="mb-8">
            {renderContent(article.content)}
          </View>

          {/* Related Articles */}
          {article.relatedArticles.length > 0 && (
            <View className="mb-8">
              <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Related Articles
              </Text>
              <View className="gap-3">
                {article.relatedArticles.map((related) => (
                  <TouchableOpacity
                    key={related.id}
                    onPress={() => router.push(`/(driver)/learn/article/${related.id}`)}
                    className={`flex-row rounded-xl overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
                  >
                    <Image
                      source={{ uri: related.image }}
                      className="h-20 w-20"
                      resizeMode="cover"
                    />
                    <View className="flex-1 p-4 justify-center">
                      <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {related.title}
                      </Text>
                    </View>
                    <View className="items-center justify-center pr-4">
                      <MaterialIcons
                        name="chevron-right"
                        size={24}
                        color={isDark ? '#64748B' : '#94A3B8'}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View className={`px-4 py-4 border-t ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <Button
          title="Ask DriveAssist About This Topic"
          onPress={() => router.push('/(driver)/diagnose')}
          leftIcon="smart-toy"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
