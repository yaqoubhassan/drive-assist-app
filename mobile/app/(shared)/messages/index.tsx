import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { Card, Avatar, Badge, SearchBar, EmptyState } from '../../../src/components/common';

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  type: 'driver' | 'expert';
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'Kwame Asante',
    lastMessage: 'Thanks! The car is running great now.',
    time: '10 min ago',
    unread: 2,
    online: true,
    type: 'driver',
  },
  {
    id: '2',
    name: 'Emmanuel Auto Services',
    lastMessage: 'I can come by tomorrow at 2 PM. Does that work?',
    time: '1 hour ago',
    unread: 1,
    online: true,
    type: 'expert',
  },
  {
    id: '3',
    name: 'Ama Serwaa',
    lastMessage: 'When can I bring my car in for the brake job?',
    time: '3 hours ago',
    unread: 0,
    online: false,
    type: 'driver',
  },
  {
    id: '4',
    name: 'Quick Fix Garage',
    lastMessage: 'The parts have arrived. Ready when you are.',
    time: 'Yesterday',
    unread: 0,
    online: false,
    type: 'expert',
  },
  {
    id: '5',
    name: 'Kofi Mensah',
    lastMessage: 'How much would it cost to repair the AC?',
    time: '2 days ago',
    unread: 0,
    online: true,
    type: 'driver',
  },
  {
    id: '6',
    name: 'Premium Auto Care',
    lastMessage: 'Your car is ready for pickup!',
    time: '3 days ago',
    unread: 0,
    online: false,
    type: 'expert',
  },
];

export default function MessagesScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredConversations = mockConversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const totalUnread = mockConversations.reduce((sum, c) => sum + c.unread, 0);

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      {/* Header */}
      <View className={`px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center"
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={isDark ? '#FFFFFF' : '#111827'}
            />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Messages
            </Text>
            {totalUnread > 0 && (
              <View className="bg-primary-500 h-6 min-w-[24px] rounded-full items-center justify-center ml-2">
                <Text className="text-white text-xs font-bold px-2">{totalUnread}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity className="h-10 w-10 items-center justify-center">
            <MaterialIcons
              name="edit"
              size={24}
              color={isDark ? '#FFFFFF' : '#111827'}
            />
          </TouchableOpacity>
        </View>

        <SearchBar
          placeholder="Search messages..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Conversations List */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredConversations.length > 0 ? (
          <View className="px-4 py-2">
            {filteredConversations.map((conversation) => (
              <TouchableOpacity
                key={conversation.id}
                onPress={() => router.push(`/(shared)/messages/${conversation.id}`)}
                className={`flex-row items-center py-4 ${
                  conversation.id !== filteredConversations[filteredConversations.length - 1].id
                    ? `border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`
                    : ''
                }`}
              >
                {/* Avatar with online indicator */}
                <View className="relative">
                  <Avatar
                    size="lg"
                    source={conversation.avatar ? { uri: conversation.avatar } : undefined}
                    name={conversation.name}
                  />
                  {conversation.online && (
                    <View className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-white dark:border-slate-900" />
                  )}
                </View>

                {/* Content */}
                <View className="flex-1 ml-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <Text
                        className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}
                        numberOfLines={1}
                      >
                        {conversation.name}
                      </Text>
                      {conversation.type === 'expert' && (
                        <MaterialIcons name="verified" size={14} color="#3B82F6" style={{ marginLeft: 4 }} />
                      )}
                    </View>
                    <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {conversation.time}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between mt-1">
                    <Text
                      className={`text-sm flex-1 mr-2 ${
                        conversation.unread > 0
                          ? isDark
                            ? 'text-white font-medium'
                            : 'text-slate-900 font-medium'
                          : isDark
                          ? 'text-slate-400'
                          : 'text-slate-500'
                      }`}
                      numberOfLines={1}
                    >
                      {conversation.lastMessage}
                    </Text>
                    {conversation.unread > 0 && (
                      <View className="bg-primary-500 h-5 min-w-[20px] rounded-full items-center justify-center">
                        <Text className="text-white text-xs font-bold px-1.5">{conversation.unread}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <EmptyState
            icon="chat"
            title="No Messages"
            description={searchQuery ? 'No conversations match your search.' : 'Your messages will appear here.'}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
