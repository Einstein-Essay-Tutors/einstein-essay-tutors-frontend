'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Upload, File, X, AlertCircle, CheckCircle, FileText, Image, Archive } from 'lucide-react';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFileSize?: number; // in MB
  maxTotalSize?: number; // in MB
  maxFiles?: number;
  acceptedTypes?: string[];
  required?: boolean;
  label?: string;
  description?: string;
}

interface FileWithId extends File {
  id: string;
  preview?: string;
}

export default function FileUpload({
  files,
  onFilesChange,
  maxFileSize = 10, // 10MB per file
  maxTotalSize = 50, // 50MB total
  maxFiles = 5,
  acceptedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/zip',
    'application/x-rar-compressed',
  ],
  required = false,
  label = 'Additional Files',
  description = 'Upload any additional files related to your order (optional)',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileWithId[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Convert File to FileWithId
  const createFileWithId = (file: File): FileWithId => {
    const fileWithId = Object.assign(file, {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    });
    return fileWithId;
  };

  // Get file type icon
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-600" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-600" />;
    } else if (file.type.includes('zip') || file.type.includes('rar')) {
      return <Archive className="h-5 w-5 text-purple-600" />;
    } else {
      return <File className="h-5 w-5 text-gray-600" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file type label
  const getFileTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      'application/pdf': 'PDF',
      'application/msword': 'DOC',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
      'text/plain': 'TXT',
      'image/jpeg': 'JPEG',
      'image/png': 'PNG',
      'image/gif': 'GIF',
      'application/zip': 'ZIP',
      'application/x-rar-compressed': 'RAR',
    };
    return typeMap[type] || type.split('/')[1]?.toUpperCase() || 'FILE';
  };

  // Calculate total file size
  const getTotalSize = (): number => {
    return uploadedFiles.reduce((total, file) => total + file.size, 0);
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `File type "${getFileTypeLabel(file.type)}" is not allowed. Accepted types: ${acceptedTypes.map(t => getFileTypeLabel(t)).join(', ')}`;
    }

    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size (${formatFileSize(file.size)}) exceeds maximum allowed size of ${maxFileSize}MB`;
    }

    // Check total size after adding this file
    const currentTotalSize = getTotalSize();
    if (currentTotalSize + file.size > maxTotalSize * 1024 * 1024) {
      const remainingSize = maxTotalSize * 1024 * 1024 - currentTotalSize;
      return `Adding this file would exceed total size limit of ${maxTotalSize}MB. Remaining space: ${formatFileSize(remainingSize)}`;
    }

    // Check max files
    if (uploadedFiles.length >= maxFiles) {
      return `Maximum number of files (${maxFiles}) already uploaded`;
    }

    // Check for duplicate names
    if (uploadedFiles.some(existingFile => existingFile.name === file.name)) {
      return `A file with the name "${file.name}" already exists`;
    }

    return null;
  };

  // Handle file selection
  const handleFiles = useCallback(
    (fileList: FileList) => {
      const newFiles: FileWithId[] = [];
      const errors: string[] = [];

      Array.from(fileList).forEach(file => {
        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else {
          newFiles.push(createFileWithId(file));
        }
      });

      if (errors.length > 0) {
        toast({
          title: 'File Validation Errors',
          description: errors.join('\n'),
          variant: 'destructive',
        });
      }

      if (newFiles.length > 0) {
        const updatedFiles = [...uploadedFiles, ...newFiles];
        setUploadedFiles(updatedFiles);
        onFilesChange(updatedFiles);

        toast({
          title: 'Files Added',
          description: `Successfully added ${newFiles.length} file${newFiles.length > 1 ? 's' : ''}`,
        });
      }
    },
    [uploadedFiles, onFilesChange, toast, maxFileSize, maxTotalSize, maxFiles, acceptedTypes]
  );

  // Handle drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove file
  const removeFile = (fileId: string) => {
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId);

    // Clean up preview URL if it exists
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    setUploadedFiles(updatedFiles);
    onFilesChange(updatedFiles);

    toast({
      title: 'File Removed',
      description: `Removed "${fileToRemove?.name}"`,
    });
  };

  // Click to upload
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const totalSize = getTotalSize();
  const remainingFiles = maxFiles - uploadedFiles.length;
  const remainingSize = maxTotalSize * 1024 * 1024 - totalSize;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          {label}
          {required && <span className="text-destructive">*</span>}
        </CardTitle>
        {description && <p className="text-sm text-gray-700">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
          <p className="text-sm text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
          <p className="text-xs text-gray-500">
            Max {maxFiles} files, {maxFileSize}MB per file, {maxTotalSize}MB total
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Accepted: {acceptedTypes.map(t => getFileTypeLabel(t)).join(', ')}
          </p>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* File Statistics */}
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
            <Badge variant="info" className="bg-blue-100 text-blue-800 border-blue-300">
              {uploadedFiles.length}/{maxFiles} files
            </Badge>
            <Badge variant="info" className="bg-blue-100 text-blue-800 border-blue-300">
              {formatFileSize(totalSize)}/{formatFileSize(maxTotalSize * 1024 * 1024)} used
            </Badge>
            {remainingFiles > 0 && (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                {remainingFiles} files remaining
              </Badge>
            )}
            {remainingSize > 0 && (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                {formatFileSize(remainingSize)} space remaining
              </Badge>
            )}
          </div>
        )}

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-800">Uploaded Files:</h4>
            {uploadedFiles.map(file => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {getFileTypeLabel(file.type)}
                      </Badge>
                      <span className="text-xs text-gray-600">{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Validation Messages */}
        {uploadedFiles.length === maxFiles && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border-2 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Maximum number of files reached ({maxFiles})
            </span>
          </div>
        )}

        {totalSize >= maxTotalSize * 1024 * 1024 && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border-2 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-800">
              Total file size limit reached ({maxTotalSize}MB)
            </span>
          </div>
        )}

        {uploadedFiles.length > 0 &&
          totalSize < maxTotalSize * 1024 * 1024 &&
          uploadedFiles.length < maxFiles && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border-2 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">
                Ready to upload {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
