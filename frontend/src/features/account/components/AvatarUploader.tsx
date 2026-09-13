import ErrorMessage from '@/core/components/ErrorMessage';
import { Button } from '@/core/components/ui/Button';
import { useToast } from '@/core/components/ui/useToast';
import { apiFetch, errorMessage, resolveAssetUrl } from '@/core/config/api';
import { useAuthStore } from '@/features/auth/stores/auth';
import type { UserDTO } from '@/features/auth/types/user';
import { useMutation } from '@tanstack/react-query';
import { useRef, useState, type ChangeEvent } from 'react';

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,image/gif';

export default function AvatarUploader({ user }: { user: UserDTO }) {
  const setUser = useAuthStore((state) => state.setUser);
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiFetch<UserDTO>('/users/me/avatar', { method: 'POST', body: formData });
    },
    onSuccess: (updated) => {
      setUser(updated);
      toast.success({ title: 'Avatar updated' });
    },
    onError: (error) => {
      setApiError(errorMessage(error));
    },
    onSettled: () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setPreviewUrl(null);
    },
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setApiError(null);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPreviewUrl(url);
    uploadMutation.mutate(file);
  };

  const displayUrl = previewUrl ?? resolveAssetUrl(user.avatarUrl);

  return (
    <section className="flex flex-col gap-[1.1rem] rounded-xl border border-border bg-white px-[1.8rem] py-[1.6rem] shadow-card">
      <h2 className="text-[1.3rem]">Profile picture</h2>
      <div className="flex items-center gap-[1.2rem]">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="group relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-full border border-border disabled:cursor-not-allowed"
        >
          <img src={displayUrl} alt={user.name} className="h-full w-full object-cover" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-center text-[0.65rem] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
            {uploadMutation.isPending ? 'Uploading…' : 'Change'}
          </span>
        </button>
        <div className="flex flex-col gap-1">
          <Button
            type="button"
            variant="quiet"
            compact
            onClick={() => inputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? 'Uploading…' : 'Upload new photo'}
          </Button>
          <p className="text-[0.75rem] text-ink-soft">JPEG, PNG, WEBP or GIF, up to 5MB.</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {apiError && <ErrorMessage message={apiError} />}
    </section>
  );
}
