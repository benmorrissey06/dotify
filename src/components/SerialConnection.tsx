import { useState, useCallback } from 'react'
import { Wifi, WifiOff, Loader2, Settings } from 'lucide-react'

interface SerialConnectionProps {
  isConnected: boolean
  onConnectionChange: (connected: boolean) => void
}

export function SerialConnection({ isConnected, onConnectionChange }: SerialConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [availablePorts, setAvailablePorts] = useState<string[]>([])

  const listAvailablePorts = useCallback(async () => {
    try {
      if (!('serial' in navigator)) return
      
      const ports = await (navigator as any).serial.getPorts()
      const portInfo = ports.map((port: any) => `${port.getInfo().usbVendorId || 'Unknown'}:${port.getInfo().usbProductId || 'Unknown'}`)
      setAvailablePorts(portInfo)
      console.log('Available ports:', portInfo)
    } catch (error) {
      console.error('Failed to list ports:', error)
    }
  }, [])

  const connectToPrinter = useCallback(async () => {
    if (isConnected) return

    setIsConnecting(true)
    
    try {
      // Check if Web Serial API is supported
      if (!('serial' in navigator)) {
        throw new Error('Web Serial API is not supported in this browser. Please use Chrome or Edge.')
      }

      // Check if we're on HTTPS or localhost
      if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        throw new Error('Web Serial API requires HTTPS or localhost. Please use https:// or localhost.')
      }

      // Request port access with filters
      const port = await (navigator as any).serial.requestPort({
        filters: [
          { usbVendorId: 0x2341 }, // Arduino
          { usbVendorId: 0x1A86 }, // CH340 (common USB-serial chip)
          { usbVendorId: 0x0403 }, // FTDI
          { usbVendorId: 0x10C4 }, // Silicon Labs
        ]
      })
      
      // Open the port with more options
      await port.open({ 
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
      })
      
      onConnectionChange(true)
      
      // Store port for later use
      ;(window as any).serialPort = port
      
      console.log('Successfully connected to printer:', port)
      
    } catch (error) {
      console.error('Serial connection failed:', error)
      
      let errorMessage = 'Unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      // Provide more specific error messages
      if (errorMessage.includes('No port selected')) {
        errorMessage = 'No printer port selected. Please try again and select a port from the list.'
      } else if (errorMessage.includes('Failed to open serial port')) {
        errorMessage = 'Failed to open serial port. Make sure:\n• The printer is connected via USB\n• The printer is powered on\n• No other application is using the port\n• Try a different USB port'
      } else if (errorMessage.includes('Access denied')) {
        errorMessage = 'Access denied. Make sure you select the correct port from the list.'
      }
      
      alert(`Failed to connect to printer: ${errorMessage}`)
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

      </div>
    </div>
  )
}
