import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import {
  NearbyExpertsList,
  ExpertsMapView,
  ExpertProfileSheet,
  SignUpPromptModal,
} from '../../../src/components/experts';
import { Expert } from '../../../src/services/expert';

type ViewMode = 'list' | 'map';

export default function NearbyExpertsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { isAuthenticated, userType } = useAuth();

  const isGuest = !isAuthenticated || userType === 'guest';

  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [showProfileSheet, setShowProfileSheet] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const handleExpertPress = (expert: Expert) => {
    setSelectedExpert(expert);
    setShowProfileSheet(true);
  };

  const handleContactPress = () => {
    if (isGuest) {
      setShowProfileSheet(false);
      setTimeout(() => setShowSignUpModal(true), 300);
    } else {
      // Navigate to messaging or contact screen
      setShowProfileSheet(false);
      if (selectedExpert) {
        router.push({
          pathname: '/(shared)/messages/[id]',
          params: { id: selectedExpert.id.toString(), expertId: selectedExpert.id.toString() },
        });
      }
    }
  };

  const handleSignUp = () => {
    setShowSignUpModal(false);
    router.push('/(auth)/sign-up');
  };

  const handleSignIn = () => {
    setShowSignUpModal(false);
    router.push('/(auth)/sign-in');
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
      edges={['top']}
    >
      {/* Header */}
      <View className={`flex-row items-center justify-between px-4 py-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 -ml-2"
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={isDark ? '#F8FAFC' : '#1E293B'}
          />
        </TouchableOpacity>

        <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Find Experts
        </Text>

        {/* View Toggle */}
        <View className={`flex-row rounded-lg overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <TouchableOpacity
            onPress={() => setViewMode('map')}
            className={`px-3 py-1.5 ${viewMode === 'map' ? 'bg-primary-500' : ''}`}
          >
            <MaterialIcons
              name="map"
              size={20}
              color={viewMode === 'map' ? '#FFF' : isDark ? '#94A3B8' : '#64748B'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            className={`px-3 py-1.5 ${viewMode === 'list' ? 'bg-primary-500' : ''}`}
          >
            <MaterialIcons
              name="list"
              size={20}
              color={viewMode === 'list' ? '#FFF' : isDark ? '#94A3B8' : '#64748B'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {viewMode === 'map' ? (
        <ExpertsMapView
          onExpertPress={handleExpertPress}
          radius={15}
        />
      ) : (
        <View className="flex-1 p-4">
          <NearbyExpertsList
            onExpertPress={handleExpertPress}
            onSignUpPress={() => setShowSignUpModal(true)}
            isGuest={isGuest}
            limit={20}
          />
        </View>
      )}

      {/* Expert Profile Bottom Sheet */}
      <ExpertProfileSheet
        expert={selectedExpert}
        visible={showProfileSheet}
        onClose={() => setShowProfileSheet(false)}
        onContactPress={handleContactPress}
        isGuest={isGuest}
      />

      {/* Sign Up Prompt Modal */}
      <SignUpPromptModal
        visible={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onSignUp={handleSignUp}
        onSignIn={handleSignIn}
        title="Sign Up to Contact"
        message="Create a free account to message this expert, access their contact details, and book appointments."
      />
    </SafeAreaView>
  );
}
