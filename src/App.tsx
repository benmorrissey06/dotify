import { useState, useCallback } from 'react'
import { Camera, Type, WifiIcon } from 'lucide-react'
import { useToast } from './hooks/useToast'
import { CameraMode } from './components/CameraMode'
import { ManualMode } from './components/ManualMode'
import { ProcessingSection } from './components/ProcessingSection'
import { SerialConnection } from './components/SerialConnection'
import { InfoCards } from './components/InfoCards'
import { analyzeImage } from './services/aiService'

type InputMode = 'camera' | 'manual'

interface ProcessingState {
  isProcessing: boolean
  progress: number
  result: string | null
  error: string | null
}

function App() {
  const [inputMode, setInputMode] = useState<InputMode>('camera')
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    result: null,
    error: null
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [manualText, setManualText] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const { toast } = useToast()

  const handleImageCapture = useCallback((file: File) => {
    setImageFile(file)
    setProcessing({ isProcessing: false, progress: 0, result: null, error: null })
  }, [])

  const handleManualTextChange = useCallback((text: string) => {
    setManualText(text)
    setProcessing({ isProcessing: false, progress: 0, result: null, error: null })
  }, [])

  const processImage = useCallback(async () => {
    if (!imageFile) return

    setProcessing({ isProcessing: true, progress: 0, result: null, error: null })

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProcessing(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }))
      }, 200)

      const result = await analyzeImage(imageFile)
      
      clearInterval(progressInterval)
      
      setProcessing({
        isProcessing: false,
        progress: 100,
        result,
        error: null
      })

      toast({
        title: "Analysis Complete",
        description: "Image successfully analyzed and converted to Braille description.",
      })
    } catch (error) {
      setProcessing({
        isProcessing: false,
        progress: 0,
        result: null,
        error: error instanceof Error ? error.message : 'Analysis failed'
      })

      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : 'Failed to analyze image',
        variant: "destructive"
      })
    }
  }, [imageFile, toast])

  const processManualText = useCallback(async () => {
    if (!manualText.trim()) return

    setProcessing({ isProcessing: true, progress: 0, result: null, error: null })

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProcessing(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 20, 90)
        }))
      }, 100)

      // For manual text, we'll just use the text as-is for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      clearInterval(progressInterval)
      
      setProcessing({
        isProcessing: false,
        progress: 100,
        result: manualText.trim(),
        error: null
      })

      toast({
        title: "Text Ready",
        description: "Text is ready to be sent to Braille printer.",
      })
    } catch (error) {
      setProcessing({
        isProcessing: false,
        progress: 0,
        result: null,
        error: error instanceof Error ? error.message : 'Processing failed'
      })

      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : 'Failed to process text',
        variant: "destructive"
      })
    }
  }, [manualText, toast])

  const sendToPrinter = useCallback(async (text: string) => {
    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect to the Braille printer first.",
        variant: "destructive"
      })
      return
    }

    try {
      const port = (window as any).serialPort
      if (!port) {
        throw new Error('No serial port available')
      }

      // Convert text to bytes and send
      const encoder = new TextEncoder()
      const data = encoder.encode(text + '\n') // Add newline for Arduino
      
      const writer = port.writable.getWriter()
      await writer.write(data)
      writer.releaseLock()
      
      console.log('Sent to printer:', text)
      
      toast({
        title: "Sent to Printer",
        description: `"${text}" successfully sent to Braille printer.`,
      })
    } catch (error) {
      console.error('Send failed:', error)
      toast({
        title: "Send Failed",
        description: `Failed to send text to printer: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      })
    }
  }, [isConnected, toast])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Logo Section - Prominent Feature */}
          <div className="flex flex-col items-center space-y-8">
            <div className="flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Dotify typrr" 
                className="h-48 w-auto drop-shadow-2xl"
              />
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600/20 rounded-xl border border-blue-500/30">
                <WifiIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-lg text-gray-300 font-medium">
                {isConnected ? 'Printer Connected' : 'Printer Disconnected'}
              </div>
            </div>
            
            {/* Main Title and Description */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-white mb-4">AI to Braille</h1>
              <p className="text-gray-400 text-xl max-w-3xl mx-auto leading-relaxed">
                Transform any image into precise Braille labels with AI-powered visual recognition. 
                Create accessible tactile labels for everyday items with just a photo.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Mode Toggle */}
        <div className="flex justify-center">
          <div className="flex bg-black rounded-xl p-1 border border-gray-800">
            <button
              onClick={() => setInputMode('camera')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                inputMode === 'camera'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Camera className="h-4 w-4" />
              <span>Camera Mode</span>
            </button>
            <button
              onClick={() => setInputMode('manual')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                inputMode === 'manual'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Type className="h-4 w-4" />
              <span>Manual Text</span>
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-black rounded-xl p-8 border border-gray-800">
          {inputMode === 'camera' ? (
            <CameraMode
              onImageCapture={handleImageCapture}
              onProcess={processImage}
              isProcessing={processing.isProcessing}
              hasImage={!!imageFile}
            />
          ) : (
            <ManualMode
              text={manualText}
              onTextChange={handleManualTextChange}
              onProcess={processManualText}
              isProcessing={processing.isProcessing}
            />
          )}
        </div>

        {/* Processing Section */}
        {(processing.isProcessing || processing.result || processing.error) && (
          <ProcessingSection
            processing={processing}
            onSendToPrinter={sendToPrinter}
          />
        )}

        {/* Serial Connection */}
        <SerialConnection
          isConnected={isConnected}
          onConnectionChange={setIsConnected}
        />

        {/* Info Cards */}
        <InfoCards />
      </main>
    </div>
  )
}

export default App