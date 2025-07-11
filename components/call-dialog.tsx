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
  User,
  Zap,
  Plus,
  X,
  TrendingUp,
  Target,
  FileText,
  Users,
  Calendar,
  Clock,
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

interface InsightPanel {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  type: "sentiment" | "analytics" | "keywords" | "actions" | "summary" | "participants" | "timeline"
}

interface InsightData {
  sentiment: "positive" | "neutral" | "negative"
  keywords: string[]
  topics: string[]
  actionItems: string[]
  summary: string
  participants: Array<{ name: string; speakingTime: number; sentiment: string }>
  timeline: Array<{ time: string; event: string; type: "join" | "leave" | "action" }>
}

export function CallDialog({ isOpen, onClose, initialPosition = { x: 100, y: 100 } }: CallDialogProps) {
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState({ width: 1200, height: 800 })
  const [windowState, setWindowState] = useState<WindowState>("normal")
  const [callState, setCallState] = useState<CallState>("idle")
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })

  const dialogRef = useRef<HTMLDivElement>(null)
  const resizeRef = useRef<HTMLDivElement>(null)

  // Add these state variables after the existing useState declarations
  const [panelHeights, setPanelHeights] = useState<Record<string, number>>({})
  const [resizingPanel, setResizingPanel] = useState<string | null>(null)
  const [resizeStartData, setResizeStartData] = useState({ y: 0, height: 0 })

  // Insight panels - maximum 4 panels
  const [insightPanels, setInsightPanels] = useState<InsightPanel[]>([
    { id: "sentiment", title: "Sentiment Analysis", icon: BarChart3, type: "sentiment" },
  ])

  // Available panel types for adding
  const availablePanelTypes = [
    { type: "sentiment" as const, title: "Sentiment Analysis", icon: BarChart3 },
    { type: "analytics" as const, title: "Call Analytics", icon: TrendingUp },
    { type: "keywords" as const, title: "Keywords", icon: Zap },
    { type: "actions" as const, title: "Action Items", icon: Target },
    { type: "summary" as const, title: "AI Summary", icon: FileText },
    { type: "participants" as const, title: "Participants", icon: Users },
    { type: "timeline" as const, title: "Timeline", icon: Calendar },
  ]

  // Mock transcription data
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([
    {
      id: "1",
      speaker: "John Doe",
      text: "Hello everyone, thanks for joining today's call. Let's start by reviewing the quarterly results and discussing our progress.",
      timestamp: "10:30:15",
      confidence: 0.95,
    },
    {
      id: "2",
      speaker: "Sarah Smith",
      text: "Great! I have the numbers ready. Our revenue increased by 23% this quarter, which exceeds our initial projections.",
      timestamp: "10:30:45",
      confidence: 0.92,
    },
    {
      id: "3",
      speaker: "Mike Johnson",
      text: "That's fantastic news! The marketing campaign really paid off. We should analyze what worked best.",
      timestamp: "10:31:20",
      confidence: 0.89,
    },
  ])

  // Mock insights data
  const insights: InsightData = {
    sentiment: "positive",
    keywords: [
      "revenue",
      "quarterly",
      "results",
      "growth",
      "performance",
      "team",
      "success",
      "metrics",
      "campaign",
      "projections",
    ],
    topics: ["Financial Performance", "Quarterly Review", "Revenue Growth", "Team Performance", "Marketing Analysis"],
    actionItems: [
      "Follow up on Q4 projections and budget planning",
      "Schedule team meeting for next week to discuss strategy",
      "Prepare detailed revenue breakdown for stakeholders",
      "Review marketing campaign effectiveness metrics",
      "Update stakeholder presentation with new data",
      "Analyze competitor performance in the same period",
    ],
    summary:
      "Positive quarterly review discussing 23% revenue growth, successful marketing campaigns, and strategic planning for continued success in the upcoming quarter.",
    participants: [
      { name: "John Doe", speakingTime: 45, sentiment: "positive" },
      { name: "Sarah Smith", speakingTime: 35, sentiment: "positive" },
      { name: "Mike Johnson", speakingTime: 20, sentiment: "enthusiastic" },
    ],
    timeline: [
      { time: "10:30", event: "John Doe joined the call", type: "join" },
      { time: "10:31", event: "Sarah Smith joined the call", type: "join" },
      { time: "10:31", event: "Mike Johnson joined the call", type: "join" },
      { time: "10:35", event: "Screen sharing started", type: "action" },
      { time: "10:40", event: "Quarterly report presented", type: "action" },
    ],
  }

  // Calculate layout based on number of panels
  const getLayoutConfig = () => {
    const panelCount = insightPanels.length

    if (panelCount === 0) {
      return { transcriptionWidth: 100, insightColumns: 0, insightRows: 0 }
    } else if (panelCount === 1) {
      return { transcriptionWidth: 50, insightColumns: 1, insightRows: 1 }
    } else if (panelCount <= 2) {
      return { transcriptionWidth: 33.33, insightColumns: 1, insightRows: 2 }
    } else if (panelCount <= 4) {
      return { transcriptionWidth: 33.33, insightColumns: 2, insightRows: 2 }
    }
    return { transcriptionWidth: 33.33, insightColumns: 2, insightRows: 2 }
  }

  const layoutConfig = getLayoutConfig()

  // Simulate live transcription
  useEffect(() => {
    if (callState === "active") {
      const interval = setInterval(() => {
        const speakers = ["John Doe", "Sarah Smith", "Mike Johnson"]
        const sampleTexts = [
          "This is a simulated live transcription entry with real-time content updates...",
          "We're seeing great progress on our key metrics and performance indicators.",
          "Let's discuss the next steps and action items for the upcoming quarter.",
          "The data shows significant improvement in customer satisfaction scores.",
        ]

        const newTranscription: TranscriptionEntry = {
          id: Date.now().toString(),
          speaker: speakers[Math.floor(Math.random() * speakers.length)],
          text: sampleTexts[Math.floor(Math.random() * sampleTexts.length)],
          timestamp: new Date().toLocaleTimeString(),
          confidence: 0.85 + Math.random() * 0.15,
        }
        setTranscriptions((prev) => [...prev, newTranscription])
      }, 8000)

      return () => clearInterval(interval)
    }
  }, [callState])

  // Main window drag handlers
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
      const newWidth = Math.max(800, resizeStart.width + (e.clientX - resizeStart.x))
      const newHeight = Math.max(600, resizeStart.height + (e.clientY - resizeStart.y))
      setSize({ width: newWidth, height: newHeight })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  // Main window resize handlers
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
    if (isDragging || isResizing || resizingPanel) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)

      if (resizingPanel) {
        document.addEventListener("mousemove", handlePanelMouseMove)
        document.addEventListener("mouseup", handlePanelMouseUp)
      }

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        if (resizingPanel) {
          document.removeEventListener("mousemove", handlePanelMouseMove)
          document.removeEventListener("mouseup", handlePanelMouseUp)
        }
      }
    }
  }, [isDragging, isResizing, resizingPanel, dragStart, resizeStart, resizeStartData])

  const handleMinimize = () => {
    setWindowState("minimized")
  }

  const handleMaximize = () => {
    setWindowState(windowState === "maximized" ? "normal" : "maximized")
  }

  const handleClose = () => {
    if (callState === "active") return
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

  // Add default height constant
  const DEFAULT_PANEL_HEIGHT = 200

  // Panel management functions
  const addPanel = (type: InsightPanel["type"]) => {
    if (insightPanels.length >= 4) return // Maximum 4 panels

    const panelType = availablePanelTypes.find((p) => p.type === type)
    if (!panelType) return

    const newPanel: InsightPanel = {
      id: `${type}-${Date.now()}`,
      title: panelType.title,
      icon: panelType.icon,
      type,
    }

    // Set default height for new panel
    setPanelHeights((prev) => ({
      ...prev,
      [newPanel.id]: DEFAULT_PANEL_HEIGHT,
    }))

    setInsightPanels((prev) => [...prev, newPanel])
  }

  const removePanel = (panelId: string) => {
    setInsightPanels((prev) => prev.filter((p) => p.id !== panelId))
  }

  // Add these functions after the existing panel management functions
  const handlePanelResizeStart = (e: React.MouseEvent, panelId: string) => {
    e.stopPropagation()
    setResizingPanel(panelId)
    setResizeStartData({
      y: e.clientY,
      height: panelHeights[panelId] || DEFAULT_PANEL_HEIGHT,
    })
  }

  const handlePanelMouseMove = (e: MouseEvent) => {
    if (resizingPanel) {
      const newHeight = Math.max(120, resizeStartData.height + (e.clientY - resizeStartData.y))
      setPanelHeights((prev) => ({
        ...prev,
        [resizingPanel]: newHeight,
      }))
    }
  }

  const handlePanelMouseUp = () => {
    setResizingPanel(null)
  }

  // Render panel content based on type
  const renderPanelContent = (panel: InsightPanel) => {
    switch (panel.type) {
      case "sentiment":
        return (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Overall Sentiment</h4>
              <Badge
                variant={insights.sentiment === "positive" ? "default" : "secondary"}
                className={insights.sentiment === "positive" ? "bg-green-100 text-green-800 border-green-200" : ""}
              >
                {insights.sentiment.charAt(0).toUpperCase() + insights.sentiment.slice(1)}
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: insights.sentiment === "positive" ? "85%" : "45%" }}
                ></div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-green-600">85%</div>
                  <div className="text-xs text-muted-foreground">Positive</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-600">12%</div>
                  <div className="text-xs text-muted-foreground">Neutral</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-600">3%</div>
                  <div className="text-xs text-muted-foreground">Negative</div>
                </div>
              </div>
            </div>
          </div>
        )

      case "analytics":
        return (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-background rounded-lg border">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-xl font-bold">05:23</div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg border">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-xl font-bold">3</div>
                <div className="text-xs text-muted-foreground">Participants</div>
              </div>
            </div>
            <div className="space-y-3">
              <h5 className="font-medium text-sm">Speaking Time</h5>
              {insights.participants.map((participant, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{participant.name}</span>
                    <span className="text-sm text-muted-foreground">{participant.speakingTime}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        index === 0 ? "bg-blue-500" : index === 1 ? "bg-purple-500" : "bg-orange-500"
                      }`}
                      style={{ width: `${participant.speakingTime}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "keywords":
        return (
          <div className="p-4 space-y-4">
            <h4 className="font-medium text-sm">Key Topics</h4>
            <div className="flex flex-wrap gap-2">
              {insights.keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Main Topics</h5>
              {insights.topics.map((topic, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-background rounded border">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">{topic}</span>
                </div>
              ))}
            </div>
          </div>
        )

      case "actions":
        return (
          <div className="p-4 space-y-4">
            <h4 className="font-medium text-sm">Action Items</h4>
            <div className="space-y-2">
              {insights.actionItems.map((action, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-background rounded border">
                  <div className="w-4 h-4 border-2 border-muted-foreground rounded mt-0.5 flex-shrink-0"></div>
                  <span className="text-sm leading-relaxed">{action}</span>
                </div>
              ))}
            </div>
          </div>
        )

      case "summary":
        return (
          <div className="p-4 space-y-4">
            <h4 className="font-medium text-sm">AI Summary</h4>
            <div className="p-4 bg-background rounded border">
              <p className="text-sm text-muted-foreground leading-relaxed">{insights.summary}</p>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Key Highlights</h5>
              <ul className="space-y-1">
                <li className="text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  23% revenue increase achieved
                </li>
                <li className="text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Marketing campaign success
                </li>
                <li className="text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  Strategic planning initiated
                </li>
              </ul>
            </div>
          </div>
        )

      case "participants":
        return (
          <div className="p-4 space-y-4">
            <h4 className="font-medium text-sm">Call Participants</h4>
            <div className="space-y-3">
              {insights.participants.map((participant, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background rounded border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{participant.name}</div>
                      <div className="text-xs text-muted-foreground">{participant.speakingTime}% speaking time</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {participant.sentiment}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )

      case "timeline":
        return (
          <div className="p-4 space-y-4">
            <h4 className="font-medium text-sm">Call Timeline</h4>
            <div className="space-y-3">
              {insights.timeline.map((event, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="text-xs text-muted-foreground font-mono w-12">{event.time}</div>
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      event.type === "join" ? "bg-green-500" : event.type === "leave" ? "bg-red-500" : "bg-blue-500"
                    }`}
                  ></div>
                  <span className="text-sm">{event.event}</span>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return <div className="p-4 text-sm text-muted-foreground">Panel content</div>
    }
  }

  // Add this component before the main return statement
  const PanelResizeHandle = ({ panelId }: { panelId: string }) => (
    <div
      className="h-2 cursor-row-resize hover:bg-blue-200 transition-colors flex items-center justify-center group border-t"
      onMouseDown={(e) => handlePanelResizeStart(e, panelId)}
    >
      <GripHorizontal className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )

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
            <span className="font-medium">Advanced Call Interface</span>
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

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Transcription Panel - Always Present */}
          <div className="flex flex-col border-r" style={{ width: `${layoutConfig.transcriptionWidth}%` }}>
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

          {/* Insights Panel Area */}
          {insightPanels.length > 0 && (
            <div className="flex-1 flex flex-col">
              {/* Insights Header */}
              <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  <h3 className="font-medium">Real-time Insights</h3>
                  <Badge variant="outline" className="text-xs">
                    {insightPanels.length}/4 panels
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  {availablePanelTypes
                    .filter((type) => !insightPanels.some((panel) => panel.type === type.type))
                    .slice(0, 4 - insightPanels.length)
                    .map((type) => (
                      <Button
                        key={type.type}
                        variant="ghost"
                        size="sm"
                        onClick={() => addPanel(type.type)}
                        className="h-7 px-2 text-xs"
                        title={`Add ${type.title}`}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {type.title}
                      </Button>
                    ))}
                </div>
              </div>

              {/* Insights Grid */}
              <div className="flex-1 overflow-hidden">
                {layoutConfig.insightColumns === 1 ? (
                  // Single column layout (1-2 panels)
                  <ScrollArea className="h-full">
                    <div className="space-y-0">
                      {insightPanels.map((panel, index) => (
                        <div key={panel.id} className="border-b last:border-b-0">
                          <div className="p-2 bg-background/50 border-b flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <panel.icon className="w-4 h-4" />
                              <h4 className="font-medium text-sm">{panel.title}</h4>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removePanel(panel.id)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          <div
                            className="overflow-auto"
                            style={{ height: `${panelHeights[panel.id] || DEFAULT_PANEL_HEIGHT}px` }}
                          >
                            {renderPanelContent(panel)}
                          </div>
                          {index < insightPanels.length - 1 && <PanelResizeHandle panelId={panel.id} />}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  // Two column layout (3-4 panels)
                  <div className="h-full flex">
                    <div className="flex-1 border-r">
                      <ScrollArea className="h-full">
                        <div className="space-y-0">
                          {insightPanels.slice(0, 2).map((panel, index) => (
                            <div key={panel.id} className="border-b last:border-b-0">
                              <div className="p-2 bg-background/50 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <panel.icon className="w-4 h-4" />
                                  <h4 className="font-medium text-sm">{panel.title}</h4>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removePanel(panel.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                              <div
                                className="overflow-auto"
                                style={{ height: `${panelHeights[panel.id] || DEFAULT_PANEL_HEIGHT}px` }}
                              >
                                {renderPanelContent(panel)}
                              </div>
                              {index < Math.min(2, insightPanels.length) - 1 && (
                                <PanelResizeHandle panelId={panel.id} />
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                    <div className="flex-1">
                      <ScrollArea className="h-full">
                        <div className="space-y-0">
                          {insightPanels.slice(2, 4).map((panel, index) => (
                            <div key={panel.id} className="border-b last:border-b-0">
                              <div className="p-2 bg-background/50 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <panel.icon className="w-4 h-4" />
                                  <h4 className="font-medium text-sm">{panel.title}</h4>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removePanel(panel.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                              <div
                                className="overflow-auto"
                                style={{ height: `${panelHeights[panel.id] || DEFAULT_PANEL_HEIGHT}px` }}
                              >
                                {renderPanelContent(panel)}
                              </div>
                              {index < insightPanels.slice(2, 4).length - 1 && <PanelResizeHandle panelId={panel.id} />}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Window Resize Handle */}
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
