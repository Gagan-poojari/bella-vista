'use client';

import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';

interface ImageUploaderProps {
  roomId: string;
  onUploadSuccess?: (url: string) => void;
}

export default function ImageUploader({ roomId, onUploadSuccess }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      // 1. Compress Image
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);

      // 2. Fetch Auth Parameters
      const authRes = await fetch('/api/imagekit/auth');
      if (!authRes.ok) throw new Error('Failed to get ImageKit auth params');
      const authData = await authRes.json();

      // 3. Upload to ImageKit
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('fileName', compressedFile.name);
      formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '');
      formData.append('signature', authData.signature);
      formData.append('expire', authData.expire.toString());
      formData.append('token', authData.token);
      formData.append('folder', `/rooms/${roomId}`);

      const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload image to ImageKit');
      }

      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.url;

      // 4. Update the Room in MongoDB
      // First, get the current room to append the image
      const roomRes = await fetch(`/api/rooms/${roomId}`);
      if (!roomRes.ok) throw new Error('Failed to fetch room');
      const room = await roomRes.json();

      const newImages = [...(room.images || []), imageUrl];

      const updateRes = await fetch(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: newImages }),
      });

      if (!updateRes.ok) {
        throw new Error('Failed to update room in database');
      }

      if (onUploadSuccess) {
        onUploadSuccess(imageUrl);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border border-bark/20 rounded-lg bg-mist/50">
      <h3 className="text-lg font-semibold text-ink mb-2">Upload Room Image</h3>
      <p className="text-sm text-ink/70 mb-4">Images will be compressed and added to the room gallery.</p>
      
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
        disabled={uploading}
        className="block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-husk/10 file:text-husk
          hover:file:bg-husk/20"
      />
      
      {uploading && <p className="mt-2 text-sm text-blue-600">Compressing and uploading...</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
