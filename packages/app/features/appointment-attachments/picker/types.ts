import type { UploadFile } from '../types';

export interface AttachmentPickerRepository {
  pickFromCamera(): Promise<UploadFile | null>;
  pickFromGallery(): Promise<UploadFile | null>;
  pickDocument(): Promise<UploadFile | null>;
}
