import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { SearchBar, Chip, Card } from '../../../src/components/common';

const categories = [
  { id: 'all', label: 'All Signs' },
  { id: 'regulatory', label: 'Regulatory' },
  { id: 'warning', label: 'Warning' },
  { id: 'informational', label: 'Informational' },
  { id: 'guide', label: 'Guide' },
];

// Ghana DVLA Road Signs - Based on ECOWAS/Vienna Convention standards used in Ghana
const roadSigns = [
  // REGULATORY SIGNS (Red circle - Must obey)
  {
    id: '1',
    name: 'Stop Sign',
    category: 'regulatory',
    description: 'Come to a complete stop at the line, crosswalk, or before entering the intersection. Look both ways before proceeding.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842157.png',
    color: '#EF4444',
  },
  {
    id: '2',
    name: 'Yield / Give Way',
    category: 'regulatory',
    description: 'Slow down and give way to traffic on the road you are entering or crossing. Stop if necessary.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842066.png',
    color: '#EF4444',
  },
  {
    id: '3',
    name: 'Speed Limit (50 km/h)',
    category: 'regulatory',
    description: 'Maximum speed allowed on this road is 50 km/h. Common in urban areas in Ghana. Exceeding this limit is a traffic offense.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842094.png',
    color: '#EF4444',
  },
  {
    id: '4',
    name: 'No Entry',
    category: 'regulatory',
    description: 'Do not enter this road from your direction. Entry is prohibited. Often seen on one-way streets.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842135.png',
    color: '#EF4444',
  },
  {
    id: '5',
    name: 'No Overtaking',
    category: 'regulatory',
    description: 'Overtaking other vehicles is prohibited in this zone. Wait until you see the end of restriction sign.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842081.png',
    color: '#EF4444',
  },
  {
    id: '6',
    name: 'No Parking',
    category: 'regulatory',
    description: 'Parking is not allowed in this area. Your vehicle may be towed by the Accra Metropolitan Assembly.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842138.png',
    color: '#EF4444',
  },
  {
    id: '7',
    name: 'No U-Turn',
    category: 'regulatory',
    description: 'U-turns are prohibited at this location. Continue to the next intersection to turn around.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842147.png',
    color: '#EF4444',
  },
  {
    id: '8',
    name: 'No Left Turn',
    category: 'regulatory',
    description: 'Left turns are prohibited at this intersection. Find an alternative route.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842146.png',
    color: '#EF4444',
  },
  {
    id: '9',
    name: 'No Right Turn',
    category: 'regulatory',
    description: 'Right turns are prohibited at this intersection. Continue straight or turn left.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842149.png',
    color: '#EF4444',
  },
  {
    id: '10',
    name: 'One Way',
    category: 'regulatory',
    description: 'Traffic flows in one direction only. Do not drive against the flow of traffic.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842161.png',
    color: '#3B82F6',
  },
  {
    id: '11',
    name: 'No Horns / Silent Zone',
    category: 'regulatory',
    description: 'Use of vehicle horns is prohibited. Common near hospitals, schools, and residential areas.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842134.png',
    color: '#EF4444',
  },
  {
    id: '12',
    name: 'Keep Right',
    category: 'regulatory',
    description: 'Keep to the right side of the obstacle or road divider. Common at roundabouts.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842165.png',
    color: '#3B82F6',
  },
  {
    id: '13',
    name: 'No Stopping',
    category: 'regulatory',
    description: 'Stopping is prohibited in this area, even briefly. Keep moving.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842140.png',
    color: '#EF4444',
  },
  {
    id: '14',
    name: 'Speed Limit (30 km/h)',
    category: 'regulatory',
    description: 'Maximum speed 30 km/h. Common in school zones and residential areas in Ghana.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842092.png',
    color: '#EF4444',
  },
  // WARNING SIGNS (Yellow/Amber triangle - Caution)
  {
    id: '15',
    name: 'Curve Ahead',
    category: 'warning',
    description: 'Sharp curve ahead. Reduce speed and be prepared to turn. Stay in your lane.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842045.png',
    color: '#F59E0B',
  },
  {
    id: '16',
    name: 'Pedestrian Crossing',
    category: 'warning',
    description: 'Pedestrian crossing ahead. Be prepared to stop for pedestrians. Common near markets in Ghana.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842032.png',
    color: '#F59E0B',
  },
  {
    id: '17',
    name: 'School Zone / Children',
    category: 'warning',
    description: 'School area ahead. Watch for children and reduce speed. Be extra cautious during school hours.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842036.png',
    color: '#F59E0B',
  },
  {
    id: '18',
    name: 'Roundabout Ahead',
    category: 'warning',
    description: 'Roundabout ahead. Give way to vehicles already in the roundabout. Yield to traffic from your right.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842053.png',
    color: '#F59E0B',
  },
  {
    id: '19',
    name: 'Road Works',
    category: 'warning',
    description: 'Construction or road maintenance ahead. Slow down and watch for workers and equipment.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842059.png',
    color: '#F59E0B',
  },
  {
    id: '20',
    name: 'Slippery Road',
    category: 'warning',
    description: 'Road may be slippery when wet. Reduce speed and avoid sudden braking or steering.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842043.png',
    color: '#F59E0B',
  },
  {
    id: '21',
    name: 'Steep Hill Downward',
    category: 'warning',
    description: 'Steep downhill gradient ahead. Use lower gear and control your speed. Check your brakes.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842047.png',
    color: '#F59E0B',
  },
  {
    id: '22',
    name: 'Steep Hill Upward',
    category: 'warning',
    description: 'Steep uphill gradient ahead. Maintain momentum if safe. Be prepared to shift to lower gear.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842048.png',
    color: '#F59E0B',
  },
  {
    id: '23',
    name: 'Narrow Road / Bridge',
    category: 'warning',
    description: 'Road narrows ahead. Prepare to adjust your position. Give way to oncoming traffic if needed.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842051.png',
    color: '#F59E0B',
  },
  {
    id: '24',
    name: 'Two-Way Traffic',
    category: 'warning',
    description: 'Two-way traffic ahead. Stay in your lane and be alert for oncoming vehicles.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842057.png',
    color: '#F59E0B',
  },
  {
    id: '25',
    name: 'Traffic Lights Ahead',
    category: 'warning',
    description: 'Traffic signal ahead. Be prepared to stop if the light is red or amber.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842055.png',
    color: '#F59E0B',
  },
  {
    id: '26',
    name: 'Railway Crossing',
    category: 'warning',
    description: 'Railway level crossing ahead. Stop, look, and listen. Do not cross if barriers are down.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842062.png',
    color: '#F59E0B',
  },
  {
    id: '27',
    name: 'Animals Crossing',
    category: 'warning',
    description: 'Animals may cross the road. Common on rural roads in Ghana. Reduce speed.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842038.png',
    color: '#F59E0B',
  },
  {
    id: '28',
    name: 'Bumpy Road / Speed Bump',
    category: 'warning',
    description: 'Uneven road surface or speed bumps ahead. Reduce speed to avoid damage to your vehicle.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842050.png',
    color: '#F59E0B',
  },
  {
    id: '29',
    name: 'Intersection Ahead',
    category: 'warning',
    description: 'Junction or crossroads ahead. Be prepared for traffic from other directions.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842064.png',
    color: '#F59E0B',
  },
  {
    id: '30',
    name: 'Double Curve',
    category: 'warning',
    description: 'Series of curves ahead. Reduce speed and stay alert for changing road direction.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842046.png',
    color: '#F59E0B',
  },
  // INFORMATIONAL SIGNS (Blue square/rectangle - Services)
  {
    id: '31',
    name: 'Hospital',
    category: 'informational',
    description: 'Hospital nearby. Keep noise low and watch for emergency vehicles. First aid available.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842118.png',
    color: '#3B82F6',
  },
  {
    id: '32',
    name: 'Fuel / Petrol Station',
    category: 'informational',
    description: 'Fuel station available ahead or nearby. Shell, Total, and Goil are common in Ghana.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842121.png',
    color: '#3B82F6',
  },
  {
    id: '33',
    name: 'Parking',
    category: 'informational',
    description: 'Parking area available. Check for any time restrictions or fees.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842115.png',
    color: '#3B82F6',
  },
  {
    id: '34',
    name: 'Restaurant / Food',
    category: 'informational',
    description: 'Restaurant or food services available nearby. Take a break if you are tired.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842124.png',
    color: '#3B82F6',
  },
  {
    id: '35',
    name: 'Hotel / Lodging',
    category: 'informational',
    description: 'Accommodation available nearby. Hotels or guest houses for travelers.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842119.png',
    color: '#3B82F6',
  },
  {
    id: '36',
    name: 'First Aid',
    category: 'informational',
    description: 'First aid or emergency medical services available. Useful in case of accidents.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842117.png',
    color: '#3B82F6',
  },
  {
    id: '37',
    name: 'Telephone',
    category: 'informational',
    description: 'Public telephone available. Can be used for emergencies if mobile network is unavailable.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842127.png',
    color: '#3B82F6',
  },
  {
    id: '38',
    name: 'Restrooms / WC',
    category: 'informational',
    description: 'Public toilet facilities available. Common at petrol stations and rest stops.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842125.png',
    color: '#3B82F6',
  },
  // GUIDE SIGNS (Green - Directions)
  {
    id: '39',
    name: 'Airport',
    category: 'guide',
    description: 'Direction to airport. Follow signs to Kotoka International Airport in Accra.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842106.png',
    color: '#10B981',
  },
  {
    id: '40',
    name: 'Highway Exit',
    category: 'guide',
    description: 'Exit from highway. Follow signs to your destination. Common on N1 motorway.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842108.png',
    color: '#10B981',
  },
  {
    id: '41',
    name: 'Distance Marker',
    category: 'guide',
    description: 'Shows distance to destinations in kilometers. Helps you plan your journey.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842112.png',
    color: '#10B981',
  },
  {
    id: '42',
    name: 'City / Town Direction',
    category: 'guide',
    description: 'Indicates direction to city or town. Common destinations: Accra, Kumasi, Tamale, Cape Coast.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842110.png',
    color: '#10B981',
  },
  {
    id: '43',
    name: 'Route Number',
    category: 'guide',
    description: 'Identifies the route or highway number. N1 is the main coastal highway in Ghana.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842113.png',
    color: '#10B981',
  },
  {
    id: '44',
    name: 'Bus Stop',
    category: 'guide',
    description: 'Bus stop location. Tro-tro and STC buses stop here. Watch for pedestrians.',
    image: 'https://cdn-icons-png.flaticon.com/512/3842/3842107.png',
    color: '#10B981',
  },
];

export default function RoadSignsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedSign, setExpandedSign] = useState<string | null>(null);

  const filteredSigns = roadSigns.filter((sign) => {
    const matchesSearch = sign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sign.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || sign.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'regulatory':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      case 'informational':
        return '#3B82F6';
      case 'guide':
        return '#10B981';
      default:
        return '#64748B';
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      {/* Header */}
      <View className={`px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center mr-2"
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={isDark ? '#FFFFFF' : '#111827'}
            />
          </TouchableOpacity>
          <View>
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Ghana Road Signs
            </Text>
            <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {filteredSigns.length} signs • DVLA Approved
            </Text>
          </View>
        </View>

        <SearchBar
          placeholder="Search road signs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
          contentContainerStyle={{ gap: 8 }}
        >
          {categories.map((category) => (
            <Chip
              key={category.id}
              label={category.label}
              selected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Signs List */}
      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        <View className="gap-3 pb-8">
          {filteredSigns.map((sign) => (
            <TouchableOpacity
              key={sign.id}
              onPress={() => setExpandedSign(expandedSign === sign.id ? null : sign.id)}
              activeOpacity={0.7}
            >
              <Card variant="default" padding="none" className="overflow-hidden">
                <View className="flex-row p-4">
                  {/* Sign Image */}
                  <View
                    className="h-20 w-20 rounded-lg items-center justify-center mr-4"
                    style={{ backgroundColor: sign.color + '15' }}
                  >
                    <Image
                      source={{ uri: sign.image }}
                      className="h-14 w-14"
                      resizeMode="contain"
                    />
                  </View>

                  {/* Sign Info */}
                  <View className="flex-1 justify-center">
                    <View className="flex-row items-center mb-1">
                      <View
                        className="h-2 w-2 rounded-full mr-2"
                        style={{ backgroundColor: getCategoryColor(sign.category) }}
                      />
                      <Text
                        className="text-xs font-medium capitalize"
                        style={{ color: getCategoryColor(sign.category) }}
                      >
                        {sign.category}
                      </Text>
                    </View>
                    <Text className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {sign.name}
                    </Text>
                    <Text
                      className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                      numberOfLines={expandedSign === sign.id ? undefined : 2}
                    >
                      {sign.description}
                    </Text>
                  </View>

                  {/* Expand Icon */}
                  <View className="items-center justify-center">
                    <MaterialIcons
                      name={expandedSign === sign.id ? 'expand-less' : 'expand-more'}
                      size={24}
                      color={isDark ? '#64748B' : '#94A3B8'}
                    />
                  </View>
                </View>

                {/* Expanded Content */}
                {expandedSign === sign.id && (
                  <View className={`px-4 pb-4 pt-2 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <MaterialIcons name="lightbulb" size={18} color="#F59E0B" />
                        <Text className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          Tip: Always obey road signs for your safety
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {filteredSigns.length === 0 && (
          <View className="items-center justify-center py-12">
            <MaterialIcons
              name="search-off"
              size={48}
              color={isDark ? '#475569' : '#94A3B8'}
            />
            <Text className={`text-lg font-semibold mt-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              No signs found
            </Text>
            <Text className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Try adjusting your search or filter
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
