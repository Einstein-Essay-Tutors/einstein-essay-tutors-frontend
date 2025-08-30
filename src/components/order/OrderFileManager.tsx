'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/lib/config';
import {
  File,
  Download,
  X,
  Upload,
  AlertCircle,
  FileText,
  Image,
  Archive,
  Cloud,
  ExternalLink,
} from 'lucide-react';

interface OrderFile {
  id: string;
  original_name: string;
  file_size: number;
  upload_date: string;
  description: string;
}

interface OrderFileManagerProps {
  orderId: string;
  readOnly?: boolean;
}

export default function OrderFileManager({ orderId, readOnly = false }: OrderFileManagerProps) {
  const [files, setFiles] = useState<OrderFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [totalSize, setTotalSize] = useState(0);
  const [maxFiles, setMaxFiles] = useState(5);
  const [maxTotalSize, setMaxTotalSize] = useState(50 * 1024 * 1024);

  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchFiles();
  }, [orderId]);

  const fetchFiles = async () => {
    try {
      const response = await fetch(getApiUrl(`get_order_files/${orderId}/`), {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(data.files);
        setTotalSize(data.total_size);
        setMaxFiles(data.max_files);
        setMaxTotalSize(data.max_total_size);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load files');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load files',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (fileId: string, fileName: string) => {
    setDownloading(fileId);
    try {
      console.log(`Attempting to download file ${fileId}: ${fileName}`);

      const response = await fetch(getApiUrl(`download_order_file/${fileId}/`), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log(`Download response status: ${response.status}`);
      console.log(`Download response headers:`, response.headers);

      if (response.ok) {
        // Check if response is actually a file
        const contentType = response.headers.get('Content-Type');
        const contentDisposition = response.headers.get('Content-Disposition');

        console.log(`Content-Type: ${contentType}`);
        console.log(`Content-Disposition: ${contentDisposition}`);

        // If it's JSON, it's probably an error response
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || 'Unexpected JSON response');
        }

        // Get the file blob
        const blob = await response.blob();
        console.log(`Blob size: ${blob.size}, type: ${blob.type}`);

        if (blob.size === 0) {
          throw new Error('File is empty or not found');
        }

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);

        toast({
          title: 'Download Started',
          description: `Downloading "${fileName}"`,
        });
      } else {
        // Try to get error message from response
        let errorMessage = 'Failed to download file';
        try {
          const responseText = await response.text();
          console.log(`Error response text: ${responseText}`);

          // Try to parse as JSON first
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorData.message || responseText;
          } catch {
            // If not JSON, use the text directly
            errorMessage = responseText || `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Download Error',
        description: error instanceof Error ? error.message : 'Failed to download file',
        variant: 'destructive',
      });
    } finally {
      setDownloading(null);
    }
  };

  const deleteFile = async (fileId: string, fileName: string) => {
    setDeleting(fileId);

    try {
      const response = await fetch(getApiUrl(`delete_order_file/${fileId}/`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setFiles(files.filter(f => f.id !== fileId));
        toast({
          title: 'File Deleted',
          description: `Successfully deleted "${fileName}"`,
        });
        fetchFiles(); // Refresh to get updated stats
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete file',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return <Image className="h-5 w-5 text-blue-600" />;
    } else if (extension === 'pdf') {
      return <FileText className="h-5 w-5 text-red-600" />;
    } else if (['zip', 'rar'].includes(extension || '')) {
      return <Archive className="h-5 w-5 text-purple-600" />;
    } else {
      return <File className="h-5 w-5 text-gray-600" />;
    }
  };

  const getFileTypeLabel = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const typeMap: Record<string, string> = {
      pdf: 'PDF',
      doc: 'DOC',
      docx: 'DOCX',
      txt: 'TXT',
      jpg: 'JPEG',
      jpeg: 'JPEG',
      png: 'PNG',
      gif: 'GIF',
      zip: 'ZIP',
      rar: 'RAR',
    };
    return typeMap[extension || ''] || extension?.toUpperCase() || 'FILE';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading files...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-4 w-4" />
          Order Files
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Statistics */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
            <Badge variant="info" className="bg-blue-100 text-blue-800 border-blue-300">
              {files.length}/{maxFiles} files
            </Badge>
            <Badge variant="info" className="bg-blue-100 text-blue-800 border-blue-300">
              {formatFileSize(totalSize)}/{formatFileSize(maxTotalSize)} used
            </Badge>
          </div>
        )}

        {/* File List */}
        {files.length > 0 ? (
          <div className="space-y-2">
            {files.map(file => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(file.original_name)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {file.original_name}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {getFileTypeLabel(file.original_name)}
                      </Badge>
                      <span className="text-xs text-gray-600">
                        {formatFileSize(file.file_size)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(file.upload_date).toLocaleDateString()}
                      </span>
                    </div>
                    {file.description && (
                      <p className="text-xs text-gray-600 mt-1 truncate">{file.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadFile(file.id, file.original_name)}
                    disabled={downloading === file.id}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2"
                    title="Download file"
                  >
                    {downloading === file.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFile(file.id, file.original_name)}
                      disabled={deleting === file.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                      title="Delete file"
                    >
                      {deleting === file.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <File className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2 text-gray-600">No files uploaded</h3>
            <p className="text-gray-500">No files have been uploaded for this order yet.</p>
          </div>
        )}

        {/* Upload Status */}
        {files.length === maxFiles && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border-2 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Maximum number of files reached ({maxFiles})
            </span>
          </div>
        )}

        {totalSize >= maxTotalSize && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border-2 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-800">
              Total file size limit reached ({formatFileSize(maxTotalSize)})
            </span>
          </div>
        )}

        {/* Cloud Sharing Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Cloud className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-2">Need to share larger files?</h4>
              <p className="text-sm text-blue-800 mb-3">
                If you have additional files or files that exceed our size limits, you can upload
                them to cloud storage services and share the links via messages:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  {
                    name: 'File.io',
                    url: 'https://file.io',
                    description: 'Simple, temporary file sharing',
                  },
                  {
                    name: 'MediaFire',
                    url: 'https://mediafire.com',
                    description: 'Free file hosting service',
                  },
                  {
                    name: 'Google Drive',
                    url: 'https://drive.google.com',
                    description: 'Share from your Google Drive',
                  },
                  {
                    name: 'OneDrive',
                    url: 'https://onedrive.live.com',
                    description: 'Microsoft cloud storage',
                  },
                  {
                    name: 'Dropbox',
                    url: 'https://dropbox.com',
                    description: 'Share via Dropbox links',
                  },
                  {
                    name: 'WeTransfer',
                    url: 'https://wetransfer.com',
                    description: 'Send large files easily',
                  },
                ].map(service => (
                  <div
                    key={service.name}
                    className="bg-white p-3 rounded border border-blue-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-800">{service.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(service.url, '_blank')}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600">{service.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Important:</p>
                    <ul className="text-xs space-y-1 ml-4">
                      <li>• Set sharing permissions to "Anyone with the link can view"</li>
                      <li>• Copy the shareable link and send it via the messages section</li>
                      <li>• Ensure files remain accessible until your order is completed</li>
                      <li>• Include a brief description of the file contents in your message</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
