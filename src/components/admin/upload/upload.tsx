'use client';
import React, { useRef, useState } from "react";
import { FaUpload, FaFileAlt } from "react-icons/fa";

type UploadProps = {
  label?: string;
  accept?: string;
  onFileChange?: (file: File | null) => void;
  id?: string; // <-- tambahan supaya tiap input punya id unik
};

const Upload: React.FC<UploadProps> = ({
  label = "Upload File",
  accept = "*",
  onFileChange,
  id,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // ID unik fallback
  const inputId = id ?? `file-upload-${label?.toLowerCase().replace(/\s+/g, '-') || Math.random()}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    onFileChange?.(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0] || null;
    setSelectedFile(file);
    onFileChange?.(file);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <label
        htmlFor={inputId}
        className={`
          flex flex-col items-center justify-center w-full max-w-md p-6 border-2
          border-dashed ${dragActive ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 bg-white'}
          rounded-2xl cursor-pointer transition-all
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FaUpload size={36} className="mb-2 text-gray-500" />
        <span className="font-semibold text-gray-700 mb-1">{label}</span>
        <span className="text-sm text-gray-400 mb-2">Klik di sini atau drag & drop file</span>
        <input
          id={inputId}
          type="file"
          accept={accept}
          ref={inputRef}
          onChange={handleInputChange}
          className="hidden"
        />
        {selectedFile && (
          <div className="flex items-center mt-4">
            <FaFileAlt className="text-yellow-500 mr-2" />
            <span className="text-sm font-medium text-black">{selectedFile.name}</span>
          </div>
        )}
      </label>
      {selectedFile && (
        <button
          type="button"
          className="mt-4 text-red-500 underline text-sm"
          onClick={() => {
            setSelectedFile(null);
            onFileChange?.(null);
            if (inputRef.current) inputRef.current.value = '';
          }}
        >
          Hapus File
        </button>
      )}
    </div>
  );
};

export default Upload;
