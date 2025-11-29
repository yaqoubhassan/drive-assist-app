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
import * as Speech from 'expo-speech';
import { useTheme } from '../../../src/context/ThemeContext';
import { useDiagnosis } from '../../../src/context/DiagnosisContext';
import { Button } from '../../../src/components/common';

type InputTab = 'text' | 'voice';

const suggestionPrompts = [
  'When did it start?',
  'Any strange noises?',
  'Does it happen all the time or only sometimes?',
  'Any warning lights on?',
];

export default function DiagnoseDescribeScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const { isDark } = useTheme();
  const { input, updateInput, isGuest } = useDiagnosis();

  const [activeTab, setActiveTab] = useState<InputTab>('text');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  // Use context value for persistence across navigation
  const [recordedUri, setRecordedUri] = useState<string | null>(input.voiceRecordingUri || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  // Restore from context when component mounts
  useEffect(() => {
    if (input.voiceRecordingUri && !recordedUri) {
      setRecordedUri(input.voiceRecordingUri);
      // Switch to voice tab if there's a recording
      setActiveTab('voice');
    }
    if (input.description && !description) {
      setDescription(input.description);
    }
    if (input.photos && input.photos.length > 0 && photos.length === 0) {
      setPhotos(input.photos);
    }
  }, []);

  // Speech-to-text states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // expo-audio hooks
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const audioPlayer = useAudioPlayer(recordedUri ? { uri: recordedUri } : null);

  // Refs to track latest state for interval callbacks (avoids stale closures)
  const audioPlayerRef = useRef(audioPlayer);
  const isPlayingRef = useRef(false);

  // Keep ref in sync with hook value
  useEffect(() => {
    audioPlayerRef.current = audioPlayer;
  }, [audioPlayer]);

  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
      Speech.stop();
    };
  }, []);

  // Reset states when audioPlayer changes (new player or null)
  useEffect(() => {
    // Clear interval when player changes
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }

    // Reset states
    setIsPlaying(false);
    isPlayingRef.current = false;
    setPlaybackPosition(0);

    // Update duration if player has it
    if (audioPlayer?.duration) {
      setPlaybackDuration(audioPlayer.duration);
    } else {
      setPlaybackDuration(recordingDuration);
    }
  }, [audioPlayer]);

  // Update duration when it becomes available
  useEffect(() => {
    if (audioPlayer?.duration) {
      setPlaybackDuration(audioPlayer.duration);
    }
  }, [audioPlayer?.duration]);

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

  // Track playback status with interval for smooth progress
  useEffect(() => {
    // Clear any existing interval first
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }

    if (isPlaying && recordedUri && audioPlayerRef.current) {
      // Update position every 100ms for smooth progress
      playbackTimerRef.current = setInterval(() => {
        try {
          const player = audioPlayerRef.current;
          // Check if player is still valid
          if (!player || !isPlayingRef.current) {
            if (playbackTimerRef.current) {
              clearInterval(playbackTimerRef.current);
              playbackTimerRef.current = null;
            }
            return;
          }

          const currentTime = player.currentTime;
          const duration = player.duration;

          if (currentTime !== undefined && currentTime !== null) {
            setPlaybackPosition(currentTime);
          }

          // Update duration if not set
          if (duration && duration > 0) {
            setPlaybackDuration(duration);
          }

          // Check if playback finished
          if (duration && duration > 0 && currentTime >= duration - 0.1) {
            setIsPlaying(false);
            isPlayingRef.current = false;
            setPlaybackPosition(0);
            if (playbackTimerRef.current) {
              clearInterval(playbackTimerRef.current);
              playbackTimerRef.current = null;
            }
          }
        } catch (error) {
          // Player was likely released, stop the interval
          console.log('Playback tracking stopped:', error);
          setIsPlaying(false);
          isPlayingRef.current = false;
          if (playbackTimerRef.current) {
            clearInterval(playbackTimerRef.current);
            playbackTimerRef.current = null;
          }
        }
      }, 100);
    }

    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    };
  }, [isPlaying, recordedUri]);

  const formatTime = (seconds: number) => {
    const totalSeconds = Math.floor(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
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

      // Save to context for persistence across navigation
      if (uri) {
        updateInput({ voiceRecordingUri: uri });
      }
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
    const player = audioPlayerRef.current;
    if (!recordedUri || !player) return;

    try {
      // Set audio mode for playback
      await AudioModule.setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
        isPlayingRef.current = false;
      } else {
        // Reset to start if at end
        if (playbackPosition >= playbackDuration && playbackDuration > 0) {
          player.seekTo(0);
          setPlaybackPosition(0);
        }
        player.play();
        setIsPlaying(true);
        isPlayingRef.current = true;
      }
    } catch (err) {
      console.error('Failed to play recording:', err);
      Alert.alert('Error', 'Failed to play recording. Please try again.');
    }
  };

  const deleteRecording = () => {
    // Stop playback tracking first
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    setIsPlaying(false);
    isPlayingRef.current = false;

    // Try to pause the player (hook manages lifecycle, don't call release)
    try {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    } catch (error) {
      // Player might already be released
      console.log('Player pause error:', error);
    }

    // Reset all states - setting recordedUri to null will cause hook to release player
    setRecordedUri(null);
    setRecordingDuration(0);
    setPlaybackDuration(0);
    setPlaybackPosition(0);

    // Clear from context as well
    updateInput({ voiceRecordingUri: undefined });
  };

  // Speech-to-text functions (requires development build)
  const startListening = () => {
    Alert.alert(
      'Development Build Required',
      'Speech-to-text functionality requires a development build. This feature is not available in Expo Go.\n\nTo use this feature, please create a development build of the app.',
      [{ text: 'OK' }]
    );
  };

  const stopListening = () => {
    setIsListening(false);
  };

  // Text-to-speech functions
  const speakText = async () => {
    if (!description.trim()) {
      Alert.alert('No Text', 'Please enter some text to read aloud.');
      return;
    }

    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      Speech.speak(description, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const handleContinue = () => {
    // Save to diagnosis context
    updateInput({
      category,
      description,
      photos,
      voiceRecordingUri: recordedUri || undefined,
    });

    // For guests, skip vehicle selection and go directly to review
    if (isGuest) {
      router.push({
        pathname: '/(driver)/diagnose/review',
        params: {
          category,
          description,
          isGuest: 'true',
        },
      });
    } else {
      // Authenticated users go to vehicle selection
      router.push({
        pathname: '/(driver)/diagnose/vehicle',
        params: {
          category,
          description,
          photos: JSON.stringify(photos),
          hasVoiceRecording: recordedUri ? 'true' : 'false',
        },
      });
    }
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

  // Valid if: (text >= 20 chars OR voice recording) - photos are optional but encouraged
  const hasDescription = description.length >= 20 || recordedUri !== null;
  const isValid = hasDescription;

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
            onPress={() => router.replace('/(driver)')}
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
            {/* Category Badge */}
            {category && (
              <View className="flex-row mt-3">
                <View className={`flex-row items-center px-3 py-1.5 rounded-full ${isDark ? 'bg-primary-500/20' : 'bg-primary-50'}`}>
                  <MaterialIcons name="category" size={14} color="#3B82F6" />
                  <Text className="text-primary-500 font-medium text-sm ml-1.5 capitalize">
                    {category === 'other' ? 'General Issue' : category}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Input Tabs - Text or Voice */}
          <View className="flex-row gap-2 py-4">
            {(['text', 'voice'] as InputTab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-xl items-center flex-row justify-center ${activeTab === tab
                  ? 'bg-primary-500'
                  : isDark
                    ? 'bg-slate-800'
                    : 'bg-slate-100'
                  }`}
              >
                <MaterialIcons
                  name={tab === 'text' ? 'edit' : 'mic'}
                  size={20}
                  color={activeTab === tab ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'}
                />
                <Text
                  className={`text-sm font-semibold ml-2 capitalize ${activeTab === tab
                    ? 'text-white'
                    : isDark
                      ? 'text-slate-300'
                      : 'text-slate-600'
                    }`}
                >
                  {tab === 'text' ? 'Type' : 'Record Voice'}
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
                  style={{ minHeight: 100 }}
                />
              </View>

              {/* Speech Controls */}
              <View className="flex-row items-center justify-between mt-3">
                <View className="flex-row items-center gap-2">
                  {/* Speech-to-text button */}
                  <TouchableOpacity
                    onPress={isListening ? stopListening : startListening}
                    className={`flex-row items-center px-4 py-2 rounded-full ${isListening
                        ? 'bg-red-500'
                        : isDark ? 'bg-slate-700' : 'bg-slate-200'
                      }`}
                  >
                    <MaterialIcons
                      name={isListening ? 'mic-off' : 'mic'}
                      size={18}
                      color={isListening ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'}
                    />
                    <Text
                      className={`ml-2 text-sm font-medium ${isListening
                          ? 'text-white'
                          : isDark ? 'text-slate-300' : 'text-slate-600'
                        }`}
                    >
                      {isListening ? 'Listening...' : 'Speak'}
                    </Text>
                  </TouchableOpacity>

                  {/* Text-to-speech button */}
                  <TouchableOpacity
                    onPress={speakText}
                    className={`flex-row items-center px-4 py-2 rounded-full ${isSpeaking
                        ? 'bg-primary-500'
                        : isDark ? 'bg-slate-700' : 'bg-slate-200'
                      }`}
                    disabled={!description.trim()}
                    style={{ opacity: description.trim() ? 1 : 0.5 }}
                  >
                    <MaterialIcons
                      name={isSpeaking ? 'stop' : 'volume-up'}
                      size={18}
                      color={isSpeaking ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'}
                    />
                    <Text
                      className={`ml-2 text-sm font-medium ${isSpeaking
                          ? 'text-white'
                          : isDark ? 'text-slate-300' : 'text-slate-600'
                        }`}
                    >
                      {isSpeaking ? 'Stop' : 'Listen'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text
                  className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                >
                  {description.length}/500
                </Text>
              </View>

              <View className="flex-row justify-between mt-1">
                <Text
                  className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                >
                  Min 20 characters
                </Text>
              </View>

              {/* Helper Prompts - Questions to answer */}
              <View className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <View className="flex-row items-center mb-3">
                  <MaterialIcons
                    name="help-outline"
                    size={18}
                    color={isDark ? '#94A3B8' : '#64748B'}
                  />
                  <Text className={`ml-2 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Try to answer these questions:
                  </Text>
                </View>
                <View className="gap-2">
                  {suggestionPrompts.map((prompt, index) => (
                    <View key={prompt} className="flex-row items-start">
                      <Text className={`mr-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {index + 1}.
                      </Text>
                      <Text className={`flex-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {prompt}
                      </Text>
                    </View>
                  ))}
                </View>
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

          {/* Photos Section - Always visible */}
          <View className={`mt-6 pt-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <MaterialIcons
                  name="photo-camera"
                  size={20}
                  color={isDark ? '#94A3B8' : '#64748B'}
                />
                <Text className={`ml-2 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Add Photos
                </Text>
                <Text className={`ml-2 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  (Optional)
                </Text>
              </View>
              {photos.length > 0 && (
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {photos.length}/5
                </Text>
              )}
            </View>

            <Text className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Photos help our AI better understand the issue
            </Text>

            {/* Photo Grid / Upload Buttons */}
            {photos.length === 0 ? (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleTakePhoto}
                  className={`flex-1 flex-row items-center justify-center py-4 rounded-xl border-2 border-dashed ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-300 bg-slate-50'
                    }`}
                >
                  <MaterialIcons
                    name="camera-alt"
                    size={24}
                    color={isDark ? '#94A3B8' : '#64748B'}
                  />
                  <Text className={`ml-2 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Camera
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handlePickImage}
                  className={`flex-1 flex-row items-center justify-center py-4 rounded-xl border-2 border-dashed ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-300 bg-slate-50'
                    }`}
                >
                  <MaterialIcons
                    name="photo-library"
                    size={24}
                    color={isDark ? '#94A3B8' : '#64748B'}
                  />
                  <Text className={`ml-2 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Gallery
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View className="flex-row flex-wrap gap-3">
                  {photos.map((photo, index) => (
                    <View key={index} className="relative">
                      <Image
                        source={{ uri: photo }}
                        className="h-20 w-20 rounded-xl"
                      />
                      <TouchableOpacity
                        onPress={() => handleRemovePhoto(index)}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 items-center justify-center"
                      >
                        <MaterialIcons name="close" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {photos.length < 5 && (
                    <TouchableOpacity
                      onPress={handlePickImage}
                      className={`h-20 w-20 rounded-xl items-center justify-center border-2 border-dashed ${isDark ? 'border-slate-700' : 'border-slate-300'
                        }`}
                    >
                      <MaterialIcons
                        name="add"
                        size={28}
                        color={isDark ? '#64748B' : '#94A3B8'}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Bottom spacing */}
          <View className="h-4" />
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