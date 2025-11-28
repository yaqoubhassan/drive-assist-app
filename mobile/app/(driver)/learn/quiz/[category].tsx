import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../../src/context/ThemeContext';
import { Button, Card } from '../../../../src/components/common';

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

// Comprehensive quiz questions database with Flaticon images
const allQuestions: QuizQuestion[] = [
  // REGULATORY SIGNS
  {
    id: 'r1',
    question: 'What should you do when you see this sign?',
    options: ['Slow down and proceed', 'Come to a complete stop', 'Yield to traffic', 'Continue at normal speed'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842157.png',
    signName: 'Stop Sign',
    explanation: 'A stop sign requires you to come to a complete stop at the line, crosswalk, or before entering the intersection.',
    category: 'regulatory',
  },
  {
    id: 'r2',
    question: 'This sign means you must:',
    options: ['Stop immediately', 'Slow down and give way to traffic', 'Speed up to merge', 'Change lanes'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842066.png',
    signName: 'Yield / Give Way',
    explanation: 'A yield sign means you must slow down and give way to traffic on the road you are entering or crossing.',
    category: 'regulatory',
  },
  {
    id: 'r3',
    question: 'What does this sign indicate?',
    options: ['Minimum speed allowed', 'Maximum speed allowed', 'Suggested speed', 'Speed limit for trucks only'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842094.png',
    signName: 'Speed Limit',
    explanation: 'This sign shows the maximum speed allowed on this road. In Ghana, speed limits are in km/h.',
    category: 'regulatory',
  },
  {
    id: 'r4',
    question: 'What does this sign mean?',
    options: ['One way street', 'Do not enter', 'Wrong way', 'Road closed ahead'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842135.png',
    signName: 'No Entry',
    explanation: 'This sign prohibits entry from your direction. Do not enter this road.',
    category: 'regulatory',
  },
  {
    id: 'r5',
    question: 'When you see this sign, you should:',
    options: ['Pass vehicles freely', 'Not overtake other vehicles', 'Overtake only on the right', 'Overtake at high speed'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842081.png',
    signName: 'No Overtaking',
    explanation: 'This sign means overtaking other vehicles is prohibited in this zone.',
    category: 'regulatory',
  },
  {
    id: 'r6',
    question: 'This sign indicates:',
    options: ['Parking available', 'No parking allowed', 'Short-term parking', 'Reserved parking'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842138.png',
    signName: 'No Parking',
    explanation: 'Parking is not allowed in this area. Your vehicle may be towed.',
    category: 'regulatory',
  },
  {
    id: 'r7',
    question: 'What action is prohibited by this sign?',
    options: ['Left turn', 'Right turn', 'U-turn', 'Straight ahead'],
    correctAnswer: 2,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842147.png',
    signName: 'No U-Turn',
    explanation: 'U-turns are prohibited at this location.',
    category: 'regulatory',
  },
  {
    id: 'r8',
    question: 'This sign prohibits:',
    options: ['Right turns', 'Left turns', 'U-turns', 'Going straight'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842146.png',
    signName: 'No Left Turn',
    explanation: 'Left turns are prohibited at this intersection.',
    category: 'regulatory',
  },
  {
    id: 'r9',
    question: 'What does this one-way sign mean?',
    options: ['Merge ahead', 'Traffic flows in one direction only', 'Road splits ahead', 'Keep left'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842161.png',
    signName: 'One Way',
    explanation: 'Traffic flows in one direction only. Do not drive against the flow.',
    category: 'regulatory',
  },
  {
    id: 'r10',
    question: 'This sign is commonly found near:',
    options: ['Schools', 'Hospitals', 'Markets', 'All of the above'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842134.png',
    signName: 'No Horns / Silent Zone',
    explanation: 'Use of vehicle horns is prohibited in this area. Common in hospital zones.',
    category: 'regulatory',
  },
  {
    id: 'r11',
    question: 'What does this sign instruct you to do?',
    options: ['Keep left', 'Keep right', 'Turn around', 'Stop'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842165.png',
    signName: 'Keep Right',
    explanation: 'Keep to the right side of the obstacle or road divider.',
    category: 'regulatory',
  },
  {
    id: 'r12',
    question: 'This sign prohibits:',
    options: ['Left turns', 'U-turns', 'Right turns', 'Stopping'],
    correctAnswer: 2,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842149.png',
    signName: 'No Right Turn',
    explanation: 'Right turns are prohibited at this intersection.',
    category: 'regulatory',
  },
  {
    id: 'r13',
    question: 'What does this sign indicate in school zones?',
    options: ['Maximum 50 km/h', 'Maximum 30 km/h', 'Maximum 60 km/h', 'No speed limit'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842092.png',
    signName: 'Speed Limit (30 km/h)',
    explanation: 'Maximum speed 30 km/h. Common in school zones and residential areas in Ghana.',
    category: 'regulatory',
  },
  {
    id: 'r14',
    question: 'This sign means you must not:',
    options: ['Park here', 'Stop here', 'Turn here', 'Honk here'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842140.png',
    signName: 'No Stopping',
    explanation: 'Stopping is prohibited in this area, even briefly. Keep moving.',
    category: 'regulatory',
  },

  // WARNING SIGNS
  {
    id: 'w1',
    question: 'This sign warns you about:',
    options: ['Straight road ahead', 'Sharp curve ahead', 'Road ends', 'Intersection ahead'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842045.png',
    signName: 'Curve Ahead',
    explanation: 'Sharp curve ahead. Reduce speed and be prepared to turn.',
    category: 'warning',
  },
  {
    id: 'w2',
    question: 'When you see this sign, you should:',
    options: ['Speed up', 'Be prepared to stop for pedestrians', 'Honk your horn', 'Change lanes'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842032.png',
    signName: 'Pedestrian Crossing',
    explanation: 'Pedestrian crossing ahead. Be prepared to stop for pedestrians.',
    category: 'warning',
  },
  {
    id: 'w3',
    question: 'This sign indicates:',
    options: ['Hospital zone', 'School zone', 'Shopping area', 'Residential area'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842036.png',
    signName: 'School Zone / Children',
    explanation: 'School area ahead. Watch for children and reduce speed.',
    category: 'warning',
  },
  {
    id: 'w4',
    question: 'At this sign, you should:',
    options: ['Stop completely', 'Give way to vehicles already in the roundabout', 'Speed through', 'Turn back'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842053.png',
    signName: 'Roundabout Ahead',
    explanation: 'Roundabout ahead. Give way to vehicles already in the roundabout.',
    category: 'warning',
  },
  {
    id: 'w5',
    question: 'This sign warns about:',
    options: ['Speed bump', 'Construction zone', 'School ahead', 'Hospital nearby'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842059.png',
    signName: 'Road Works',
    explanation: 'Construction or road maintenance ahead. Slow down and watch for workers.',
    category: 'warning',
  },
  {
    id: 'w6',
    question: 'When you see this sign, you should:',
    options: ['Speed up', 'Reduce speed and avoid sudden braking', 'Stop immediately', 'Turn around'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842043.png',
    signName: 'Slippery Road',
    explanation: 'Road may be slippery when wet. Reduce speed and avoid sudden braking.',
    category: 'warning',
  },
  {
    id: 'w7',
    question: 'This sign indicates:',
    options: ['Hill climbing area', 'Steep downhill gradient ahead', 'Speed bump', 'Flat road'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842047.png',
    signName: 'Steep Hill Downward',
    explanation: 'Steep downhill gradient ahead. Use lower gear and control your speed.',
    category: 'warning',
  },
  {
    id: 'w8',
    question: 'What should you do when seeing this sign?',
    options: ['Brake hard', 'Maintain momentum if safe', 'Stop', 'Turn around'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842048.png',
    signName: 'Steep Hill Upward',
    explanation: 'Steep uphill gradient ahead. Maintain momentum if safe.',
    category: 'warning',
  },
  {
    id: 'w9',
    question: 'This sign warns that:',
    options: ['Road widens', 'Road narrows ahead', 'Road ends', 'Two lanes merge'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842051.png',
    signName: 'Narrow Road / Bridge',
    explanation: 'Road narrows ahead. Prepare to adjust your position.',
    category: 'warning',
  },
  {
    id: 'w10',
    question: 'This sign indicates:',
    options: ['One-way traffic', 'Two-way traffic ahead', 'Dead end', 'Merge ahead'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842057.png',
    signName: 'Two-Way Traffic',
    explanation: 'Two-way traffic ahead. Stay in your lane.',
    category: 'warning',
  },
  {
    id: 'w11',
    question: 'When you see this sign:',
    options: ['Speed up to pass', 'Be prepared to stop', 'Honk your horn', 'Flash your lights'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842055.png',
    signName: 'Traffic Lights Ahead',
    explanation: 'Traffic signal ahead. Be prepared to stop.',
    category: 'warning',
  },
  {
    id: 'w12',
    question: 'This sign warns about:',
    options: ['Road closure', 'Railway crossing ahead', 'Bridge ahead', 'Tunnel ahead'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842062.png',
    signName: 'Railway Crossing',
    explanation: 'Railway level crossing ahead. Stop if signals are active.',
    category: 'warning',
  },
  {
    id: 'w13',
    question: 'This sign is common on:',
    options: ['City streets', 'Rural roads', 'Highways', 'Parking lots'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842038.png',
    signName: 'Animals Crossing',
    explanation: 'Wild animals may cross the road. Common on rural roads in Ghana.',
    category: 'warning',
  },
  {
    id: 'w14',
    question: 'This sign warns about:',
    options: ['Smooth road ahead', 'Uneven road surface or speed bumps', 'New pavement', 'Speed limit change'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842050.png',
    signName: 'Bumpy Road / Speed Bump',
    explanation: 'Uneven road surface ahead. Reduce speed to avoid damage.',
    category: 'warning',
  },
  {
    id: 'w15',
    question: 'This sign warns of:',
    options: ['Road ending', 'Junction ahead', 'One-way road', 'U-turn allowed'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842064.png',
    signName: 'Intersection Ahead',
    explanation: 'Junction or crossroads ahead. Be prepared for traffic from other directions.',
    category: 'warning',
  },
  {
    id: 'w16',
    question: 'This sign indicates:',
    options: ['Single curve', 'Double curve ahead', 'Road ends', 'Straight road'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842046.png',
    signName: 'Double Curve',
    explanation: 'Series of curves ahead. Reduce speed and stay alert.',
    category: 'warning',
  },

  // INFORMATIONAL SIGNS
  {
    id: 'i1',
    question: 'This sign indicates:',
    options: ['Police station', 'Hospital nearby', 'Fire station', 'School'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842118.png',
    signName: 'Hospital',
    explanation: 'Hospital nearby. Keep noise low and watch for emergency vehicles.',
    category: 'informational',
  },
  {
    id: 'i2',
    question: 'What facility does this sign indicate?',
    options: ['Garage', 'Fuel station', 'Car wash', 'Parking'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842121.png',
    signName: 'Fuel / Petrol Station',
    explanation: 'Petrol/fuel station available ahead or nearby.',
    category: 'informational',
  },
  {
    id: 'i3',
    question: 'This sign indicates:',
    options: ['No parking', 'Parking available', 'Reserved parking', 'Temporary parking'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842115.png',
    signName: 'Parking',
    explanation: 'Parking area available.',
    category: 'informational',
  },
  {
    id: 'i4',
    question: 'What service is available near this sign?',
    options: ['Hotel', 'Restaurant', 'Gas station', 'Hospital'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842124.png',
    signName: 'Restaurant / Food',
    explanation: 'Restaurant or food services available nearby.',
    category: 'informational',
  },
  {
    id: 'i5',
    question: 'This sign indicates:',
    options: ['Restaurant', 'Hotel or lodging', 'Hospital', 'Information center'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842119.png',
    signName: 'Hotel / Lodging',
    explanation: 'Accommodation available nearby. Hotels or guest houses.',
    category: 'informational',
  },
  {
    id: 'i6',
    question: 'This sign shows:',
    options: ['Hospital', 'First aid services', 'Pharmacy', 'Doctor\'s office'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842117.png',
    signName: 'First Aid',
    explanation: 'First aid or emergency medical services available.',
    category: 'informational',
  },
  {
    id: 'i7',
    question: 'What facility does this sign indicate?',
    options: ['Internet cafe', 'Public telephone', 'Post office', 'Police station'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842127.png',
    signName: 'Telephone',
    explanation: 'Public telephone available. Useful for emergencies.',
    category: 'informational',
  },
  {
    id: 'i8',
    question: 'This sign indicates:',
    options: ['Shower area', 'Public restrooms', 'Swimming pool', 'Laundry'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842125.png',
    signName: 'Restrooms / WC',
    explanation: 'Public toilet facilities available.',
    category: 'informational',
  },

  // GUIDE SIGNS
  {
    id: 'g1',
    question: 'This sign gives directions to:',
    options: ['Bus station', 'Airport', 'Train station', 'Port'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842106.png',
    signName: 'Airport',
    explanation: 'Direction to airport. Follow signs to Kotoka International Airport in Accra.',
    category: 'guide',
  },
  {
    id: 'g2',
    question: 'This sign indicates:',
    options: ['Road closure', 'Highway exit', 'Speed change', 'Lane ending'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842108.png',
    signName: 'Highway Exit',
    explanation: 'Exit from highway or motorway. Follow signs for your destination.',
    category: 'guide',
  },
  {
    id: 'g3',
    question: 'What information does this sign provide?',
    options: ['Speed limit', 'Distance to destinations', 'Direction only', 'Road name'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842112.png',
    signName: 'Distance Marker',
    explanation: 'Shows distance to destinations. Distances are in kilometers in Ghana.',
    category: 'guide',
  },
  {
    id: 'g4',
    question: 'This sign shows:',
    options: ['Speed zone', 'City or town direction', 'Distance only', 'Road condition'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842110.png',
    signName: 'City / Town Direction',
    explanation: 'Indicates direction to city or town. Follow for your destination.',
    category: 'guide',
  },
  {
    id: 'g5',
    question: 'This sign identifies:',
    options: ['Speed limit', 'Route or highway number', 'Distance', 'Exit number'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842113.png',
    signName: 'Route Number',
    explanation: 'Identifies the route or highway number. N1 is the main highway in Ghana.',
    category: 'guide',
  },
  {
    id: 'g6',
    question: 'This sign indicates:',
    options: ['Taxi stand', 'Bus stop', 'Parking', 'Rest area'],
    correctAnswer: 1,
    signImage: 'https://cdn-icons-png.flaticon.com/512/3842/3842107.png',
    signName: 'Bus Stop',
    explanation: 'Bus stop location. Tro-tro and STC buses stop here.',
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
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState({ correct: 0, total: 0, percentage: 0 });
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
    if (!quizCompleted) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, quizCompleted]);

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
    if (showExplanation) return;
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
      // Calculate final score immediately
      const allAnswers = { ...answers, [currentQuestion.id]: selectedAnswer };
      const correctCount = Object.entries(allAnswers)
        .filter(([id, answer]) => {
          const q = questions.find(q => q.id === id);
          return q && answer === q.correctAnswer;
        }).length;

      const percentage = Math.round((correctCount / questions.length) * 100);

      setFinalScore({
        correct: correctCount,
        total: questions.length,
        percentage: percentage
      });
      setQuizCompleted(true);
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

  const handleViewDetailedResults = () => {
    router.replace({
      pathname: '/(driver)/learn/quiz/results',
      params: {
        score: finalScore.percentage.toString(),
        correct: finalScore.correct.toString(),
        total: finalScore.total.toString(),
        time: elapsedTime.toString(),
        category: category || 'all',
      },
    } as any);
  };

  const handleTryAgain = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers({});
    setShowExplanation(false);
    setQuizCompleted(false);
    setFinalScore({ correct: 0, total: 0, percentage: 0 });
  };

  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;
  const isPassed = finalScore.percentage >= 70;

  const getGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return '#10B981';
      case 'B': return '#3B82F6';
      case 'C': return '#F59E0B';
      case 'D': return '#F97316';
      default: return '#EF4444';
    }
  };

  // Show quiz completion screen
  if (quizCompleted) {
    const grade = getGrade(finalScore.percentage);
    const gradeColor = getGradeColor(grade);

    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Result Header */}
          <LinearGradient
            colors={isPassed ? ['#10B981', '#059669'] : ['#F59E0B', '#EF4444']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="px-4 py-8"
          >
            <View className="items-center">
              <View className="h-20 w-20 rounded-full bg-white/20 items-center justify-center mb-4">
                <MaterialIcons
                  name={isPassed ? 'emoji-events' : 'trending-up'}
                  size={48}
                  color="#FFFFFF"
                />
              </View>
              <Text className="text-white text-2xl font-bold text-center">
                {isPassed ? 'Congratulations! 🎉' : 'Keep Practicing! 💪'}
              </Text>
              <Text className="text-white/80 text-center mt-2">
                {isPassed
                  ? 'You passed the quiz!'
                  : 'You need 70% to pass. Try again!'}
              </Text>
            </View>
          </LinearGradient>

          {/* Score Card */}
          <View className="px-4 -mt-6">
            <Card variant="elevated" className="items-center py-6">
              {/* Grade Circle */}
              <View
                className="h-28 w-28 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: gradeColor + '20', borderWidth: 4, borderColor: gradeColor }}
              >
                <Text className="text-5xl font-bold" style={{ color: gradeColor }}>
                  {grade}
                </Text>
              </View>

              {/* Score */}
              <Text className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {finalScore.percentage}%
              </Text>
              <Text className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {finalScore.correct} out of {finalScore.total} correct
              </Text>

              {/* Pass/Fail Badge */}
              <View
                className={`mt-4 px-4 py-2 rounded-full ${
                  isPassed ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}
              >
                <Text
                  className={`font-semibold ${isPassed ? 'text-green-600' : 'text-red-600'}`}
                >
                  {isPassed ? '✓ PASSED' : '✗ NEEDS IMPROVEMENT'}
                </Text>
              </View>

              {/* Stats Row */}
              <View className="flex-row mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 w-full">
                <View className="flex-1 items-center">
                  <MaterialIcons name="schedule" size={24} color="#3B82F6" />
                  <Text className={`text-lg font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {formatTime(elapsedTime)}
                  </Text>
                  <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Time Taken
                  </Text>
                </View>
                <View className="flex-1 items-center">
                  <MaterialIcons name="check-circle" size={24} color="#10B981" />
                  <Text className={`text-lg font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {finalScore.correct}
                  </Text>
                  <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Correct
                  </Text>
                </View>
                <View className="flex-1 items-center">
                  <MaterialIcons name="cancel" size={24} color="#EF4444" />
                  <Text className={`text-lg font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {finalScore.total - finalScore.correct}
                  </Text>
                  <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Incorrect
                  </Text>
                </View>
              </View>
            </Card>
          </View>

          {/* Category Info */}
          <View className="px-4 mt-4">
            <Card variant="default">
              <View className="flex-row items-center">
                <View className="h-12 w-12 rounded-full bg-primary-500/10 items-center justify-center mr-3">
                  <MaterialIcons name="category" size={24} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {categoryTitles[category || 'all']}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Quiz Category
                  </Text>
                </View>
              </View>
            </Card>
          </View>

          <View className="h-8" />
        </ScrollView>

        {/* Bottom Actions */}
        <View className={`px-4 py-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.replace('/(driver)/learn/quiz')}
              className={`flex-1 py-4 rounded-xl items-center justify-center ${
                isDark ? 'bg-slate-800' : 'bg-slate-100'
              }`}
            >
              <MaterialIcons name="list" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
              <Text className={`mt-1 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                All Quizzes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleTryAgain}
              className="flex-1 py-4 rounded-xl items-center justify-center bg-primary-500"
            >
              <MaterialIcons name="replay" size={24} color="#FFFFFF" />
              <Text className="mt-1 font-semibold text-white">
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleViewDetailedResults}
            className="mt-3"
          >
            <Text className="text-primary-500 text-center font-semibold">
              View Detailed Results
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
