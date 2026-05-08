import React, { forwardRef, useCallback } from 'react';
import { StyleSheet, View, Pressable, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { GlassBottomSheet, ThemedText, IconSymbol } from '@dental/components';
import { useAttachmentPicker } from '@/features/appointment-attachments/picker';
import type { AttachmentPickerRepository } from '@/features/appointment-attachments/picker';
import type { UploadFile } from '@/features/appointment-attachments/types';

type AttachmentPickerSheetProps = {
  onSelect: (file: UploadFile) => void;
  repository: AttachmentPickerRepository;
  testID?: string;
};

type PickerOption = {
  id: 'camera' | 'gallery' | 'documents';
  labelKey: string;
  icon: string;
};

export const AttachmentPickerSheet = forwardRef<BottomSheetModal, AttachmentPickerSheetProps>(
  function AttachmentPickerSheet({ onSelect, repository, testID }, ref) {
    const { t } = useTranslation();
    const { pick, isLoading } = useAttachmentPicker(repository);

    const options: PickerOption[] = [
      { id: 'camera', labelKey: 'attachments.camera', icon: 'camera' },
      { id: 'gallery', labelKey: 'attachments.gallery', icon: 'photo' },
      { id: 'documents', labelKey: 'attachments.documents', icon: 'doc.text' },
    ];

    const handleSelect = useCallback(
      async (source: 'camera' | 'gallery' | 'documents') => {
        try {
          const file = await pick(source);
          if (file) {
            onSelect(file);
          }
          (ref as React.MutableRefObject<BottomSheetModal | null>).current?.dismiss();
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          Alert.alert(
            t('attachments.pickerErrorTitle', 'Error'),
            message,
          );
        }
      },
      [pick, onSelect, ref, t],
    );

    return (
      <GlassBottomSheet
        ref={ref}
        snapPoints={['35%']}
        testID={testID ? `${testID}-bottom-sheet` : undefined}
      >
        <View style={styles.container}>
          <ThemedText type='subtitle' style={styles.title}>
            {t('attachments.addTitle', 'Add attachment')}
          </ThemedText>

          {options.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => handleSelect(option.id)}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.option,
                pressed && styles.optionPressed,
                isLoading && styles.optionDisabled,
              ]}
              testID={testID ? `${testID}-option-${option.id}` : undefined}
            >
              <IconSymbol name={option.icon} size={22} color='#1E40AF' />
              <ThemedText type='default' weight='semibold' style={styles.optionText}>
                {t(option.labelKey, option.id)}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </GlassBottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
    gap: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionText: {
    color: '#1E40AF',
  },
});
