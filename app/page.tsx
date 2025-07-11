"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CallDialog } from "@/components/call-dialog"

export default function Page() {
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Advanced Call Interface</h1>
          <p className="text-lg text-gray-600 mb-8">
            A fully featured call dialog with live transcription, AI insights, and analytics
          </p>

          <Button onClick={() => setIsCallDialogOpen(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">
            Open Call Dialog
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Fully draggable and resizable</li>
              <li>• Minimize/Maximize controls</li>
              <li>• Cannot close during active calls</li>
              <li>• Live transcription with confidence scores</li>
              <li>• AI-powered insights and analytics</li>
              <li>• Multiple insight panels</li>
              <li>• Real-time call controls</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Insight Panels</h3>
            <ul className="space-y-2 text-gray-600">
              <li>
                • <strong>Transcription:</strong> Live speech-to-text
              </li>
              <li>
                • <strong>AI Insights:</strong> Sentiment & topic analysis
              </li>
              <li>
                • <strong>Analytics:</strong> Call metrics & speaking time
              </li>
              <li>
                • <strong>Actions:</strong> Generated action items
              </li>
            </ul>
          </div>
        </div>
      </div>

      <CallDialog
        isOpen={isCallDialogOpen}
        onClose={() => setIsCallDialogOpen(false)}
        initialPosition={{ x: 200, y: 100 }}
      />
    </div>
  )
}
