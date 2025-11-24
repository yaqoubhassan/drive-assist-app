import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../../../src/context/ThemeContext';
import { Card, Button, Badge, EmptyState } from '../../../src/components/common';

interface Document {
  id: string;
  name: string;
  type: 'license' | 'certification' | 'insurance' | 'id' | 'other';
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  uploadedAt: string;
  expiresAt?: string;
  fileUri?: string;
  fileName?: string;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Business Registration',
    type: 'license',
    status: 'verified',
    uploadedAt: 'Nov 10, 2024',
    fileName: 'business_reg.pdf',
  },
  {
    id: '2',
    name: 'Mechanic Certification',
    type: 'certification',
    status: 'verified',
    uploadedAt: 'Nov 10, 2024',
    expiresAt: 'Nov 10, 2025',
    fileName: 'mechanic_cert.pdf',
  },
  {
    id: '3',
    name: 'National ID (Ghana Card)',
    type: 'id',
    status: 'verified',
    uploadedAt: 'Nov 10, 2024',
    fileName: 'ghana_card.jpg',
  },
  {
    id: '4',
    name: 'Liability Insurance',
    type: 'insurance',
    status: 'pending',
    uploadedAt: 'Nov 20, 2024',
    expiresAt: 'Nov 20, 2025',
    fileName: 'insurance_policy.pdf',
  },
];

const documentTypes = [
  { id: 'license', name: 'Business License', icon: 'business' as const, required: true },
  { id: 'certification', name: 'Professional Certification', icon: 'workspace-premium' as const, required: true },
  { id: 'id', name: 'National ID', icon: 'badge' as const, required: true },
  { id: 'insurance', name: 'Liability Insurance', icon: 'security' as const, required: false },
  { id: 'other', name: 'Other Documents', icon: 'description' as const, required: false },
];

export default function DocumentsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'rejected':
        return '#EF4444';
      case 'expired':
        return '#64748B';
      default:
        return '#64748B';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge label="Verified" variant="success" size="sm" />;
      case 'pending':
        return <Badge label="Pending Review" variant="warning" size="sm" />;
      case 'rejected':
        return <Badge label="Rejected" variant="error" size="sm" />;
      case 'expired':
        return <Badge label="Expired" variant="default" size="sm" />;
      default:
        return null;
    }
  };

  const getDocumentIcon = (type: string): keyof typeof MaterialIcons.glyphMap => {
    const docType = documentTypes.find((d) => d.id === type);
    return docType?.icon || 'description';
  };

  const handlePickDocument = async (type: string) => {
    Alert.alert(
      'Upload Document',
      'Choose how to upload your document',
      [
        {
          text: 'Take Photo',
          onPress: () => handleCameraUpload(type),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => handleGalleryUpload(type),
        },
        {
          text: 'Choose File',
          onPress: () => handleFileUpload(type),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleCameraUpload = async (type: string) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      addDocument(type, result.assets[0].uri, 'photo.jpg');
    }
  };

  const handleGalleryUpload = async (type: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow photo library access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const fileName = result.assets[0].uri.split('/').pop() || 'document.jpg';
      addDocument(type, result.assets[0].uri, fileName);
    }
  };

  const handleFileUpload = async (type: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        addDocument(type, result.assets[0].uri, result.assets[0].name);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const addDocument = async (type: string, uri: string, fileName: string) => {
    setUploading(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const docType = documentTypes.find((d) => d.id === type);
    const newDoc: Document = {
      id: Date.now().toString(),
      name: docType?.name || 'Document',
      type: type as Document['type'],
      status: 'pending',
      uploadedAt: new Date().toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      fileUri: uri,
      fileName,
    };

    setDocuments([...documents, newDoc]);
    setUploading(false);
    setSelectedType(null);

    Alert.alert('Success', 'Document uploaded successfully. It will be reviewed within 24-48 hours.');
  };

  const handleDeleteDocument = (docId: string) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setDocuments(documents.filter((d) => d.id !== docId)),
        },
      ]
    );
  };

  const verifiedCount = documents.filter((d) => d.status === 'verified').length;
  const requiredCount = documentTypes.filter((d) => d.required).length;

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      {/* Header */}
      <View className={`flex-row items-center px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center mr-2"
        >
          <MaterialIcons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Documents
          </Text>
          <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {verifiedCount} of {requiredCount} required verified
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Verification Progress */}
        <View className="px-4 py-4">
          <Card variant="default">
            <View className="flex-row items-center mb-3">
              <MaterialIcons
                name={verifiedCount >= requiredCount ? 'verified' : 'pending'}
                size={24}
                color={verifiedCount >= requiredCount ? '#10B981' : '#F59E0B'}
              />
              <Text className={`ml-2 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {verifiedCount >= requiredCount ? 'Profile Verified' : 'Verification In Progress'}
              </Text>
            </View>
            <Text className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {verifiedCount >= requiredCount
                ? 'All required documents have been verified. You can receive leads.'
                : 'Upload and verify required documents to start receiving leads.'}
            </Text>
            <View className={`h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
              <View
                className="h-full rounded-full bg-green-500"
                style={{ width: `${(verifiedCount / requiredCount) * 100}%` }}
              />
            </View>
          </Card>
        </View>

        {/* Document Types */}
        <View className="px-4 pb-4">
          <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Required Documents
          </Text>
          <View className="gap-3">
            {documentTypes.filter((t) => t.required).map((docType) => {
              const existingDoc = documents.find((d) => d.type === docType.id);

              return (
                <Card key={docType.id} variant="default">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View
                        className="h-12 w-12 rounded-xl items-center justify-center mr-3"
                        style={{
                          backgroundColor: existingDoc
                            ? getStatusColor(existingDoc.status) + '20'
                            : isDark
                              ? '#1E293B'
                              : '#F1F5F9',
                        }}
                      >
                        <MaterialIcons
                          name={docType.icon}
                          size={24}
                          color={existingDoc ? getStatusColor(existingDoc.status) : '#64748B'}
                        />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {docType.name}
                          </Text>
                          {existingDoc && getStatusBadge(existingDoc.status)}
                        </View>
                        {existingDoc ? (
                          <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {existingDoc.fileName} • {existingDoc.uploadedAt}
                          </Text>
                        ) : (
                          <Text className="text-sm text-orange-500">Required</Text>
                        )}
                      </View>
                    </View>

                    {existingDoc ? (
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => handlePickDocument(docType.id)}
                          className={`h-8 w-8 rounded-lg items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
                        >
                          <MaterialIcons name="refresh" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteDocument(existingDoc.id)}
                          className={`h-8 w-8 rounded-lg items-center justify-center ${isDark ? 'bg-red-500/20' : 'bg-red-50'}`}
                        >
                          <MaterialIcons name="delete" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handlePickDocument(docType.id)}
                        className="h-10 px-4 rounded-lg bg-primary-500 items-center justify-center flex-row"
                      >
                        <MaterialIcons name="upload" size={18} color="#FFFFFF" />
                        <Text className="text-white font-semibold ml-1">Upload</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Card>
              );
            })}
          </View>
        </View>

        {/* Optional Documents */}
        <View className="px-4 pb-8">
          <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Optional Documents
          </Text>
          <View className="gap-3">
            {documentTypes.filter((t) => !t.required).map((docType) => {
              const existingDoc = documents.find((d) => d.type === docType.id);

              return (
                <Card key={docType.id} variant="default">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View
                        className="h-12 w-12 rounded-xl items-center justify-center mr-3"
                        style={{
                          backgroundColor: existingDoc
                            ? getStatusColor(existingDoc.status) + '20'
                            : isDark
                              ? '#1E293B'
                              : '#F1F5F9',
                        }}
                      >
                        <MaterialIcons
                          name={docType.icon}
                          size={24}
                          color={existingDoc ? getStatusColor(existingDoc.status) : '#64748B'}
                        />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {docType.name}
                          </Text>
                          {existingDoc && getStatusBadge(existingDoc.status)}
                        </View>
                        {existingDoc ? (
                          <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {existingDoc.fileName} • {existingDoc.uploadedAt}
                          </Text>
                        ) : (
                          <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Optional - adds credibility
                          </Text>
                        )}
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => existingDoc ? handleDeleteDocument(existingDoc.id) : handlePickDocument(docType.id)}
                      className={`h-8 w-8 rounded-lg items-center justify-center ${existingDoc
                        ? isDark
                          ? 'bg-red-500/20'
                          : 'bg-red-50'
                        : isDark
                          ? 'bg-slate-800'
                          : 'bg-slate-100'
                        }`}
                    >
                      <MaterialIcons
                        name={existingDoc ? 'delete' : 'add'}
                        size={18}
                        color={existingDoc ? '#EF4444' : isDark ? '#94A3B8' : '#64748B'}
                      />
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>

        {/* Info Card */}
        <View className="px-4 pb-8">
          <Card variant="default" className="bg-blue-500/10 border border-blue-500/20">
            <View className="flex-row">
              <MaterialIcons name="info" size={20} color="#3B82F6" />
              <View className="flex-1 ml-3">
                <Text className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Document Guidelines
                </Text>
                <Text className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  • Documents must be clear and readable{'\n'}
                  • PDFs and images (JPG, PNG) accepted{'\n'}
                  • Maximum file size: 10MB{'\n'}
                  • Review takes 24-48 hours
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}