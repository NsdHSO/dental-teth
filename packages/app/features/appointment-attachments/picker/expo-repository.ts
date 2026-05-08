import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import type { AttachmentPickerRepository } from './types';
import type { UploadFile } from '../types';

function mapImageResult(result: ImagePicker.ImagePickerResult): UploadFile | null {
  if (result.canceled || !result.assets?.length) return null;
  const asset = result.assets[0];
  return {
    uri: asset.uri,
    name: asset.fileName ?? 'image.jpg',
    type: asset.mimeType ?? 'image/jpeg',
  };
}

function mapDocumentResult(result: DocumentPicker.DocumentPickerResult): UploadFile | null {
  if (result.canceled || !result.assets || result.assets.length === 0) return null;
  const asset = result.assets[0];
  return {
    uri: asset.uri,
    name: asset.name ?? 'document',
    type: asset.mimeType ?? 'application/octet-stream',
  };
}

export class ExpoAttachmentPickerRepository implements AttachmentPickerRepository {
  async pickFromCamera(): Promise<UploadFile | null> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Camera permission denied');
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    return mapImageResult(result);
  }

  async pickFromGallery(): Promise<UploadFile | null> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Gallery permission denied');
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    return mapImageResult(result);
  }

  async pickDocument(): Promise<UploadFile | null> {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });
    return mapDocumentResult(result);
  }
}

export const defaultExpoAttachmentPickerRepository = new ExpoAttachmentPickerRepository();
