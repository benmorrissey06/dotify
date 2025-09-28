import { useState, useCallback } from 'react'
import { Wifi, WifiOff, Loader2, Settings } from 'lucide-react'

interface SerialConnectionProps {
  isConnected: boolean
  onConnectionChange: (connected: boolean) => void
}

export function SerialConnection({ isConnected, onConnectionChange }: SerialConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const connectToPrinter = useCallback(async () => {
    if (isConnected) return

    setIsConnecting(true)
    
    try {
      // Check if Web Serial API is supported
      if (!('serial' in navigator)) {
        throw new Error('Web Serial API is not supported in this browser. Please use Chrome or Edge.')
      }

      // Request port access
      const port = await (navigator as any).serial.requestPort()
      
      // Open the port
      await port.open({ baudRate: 9600 })
      
      onConnectionChange(true)
      
      // Store port for later use
      ;(window as any).serialPort = port
      
    } catch (error) {
      console.error('Serial connection failed:', error)
      alert(`Failed to connect to printer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsConnecting(false)
    }
  }, [isConnected, onConnectionChange])

  const disconnectFromPrinter = useCallback(async () => {
    try {
      const port = (window as any).serialPort
      if (port) {
        await port.close()
        ;(window as any).serialPort = null
      }
      onConnectionChange(false)
    } catch (error) {
      console.error('Disconnect failed:', error)
    }
  }, [onConnectionChange])

  return (
    <div className="bg-black rounded-xl p-8 border border-gray-800">
      <h2 className="text-xl font-semibold mb-6 text-white">Braille Printer Connection</h2>
      
      <div className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-400" />
            ) : (
              <WifiOff className="h-5 w-5 text-gray-400" />
            )}
            <span className="text-sm font-medium text-white">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <div className="flex space-x-2">
            {!isConnected ? (
              <button
                onClick={connectToPrinter}
                disabled={isConnecting}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4" />
                    <span>Connect</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={disconnectFromPrinter}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all duration-200"
              >
                <span>Disconnect</span>
              </button>
            )}
          </div>
        </div>

        {/* Connection Info */}
        <div className="text-xs text-gray-400 space-y-1">
          <p>• Connect your Arduino Braille printer via USB</p>
          <p>• Make sure the printer is powered on and ready</p>
          <p>• Web Serial API requires Chrome or Edge browser</p>
        </div>
      </div>
    </div>
  )
}
