'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/context/AuthContext'
import { getApiUrl } from '@/lib/config'
import { 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  RotateCcw, 
  Shield,
  Users,
  Clock,
  Send,
  Loader2,
  BarChart3
} from 'lucide-react'

interface SolutionFile {
  id: string
  original_name: string
  file_type: string
  description: string
  file_size: number
  upload_date: string
}

interface OrderSolution {
  id: string
  version: number
  status: string
  description: string
  client_feedback: string
  writer_name: string
  submitted_at: string
  accepted_at: string | null
  revision_requested_at: string | null
  files: SolutionFile[]
  // Admin-only fields
  writer_id?: number
  writer_email?: string
  updated_at?: string
  internal_notes?: string
  file_count?: number
  total_file_size?: number
}

interface SolutionData {
  solutions: OrderSolution[]
  revision_count: number
  can_request_revision: boolean
  has_accepted_solution: boolean
  max_revisions: number
}

interface OrderSolutionManagerProps {
  orderId: string
}

export default function OrderSolutionManager({ orderId }: OrderSolutionManagerProps) {
  const [solutionData, setSolutionData] = useState<SolutionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [requestingRevision, setRequestingRevision] = useState<string | null>(null)
  const [revisionFeedback, setRevisionFeedback] = useState('')

  const { getAuthHeaders, user } = useAuth()
  const { toast } = useToast()
  
  const isAdmin = user?.is_staff || user?.is_superuser

  useEffect(() => {
    if (orderId) {
      fetchSolutions()
    }
  }, [orderId])

  const fetchSolutions = async () => {
    try {
      const response = await fetch(getApiUrl(`get_order_solutions/${orderId}/`), {
        headers: getAuthHeaders()
      })

      if (response.ok) {
        const data = await response.json()
        setSolutionData(data)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load solutions')
      }
    } catch (error) {
      console.error('Error fetching solutions:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load solutions',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadSolutionFile = async (fileId: string, fileName: string) => {
    setDownloading(fileId)
    try {
      console.log(`Downloading solution file ${fileId}: ${fileName}`)
      
      const response = await fetch(getApiUrl(`download_solution_file/${fileId}/`), {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (response.ok) {
        const contentType = response.headers.get('Content-Type')
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Unexpected error downloading file')
        }
        
        const blob = await response.blob()
        if (blob.size === 0) {
          throw new Error('File is empty or not found')
        }
        
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)
        
        toast({
          title: 'Download Started',
          description: `Downloading "${fileName}"`
        })
      } else {
        const errorText = await response.text()
        throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error downloading solution file:', error)
      toast({
        title: 'Download Error',
        description: error instanceof Error ? error.message : 'Failed to download file',
        variant: 'destructive'
      })
    } finally {
      setDownloading(null)
    }
  }

  const acceptSolution = async (solutionId: string) => {
    setAccepting(solutionId)
    try {
      const response = await fetch(getApiUrl('accept_solution/'), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          solution_id: solutionId
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: 'Solution Accepted',
          description: data.message || 'Solution has been accepted successfully',
          variant: 'default'
        })
        fetchSolutions() // Refresh solutions
      } else {
        throw new Error(data.error || 'Failed to accept solution')
      }
    } catch (error) {
      console.error('Error accepting solution:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to accept solution',
        variant: 'destructive'
      })
    } finally {
      setAccepting(null)
    }
  }

  const requestRevision = async (solutionId: string) => {
    if (!revisionFeedback.trim()) {
      toast({
        title: 'Feedback Required',
        description: 'Please provide feedback explaining what needs to be revised',
        variant: 'destructive'
      })
      return
    }

    setRequestingRevision(solutionId)
    try {
      const response = await fetch(getApiUrl('request_revision/'), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          solution_id: solutionId,
          feedback: revisionFeedback.trim()
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: 'Revision Requested',
          description: `${data.message}. Remaining revisions: ${data.remaining_revisions}`,
          variant: 'default'
        })
        setRevisionFeedback('')
        fetchSolutions() // Refresh solutions
      } else {
        throw new Error(data.error || 'Failed to request revision')
      }
    } catch (error) {
      console.error('Error requesting revision:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to request revision',
        variant: 'destructive'
      })
    } finally {
      setRequestingRevision(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Pending Review</Badge>
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Accepted</Badge>
      case 'revision_requested':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Revision Requested</Badge>
      case 'superseded':
        return <Badge variant="secondary">Superseded</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'main_solution':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'ai_report':
        return <Users className="h-4 w-4 text-purple-600" />
      case 'plagiarism_report':
        return <Shield className="h-4 w-4 text-red-600" />
      case 'supplementary':
        return <FileText className="h-4 w-4 text-gray-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getFileTypeLabel = (fileType: string) => {
    switch (fileType) {
      case 'main_solution':
        return 'Main Solution'
      case 'ai_report':
        return 'AI Report'
      case 'plagiarism_report':
        return 'Plagiarism Report'
      case 'supplementary':
        return 'Supplementary'
      default:
        return 'File'
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading solutions...</p>
        </CardContent>
      </Card>
    )
  }

  if (!solutionData || solutionData.solutions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Solution Files
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2 text-gray-600">No Solutions Yet</h3>
          <p className="text-gray-500">
            Your writer hasn't submitted any solutions for this order yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Solution Files
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Revisions Used: {solutionData.revision_count}/{solutionData.max_revisions}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Admin Overview */}
        {isAdmin && solutionData.solutions.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-indigo-900 mb-3 flex items-center">
              <BarChart3 className="h-4 w-4 mr-1" />
              Admin Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-indigo-800">
                  {solutionData.solutions.length}
                </div>
                <div className="text-indigo-600">Total Versions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-800">
                  {solutionData.solutions.filter(s => s.status === 'accepted').length}
                </div>
                <div className="text-green-600">Accepted</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-800">
                  {solutionData.solutions.filter(s => s.status === 'revision_requested').length}
                </div>
                <div className="text-yellow-600">Revisions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-800">
                  {solutionData.solutions.reduce((sum, s) => sum + (s.file_count || 0), 0)}
                </div>
                <div className="text-blue-600">Total Files</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-indigo-700">
              Total File Size: {formatFileSize(
                solutionData.solutions.reduce((sum, s) => sum + (s.total_file_size || 0), 0)
              )}
            </div>
          </div>
        )}
        
        {solutionData.solutions.map((solution) => (
          <div key={solution.id} className="border rounded-lg p-4">
            {/* Solution Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                  Version {solution.version}
                </div>
                {getStatusBadge(solution.status)}
                <span className="text-sm text-gray-600">
                  by {solution.writer_name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {formatDate(solution.submitted_at)}
              </div>
            </div>

            {/* Admin-only Information */}
            {isAdmin && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Admin Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Writer ID:</span>
                    <span className="ml-1 text-gray-600">{solution.writer_id}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Writer Email:</span>
                    <span className="ml-1 text-gray-600">{solution.writer_email}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Last Updated:</span>
                    <span className="ml-1 text-gray-600">
                      {solution.updated_at ? formatDate(solution.updated_at) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Files:</span>
                    <span className="ml-1 text-gray-600">
                      {solution.file_count} files ({formatFileSize(solution.total_file_size || 0)})
                    </span>
                  </div>
                </div>
                {solution.internal_notes && (
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <span className="font-medium text-gray-700">Internal Notes:</span>
                    <p className="text-gray-600 mt-1 text-sm">{solution.internal_notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Solution Description */}
            {solution.description && (
              <div className="mb-4 p-3 bg-gray-50 rounded border">
                <h4 className="font-medium text-gray-800 mb-2">Writer's Notes:</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {solution.description}
                </p>
              </div>
            )}

            {/* Solution Files */}
            {solution.files.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Files:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {solution.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-white border rounded hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {getFileTypeIcon(file.file_type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {file.original_name}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {getFileTypeLabel(file.file_type)}
                            </Badge>
                            <span className="text-xs text-gray-600">
                              {formatFileSize(file.file_size)}
                            </span>
                            {isAdmin && (
                              <span className="text-xs text-gray-500">
                                • Uploaded {formatDate(file.upload_date)}
                              </span>
                            )}
                          </div>
                          {file.description && (
                            <p className="text-xs text-gray-600 mt-1 truncate">
                              {file.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadSolutionFile(file.id, file.original_name)}
                        disabled={downloading === file.id}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2"
                        title="Download file"
                      >
                        {downloading === file.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Client Feedback */}
            {solution.client_feedback && (
              <div className="mb-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                <h4 className="font-medium text-yellow-900 mb-2">Your Feedback:</h4>
                <p className="text-sm text-yellow-800 whitespace-pre-wrap">
                  {solution.client_feedback}
                </p>
              </div>
            )}

            {/* Admin Timeline/History */}
            {isAdmin && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Solution Timeline
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-1 border-l-2 border-blue-400 pl-3">
                    <span className="text-gray-700">
                      <strong>Submitted</strong> by {solution.writer_name}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {formatDate(solution.submitted_at)}
                    </span>
                  </div>
                  
                  {solution.revision_requested_at && (
                    <div className="flex justify-between items-center py-1 border-l-2 border-yellow-400 pl-3">
                      <span className="text-gray-700">
                        <strong>Revision Requested</strong>
                      </span>
                      <span className="text-gray-500 text-xs">
                        {formatDate(solution.revision_requested_at)}
                      </span>
                    </div>
                  )}
                  
                  {solution.accepted_at && (
                    <div className="flex justify-between items-center py-1 border-l-2 border-green-400 pl-3">
                      <span className="text-gray-700">
                        <strong>Accepted</strong> by customer
                      </span>
                      <span className="text-gray-500 text-xs">
                        {formatDate(solution.accepted_at)}
                      </span>
                    </div>
                  )}
                  
                  {solution.updated_at && solution.updated_at !== solution.submitted_at && (
                    <div className="flex justify-between items-center py-1 border-l-2 border-purple-400 pl-3">
                      <span className="text-gray-700">
                        <strong>Last Modified</strong>
                      </span>
                      <span className="text-gray-500 text-xs">
                        {formatDate(solution.updated_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons for Submitted Solutions */}
            {solution.status === 'submitted' && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Review the solution and choose your action:
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => acceptSolution(solution.id)}
                      disabled={accepting === solution.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {accepting === solution.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Accepting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept Solution
                        </>
                      )}
                    </Button>
                    
                    {solutionData.can_request_revision && (
                      <Button
                        variant="outline"
                        onClick={() => setRequestingRevision(solution.id)}
                        disabled={requestingRevision === solution.id}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Request Revision
                      </Button>
                    )}
                  </div>
                </div>

                {/* Revision Request Form */}
                {requestingRevision === solution.id && (
                  <div className="space-y-3 p-4 bg-orange-50 rounded border border-orange-200">
                    <h4 className="font-medium text-orange-900">Request Revision</h4>
                    <p className="text-sm text-orange-800">
                      Please provide detailed feedback explaining what needs to be changed or improved.
                    </p>
                    <Textarea
                      placeholder="Explain what needs to be revised..."
                      value={revisionFeedback}
                      onChange={(e) => setRevisionFeedback(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-orange-700">
                        Remaining revisions: {solutionData.max_revisions - solutionData.revision_count}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setRequestingRevision(null)
                            setRevisionFeedback('')
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => requestRevision(solution.id)}
                          disabled={!revisionFeedback.trim()}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Revision Request
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {!solutionData.can_request_revision && (
                  <div className="p-3 bg-red-50 rounded border border-red-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-800">
                        Maximum number of revisions ({solutionData.max_revisions}) has been reached.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Status Information */}
            {solution.accepted_at && (
              <div className="p-3 bg-green-50 rounded border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    Solution accepted on {formatDate(solution.accepted_at)}
                  </span>
                </div>
              </div>
            )}

            {solution.revision_requested_at && solution.status === 'revision_requested' && (
              <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Revision requested on {formatDate(solution.revision_requested_at)}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}