import { useState, useCallback } from 'react';
import type { AttachmentPickerRepository } from './types';
import type { UploadFile } from '../types';

export function useAttachmentPicker(repository: AttachmentPickerRepository) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = useCallback(
    async (source: 'camera' | 'gallery' | 'documents'): Promise<UploadFile | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const file =
          source === 'camera'
            ? await repository.pickFromCamera()
            : source === 'gallery'
              ? await repository.pickFromGallery()
              : await repository.pickDocument();
        return file;
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        setError(message);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [repository],
  );

  const clearError = useCallback(() => setError(null), []);

  return { pick, isLoading, error, clearError };
}
