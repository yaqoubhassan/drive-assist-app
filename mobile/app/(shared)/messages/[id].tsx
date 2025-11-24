import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { Avatar } from '../../../src/components/common';

interface Message {
  id: string;
  text: string;
  time: string;
  sender: 'me' | 'other';
  read: boolean;
}

const mockMessages: Message[] = [
  { id: '1', text: 'Hi, I saw your listing. Can you help with my engine problem?', time: '10:30 AM', sender: 'other', read: true },
  { id: '2', text: 'Yes, I can definitely help! What symptoms are you experiencing?', time: '10:32 AM', sender: 'me', read: true },
  { id: '3', text: 'The car overheats after about 20 minutes of driving. The temperature gauge goes to red.', time: '10:35 AM', sender: 'other', read: true },
  { id: '4', text: 'That sounds like it could be a coolant leak or thermostat issue. Have you noticed any coolant smell or leaks under the car?', time: '10:38 AM', sender: 'me', read: true },
  { id: '5', text: 'Yes! There\'s a sweet smell coming from the engine. I also saw some greenish liquid under the car yesterday.', time: '10:40 AM', sender: 'other', read: true },
  { id: '6', text: 'That confirms a coolant leak. I can fix this for you. When are you available to bring the car in?', time: '10:42 AM', sender: 'me', read: true },
  { id: '7', text: 'I\'m free tomorrow afternoon. Where should I bring it?', time: '10:45 AM', sender: 'other', read: true },
  { id: '8', text: 'You can bring it to my workshop in East Legon. I\'ll send you the location pin. 2 PM works?', time: '10:47 AM', sender: 'me', read: true },
  { id: '9', text: 'Perfect! 2 PM works. How much will it cost?', time: '10:50 AM', sender: 'other', read: true },
  { id: '10', text: 'I\'ll need to inspect it first, but typically coolant leak repairs range from GH₵300-800 depending on the severity. I\'ll give you an exact quote after the inspection.', time: '10:52 AM', sender: 'me', read: true },
  { id: '11', text: 'Thanks! The car is running great now.', time: '11:30 AM', sender: 'other', read: false },
];

const conversationInfo = {
  id: '1',
  name: 'Kwame Asante',
  online: true,
  type: 'driver' as const,
};

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      sender: 'me',
      read: false,
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = (msg: Message, index: number) => {
    const isMe = msg.sender === 'me';
    const showAvatar = !isMe && (index === 0 || messages[index - 1].sender === 'me');

    return (
      <View
        key={msg.id}
        className={`flex-row mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}
      >
        {!isMe && (
          <View className="w-8 mr-2">
            {showAvatar && <Avatar size="sm" name={conversationInfo.name} />}
          </View>
        )}

        <View
          className={`max-w-[75%] px-4 py-3 rounded-2xl ${
            isMe
              ? 'bg-primary-500 rounded-br-md'
              : isDark
              ? 'bg-slate-800 rounded-bl-md'
              : 'bg-white rounded-bl-md'
          }`}
        >
          <Text className={`${isMe ? 'text-white' : isDark ? 'text-white' : 'text-slate-900'}`}>
            {msg.text}
          </Text>
          <View className={`flex-row items-center justify-end mt-1 ${isMe ? '' : ''}`}>
            <Text
              className={`text-xs ${
                isMe ? 'text-white/70' : isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {msg.time}
            </Text>
            {isMe && (
              <MaterialIcons
                name={msg.read ? 'done-all' : 'done'}
                size={14}
                color={msg.read ? '#60A5FA' : 'rgba(255,255,255,0.7)'}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      {/* Header */}
      <View className={`flex-row items-center px-4 py-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
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

        <TouchableOpacity className="flex-row items-center flex-1">
          <View className="relative">
            <Avatar size="md" name={conversationInfo.name} />
            {conversationInfo.online && (
              <View className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-slate-900" />
            )}
          </View>
          <View className="ml-3">
            <View className="flex-row items-center">
              <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {conversationInfo.name}
              </Text>
              {conversationInfo.type === 'expert' && (
                <MaterialIcons name="verified" size={14} color="#3B82F6" style={{ marginLeft: 4 }} />
              )}
            </View>
            <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {conversationInfo.online ? 'Online' : 'Offline'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="h-10 w-10 items-center justify-center">
          <MaterialIcons name="phone" size={22} color={isDark ? '#FFFFFF' : '#111827'} />
        </TouchableOpacity>
        <TouchableOpacity className="h-10 w-10 items-center justify-center">
          <MaterialIcons name="more-vert" size={22} color={isDark ? '#FFFFFF' : '#111827'} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
        >
          {/* Date Divider */}
          <View className="items-center mb-4">
            <View className={`px-3 py-1 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
              <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Today
              </Text>
            </View>
          </View>

          {messages.map((msg, index) => renderMessage(msg, index))}
        </ScrollView>

        {/* Input Area */}
        <View className={`px-4 py-3 border-t ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <View className={`flex-row items-end rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <TouchableOpacity className="h-12 w-12 items-center justify-center">
              <MaterialIcons
                name="attach-file"
                size={22}
                color={isDark ? '#94A3B8' : '#64748B'}
              />
            </TouchableOpacity>

            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              multiline
              maxLength={1000}
              className={`flex-1 py-3 max-h-24 ${isDark ? 'text-white' : 'text-slate-900'}`}
            />

            <TouchableOpacity className="h-12 w-12 items-center justify-center">
              <MaterialIcons
                name="camera-alt"
                size={22}
                color={isDark ? '#94A3B8' : '#64748B'}
              />
            </TouchableOpacity>

            {message.trim() ? (
              <TouchableOpacity
                onPress={handleSend}
                className="h-10 w-10 rounded-full bg-primary-500 items-center justify-center mr-1 mb-1"
              >
                <MaterialIcons name="send" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity className="h-12 w-12 items-center justify-center">
                <MaterialIcons
                  name="mic"
                  size={22}
                  color={isDark ? '#94A3B8' : '#64748B'}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
