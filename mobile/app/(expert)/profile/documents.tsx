import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import { Card, Button, Badge } from '../../../src/components/common';
import { KycStatus } from '../../../src/types';

interface Document {
  id: string;
  name: string;
  type: 'business_license' | 'identity' | 'insurance' | 'certification' | 'other';
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  uploadedAt: string;
  expiresAt?: string;
  fileUri?: string;
  fileName?: string;
  rejectionReason?: string;
}

const documentTypes = [
  {
    id: 'business_license',
    name: 'Business License',
    description: 'Your business registration or license',
    icon: 'business' as const,
    required: true,
    step: 1,
  },
  {
    id: 'identity',
    name: 'Identity Document',
    description: 'Ghana Card, Passport, or Driver\'s License',
    icon: 'badge' as const,
    required: true,
    step: 2,
  },
  {
    id: 'insurance',
    name: 'Liability Insurance',
    description: 'Business or professional liability insurance',
    icon: 'security' as const,
    required: false,
    step: 3,
  },
  {
    id: 'certification',
    name: 'Professional Certification',
    description: 'Trade or professional certifications',
    icon: 'workspace-premium' as const,
    required: false,
    step: 4,
  },
];

// Mock initial documents (would come from API)
const initialDocuments: Document[] = [];

export default function DocumentsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { kycStatus, updateKycStatus } = useAuth();
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [uploading, setUploading] = useState(false);

  const getKycStatusConfig = (status: KycStatus) => {
    switch (status) {
      case 'approved':
        return {
          icon: 'verified',
          color: '#10B981',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          title: 'KYC Approved',
          description: 'Your account is fully verified. You can access all features.',
        };
      case 'under_review':
      case 'submitted':
        return {
          icon: 'hourglass-empty',
          color: '#F59E0B',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
          title: 'Under Review',
          description: 'Your documents are being reviewed. This usually takes 24-48 hours.',
        };
      case 'rejected':
        return {
          icon: 'cancel',
          color: '#EF4444',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          title: 'Verification Rejected',
          description: 'Please review the feedback and resubmit your documents.',
        };
      case 'resubmission_required':
        return {
          icon: 'refresh',
          color: '#F97316',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/20',
          title: 'Resubmission Required',
          description: 'Some documents need to be updated. Please check the feedback.',
        };
      default:
        return {
          icon: 'assignment',
          color: '#3B82F6',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          title: 'Complete Your KYC',
          description: 'Upload required documents to unlock all features and get verified.',
        };
    }
  };

  const kycConfig = getKycStatusConfig(kycStatus);

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

  const handlePickDocument = async (type: string) => {
    Alert.alert(
      'Upload Document',
      'Choose how to upload your document',
      [
        { text: 'Take Photo', onPress: () => handleCameraUpload(type) },
        { text: 'Choose from Gallery', onPress: () => handleGalleryUpload(type) },
        { text: 'Choose File', onPress: () => handleFileUpload(type) },
        { text: 'Cancel', style: 'cancel' },
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
        year: 'numeric',
      }),
      fileUri: uri,
      fileName,
    };

    // Remove existing document of same type if exists
    const filteredDocs = documents.filter((d) => d.type !== type);
    setDocuments([...filteredDocs, newDoc]);
    setUploading(false);

    // Update KYC status to in_progress if not already submitted
    if (kycStatus === 'not_started') {
      await updateKycStatus('in_progress');
    }

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

  const handleSubmitKyc = async () => {
    const requiredDocs = documentTypes.filter((d) => d.required);
    const uploadedRequired = requiredDocs.filter((d) =>
      documents.some((doc) => doc.type === d.id)
    );

    if (uploadedRequired.length < requiredDocs.length) {
      Alert.alert(
        'Missing Documents',
        'Please upload all required documents before submitting for verification.'
      );
      return;
    }

    Alert.alert(
      'Submit for Verification',
      'Your documents will be reviewed by our team. This usually takes 24-48 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            await updateKycStatus('submitted');
            Alert.alert(
              'Submitted',
              'Your KYC documents have been submitted for review. We\'ll notify you once the review is complete.'
            );
          },
        },
      ]
    );
  };

  const verifiedCount = documents.filter((d) => d.status === 'verified').length;
  const requiredCount = documentTypes.filter((d) => d.required).length;
  const uploadedRequiredCount = documentTypes
    .filter((d) => d.required)
    .filter((d) => documents.some((doc) => doc.type === d.id)).length;
  const completionPercentage = Math.round((uploadedRequiredCount / requiredCount) * 100);

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
            KYC Verification
          </Text>
          <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {completionPercentage}% complete
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* KYC Status Banner */}
        <View className="px-4 pt-4">
          <View className={`p-4 rounded-xl ${kycConfig.bgColor} border ${kycConfig.borderColor}`}>
            <View className="flex-row items-start">
              <View
                className="h-12 w-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: kycConfig.color + '20' }}
              >
                <MaterialIcons name={kycConfig.icon as any} size={24} color={kycConfig.color} />
              </View>
              <View className="flex-1">
                <Text className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {kycConfig.title}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {kycConfig.description}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            {kycStatus !== 'approved' && (
              <View className="mt-4">
                <View className="flex-row justify-between mb-2">
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {uploadedRequiredCount} of {requiredCount} required documents
                  </Text>
                  <Text className="text-sm font-semibold" style={{ color: kycConfig.color }}>
                    {completionPercentage}%
                  </Text>
                </View>
                <View className={`h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  <View
                    className="h-full rounded-full"
                    style={{ width: `${completionPercentage}%`, backgroundColor: kycConfig.color }}
                  />
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Benefits of KYC */}
        {kycStatus !== 'approved' && (
          <View className="px-4 pt-4">
            <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              VERIFICATION BENEFITS
            </Text>
            <View className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
              <View className="gap-3">
                <View className="flex-row items-center">
                  <MaterialIcons name="verified" size={20} color="#10B981" />
                  <Text className={`ml-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Verified badge on your profile
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <MaterialIcons name="visibility" size={20} color="#3B82F6" />
                  <Text className={`ml-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Higher visibility in search results
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <MaterialIcons name="star" size={20} color="#F59E0B" />
                  <Text className={`ml-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Access to premium leads
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <MaterialIcons name="account-balance-wallet" size={20} color="#8B5CF6" />
                  <Text className={`ml-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Withdraw earnings to your account
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Required Documents */}
        <View className="px-4 pt-6">
          <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            REQUIRED DOCUMENTS
          </Text>
          <View className="gap-3">
            {documentTypes.filter((t) => t.required).map((docType) => {
              const existingDoc = documents.find((d) => d.type === docType.id);

              return (
                <Card key={docType.id} variant="default">
                  <View className="flex-row items-start">
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
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {docType.name}
                        </Text>
                        {existingDoc && getStatusBadge(existingDoc.status)}
                      </View>
                      <Text className={`text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {docType.description}
                      </Text>
                      {existingDoc ? (
                        <View className="flex-row items-center justify-between">
                          <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {existingDoc.fileName} • {existingDoc.uploadedAt}
                          </Text>
                          <View className="flex-row gap-2">
                            <TouchableOpacity
                              onPress={() => handlePickDocument(docType.id)}
                              className={`px-3 py-1 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}
                            >
                              <Text className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                Replace
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => handlePickDocument(docType.id)}
                          disabled={uploading}
                          className="flex-row items-center justify-center py-2 px-4 rounded-lg bg-primary-500 self-start"
                        >
                          <MaterialIcons name="cloud-upload" size={18} color="#FFFFFF" />
                          <Text className="text-white font-semibold ml-2">Upload</Text>
                        </TouchableOpacity>
                      )}
                      {existingDoc?.status === 'rejected' && existingDoc.rejectionReason && (
                        <View className="mt-2 p-2 rounded-lg bg-red-500/10">
                          <Text className="text-red-500 text-sm">{existingDoc.rejectionReason}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>

        {/* Optional Documents */}
        <View className="px-4 pt-6 pb-4">
          <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            OPTIONAL DOCUMENTS
          </Text>
          <View className="gap-3">
            {documentTypes.filter((t) => !t.required).map((docType) => {
              const existingDoc = documents.find((d) => d.type === docType.id);

              return (
                <Card key={docType.id} variant="default">
                  <View className="flex-row items-start">
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
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {docType.name}
                        </Text>
                        {existingDoc && getStatusBadge(existingDoc.status)}
                        {!existingDoc && (
                          <View className="px-2 py-0.5 rounded bg-slate-500/20">
                            <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              Optional
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className={`text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {docType.description}
                      </Text>
                      {existingDoc ? (
                        <View className="flex-row items-center justify-between">
                          <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {existingDoc.fileName} • {existingDoc.uploadedAt}
                          </Text>
                          <TouchableOpacity
                            onPress={() => handleDeleteDocument(existingDoc.id)}
                            className="px-3 py-1 rounded-lg bg-red-500/10"
                          >
                            <Text className="text-red-500 text-sm">Remove</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => handlePickDocument(docType.id)}
                          disabled={uploading}
                          className={`flex-row items-center justify-center py-2 px-4 rounded-lg self-start ${
                            isDark ? 'bg-slate-700' : 'bg-slate-100'
                          }`}
                        >
                          <MaterialIcons name="add" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
                          <Text className={`font-medium ml-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            Add
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>

        {/* Submit Button */}
        {kycStatus !== 'approved' && kycStatus !== 'submitted' && kycStatus !== 'under_review' && (
          <View className="px-4 pb-8">
            <Button
              title="Submit for Verification"
              onPress={handleSubmitKyc}
              disabled={uploadedRequiredCount < requiredCount}
              fullWidth
              icon={<MaterialIcons name="send" size={20} color="#FFFFFF" />}
            />
            {uploadedRequiredCount < requiredCount && (
              <Text className={`text-center text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Upload all required documents to submit
              </Text>
            )}
          </View>
        )}

        {/* Document Guidelines */}
        <View className="px-4 pb-8">
          <Card variant="default">
            <View className="flex-row items-start">
              <MaterialIcons name="lightbulb" size={20} color="#F59E0B" />
              <View className="flex-1 ml-3">
                <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Document Guidelines
                </Text>
                <View className="gap-1">
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    • Ensure documents are clear and readable
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    • PDFs and images (JPG, PNG) accepted
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    • Maximum file size: 10MB per document
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    • Review typically takes 24-48 hours
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
