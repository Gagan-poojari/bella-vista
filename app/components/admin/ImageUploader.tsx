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

      // 1. Fetch Room Details for Folder Mapping
      const roomRes = await fetch(`/api/rooms/${roomId}`);
      if (!roomRes.ok) throw new Error('Failed to fetch room');
      const room = await roomRes.json();

      let folderName = `/rooms/${roomId}`;
      const lowerName = room.name?.toLowerCase() || '';
      if (lowerName.includes('1 bhk') || lowerName.includes('1bhk')) folderName = '/1bhk';
      else if (lowerName.includes('2 bhk') || lowerName.includes('2bhk')) folderName = '/2bhk';
      else if (lowerName.includes('dormitory')) folderName = '/Dormitory';

      // 2. Compress Image (Skip for videos)
      const isVideo = file.type.startsWith('video/');
      let processedFile: File | Blob = file;

      if (!isVideo) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        processedFile = await imageCompression(file, options);
      }

      // 3. Fetch Auth Parameters
      const authRes = await fetch('/api/imagekit/auth');
      if (!authRes.ok) throw new Error('Failed to get ImageKit auth params');
      const authData = await authRes.json();

      // 4. Upload to ImageKit
      const formData = new FormData();
      formData.append('file', processedFile);
      formData.append('fileName', processedFile instanceof File ? processedFile.name : file.name);
      formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '');
      formData.append('signature', authData.signature);
      formData.append('expire', authData.expire.toString());
      formData.append('token', authData.token);
      formData.append('folder', folderName);

      const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload media to ImageKit');
      }

      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.url;

      // 5. Update the Room in MongoDB
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
      <h3 className="text-lg font-semibold text-ink mb-2">Upload Room Media</h3>
      <p className="text-sm text-ink/70 mb-4">Upload images or videos for the room gallery.</p>
      
      <input 
        type="file" 
        accept="image/*,video/*" 
        onChange={handleFileChange} 
        disabled={uploading}
        className="block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-husk/10 file:text-husk
          hover:file:bg-husk/20"
      />
      
      {uploading && <p className="mt-2 text-sm text-blue-600">Uploading...</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
