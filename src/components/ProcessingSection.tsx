import { useState } from 'react'
import { CheckCircle, XCircle, Send, Loader2 } from 'lucide-react'

interface ProcessingState {
  isProcessing: boolean
  progress: number
  result: string | null
  error: string | null
}

interface ProcessingSectionProps {
  processing: ProcessingState
  onSendToPrinter: (text: string) => void
  inputMode?: 'camera' | 'manual'
}

export function ProcessingSection({ processing, onSendToPrinter, inputMode = 'camera' }: ProcessingSectionProps) {
  const { isProcessing, progress, result, error } = processing

  return (
    <div className="bg-black rounded-xl p-8 border border-gray-800">
      <h2 className="text-xl font-semibold mb-6 text-white">Processing</h2>
      
      {isProcessing && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
            <span className="text-sm text-gray-300">
              {inputMode === 'camera' ? 'Analyzing with AI...' : 'Preparing text...'}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">
            {progress}% complete
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-start space-x-2 p-4 rounded-lg bg-red-900/20 border border-red-700">
          <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-400">Processing Error</p>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex items-start space-x-2 p-4 rounded-lg bg-green-900/20 border border-green-700">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-400">
                {inputMode === 'camera' ? 'Analysis Complete' : 'Text Ready'}
              </p>
              <p className="text-sm text-green-300 mt-1">
                {inputMode === 'camera' 
                  ? 'AI-generated Braille description:' 
                  : 'Text converted to Braille format:'
                }
              </p>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-gray-700">
            <p className="text-lg font-mono text-center text-white">
              "{result}"
            </p>
          </div>
          
          <button
            onClick={() => onSendToPrinter(result)}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40"
          >
            <Send className="h-4 w-4" />
            <span>Send to Braille Printer</span>
          </button>
        </div>
      )}
    </div>
  )
}
