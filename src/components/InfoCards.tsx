import { useState } from 'react'
import { Info, Lightbulb, HelpCircle } from 'lucide-react'

export function InfoCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Instructions Card */}
      <div className="bg-black rounded-xl p-6 border border-gray-800">
        <div className="flex items-center space-x-3 mb-4">
          <Info className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-white text-lg">Instructions:</h3>
        </div>
        <div className="space-y-3 text-sm text-gray-300">
          <p>1. Capture an image of any item or scene</p>
          <p>2. AI analyzes the image and creates a 4-word description</p>
          <p>3. Connect your Braille printer/Arduino via USB</p>
          <p>4. Send the description to create a tactile Braille label</p>
        </div>
      </div>

      {/* About Dotify Card */}
      <div className="bg-black rounded-xl p-6 border border-gray-800">
        <div className="flex items-center space-x-3 mb-4">
          <HelpCircle className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-white text-lg">About Dotify:</h3>
        </div>
        <div className="space-y-3 text-sm text-gray-300">
          <p>Dotify creates concise, meaningful Braille labels at the click of a button. Each description includes key details like size, brand, or other information while ending with the main subject for easy identification.</p>
        </div>
      </div>

      {/* Perfect for Card */}
      <div className="bg-black rounded-xl p-6 border border-gray-800">
        <div className="flex items-center space-x-3 mb-4">
          <Lightbulb className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-white text-lg">Perfect for:</h3>
        </div>
        <div className="space-y-3 text-sm text-gray-300">
          <p>• Product identification and organization</p>
          <p>• Medication safety and inventory</p>
          <p>• Retail accessibility solutions</p>
          <p>• Household item management</p>
          <p>• Independent living assistance</p>
        </div>
      </div>
    </div>
  )
}
