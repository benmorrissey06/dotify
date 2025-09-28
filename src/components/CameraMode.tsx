import { useRef, useCallback, useState } from 'react'
import { Camera, Upload, Loader2, X, CheckCircle } from 'lucide-react'

interface CameraModeProps {
  onImageCapture: (file: File) => void
  onProcess: () => void
  isProcessing: boolean
  hasImage: boolean
}

export function CameraMode({ onImageCapture, onProcess, isProcessing, hasImage }: CameraModeProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      onImageCapture(file)
    }
  }, [onImageCapture])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
  }, [])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      onImageCapture(file)
    }
  }, [onImageCapture])

  const capturePhoto = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      // Fallback to file input
      fileInputRef.current?.click()
    }
  }, [])

  const takePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' })
            setSelectedImage(file)
            const reader = new FileReader()
            reader.onload = (e) => {
              setImagePreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
            onImageCapture(file)
          }
        }, 'image/jpeg', 0.8)
      }
      
      // Stop the video stream
      const stream = video.srcObject as MediaStream
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      video.srcObject = null
    }
  }, [onImageCapture])

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null)
    setImagePreview(null)
    onImageCapture(null as any)
  }, [onImageCapture])

  const handleSubmit = useCallback(() => {
    if (selectedImage) {
      onProcess()
    }
  }, [selectedImage, onProcess])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-2">1. Capture an image of any item or scene.</h2>
      </div>
      
      {/* Image Preview Section */}
      {imagePreview && (
        <div className="relative bg-black rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-green-400 font-medium text-lg">Image Selected</span>
            <button
              onClick={handleRemoveImage}
              className="ml-auto text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex space-x-6">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Selected"
                className="w-24 h-24 object-cover rounded-xl border border-gray-700"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-300 mb-3">
                {selectedImage?.name} ({(selectedImage?.size / 1024 / 1024).toFixed(2)} MB)
              </p>
              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <span>Submit for Analysis</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Area - Only show when no image selected */}
      {!imagePreview && (
        <div
          className="flex h-56 w-full cursor-pointer items-center justify-center rounded-xl bg-black border-2 border-dashed border-gray-700 transition-all duration-200 hover:border-gray-600 hover:bg-gray-900/20"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center">
            <div className="relative">
              <Camera className="mx-auto h-16 w-16 text-gray-500" />
              <div className="absolute inset-0 rounded-full bg-blue-600/10 animate-pulse"></div>
            </div>
            <p className="mt-4 text-lg text-gray-400 font-medium">Drag & drop image or</p>
            <p className="mt-1 text-sm text-gray-500">click to browse files</p>
          </div>
        </div>
      )}

      {/* Camera Controls - Only show when no image selected */}
      {!imagePreview && (
        <div className="flex justify-center space-x-6">
          <button
            onClick={capturePhoto}
            className="flex items-center space-x-3 px-8 py-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 border border-gray-700 hover:border-gray-600"
          >
            <Camera className="h-5 w-5" />
            <span className="font-medium">Capture</span>
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-3 px-8 py-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 border border-gray-700 hover:border-gray-600"
          >
            <Upload className="h-5 w-5" />
            <span className="font-medium">Upload</span>
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Video Preview (hidden) */}
      <video
        ref={videoRef}
        className="hidden"
      />
      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </div>
  )
}
