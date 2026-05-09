import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { getValidAccessToken, APP_BASE } from '@dental/auth';
import { ThemedText } from '@dental/components';

const { width, height } = Dimensions.get('window');

type Props = {
  visible: boolean;
  onClose: () => void;
  appointmentId: number;
  attachmentId: number;
  filename: string | null;
};

export function AttachmentImageViewer({
  visible,
  onClose,
  appointmentId,
  attachmentId,
  filename,
}: Props) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      getValidAccessToken().then(setToken);
    }
  }, [visible]);

  const uri = `${APP_BASE}/appointments/${appointmentId}/attachments/${attachmentId}/download`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Pressable style={styles.closeBtn} onPress={onClose}>
          <ThemedText style={styles.closeText}>Close</ThemedText>
        </Pressable>

        <ScrollView
          maximumZoomScale={4}
          minimumZoomScale={1}
          contentContainerStyle={styles.scrollContent}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          {token ? (
            <Image
              source={{
                uri,
                headers: { Authorization: `Bearer ${token}` },
              }}
              style={styles.image}
              resizeMode='contain'
              onLoadEnd={() => setLoading(false)}
            />
          ) : null}
          {loading && (
            <ActivityIndicator
              style={styles.loader}
              color='#fff'
            />
          )}
        </ScrollView>

        {filename ? (
          <View style={styles.filenameBar}>
            <ThemedText style={styles.filenameText}>
              {filename}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: height,
  },
  image: {
    width,
    height: height * 0.8,
  },
  loader: {
    position: 'absolute',
    top: height / 2 - 20,
    left: width / 2 - 20,
  },
  filenameBar: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  filenameText: {
    color: '#fff',
    fontSize: 14,
  },
});
