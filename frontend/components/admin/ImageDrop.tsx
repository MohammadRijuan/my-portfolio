'use client';
import { useContext, useEffect, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { API_URL, mediaUrl } from '@/lib/data';
import { TokenCtx, ToastCtx } from './context';

/** Downscales a picked image (max 1400px) and converts it to WebP before upload. */
async function resizeImageToWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not process image'))), 'image/webp', 0.86));
}

type Props = {
  label: string;
  value: string;
  onChange: (newValue: string, meta?: { name: string; sizeInBytes: number }) => void;
  kind?: 'image' | 'pdf';
  name?: string;
};

/** Drag & drop (or click to choose) upload. Stores the file in the database and returns its path. */
export default function ImageDrop({ label, value, onChange, kind = 'image', name }: Props) {
  const token = useContext(TokenCtx);
  const showToast = useContext(ToastCtx);
  const isPdf = kind === 'pdf';

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
  const [fileSizeLabel, setFileSizeLabel] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // PDF preview: download the stored file once and show it in an iframe.
  useEffect(() => {
    if (!isPdf || !value) { setPdfPreviewUrl(''); return; }
    let url = '';
    let isCancelled = false;
    fetch(mediaUrl(value)).then((response) => response.blob()).then((blob) => {
      if (isCancelled) return;
      url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
      setFileSizeLabel(blob.size > 1048576 ? `${(blob.size / 1048576).toFixed(1)} MB` : `${Math.round(blob.size / 1024)} KB`);
    }).catch(() => {});
    return () => { isCancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [value, isPdf]);

  const uploadFile = async (file?: File) => {
    if (!file || (isPdf ? file.type !== 'application/pdf' : !file.type.startsWith('image/'))) {
      return setErrorMessage(isPdf ? 'Please choose a PDF file' : 'Please choose an image file');
    }
    if (isPdf && file.size > 4 * 1024 * 1024) return setErrorMessage('PDF must be under 4MB');
    setIsUploading(true); setErrorMessage('');
    try {
      const blob: Blob = isPdf ? file : await resizeImageToWebp(file);
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { 'Content-Type': blob.type, 'X-File-Name': encodeURIComponent(file.name), Authorization: `Bearer ${token}` },
        body: blob,
      });
      const responseBody = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(responseBody.error || 'Upload failed');
      onChange(responseBody.url, { name: file.name, sizeInBytes: file.size });
      showToast(isPdf ? 'CV uploaded successfully' : 'Image uploaded successfully');
    } catch (error: any) {
      setErrorMessage(error.message || 'Upload failed');
      showToast(error.message || 'Upload failed', 'err');
    }
    setIsUploading(false);
  };

  return (
    <div>
      <span className="text-xs text-mute mb-1.5 block">{label}</span>
      <label
        onDragOver={(event) => { event.preventDefault(); setIsDraggingOver(true); }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(event) => { event.preventDefault(); setIsDraggingOver(false); uploadFile(event.dataTransfer.files[0]); }}
        className={`relative flex items-center justify-center gap-4 cursor-pointer rounded-xl border-2 border-dashed p-4 min-h-[120px] transition ${
          isDraggingOver ? 'border-accent bg-accent/10 scale-[1.01]' : 'border-accent/25 hover:border-accent/60 hover:bg-white/[.03]'
        }`}
      >
        {value && !isPdf && <img src={mediaUrl(value)} alt="" className="h-24 w-24 object-cover rounded-lg border border-accent/30" />}
        <span className="text-center text-sm text-mute">
          <UploadCloud className="mx-auto mb-1 text-accent" />
          {isUploading ? 'Uploading…' : value ? 'Drop or click to replace' : isPdf ? 'Drop your PDF here or click to choose' : 'Drop an image here or click to choose'}
        </span>
        <input
          type="file"
          accept={isPdf ? 'application/pdf' : 'image/*'}
          className="hidden"
          onChange={(event) => { uploadFile(event.target.files?.[0]); event.target.value = ''; }}
        />
      </label>

      {isPdf && value && (
        <div className="mt-3 rounded-xl border border-accent/25 overflow-hidden bg-white/[.03]">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm border-b border-accent/15">
            <span className="truncate">📄 {name || 'CV.pdf'}{fileSizeLabel && <span className="text-mute"> · {fileSizeLabel}</span>}</span>
            <span className="chip shrink-0">uploaded ✓</span>
          </div>
          {pdfPreviewUrl
            ? <iframe src={`${pdfPreviewUrl}#toolbar=0&view=FitH`} title="CV preview" className="w-full h-72 bg-white" />
            : <div className="h-24 grid place-items-center text-xs text-mute">Loading preview…</div>}
        </div>
      )}
      {value && <button type="button" onClick={() => onChange('')} className="text-xs text-red-400 mt-2">Remove {isPdf ? 'file' : 'image'}</button>}
      {errorMessage && <p className="text-xs text-red-400 mt-2">{errorMessage}</p>}
    </div>
  );
}
