'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/context/AuthContext'
import { getApiUrl } from '@/lib/config'
import { Upload, FileText, Shield, Users, X, Loader2 } from 'lucide-react'

interface AdminSolutionUploadProps {
  orderId: string
  orderNumber: string
  onClose: () => void
  onSuccess: () => void
}

interface FileWithType {
  file: File
  type: 'main_solution' | 'ai_report' | 'plagiarism_report' | 'supplementary'
  description: string
}

export default function AdminSolutionUpload({ 
  orderId, 
  orderNumber, 
  onClose, 
  onSuccess 
}: AdminSolutionUploadProps) {
  const [files, setFiles] = useState<FileWithType[]>([])
  const [solutionDescription, setSolutionDescription] = useState('')
  const [uploading, setUploading] = useState(false)

  const { getAuthHeaders } = useAuth()
  const { toast } = useToast()

  const fileTypeOptions = [
    { value: 'main_solution', label: 'Main Solution', icon: FileText },
    { value: 'ai_report', label: 'AI Report', icon: Users },
    { value: 'plagiarism_report', label: 'Plagiarism Report', icon: Shield },
    { value: 'supplementary', label: 'Supplementary File', icon: FileText }
  ]

  const handleFileAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles) return

    const newFiles: FileWithType[] = []
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      newFiles.push({
        file,
        type: 'main_solution',
        description: ''
      })
    }

    setFiles(prev => [...prev, ...newFiles])
    event.target.value = ''
  }

  const updateFileType = (index: number, type: 'main_solution' | 'ai_report' | 'plagiarism_report' | 'supplementary') => {
    setFiles(prev => prev.map((file, i) => i === index ? { ...file, type } : file))
  }

  const updateFileDescription = (index: number, description: string) => {
    setFiles(prev => prev.map((file, i) => i === index ? { ...file, description } : file))
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileTypeIcon = (type: string) => {
    const option = fileTypeOptions.find(opt => opt.value === type)
    const IconComponent = option?.icon || FileText
    return <IconComponent className="h-4 w-4" />
  }

  const getFileTypeLabel = (type: string) => {
    const option = fileTypeOptions.find(opt => opt.value === type)
    return option?.label || 'File'
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: 'No Files Selected',
        description: 'Please select at least one file to upload',
        variant: 'destructive'
      })
      return
    }

    if (!solutionDescription.trim()) {
      toast({
        title: 'Description Required',
        description: 'Please provide a description for the solution',
        variant: 'destructive'
      })
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('order_id', orderId)
      formData.append('description', solutionDescription.trim())

      // Group files by type and add to form data
      const fileGroups: Record<string, File[]> = {}
      files.forEach((fileWithType, index) => {
        const key = fileWithType.type
        if (!fileGroups[key]) {
          fileGroups[key] = []
        }
        fileGroups[key].push(fileWithType.file)
        formData.append(`file_description_${key}_${index}`, fileWithType.description)
      })

      // Add files to form data
      Object.entries(fileGroups).forEach(([type, fileList]) => {
        fileList.forEach((file, index) => {
          formData.append(`${type}_${index}`, file)
        })
      })

      // Don&apos;t set Content-Type for FormData - browser will set it with boundary
      const headers = getAuthHeaders()
      delete headers['Content-Type']
      
      const response = await fetch(getApiUrl('admin/upload_solution/'), {
        method: 'POST',
        headers: headers,
        body: formData
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: 'Solution Uploaded',
          description: data.message,
          variant: 'default'
        })
        onSuccess()
        onClose()
      } else {
        throw new Error(data.error || 'Failed to upload solution')
      }

    } catch (error) {
      console.error('Error uploading solution:', error)
      toast({
        title: 'Upload Error',
        description: error instanceof Error ? error.message : 'Failed to upload solution',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Solution - {orderNumber}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Solution Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Solution Description</label>
            <Textarea
              placeholder="Provide a detailed description of the solution, including any notes for the student..."
              value={solutionDescription}
              onChange={(e) => setSolutionDescription(e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Upload Files</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Input
                type="file"
                multiple
                onChange={handleFileAdd}
                className="hidden"
                id="solution-files"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip,.rar"
              />
              <label htmlFor="solution-files" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-700 mb-2">Click to upload files</p>
                <p className="text-sm text-gray-500">
                  Support for PDF, DOC, DOCX, TXT, images, and archives
                </p>
              </label>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-800 mb-4">Selected Files ({files.length})</h3>
              <div className="space-y-4">
                {files.map((fileWithType, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getFileTypeIcon(fileWithType.type)}
                        <div>
                          <p className="font-medium text-gray-800">{fileWithType.file.name}</p>
                          <p className="text-sm text-gray-600">{formatFileSize(fileWithType.file.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getFileTypeLabel(fileWithType.type)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">File Type</label>
                        <select
                          value={fileWithType.type}
                          onChange={(e) => updateFileType(index, e.target.value as any)}
                          className="w-full p-2 border rounded-md text-sm"
                        >
                          {fileTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                        <Input
                          placeholder="Brief description of this file..."
                          value={fileWithType.description}
                          onChange={(e) => updateFileDescription(index, e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Type Guide */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">File Type Guide:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span><strong>Main Solution:</strong> The primary deliverable (essay, report, etc.)</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span><strong>AI Report:</strong> AI detection and analysis results</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-600" />
                <span><strong>Plagiarism Report:</strong> Originality verification document</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <span><strong>Supplementary:</strong> Additional supporting files</span>
              </div>
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={uploading || files.length === 0 || !solutionDescription.trim()}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Solution
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}