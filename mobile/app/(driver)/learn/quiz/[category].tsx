import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../src/context/ThemeContext';
import { Button } from '../../../../src/components/common';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  signImage: string;
  signName: string;
  explanation: string;
  category: string;
}

// Comprehensive quiz questions database
const allQuestions: QuizQuestion[] = [
  // REGULATORY SIGNS
  {
    id: 'r1',
    question: 'What should you do when you see this sign?',
    options: ['Slow down and proceed', 'Come to a complete stop', 'Yield to traffic', 'Continue at normal speed'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Vienna_Convention_road_sign_B2a.svg/240px-Vienna_Convention_road_sign_B2a.svg.png',
    signName: 'Stop Sign',
    explanation: 'A stop sign requires you to come to a complete stop at the line, crosswalk, or before entering the intersection.',
    category: 'regulatory',
  },
  {
    id: 'r2',
    question: 'This sign means you must:',
    options: ['Stop immediately', 'Slow down and give way to traffic', 'Speed up to merge', 'Change lanes'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Vienna_Convention_road_sign_B1-V1.svg/240px-Vienna_Convention_road_sign_B1-V1.svg.png',
    signName: 'Yield Sign',
    explanation: 'A yield sign means you must slow down and give way to traffic on the road you are entering or crossing.',
    category: 'regulatory',
  },
  {
    id: 'r3',
    question: 'What does this sign indicate?',
    options: ['Minimum speed allowed', 'Maximum speed allowed', 'Suggested speed', 'Speed limit for trucks only'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Zeichen_274-60_-_Zul%C3%A4ssige_H%C3%B6chstgeschwindigkeit%2C_StVO_2017.svg/240px-Zeichen_274-60_-_Zul%C3%A4ssige_H%C3%B6chstgeschwindigkeit%2C_StVO_2017.svg.png',
    signName: 'Speed Limit',
    explanation: 'This sign shows the maximum speed allowed on this road. In Ghana, speed limits are in km/h.',
    category: 'regulatory',
  },
  {
    id: 'r4',
    question: 'What does this sign mean?',
    options: ['One way street', 'Do not enter', 'Wrong way', 'Road closed ahead'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Vienna_Convention_road_sign_C1.svg/240px-Vienna_Convention_road_sign_C1.svg.png',
    signName: 'No Entry',
    explanation: 'This sign prohibits entry from your direction. Do not enter this road.',
    category: 'regulatory',
  },
  {
    id: 'r5',
    question: 'When you see this sign, you should:',
    options: ['Pass vehicles freely', 'Not overtake other vehicles', 'Overtake only on the right', 'Overtake at high speed'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Vienna_Convention_road_sign_C13a-V1.svg/240px-Vienna_Convention_road_sign_C13a-V1.svg.png',
    signName: 'No Overtaking',
    explanation: 'This sign means overtaking other vehicles is prohibited in this zone.',
    category: 'regulatory',
  },
  {
    id: 'r6',
    question: 'This sign indicates:',
    options: ['Parking available', 'No parking allowed', 'Short-term parking', 'Reserved parking'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Vienna_Convention_road_sign_C18.svg/240px-Vienna_Convention_road_sign_C18.svg.png',
    signName: 'No Parking',
    explanation: 'Parking is not allowed in this area. Your vehicle may be towed.',
    category: 'regulatory',
  },
  {
    id: 'r7',
    question: 'What action is prohibited by this sign?',
    options: ['Left turn', 'Right turn', 'U-turn', 'Straight ahead'],
    correctAnswer: 2,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Vienna_Convention_road_sign_C11a.svg/240px-Vienna_Convention_road_sign_C11a.svg.png',
    signName: 'No U-Turn',
    explanation: 'U-turns are prohibited at this location.',
    category: 'regulatory',
  },
  {
    id: 'r8',
    question: 'This sign prohibits:',
    options: ['Right turns', 'Left turns', 'U-turns', 'Going straight'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Vienna_Convention_road_sign_C11b.svg/240px-Vienna_Convention_road_sign_C11b.svg.png',
    signName: 'No Left Turn',
    explanation: 'Left turns are prohibited at this intersection.',
    category: 'regulatory',
  },
  {
    id: 'r9',
    question: 'What does this one-way sign mean?',
    options: ['Merge ahead', 'Traffic flows in one direction only', 'Road splits ahead', 'Keep left'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Vienna_Convention_road_sign_C12b-V1.svg/240px-Vienna_Convention_road_sign_C12b-V1.svg.png',
    signName: 'One Way',
    explanation: 'Traffic flows in one direction only. Do not drive against the flow.',
    category: 'regulatory',
  },
  {
    id: 'r10',
    question: 'This sign is commonly found near:',
    options: ['Schools', 'Hospitals', 'Markets', 'All of the above'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Vienna_Convention_road_sign_C33a-V1.svg/240px-Vienna_Convention_road_sign_C33a-V1.svg.png',
    signName: 'No Horns',
    explanation: 'Use of vehicle horns is prohibited in this area. Common in hospital zones.',
    category: 'regulatory',
  },
  {
    id: 'r11',
    question: 'What does this sign instruct you to do?',
    options: ['Keep left', 'Keep right', 'Turn around', 'Stop'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Vienna_Convention_road_sign_D1b-V1.svg/240px-Vienna_Convention_road_sign_D1b-V1.svg.png',
    signName: 'Keep Right',
    explanation: 'Keep to the right side of the obstacle or road divider.',
    category: 'regulatory',
  },
  {
    id: 'r12',
    question: 'This sign prohibits:',
    options: ['Left turns', 'U-turns', 'Right turns', 'Stopping'],
    correctAnswer: 2,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Vienna_Convention_road_sign_C11c.svg/240px-Vienna_Convention_road_sign_C11c.svg.png',
    signName: 'No Right Turn',
    explanation: 'Right turns are prohibited at this intersection.',
    category: 'regulatory',
  },

  // WARNING SIGNS
  {
    id: 'w1',
    question: 'This sign warns you about:',
    options: ['Straight road ahead', 'Sharp curve ahead', 'Road ends', 'Intersection ahead'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Vienna_Convention_road_sign_A1a-V1.svg/240px-Vienna_Convention_road_sign_A1a-V1.svg.png',
    signName: 'Curve Ahead',
    explanation: 'Sharp curve ahead. Reduce speed and be prepared to turn.',
    category: 'warning',
  },
  {
    id: 'w2',
    question: 'When you see this sign, you should:',
    options: ['Speed up', 'Be prepared to stop for pedestrians', 'Honk your horn', 'Change lanes'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Vienna_Convention_road_sign_A12-V2.svg/240px-Vienna_Convention_road_sign_A12-V2.svg.png',
    signName: 'Pedestrian Crossing',
    explanation: 'Pedestrian crossing ahead. Be prepared to stop for pedestrians.',
    category: 'warning',
  },
  {
    id: 'w3',
    question: 'This sign indicates:',
    options: ['Hospital zone', 'School zone', 'Shopping area', 'Residential area'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Vienna_Convention_road_sign_A13-V1.svg/240px-Vienna_Convention_road_sign_A13-V1.svg.png',
    signName: 'School Zone',
    explanation: 'School area ahead. Watch for children and reduce speed.',
    category: 'warning',
  },
  {
    id: 'w4',
    question: 'At this sign, you should:',
    options: ['Stop completely', 'Give way to vehicles already in the roundabout', 'Speed through', 'Turn back'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Vienna_Convention_road_sign_A26-V2.svg/240px-Vienna_Convention_road_sign_A26-V2.svg.png',
    signName: 'Roundabout',
    explanation: 'Roundabout ahead. Give way to vehicles already in the roundabout.',
    category: 'warning',
  },
  {
    id: 'w5',
    question: 'This sign warns about:',
    options: ['Speed bump', 'Construction zone', 'School ahead', 'Hospital nearby'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Vienna_Convention_road_sign_A15.svg/240px-Vienna_Convention_road_sign_A15.svg.png',
    signName: 'Road Works',
    explanation: 'Construction or road maintenance ahead. Slow down and watch for workers.',
    category: 'warning',
  },
  {
    id: 'w6',
    question: 'When you see this sign, you should:',
    options: ['Speed up', 'Reduce speed and avoid sudden braking', 'Stop immediately', 'Turn around'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Vienna_Convention_road_sign_A8.svg/240px-Vienna_Convention_road_sign_A8.svg.png',
    signName: 'Slippery Road',
    explanation: 'Road may be slippery when wet. Reduce speed and avoid sudden braking.',
    category: 'warning',
  },
  {
    id: 'w7',
    question: 'This sign indicates:',
    options: ['Hill climbing area', 'Steep downhill gradient ahead', 'Speed bump', 'Flat road'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Vienna_Convention_road_sign_A3a.svg/240px-Vienna_Convention_road_sign_A3a.svg.png',
    signName: 'Steep Hill Downward',
    explanation: 'Steep downhill gradient ahead. Use lower gear and control your speed.',
    category: 'warning',
  },
  {
    id: 'w8',
    question: 'What should you do when seeing this sign?',
    options: ['Brake hard', 'Maintain momentum if safe', 'Stop', 'Turn around'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Vienna_Convention_road_sign_A3b.svg/240px-Vienna_Convention_road_sign_A3b.svg.png',
    signName: 'Steep Hill Upward',
    explanation: 'Steep uphill gradient ahead. Maintain momentum if safe.',
    category: 'warning',
  },
  {
    id: 'w9',
    question: 'This sign warns that:',
    options: ['Road widens', 'Road narrows ahead', 'Road ends', 'Two lanes merge'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Vienna_Convention_road_sign_A5a.svg/240px-Vienna_Convention_road_sign_A5a.svg.png',
    signName: 'Narrow Road Ahead',
    explanation: 'Road narrows ahead. Prepare to adjust your position.',
    category: 'warning',
  },
  {
    id: 'w10',
    question: 'This sign indicates:',
    options: ['One-way traffic', 'Two-way traffic ahead', 'Dead end', 'Merge ahead'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Vienna_Convention_road_sign_A6.svg/240px-Vienna_Convention_road_sign_A6.svg.png',
    signName: 'Two-Way Traffic',
    explanation: 'Two-way traffic ahead. Stay in your lane.',
    category: 'warning',
  },
  {
    id: 'w11',
    question: 'When you see this sign:',
    options: ['Speed up to pass', 'Be prepared to stop', 'Honk your horn', 'Flash your lights'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Vienna_Convention_road_sign_A17.svg/240px-Vienna_Convention_road_sign_A17.svg.png',
    signName: 'Traffic Lights Ahead',
    explanation: 'Traffic signal ahead. Be prepared to stop.',
    category: 'warning',
  },
  {
    id: 'w12',
    question: 'This sign warns about:',
    options: ['Road closure', 'Railway crossing ahead', 'Bridge ahead', 'Tunnel ahead'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Vienna_Convention_road_sign_A27.svg/240px-Vienna_Convention_road_sign_A27.svg.png',
    signName: 'Railway Crossing',
    explanation: 'Railway level crossing ahead. Stop if signals are active.',
    category: 'warning',
  },
  {
    id: 'w13',
    question: 'This sign is common on:',
    options: ['City streets', 'Rural roads', 'Highways', 'Parking lots'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Vienna_Convention_road_sign_A19-V1.svg/240px-Vienna_Convention_road_sign_A19-V1.svg.png',
    signName: 'Animals Crossing',
    explanation: 'Wild animals may cross the road. Common on rural roads in Ghana.',
    category: 'warning',
  },
  {
    id: 'w14',
    question: 'This sign warns about:',
    options: ['Smooth road ahead', 'Uneven road surface', 'New pavement', 'Speed limit change'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Vienna_Convention_road_sign_A7a.svg/240px-Vienna_Convention_road_sign_A7a.svg.png',
    signName: 'Bumpy Road',
    explanation: 'Uneven road surface ahead. Reduce speed to avoid damage.',
    category: 'warning',
  },

  // INFORMATIONAL SIGNS
  {
    id: 'i1',
    question: 'This sign indicates:',
    options: ['Police station', 'Hospital nearby', 'Fire station', 'School'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Italian_traffic_signs_-_ospedale.svg/240px-Italian_traffic_signs_-_ospedale.svg.png',
    signName: 'Hospital',
    explanation: 'Hospital nearby. Keep noise low and watch for emergency vehicles.',
    category: 'informational',
  },
  {
    id: 'i2',
    question: 'What facility does this sign indicate?',
    options: ['Garage', 'Fuel station', 'Car wash', 'Parking'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Vienna_Convention_road_sign_F5-V1.svg/240px-Vienna_Convention_road_sign_F5-V1.svg.png',
    signName: 'Fuel Station',
    explanation: 'Petrol/fuel station available ahead or nearby.',
    category: 'informational',
  },
  {
    id: 'i3',
    question: 'This sign indicates:',
    options: ['No parking', 'Parking available', 'Reserved parking', 'Temporary parking'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Vienna_Convention_road_sign_E14a.svg/240px-Vienna_Convention_road_sign_E14a.svg.png',
    signName: 'Parking',
    explanation: 'Parking area available.',
    category: 'informational',
  },
  {
    id: 'i4',
    question: 'What service is available near this sign?',
    options: ['Hotel', 'Restaurant', 'Gas station', 'Hospital'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Vienna_Convention_road_sign_F3-V1.svg/240px-Vienna_Convention_road_sign_F3-V1.svg.png',
    signName: 'Restaurant',
    explanation: 'Restaurant or food services available nearby.',
    category: 'informational',
  },
  {
    id: 'i5',
    question: 'This sign indicates:',
    options: ['Restaurant', 'Hotel or lodging', 'Hospital', 'Information center'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Vienna_Convention_road_sign_F2-V1.svg/240px-Vienna_Convention_road_sign_F2-V1.svg.png',
    signName: 'Hotel/Lodging',
    explanation: 'Accommodation available nearby. Hotels or guest houses.',
    category: 'informational',
  },
  {
    id: 'i6',
    question: 'This sign shows:',
    options: ['Hospital', 'First aid services', 'Pharmacy', 'Doctor\'s office'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Vienna_Convention_road_sign_F8-V1.svg/240px-Vienna_Convention_road_sign_F8-V1.svg.png',
    signName: 'First Aid',
    explanation: 'First aid or emergency medical services available.',
    category: 'informational',
  },
  {
    id: 'i7',
    question: 'What facility does this sign indicate?',
    options: ['Internet cafe', 'Public telephone', 'Post office', 'Police station'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Vienna_Convention_road_sign_F9.svg/240px-Vienna_Convention_road_sign_F9.svg.png',
    signName: 'Telephone',
    explanation: 'Public telephone available. Useful for emergencies.',
    category: 'informational',
  },
  {
    id: 'i8',
    question: 'This sign indicates:',
    options: ['Shower area', 'Public restrooms', 'Swimming pool', 'Laundry'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Vienna_Convention_road_sign_F12a.svg/240px-Vienna_Convention_road_sign_F12a.svg.png',
    signName: 'Restrooms',
    explanation: 'Public toilet facilities available.',
    category: 'informational',
  },

  // GUIDE SIGNS
  {
    id: 'g1',
    question: 'This sign gives directions to:',
    options: ['Bus station', 'Airport', 'Train station', 'Port'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Vienna_Convention_road_sign_F15-V1.svg/240px-Vienna_Convention_road_sign_F15-V1.svg.png',
    signName: 'Airport',
    explanation: 'Direction to airport. Follow signs to Kotoka International Airport in Accra.',
    category: 'guide',
  },
  {
    id: 'g2',
    question: 'This sign indicates:',
    options: ['Road closure', 'Highway exit', 'Speed change', 'Lane ending'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/UK_traffic_sign_819.svg/240px-UK_traffic_sign_819.svg.png',
    signName: 'Highway Exit',
    explanation: 'Exit from highway or motorway. Follow signs for your destination.',
    category: 'guide',
  },
  {
    id: 'g3',
    question: 'What information does this sign provide?',
    options: ['Speed limit', 'Distance to destinations', 'Direction only', 'Road name'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Vienna_Convention_road_sign_E19a.svg/240px-Vienna_Convention_road_sign_E19a.svg.png',
    signName: 'Distance Marker',
    explanation: 'Shows distance to destinations. Distances are in kilometers in Ghana.',
    category: 'guide',
  },
  {
    id: 'g4',
    question: 'This sign shows:',
    options: ['Speed zone', 'City or town direction', 'Distance only', 'Road condition'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Vienna_Convention_road_sign_E17aa-V1.svg/240px-Vienna_Convention_road_sign_E17aa-V1.svg.png',
    signName: 'City/Town Ahead',
    explanation: 'Indicates direction to city or town. Follow for your destination.',
    category: 'guide',
  },
  {
    id: 'g5',
    question: 'This sign identifies:',
    options: ['Speed limit', 'Route or highway number', 'Distance', 'Exit number'],
    correctAnswer: 1,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Vienna_Convention_road_sign_E6a.svg/240px-Vienna_Convention_road_sign_E6a.svg.png',
    signName: 'Route Number',
    explanation: 'Identifies the route or highway number. N1 is the main highway in Ghana.',
    category: 'guide',
  },
  {
    id: 'g6',
    question: 'Guide signs are typically what color in Ghana?',
    options: ['Red', 'Yellow', 'Green', 'Blue'],
    correctAnswer: 2,
    signImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Vienna_Convention_road_sign_E19a.svg/240px-Vienna_Convention_road_sign_E19a.svg.png',
    signName: 'Guide Signs',
    explanation: 'Guide signs are typically green and provide directional information.',
    category: 'guide',
  },
];

const categoryTitles: Record<string, string> = {
  all: 'All Road Signs',
  regulatory: 'Regulatory Signs',
  warning: 'Warning Signs',
  informational: 'Information Signs',
  guide: 'Guide Signs',
};

export default function QuizScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const { isDark } = useTheme();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Filter questions by category
  const questions = category === 'all'
    ? allQuestions
    : allQuestions.filter(q => q.category === category);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasAnswered = selectedAnswer !== null;

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // Progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentQuestionIndex + 1) / questions.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentQuestionIndex, questions.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (index: number) => {
    if (showExplanation) return; // Can't change answer after checking
    setSelectedAnswer(index);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    setShowExplanation(true);
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: selectedAnswer,
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Calculate results and navigate
      const correctCount = Object.entries({ ...answers, [currentQuestion.id]: selectedAnswer })
        .filter(([id, answer]) => {
          const q = questions.find(q => q.id === id);
          return q && answer === q.correctAnswer;
        }).length;

      const score = Math.round((correctCount / questions.length) * 100);

      router.replace({
        pathname: '/(driver)/learn/quiz/results',
        params: {
          score: score.toString(),
          correct: correctCount.toString(),
          total: questions.length.toString(),
          time: elapsedTime.toString(),
          category: category || 'all',
        },
      } as any);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Quiz?',
      'Your progress will be lost. Are you sure you want to exit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

  if (!currentQuestion) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <View className="flex-1 items-center justify-center p-6">
          <Text className={`text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
            No questions available
          </Text>
          <Button title="Go Back" onPress={() => router.back()} className="mt-4" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      {/* Header */}
      <View className={`px-4 py-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity onPress={handleExit} className="flex-row items-center">
            <MaterialIcons name="close" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
          </TouchableOpacity>
          <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {categoryTitles[category || 'all']}
          </Text>
          <View className="flex-row items-center">
            <MaterialIcons name="schedule" size={18} color={isDark ? '#64748B' : '#94A3B8'} />
            <Text className={`ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {formatTime(elapsedTime)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="flex-row items-center">
          <Text className={`text-sm mr-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {currentQuestionIndex + 1}/{questions.length}
          </Text>
          <View className={`flex-1 h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
            <Animated.View
              className="h-2 rounded-full bg-primary-500"
              style={{
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }}
            />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {/* Sign Image */}
        <View className={`items-center p-6 rounded-xl mb-4 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <Image
            source={{ uri: currentQuestion.signImage }}
            className="h-32 w-32"
            resizeMode="contain"
          />
          {showExplanation && (
            <Text className={`mt-2 text-center font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {currentQuestion.signName}
            </Text>
          )}
        </View>

        {/* Question */}
        <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {currentQuestion.question}
        </Text>

        {/* Options */}
        <View className="gap-3 mb-4">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectOption = index === currentQuestion.correctAnswer;

            let optionStyle = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
            let textColor = isDark ? 'text-white' : 'text-slate-900';
            let iconColor = isDark ? '#64748B' : '#94A3B8';

            if (showExplanation) {
              if (isCorrectOption) {
                optionStyle = 'bg-green-500/10 border-green-500';
                textColor = 'text-green-600';
                iconColor = '#10B981';
              } else if (isSelected && !isCorrectOption) {
                optionStyle = 'bg-red-500/10 border-red-500';
                textColor = 'text-red-600';
                iconColor = '#EF4444';
              }
            } else if (isSelected) {
              optionStyle = 'bg-primary-500/10 border-primary-500';
              textColor = 'text-primary-500';
              iconColor = '#3B82F6';
            }

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleSelectAnswer(index)}
                disabled={showExplanation}
                className={`flex-row items-center p-4 rounded-xl border-2 ${optionStyle}`}
              >
                <View className={`h-8 w-8 rounded-full border-2 items-center justify-center mr-3`}
                  style={{ borderColor: iconColor }}
                >
                  {showExplanation && isCorrectOption && (
                    <MaterialIcons name="check" size={18} color={iconColor} />
                  )}
                  {showExplanation && isSelected && !isCorrectOption && (
                    <MaterialIcons name="close" size={18} color={iconColor} />
                  )}
                  {!showExplanation && isSelected && (
                    <View className="h-4 w-4 rounded-full bg-primary-500" />
                  )}
                </View>
                <Text className={`flex-1 font-medium ${textColor}`}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation */}
        {showExplanation && (
          <View className={`p-4 rounded-xl mb-4 ${isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            <View className="flex-row items-center mb-2">
              <MaterialIcons
                name={isCorrect ? 'check-circle' : 'cancel'}
                size={24}
                color={isCorrect ? '#10B981' : '#EF4444'}
              />
              <Text className={`ml-2 font-bold text-lg ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </Text>
            </View>
            <Text className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {currentQuestion.explanation}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View className={`px-4 py-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        {!showExplanation ? (
          <Button
            title="Check Answer"
            onPress={handleCheckAnswer}
            disabled={selectedAnswer === null}
            fullWidth
          />
        ) : (
          <Button
            title={isLastQuestion ? 'See Results' : 'Next Question'}
            onPress={handleNext}
            rightIcon="arrow-forward"
            fullWidth
          />
        )}
      </View>
    </SafeAreaView>
  );
}
