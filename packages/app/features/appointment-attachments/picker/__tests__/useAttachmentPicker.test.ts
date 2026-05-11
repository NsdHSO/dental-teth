import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useAttachmentPicker } from '../useAttachmentPicker';
import type { AttachmentPickerRepository } from '../types';
import type { UploadFile } from '../../types';

const mockFile: UploadFile = { uri: 'file://test.jpg', name: 'test.jpg', type: 'image/jpeg' };

function createMockRepository(overrides?: Partial<AttachmentPickerRepository>): AttachmentPickerRepository {
  return {
    pickFromCamera: jest.fn().mockResolvedValue(mockFile),
    pickFromGallery: jest.fn().mockResolvedValue(mockFile),
    pickDocument: jest.fn().mockResolvedValue(mockFile),
    ...overrides,
  };
}

describe('useAttachmentPicker', () => {
  it('picks from camera and returns file', async () => {
    const repo = createMockRepository();
    const { result } = renderHook(() => useAttachmentPicker(repo));

    let file: UploadFile | null = null;
    await act(async () => {
      file = await result.current.pick('camera');
    });

    expect(file).toEqual(mockFile);
    expect(repo.pickFromCamera).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error when permission denied', async () => {
    const repo = createMockRepository({
      pickFromCamera: jest.fn().mockRejectedValue(new Error('Camera permission denied')),
    });
    const { result } = renderHook(() => useAttachmentPicker(repo));

    await act(async () => {
      try {
        await result.current.pick('camera');
      } catch {
        // expected to throw
      }
    });

    expect(result.current.error).toBe('Camera permission denied');
    expect(result.current.isLoading).toBe(false);
  });

  it('returns null on cancel without error', async () => {
    const repo = createMockRepository({
      pickFromGallery: jest.fn().mockResolvedValue(null),
    });
    const { result } = renderHook(() => useAttachmentPicker(repo));

    let file: UploadFile | null = null;
    await act(async () => {
      file = await result.current.pick('gallery');
    });

    expect(file).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('clears error on demand', async () => {
    const repo = createMockRepository({
      pickFromCamera: jest.fn().mockRejectedValue(new Error('fail')),
    });
    const { result } = renderHook(() => useAttachmentPicker(repo));

    await act(async () => {
      try {
        await result.current.pick('camera');
      } catch {
        // expected to throw
      }
    });

    expect(result.current.error).toBe('fail');

    act(() => result.current.clearError());
    expect(result.current.error).toBeNull();
  });
});
