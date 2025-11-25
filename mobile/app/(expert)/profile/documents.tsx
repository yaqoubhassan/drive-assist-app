import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import { Card, Button, Badge } from '../../../src/components/common';
import { KycStatus } from '../../../src/types';

interface UploadedFile {
  uri: string;
  fileName: string;
  uploadedAt: string;
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
}

interface DocumentState {
  business_license?: UploadedFile;
  identity_front?: UploadedFile;
  identity_back?: UploadedFile;
  insurance?: UploadedFile;
  certification?: UploadedFile;
}

type IdentityDocType = 'ghana_card' | 'passport' | 'drivers_license' | '';

const identityDocTypes = [
  {
    id: 'ghana_card' as IdentityDocType,
    label: 'Ghana Card',
    icon: 'credit-card',
    requiresBack: true,
    frontLabel: 'Front of Ghana Card',
    backLabel: 'Back of Ghana Card',
  },
  {
    id: 'passport' as IdentityDocType,
    label: 'Passport',
    icon: 'book',
    requiresBack: false,
    frontLabel: 'Passport Bio Page',
    backLabel: '',
  },
  {
    id: 'drivers_license' as IdentityDocType,
    label: "Driver's License",
    icon: 'directions-car',
    requiresBack: true,
    frontLabel: "Front of Driver's License",
    backLabel: "Back of Driver's License",
  },
];

export default function DocumentsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { kycStatus, updateKycStatus } = useAuth();
  const insets = useSafeAreaInsets();

  const [documents, setDocuments] = useState<DocumentState>({});
  const [identityDocType, setIdentityDocType] = useState<IdentityDocType>('');
  const [uploading, setUploading] = useState<string | null>(null);
  const [showIdTypePicker, setShowIdTypePicker] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
      default:
        return '#64748B';
    }
  };

  const handlePickDocument = async (docKey: keyof DocumentState) => {
    Alert.alert('Upload Document', 'Choose how to upload your document', [
      { text: 'Take Photo', onPress: () => handleCameraUpload(docKey) },
      { text: 'Choose from Gallery', onPress: () => handleGalleryUpload(docKey) },
      { text: 'Choose File', onPress: () => handleFileUpload(docKey) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleCameraUpload = async (docKey: keyof DocumentState) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access to take photos.');
      return;
    }
    setUploading(docKey);
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await addDocument(docKey, result.assets[0].uri, 'photo.jpg');
    }
    setUploading(null);
  };

  const handleGalleryUpload = async (docKey: keyof DocumentState) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow photo library access.');
      return;
    }
    setUploading(docKey);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const fileName = result.assets[0].uri.split('/').pop() || 'document.jpg';
      await addDocument(docKey, result.assets[0].uri, fileName);
    }
    setUploading(null);
  };

  const handleFileUpload = async (docKey: keyof DocumentState) => {
    try {
      setUploading(docKey);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        await addDocument(docKey, result.assets[0].uri, result.assets[0].name);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const addDocument = async (docKey: keyof DocumentState, uri: string, fileName: string) => {
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newDoc: UploadedFile = {
      uri,
      fileName,
      uploadedAt: new Date().toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      status: 'pending',
    };

    setDocuments((prev) => ({ ...prev, [docKey]: newDoc }));

    // Update KYC status to in_progress if not already submitted
    if (kycStatus === 'not_started') {
      await updateKycStatus('in_progress');
    }
  };

  const handleDeleteDocument = (docKey: keyof DocumentState) => {
    Alert.alert('Delete Document', 'Are you sure you want to delete this document?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setDocuments((prev) => {
            const newDocs = { ...prev };
            delete newDocs[docKey];
            return newDocs;
          });
        },
      },
    ]);
  };

  const handleSubmitKyc = async () => {
    // Check required documents
    const hasBusinessLicense = !!documents.business_license;
    const hasIdentityFront = !!documents.identity_front;
    const selectedIdType = identityDocTypes.find((t) => t.id === identityDocType);
    const hasIdentityBack = !selectedIdType?.requiresBack || !!documents.identity_back;

    if (!hasBusinessLicense) {
      Alert.alert('Missing Document', 'Please upload your Business License.');
      return;
    }

    if (!identityDocType) {
      Alert.alert('Missing Selection', 'Please select your identity document type.');
      return;
    }

    if (!hasIdentityFront) {
      Alert.alert('Missing Document', `Please upload the ${selectedIdType?.frontLabel}.`);
      return;
    }

    if (!hasIdentityBack) {
      Alert.alert('Missing Document', `Please upload the ${selectedIdType?.backLabel}.`);
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
              "Your KYC documents have been submitted for review. We'll notify you once the review is complete."
            );
          },
        },
      ]
    );
  };

  // Calculate completion
  const selectedIdType = identityDocTypes.find((t) => t.id === identityDocType);
  const requiredDocs = selectedIdType?.requiresBack ? 3 : 2; // business + front + (back if needed)
  let uploadedRequired = 0;
  if (documents.business_license) uploadedRequired++;
  if (documents.identity_front) uploadedRequired++;
  if (selectedIdType?.requiresBack && documents.identity_back) uploadedRequired++;
  const completionPercentage = identityDocType
    ? Math.round((uploadedRequired / requiredDocs) * 100)
    : documents.business_license
      ? 33
      : 0;

  const renderDocumentCard = (
    docKey: keyof DocumentState,
    title: string,
    description: string,
    icon: keyof typeof MaterialIcons.glyphMap,
    isRequired: boolean = true
  ) => {
    const doc = documents[docKey];
    const isUploadingThis = uploading === docKey;
    const isImage = doc?.uri && (doc.uri.endsWith('.jpg') || doc.uri.endsWith('.jpeg') || doc.uri.endsWith('.png') || doc.uri.includes('ImagePicker'));

    return (
      <View
        className={`p-4 rounded-xl mb-3 ${isDark ? 'bg-slate-800' : 'bg-white'}`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        <View className="flex-row items-start">
          {/* Icon */}
          <View
            className="h-12 w-12 rounded-xl items-center justify-center mr-3"
            style={{
              backgroundColor: doc ? getStatusColor(doc.status) + '20' : isDark ? '#1E293B' : '#F1F5F9',
            }}
          >
            <MaterialIcons
              name={icon}
              size={24}
              color={doc ? getStatusColor(doc.status) : '#64748B'}
            />
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {title}
              </Text>
              {isRequired && (
                <Text className="text-red-500 ml-1">*</Text>
              )}
              {doc && (
                <View className="ml-2">
                  <Badge
                    label={doc.status === 'verified' ? 'Verified' : doc.status === 'rejected' ? 'Rejected' : 'Pending'}
                    variant={doc.status === 'verified' ? 'success' : doc.status === 'rejected' ? 'error' : 'warning'}
                    size="sm"
                  />
                </View>
              )}
            </View>
            <Text className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {description}
            </Text>

            {/* Uploaded Document Preview */}
            {doc ? (
              <View>
                {/* Preview Area */}
                <TouchableOpacity
                  onPress={() => isImage && setPreviewImage(doc.uri)}
                  className={`rounded-lg overflow-hidden mb-2 ${isImage ? '' : 'opacity-80'}`}
                  disabled={!isImage}
                >
                  {isImage ? (
                    <Image
                      source={{ uri: doc.uri }}
                      className="w-full h-32 rounded-lg"
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      className={`h-20 rounded-lg items-center justify-center ${
                        isDark ? 'bg-slate-700' : 'bg-slate-100'
                      }`}
                    >
                      <MaterialIcons name="description" size={32} color="#64748B" />
                      <Text className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {doc.fileName}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* File info and actions */}
                <View className="flex-row items-center justify-between">
                  <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Uploaded {doc.uploadedAt}
                  </Text>
                  <View className="flex-row gap-2">
                    {isImage && (
                      <TouchableOpacity
                        onPress={() => setPreviewImage(doc.uri)}
                        className={`px-3 py-1.5 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}
                      >
                        <Text className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          View
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => handleDeleteDocument(docKey)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10"
                    >
                      <Text className="text-sm text-red-500">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Rejection reason */}
                {doc.status === 'rejected' && doc.rejectionReason && (
                  <View className="mt-2 p-2 rounded-lg bg-red-500/10">
                    <Text className="text-red-500 text-sm">{doc.rejectionReason}</Text>
                  </View>
                )}
              </View>
            ) : (
              /* Upload Button */
              <TouchableOpacity
                onPress={() => handlePickDocument(docKey)}
                disabled={isUploadingThis}
                className={`flex-row items-center justify-center py-3 px-4 rounded-lg ${
                  isRequired ? 'bg-primary-500' : isDark ? 'bg-slate-700' : 'bg-slate-100'
                }`}
              >
                {isUploadingThis ? (
                  <ActivityIndicator size="small" color={isRequired ? '#FFFFFF' : '#64748B'} />
                ) : (
                  <>
                    <MaterialIcons
                      name="cloud-upload"
                      size={20}
                      color={isRequired ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'}
                    />
                    <Text
                      className={`font-semibold ml-2 ${
                        isRequired ? 'text-white' : isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      Upload
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      {/* Header */}
      <View
        className={`flex-row items-center px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}
      >
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
                    {uploadedRequired} of {requiredDocs} required documents
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

        {/* Benefits */}
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

          {/* Business License */}
          {renderDocumentCard(
            'business_license',
            'Business License',
            'Your business registration or license document',
            'business',
            true
          )}

          {/* Identity Document Type Selector */}
          <View
            className={`p-4 rounded-xl mb-3 ${isDark ? 'bg-slate-800' : 'bg-white'}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <View className="flex-row items-start">
              <View
                className="h-12 w-12 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: identityDocType ? '#3B82F620' : isDark ? '#1E293B' : '#F1F5F9' }}
              >
                <MaterialIcons
                  name="badge"
                  size={24}
                  color={identityDocType ? '#3B82F6' : '#64748B'}
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Identity Document
                  </Text>
                  <Text className="text-red-500 ml-1">*</Text>
                </View>
                <Text className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Select the type of ID you want to upload
                </Text>

                {/* ID Type Selector */}
                <TouchableOpacity
                  onPress={() => setShowIdTypePicker(true)}
                  className={`flex-row items-center justify-between p-3 rounded-xl border-2 ${
                    identityDocType
                      ? 'border-primary-500 bg-primary-500/5'
                      : isDark
                        ? 'border-slate-700 bg-slate-700'
                        : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <View className="flex-row items-center">
                    {identityDocType ? (
                      <>
                        <MaterialIcons
                          name={identityDocTypes.find((t) => t.id === identityDocType)?.icon as any}
                          size={20}
                          color="#3B82F6"
                        />
                        <Text className={`ml-2 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {identityDocTypes.find((t) => t.id === identityDocType)?.label}
                        </Text>
                      </>
                    ) : (
                      <Text className={isDark ? 'text-slate-400' : 'text-slate-400'}>
                        Select ID type...
                      </Text>
                    )}
                  </View>
                  <MaterialIcons
                    name="keyboard-arrow-down"
                    size={24}
                    color={isDark ? '#64748B' : '#94A3B8'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Identity Document Uploads (shown after type selection) */}
          {identityDocType && (
            <>
              {renderDocumentCard(
                'identity_front',
                selectedIdType?.frontLabel || 'Front of ID',
                `Upload a clear photo of ${selectedIdType?.frontLabel.toLowerCase()}`,
                'photo-camera',
                true
              )}

              {selectedIdType?.requiresBack &&
                renderDocumentCard(
                  'identity_back',
                  selectedIdType?.backLabel || 'Back of ID',
                  `Upload a clear photo of ${selectedIdType?.backLabel.toLowerCase()}`,
                  'photo-camera',
                  true
                )}
            </>
          )}
        </View>

        {/* Optional Documents */}
        <View className="px-4 pt-4">
          <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            OPTIONAL DOCUMENTS
          </Text>

          {renderDocumentCard(
            'insurance',
            'Liability Insurance',
            'Business or professional liability insurance',
            'security',
            false
          )}

          {renderDocumentCard(
            'certification',
            'Professional Certification',
            'Trade or professional certifications',
            'workspace-premium',
            false
          )}
        </View>

        {/* Submit Button */}
        {kycStatus !== 'approved' && kycStatus !== 'submitted' && kycStatus !== 'under_review' && (
          <View className="px-4 py-6">
            <Button
              title="Submit for Verification"
              onPress={handleSubmitKyc}
              disabled={completionPercentage < 100}
              fullWidth
              icon={<MaterialIcons name="send" size={20} color="#FFFFFF" />}
            />
            {completionPercentage < 100 && (
              <Text className={`text-center text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Upload all required documents to submit
              </Text>
            )}
          </View>
        )}

        {/* Document Guidelines */}
        <View className="px-4 pb-8">
          <View className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
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
          </View>
        </View>
      </ScrollView>

      {/* ID Type Picker Modal */}
      <Modal
        visible={showIdTypePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowIdTypePicker(false)}
      >
        <View className="flex-1 justify-end">
          <Pressable
            className="absolute inset-0 bg-black/50"
            onPress={() => setShowIdTypePicker(false)}
          />
          <View className={`rounded-t-3xl ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            {/* Handle bar */}
            <View className="items-center py-3">
              <View className={`w-10 h-1 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
            </View>

            {/* Header */}
            <View
              className={`flex-row items-center justify-between px-6 pb-4 border-b ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}
            >
              <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Select ID Type
              </Text>
              <TouchableOpacity onPress={() => setShowIdTypePicker(false)}>
                <MaterialIcons name="close" size={24} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            {/* Options */}
            <View className="px-4 py-4">
              {identityDocTypes.map((type) => {
                const isSelected = identityDocType === type.id;
                return (
                  <TouchableOpacity
                    key={type.id}
                    onPress={() => {
                      // Clear previous identity docs if type changes
                      if (identityDocType !== type.id) {
                        setDocuments((prev) => {
                          const newDocs = { ...prev };
                          delete newDocs.identity_front;
                          delete newDocs.identity_back;
                          return newDocs;
                        });
                      }
                      setIdentityDocType(type.id);
                      setShowIdTypePicker(false);
                    }}
                    className={`flex-row items-center p-4 rounded-xl mb-3 ${
                      isSelected
                        ? 'bg-primary-500/10 border-2 border-primary-500'
                        : isDark
                          ? 'bg-slate-800'
                          : 'bg-slate-50'
                    }`}
                  >
                    <View
                      className={`h-12 w-12 rounded-full items-center justify-center mr-4 ${
                        isSelected ? 'bg-primary-500' : isDark ? 'bg-slate-700' : 'bg-slate-200'
                      }`}
                    >
                      <MaterialIcons
                        name={type.icon as any}
                        size={24}
                        color={isSelected ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`font-semibold ${
                          isSelected ? 'text-primary-500' : isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {type.label}
                      </Text>
                      <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {type.requiresBack ? 'Front & Back required' : 'Bio page only'}
                      </Text>
                    </View>
                    {isSelected && <MaterialIcons name="check-circle" size={24} color="#3B82F6" />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Safe area padding */}
            <View style={{ height: 34 }} />
          </View>
        </View>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        visible={!!previewImage}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setPreviewImage(null)}
        statusBarTranslucent
      >
        <View className="flex-1 bg-black">
          {/* Header with safe area inset */}
          <View
            className="flex-row items-center justify-between px-4 py-4"
            style={{ paddingTop: insets.top + 16 }}
          >
            <TouchableOpacity
              onPress={() => setPreviewImage(null)}
              className="h-12 w-12 rounded-full bg-white/20 items-center justify-center"
            >
              <MaterialIcons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text className="text-white font-semibold text-lg">Document Preview</Text>
            <View className="w-12" />
          </View>

          {/* Image */}
          <View className="flex-1 items-center justify-center">
            {previewImage && (
              <Image
                source={{ uri: previewImage }}
                className="w-full h-full"
                resizeMode="contain"
              />
            )}
          </View>

          {/* Bottom safe area */}
          <View style={{ height: insets.bottom }} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}
