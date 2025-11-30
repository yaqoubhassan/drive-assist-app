import React, { forwardRef, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface DraggableBottomSheetProps {
  title: string;
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  onClose: () => void;
  scrollable?: boolean;
  initialIndex?: number;
}

const DraggableBottomSheet = forwardRef<BottomSheet, DraggableBottomSheetProps>(
  (
    {
      title,
      children,
      snapPoints: customSnapPoints,
      onClose,
      scrollable = true,
      initialIndex = 1,
    },
    ref
  ) => {
    const { isDark } = useTheme();

    // Default snap points: 50% and 90% of screen
    const snapPoints = useMemo(
      () => customSnapPoints || ['50%', '90%'],
      [customSnapPoints]
    );

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    const handleSheetChanges = useCallback(
      (index: number) => {
        if (index === -1) {
          onClose();
        }
      },
      [onClose]
    );

    const ContentWrapper = scrollable ? BottomSheetScrollView : BottomSheetView;

    return (
      <BottomSheet
        ref={ref}
        index={initialIndex}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        onChange={handleSheetChanges}
        backgroundStyle={{
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
        }}
        handleIndicatorStyle={{
          backgroundColor: isDark ? '#475569' : '#cbd5e1',
          width: 40,
        }}
        style={styles.bottomSheet}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { borderBottomColor: isDark ? '#334155' : '#e2e8f0' },
          ]}
        >
          <Text
            style={[
              styles.title,
              { color: isDark ? '#ffffff' : '#0f172a' },
            ]}
          >
            {title}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons
              name="close"
              size={24}
              color={isDark ? '#ffffff' : '#0f172a'}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ContentWrapper
          style={styles.content}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: Platform.OS === 'android' ? 100 : 40 },
          ]}
        >
          {children}
        </ContentWrapper>
      </BottomSheet>
    );
  }
);

DraggableBottomSheet.displayName = 'DraggableBottomSheet';

const styles = StyleSheet.create({
  bottomSheet: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});

export default DraggableBottomSheet;
