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

const roadSigns = [
  {
    id: '1',
    name: 'Stop Sign',
    category: 'regulatory',
    description: 'Come to a complete stop at the line, crosswalk, or before entering the intersection.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Vienna_Convention_road_sign_B2a.svg/240px-Vienna_Convention_road_sign_B2a.svg.png',
    color: '#EF4444',
  },
  {
    id: '2',
    name: 'Yield Sign',
    category: 'regulatory',
    description: 'Slow down and give way to traffic on the road you are entering or crossing.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Vienna_Convention_road_sign_B1-V1.svg/240px-Vienna_Convention_road_sign_B1-V1.svg.png',
    color: '#EF4444',
  },
  {
    id: '3',
    name: 'Speed Limit',
    category: 'regulatory',
    description: 'Maximum speed allowed on this road. In Ghana, speed limits are in km/h.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Zeichen_274-60_-_Zul%C3%A4ssige_H%C3%B6chstgeschwindigkeit%2C_StVO_2017.svg/240px-Zeichen_274-60_-_Zul%C3%A4ssige_H%C3%B6chstgeschwindigkeit%2C_StVO_2017.svg.png',
    color: '#EF4444',
  },
  {
    id: '4',
    name: 'No Entry',
    category: 'regulatory',
    description: 'Do not enter this road from your direction. Entry is prohibited.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Vienna_Convention_road_sign_C1.svg/240px-Vienna_Convention_road_sign_C1.svg.png',
    color: '#EF4444',
  },
  {
    id: '5',
    name: 'No Overtaking',
    category: 'regulatory',
    description: 'Overtaking other vehicles is prohibited in this zone.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Vienna_Convention_road_sign_C13a-V1.svg/240px-Vienna_Convention_road_sign_C13a-V1.svg.png',
    color: '#EF4444',
  },
  {
    id: '6',
    name: 'Curve Ahead',
    category: 'warning',
    description: 'Sharp curve ahead. Reduce speed and be prepared to turn.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Vienna_Convention_road_sign_A1a-V1.svg/240px-Vienna_Convention_road_sign_A1a-V1.svg.png',
    color: '#F59E0B',
  },
  {
    id: '7',
    name: 'Pedestrian Crossing',
    category: 'warning',
    description: 'Pedestrian crossing ahead. Be prepared to stop for pedestrians.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Vienna_Convention_road_sign_A12-V2.svg/240px-Vienna_Convention_road_sign_A12-V2.svg.png',
    color: '#F59E0B',
  },
  {
    id: '8',
    name: 'School Zone',
    category: 'warning',
    description: 'School area ahead. Watch for children and reduce speed.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Vienna_Convention_road_sign_A13-V1.svg/240px-Vienna_Convention_road_sign_A13-V1.svg.png',
    color: '#F59E0B',
  },
  {
    id: '9',
    name: 'Roundabout',
    category: 'warning',
    description: 'Roundabout ahead. Give way to vehicles already in the roundabout.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Vienna_Convention_road_sign_A26-V2.svg/240px-Vienna_Convention_road_sign_A26-V2.svg.png',
    color: '#F59E0B',
  },
  {
    id: '10',
    name: 'Road Works',
    category: 'warning',
    description: 'Construction or road maintenance ahead. Slow down and watch for workers.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Vienna_Convention_road_sign_A15.svg/240px-Vienna_Convention_road_sign_A15.svg.png',
    color: '#F59E0B',
  },
  {
    id: '11',
    name: 'Hospital',
    category: 'informational',
    description: 'Hospital nearby. Keep noise low and watch for emergency vehicles.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Italian_traffic_signs_-_ospedale.svg/240px-Italian_traffic_signs_-_ospedale.svg.png',
    color: '#3B82F6',
  },
  {
    id: '12',
    name: 'Fuel Station',
    category: 'informational',
    description: 'Petrol/fuel station available ahead or nearby.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Vienna_Convention_road_sign_F5-V1.svg/240px-Vienna_Convention_road_sign_F5-V1.svg.png',
    color: '#3B82F6',
  },
  {
    id: '13',
    name: 'Parking',
    category: 'informational',
    description: 'Parking area available.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Vienna_Convention_road_sign_E14a.svg/240px-Vienna_Convention_road_sign_E14a.svg.png',
    color: '#3B82F6',
  },
  {
    id: '14',
    name: 'Airport',
    category: 'guide',
    description: 'Direction to airport. Follow signs to Kotoka International Airport in Accra.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Vienna_Convention_road_sign_F15-V1.svg/240px-Vienna_Convention_road_sign_F15-V1.svg.png',
    color: '#10B981',
  },
  {
    id: '15',
    name: 'Highway Exit',
    category: 'guide',
    description: 'Exit from highway or motorway. Follow signs for your destination.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/UK_traffic_sign_819.svg/240px-UK_traffic_sign_819.svg.png',
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
              Road Signs Guide
            </Text>
            <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {filteredSigns.length} signs
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
