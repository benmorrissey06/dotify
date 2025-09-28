import { useState } from 'react'
import { Type, Loader2 } from 'lucide-react'

interface ManualModeProps {
  text: string
  onTextChange: (text: string) => void
  onProcess: () => void
  isProcessing: boolean
}

export function ManualMode({ text, onTextChange, onProcess, isProcessing }: ManualModeProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-2">1. Enter text to convert to Braille</h2>
      </div>
      
      <div className="space-y-6">
        <div>
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Type or paste your text here..."
            className="w-full min-h-[140px] px-6 py-4 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all duration-200"
            disabled={isProcessing}
          />
          <p className="mt-2 text-sm text-gray-400">
            {text.length} characters
          </p>
        </div>

        <button
          onClick={onProcess}
          disabled={!text.trim() || isProcessing}
          className="w-full flex items-center justify-center space-x-3 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-medium">Processing...</span>
            </>
          ) : (
            <>
              <Type className="h-5 w-5" />
              <span className="font-medium">Process Text</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
