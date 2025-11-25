import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAudioRecorder, useAudioPlayer, AudioModule, RecordingPresets } from 'expo-audio';
import { useTheme } from '../../../src/context/ThemeContext';
import { Button, Chip } from '../../../src/components/common';

type InputTab = 'text' | 'voice' | 'photos';

const suggestionChips = [
  'When did it start?',
  'Any strange noises?',
  'Does it happen when...',
  'How often?',
];

export default function DiagnoseDescribeScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<InputTab>('text');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  // expo-audio hooks
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const audioPlayer = useAudioPlayer(recordedUri ? { uri: recordedUri } : null);

  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // Pulse animation for recording indicator
  useEffect(() => {
    if (audioRecorder.isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [audioRecorder.isRecording, pulseAnim]);

  // Track playback status
  useEffect(() => {
    if (audioPlayer) {
      setIsPlaying(audioPlayer.playing);
      if (audioPlayer.duration) {
        setPlaybackDuration(Math.floor(audioPlayer.duration));
      }
      if (audioPlayer.currentTime !== undefined) {
        setPlaybackPosition(Math.floor(audioPlayer.currentTime));
      }
    }
  }, [audioPlayer?.playing, audioPlayer?.duration, audioPlayer?.currentTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      // Request permissions
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission Required', 'Please allow microphone access to record audio.');
        return;
      }

      // Set audio mode for recording (required on iOS)
      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      setRecordingDuration(0);
      setRecordedUri(null);

      // Prepare and start recording
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!audioRecorder.isRecording) return;

    try {
      // Stop timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      // Stop recording and get URI
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      setRecordedUri(uri);
      setPlaybackDuration(recordingDuration);
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  };

  const toggleRecording = () => {
    if (audioRecorder.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const playRecording = async () => {
    if (!recordedUri || !audioPlayer) return;

    try {
      if (isPlaying) {
        audioPlayer.pause();
      } else {
        audioPlayer.play();
      }
    } catch (err) {
      console.error('Failed to play recording:', err);
    }
  };

  const deleteRecording = () => {
    if (audioPlayer) {
      audioPlayer.pause();
    }
    setRecordedUri(null);
    setRecordingDuration(0);
    setPlaybackDuration(0);
    setPlaybackPosition(0);
    setIsPlaying(false);
  };

  const handleContinue = () => {
    router.push({
      pathname: '/(driver)/diagnose/vehicle',
      params: { category, description },
    });
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photos to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - photos.length,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map((asset) => asset.uri);
      setPhotos([...photos, ...newPhotos].slice(0, 5));
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri].slice(0, 5));
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSuggestionPress = (suggestion: string) => {
    setDescription((prev) => (prev ? `${prev}\n${suggestion}` : suggestion));
  };

  const isValid = description.length >= 20 || photos.length > 0 || recordedUri !== null;

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
      edges={['top']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-12 w-12 items-center justify-center"
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={isDark ? '#FFFFFF' : '#111827'}
            />
          </TouchableOpacity>
          <Text
            className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
          >
            Step 2 of 4
          </Text>
          <TouchableOpacity
            onPress={() => router.dismissAll()}
            className="h-12 w-12 items-center justify-center"
          >
            <MaterialIcons
              name="close"
              size={24}
              color={isDark ? '#FFFFFF' : '#111827'}
            />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View className="pt-4 pb-3">
            <Text
              className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              Describe the Problem
            </Text>
            <Text
              className={`text-base mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
            >
              The more details, the better
            </Text>
          </View>

          {/* Input Tabs */}
          <View className="flex-row gap-2 py-4">
            {(['text', 'voice', 'photos'] as InputTab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-xl items-center ${activeTab === tab
                  ? 'bg-primary-500'
                  : isDark
                    ? 'bg-slate-800'
                    : 'bg-slate-100'
                  }`}
              >
                <MaterialIcons
                  name={
                    tab === 'text'
                      ? 'edit'
                      : tab === 'voice'
                        ? 'mic'
                        : 'photo-camera'
                  }
                  size={20}
                  color={activeTab === tab ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'}
                />
                <Text
                  className={`text-sm font-semibold mt-1 capitalize ${activeTab === tab
                    ? 'text-white'
                    : isDark
                      ? 'text-slate-300'
                      : 'text-slate-600'
                    }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Text Input Tab */}
          {activeTab === 'text' && (
            <View>
              <View
                className={`rounded-xl border-2 p-4 min-h-[150px] ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
              >
                <TextInput
                  className={`text-base ${isDark ? 'text-white' : 'text-slate-900'}`}
                  placeholder="Describe what's happening with your car..."
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  textAlignVertical="top"
                />
              </View>
              <View className="flex-row justify-between mt-2">
                <Text
                  className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                >
                  Min 20 characters
                </Text>
                <Text
                  className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                >
                  {description.length}/500
                </Text>
              </View>

              {/* Suggestions */}
              <View className="flex-row flex-wrap gap-2 mt-4">
                {suggestionChips.map((suggestion) => (
                  <Chip
                    key={suggestion}
                    label={suggestion}
                    onPress={() => handleSuggestionPress(suggestion)}
                  />
                ))}
              </View>

              {/* Tip */}
              <View
                className={`flex-row p-4 rounded-xl mt-4 ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'
                  }`}
              >
                <MaterialIcons
                  name="lightbulb"
                  size={20}
                  color="#F59E0B"
                  style={{ marginRight: 12, marginTop: 2 }}
                />
                <Text
                  className={`flex-1 text-sm ${isDark ? 'text-amber-200' : 'text-amber-700'
                    }`}
                >
                  Tip: Mention when the issue started, how often it happens, and any
                  unusual sounds or smells.
                </Text>
              </View>
            </View>
          )}

          {/* Voice Tab */}
          {activeTab === 'voice' && (
            <View className="items-center py-8">
              {!recordedUri ? (
                // Recording UI
                <>
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <TouchableOpacity
                      onPress={toggleRecording}
                      className={`h-32 w-32 rounded-full items-center justify-center ${audioRecorder.isRecording ? 'bg-red-500' : 'bg-primary-500'}`}
                    >
                      <MaterialIcons
                        name={audioRecorder.isRecording ? 'stop' : 'mic'}
                        size={48}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  </Animated.View>

                  {audioRecorder.isRecording && (
                    <View className="flex-row items-center mt-4">
                      <View className="h-3 w-3 rounded-full bg-red-500 mr-2" />
                      <Text className="text-red-500 font-semibold">REC</Text>
                    </View>
                  )}

                  <Text className={`text-3xl font-bold mt-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {formatTime(recordingDuration)}
                  </Text>

                  <Text className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {audioRecorder.isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
                  </Text>

                  {audioRecorder.isRecording && (
                    <View className="flex-row items-center mt-6">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Animated.View
                          key={i}
                          className="h-8 w-1 mx-0.5 rounded-full bg-primary-500"
                          style={{
                            opacity: 0.3 + Math.random() * 0.7,
                            height: 16 + Math.random() * 24,
                          }}
                        />
                      ))}
                    </View>
                  )}
                </>
              ) : (
                // Playback UI
                <>
                  <View className={`w-full rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <View className="flex-row items-center mb-4">
                      <MaterialIcons name="mic" size={24} color="#3B82F6" />
                      <Text className={`ml-2 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Voice Recording
                      </Text>
                      <Text className={`ml-auto text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {formatTime(playbackDuration)}
                      </Text>
                    </View>

                    {/* Progress bar */}
                    <View className={`h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}>
                      <View
                        className="h-2 rounded-full bg-primary-500"
                        style={{ width: `${playbackDuration > 0 ? (playbackPosition / playbackDuration) * 100 : 0}%` }}
                      />
                    </View>

                    <View className="flex-row justify-between mt-2">
                      <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {formatTime(playbackPosition)}
                      </Text>
                      <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {formatTime(playbackDuration)}
                      </Text>
                    </View>

                    {/* Playback controls */}
                    <View className="flex-row items-center justify-center mt-4 gap-4">
                      <TouchableOpacity
                        onPress={deleteRecording}
                        className={`h-12 w-12 rounded-full items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
                      >
                        <MaterialIcons name="delete" size={24} color="#EF4444" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={playRecording}
                        className="h-16 w-16 rounded-full bg-primary-500 items-center justify-center"
                      >
                        <MaterialIcons
                          name={isPlaying ? 'pause' : 'play-arrow'}
                          size={32}
                          color="#FFFFFF"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={toggleRecording}
                        className={`h-12 w-12 rounded-full items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
                      >
                        <MaterialIcons name="replay" size={24} color={isDark ? '#94A3B8' : '#64748B'} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text className={`text-sm mt-4 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Recording saved. You can play it back or re-record.
                  </Text>
                </>
              )}
            </View>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <View>
              <Text
                className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'
                  }`}
              >
                Add Photos
              </Text>
              <Text
                className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
              >
                Take or upload up to 5 photos
              </Text>

              {/* Upload Area */}
              <TouchableOpacity
                onPress={handlePickImage}
                className={`border-2 border-dashed rounded-xl p-8 items-center ${isDark ? 'border-slate-600' : 'border-slate-300'
                  }`}
              >
                <MaterialIcons
                  name="photo-camera"
                  size={48}
                  color={isDark ? '#64748B' : '#94A3B8'}
                />
                <Text
                  className={`text-base font-semibold mt-4 ${isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                >
                  Tap to take photo or upload
                </Text>
                <Text
                  className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                >
                  Or choose from library
                </Text>
              </TouchableOpacity>

              {/* Action Buttons */}
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={handleTakePhoto}
                  className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'
                    }`}
                >
                  <MaterialIcons
                    name="camera-alt"
                    size={20}
                    color={isDark ? '#94A3B8' : '#64748B'}
                  />
                  <Text
                    className={`ml-2 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                  >
                    Take Photo
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handlePickImage}
                  className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'
                    }`}
                >
                  <MaterialIcons
                    name="photo-library"
                    size={20}
                    color={isDark ? '#94A3B8' : '#64748B'}
                  />
                  <Text
                    className={`ml-2 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                  >
                    Gallery
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Photo Grid */}
              {photos.length > 0 && (
                <View className="mt-4">
                  <Text
                    className={`text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    {photos.length} of 5 photos
                  </Text>
                  <View className="flex-row flex-wrap gap-3">
                    {photos.map((photo, index) => (
                      <View key={index} className="relative">
                        <Image
                          source={{ uri: photo }}
                          className="h-24 w-24 rounded-xl"
                        />
                        <TouchableOpacity
                          onPress={() => handleRemovePhoto(index)}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 items-center justify-center"
                        >
                          <MaterialIcons name="close" size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                        {index === 0 && (
                          <View className="absolute bottom-1 left-1 px-2 py-0.5 rounded bg-primary-500">
                            <Text className="text-xs text-white font-semibold">
                              Main
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View
          className={`px-4 py-4 border-t ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
            }`}
        >
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!isValid}
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}