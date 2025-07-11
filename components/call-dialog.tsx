"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Minimize2,
  Maximize2,
  Square,
  GripHorizontal,
  Volume2,
  Settings,
  MessageSquare,
  BarChart3,
  Brain,
  Clock,
  User,
  Zap,
} from "lucide-react"

interface CallDialogProps {
  isOpen: boolean
  onClose: () => void
  initialPosition?: { x: number; y: number }
}

type CallState = "idle" | "connecting" | "active" | "ended"
type WindowState = "normal" | "minimized" | "maximized"

interface TranscriptionEntry {
  id: string
  speaker: string
  text: string
  timestamp: string
  confidence: number
}

interface InsightData {
  sentiment: "positive" | "neutral" | "negative"
  keywords: string[]
  topics: string[]
  actionItems: string[]
  summary: string
}

export function CallDialog({ isOpen, onClose, initialPosition = { x: 100, y: 100 } }: CallDialogProps) {
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState({ width: 800, height: 600 })
  const [windowState, setWindowState] = useState<WindowState>("normal")
  const [callState, setCallState] = useState<CallState>("idle")
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [selectedInsight, setSelectedInsight] = useState("transcription")

  const dialogRef = useRef<HTMLDivElement>(null)
  const resizeRef = useRef<HTMLDivElement>(null)

  // Mock transcription data
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([
    {
      id: "1",
      speaker: "John Doe",
      text: "Hello everyone, thanks for joining today's call. Let's start by reviewing the quarterly results.",
      timestamp: "10:30:15",
      confidence: 0.95,
    },
    {
      id: "2",
      speaker: "Sarah Smith",
      text: "Great! I have the numbers ready. Our revenue increased by 23% this quarter.",
      timestamp: "10:30:45",
      confidence: 0.92,
    },
  ])

  // Mock insights data
  const insights: InsightData = {
    sentiment: "positive",
    keywords: ["revenue", "quarterly", "results", "growth", "performance"],
    topics: ["Financial Performance", "Quarterly Review", "Revenue Growth"],
    actionItems: [
      "Follow up on Q4 projections",
      "Schedule team meeting for next week",
      "Prepare detailed revenue breakdown",
    ],
    summary: "Positive quarterly review discussing 23% revenue growth and planning next steps.",
  }

  // Simulate live transcription
  useEffect(() => {
    if (callState === "active") {
      const interval = setInterval(() => {
        const newTranscription: TranscriptionEntry = {
          id: Date.now().toString(),
          speaker: Math.random() > 0.5 ? "John Doe" : "Sarah Smith",
          text: "This is a simulated live transcription entry...",
          timestamp: new Date().toLocaleTimeString(),
          confidence: 0.85 + Math.random() * 0.15,
        }
        setTranscriptions((prev) => [...prev, newTranscription])
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [callState])

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowState === "maximized") return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && windowState !== "maximized") {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
    if (isResizing) {
      const newWidth = Math.max(400, resizeStart.width + (e.clientX - resizeStart.x))
      const newHeight = Math.max(300, resizeStart.height + (e.clientY - resizeStart.y))
      setSize({ width: newWidth, height: newHeight })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    })
  }

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, isResizing, dragStart, resizeStart])

  const handleMinimize = () => {
    setWindowState("minimized")
  }

  const handleMaximize = () => {
    setWindowState(windowState === "maximized" ? "normal" : "maximized")
  }

  const handleClose = () => {
    if (callState === "active") return // Cannot close during active call
    onClose()
  }

  const startCall = () => {
    setCallState("connecting")
    setTimeout(() => setCallState("active"), 2000)
  }

  const endCall = () => {
    setCallState("ended")
    setTimeout(() => setCallState("idle"), 1000)
  }

  if (!isOpen) return null

  const getWindowStyle = () => {
    if (windowState === "minimized") {
      return {
        position: "fixed" as const,
        bottom: "20px",
        right: "20px",
        width: "300px",
        height: "60px",
        zIndex: 1000,
      }
    }
    if (windowState === "maximized") {
      return {
        position: "fixed" as const,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1000,
      }
    }
    return {
      position: "fixed" as const,
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: `${size.width}px`,
      height: `${size.height}px`,
      zIndex: 1000,
    }
  }

  if (windowState === "minimized") {
    return (
      <Card style={getWindowStyle()} className="shadow-lg border-2">
        <CardHeader className="p-3 cursor-pointer" onClick={() => setWindowState("normal")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">{callState === "active" ? "Call Active" : "Call Dialog"}</span>
              {callState === "active" && (
                <Badge variant="destructive" className="text-xs">
                  LIVE
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleClose()
              }}
              disabled={callState === "active"}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card ref={dialogRef} style={getWindowStyle()} className="shadow-2xl border-2 overflow-hidden">
      {/* Title Bar */}
      <CardHeader className="p-3 cursor-move bg-muted/50 border-b" onMouseDown={handleMouseDown}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripHorizontal className="w-4 h-4 text-muted-foreground" />
            <Phone className="w-4 h-4" />
            <span className="font-medium">Call Interface</span>
            {callState === "active" && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                LIVE
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleMinimize} className="h-6 w-6 p-0">
              <Minimize2 className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleMaximize} className="h-6 w-6 p-0">
              {windowState === "maximized" ? <Square className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={callState === "active"}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 h-full flex flex-col">
        {/* Call Controls */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Conference Call</p>
                  <p className="text-xs text-muted-foreground">
                    {callState === "active" && "Connected • 00:05:23"}
                    {callState === "connecting" && "Connecting..."}
                    {callState === "idle" && "Ready to connect"}
                    {callState === "ended" && "Call ended"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={isMuted ? "destructive" : "outline"}
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
                disabled={callState !== "active"}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button
                variant={!isVideoOn ? "destructive" : "outline"}
                size="sm"
                onClick={() => setIsVideoOn(!isVideoOn)}
                disabled={callState !== "active"}
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm" disabled={callState !== "active"}>
                <Volume2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={callState !== "active"}>
                <Settings className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              {callState === "idle" && (
                <Button onClick={startCall} className="bg-green-600 hover:bg-green-700">
                  <Phone className="w-4 h-4 mr-2" />
                  Start Call
                </Button>
              )}
              {(callState === "active" || callState === "connecting") && (
                <Button onClick={endCall} variant="destructive">
                  <PhoneOff className="w-4 h-4 mr-2" />
                  End Call
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area - Unified View */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Live Transcription */}
          <div className="flex-1 border-r flex flex-col">
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <h3 className="font-medium">Live Transcription</h3>
                </div>
                {callState === "active" && (
                  <Badge variant="outline" className="animate-pulse">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    Recording
                  </Badge>
                )}
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {transcriptions.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-3 bg-background">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{entry.speaker}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(entry.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">{entry.text}</p>
                  </div>
                ))}
                {callState === "active" && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm p-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    Listening...
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - All Insights */}
          <div className="w-80 flex flex-col bg-muted/20">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <h3 className="font-medium">Real-time Insights</h3>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-medium">Duration</span>
                    </div>
                    <p className="text-lg font-bold">05:23</p>
                  </Card>
                  <Card className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-medium">People</span>
                    </div>
                    <p className="text-lg font-bold">3</p>
                  </Card>
                </div>

                {/* Sentiment Analysis */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4" />
                    <h4 className="font-medium text-sm">Sentiment</h4>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      variant={insights.sentiment === "positive" ? "default" : "secondary"}
                      className={
                        insights.sentiment === "positive" ? "bg-green-100 text-green-800 border-green-200" : ""
                      }
                    >
                      {insights.sentiment.charAt(0).toUpperCase() + insights.sentiment.slice(1)}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: insights.sentiment === "positive" ? "75%" : "45%" }}
                    ></div>
                  </div>
                </div>

                {/* Speaking Time */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Volume2 className="w-4 h-4" />
                    <h4 className="font-medium text-sm">Speaking Time</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs">John Doe</span>
                        <span className="text-xs text-muted-foreground">60%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: "60%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs">Sarah Smith</span>
                        <span className="text-xs text-muted-foreground">40%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: "40%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Topics */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4" />
                    <h4 className="font-medium text-sm">Key Topics</h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {insights.topics.map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs py-0.5 px-2">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4" />
                    <h4 className="font-medium text-sm">Keywords</h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {insights.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs py-0.5 px-2">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Items */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4" />
                    <h4 className="font-medium text-sm">Action Items</h4>
                  </div>
                  <div className="space-y-2">
                    {insights.actionItems.map((action, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-background rounded border text-xs">
                        <div className="w-3 h-3 border rounded mt-0.5 flex-shrink-0"></div>
                        <span className="leading-relaxed">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4" />
                    <h4 className="font-medium text-sm">AI Summary</h4>
                  </div>
                  <div className="p-3 bg-background rounded border">
                    <p className="text-xs text-muted-foreground leading-relaxed">{insights.summary}</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2 pt-2 border-t">
                  <Button size="sm" className="w-full text-xs h-8">
                    <Zap className="w-3 h-3 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-xs h-8 bg-transparent">
                    Export Transcript
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Resize Handle */}
        {windowState === "normal" && (
          <div
            ref={resizeRef}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={handleResizeStart}
          >
            <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-muted-foreground"></div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
