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
  GripVertical,
  TrendingUp,
  Target,
  FileText,
  Users,
  Calendar,
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
  height: number
  isCollapsed: boolean
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
  const [size, setSize] = useState({ width: 1000, height: 700 })
  const [windowState, setWindowState] = useState<WindowState>("normal")
  const [callState, setCallState] = useState<CallState>("idle")
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [transcriptionWidth, setTranscriptionWidth] = useState(500)
  const [isResizingTranscription, setIsResizingTranscription] = useState(false)
  const [resizeTranscriptionStart, setResizeTranscriptionStart] = useState({ x: 0, width: 0 })

  const dialogRef = useRef<HTMLDivElement>(null)
  const resizeRef = useRef<HTMLDivElement>(null)
  const transcriptionResizeRef = useRef<HTMLDivElement>(null)

  // Default insight panels
  const [insightPanels, setInsightPanels] = useState<InsightPanel[]>([
    { id: "sentiment", title: "Sentiment", icon: BarChart3, type: "sentiment", height: 120, isCollapsed: false },
    { id: "analytics", title: "Analytics", icon: TrendingUp, type: "analytics", height: 150, isCollapsed: false },
    { id: "keywords", title: "Keywords", icon: Zap, type: "keywords", height: 100, isCollapsed: false },
    { id: "actions", title: "Actions", icon: Target, type: "actions", height: 180, isCollapsed: false },
  ])

  // Available panel types for adding
  const availablePanelTypes = [
    { type: "summary" as const, title: "AI Summary", icon: FileText },
    { type: "participants" as const, title: "Participants", icon: Users },
    { type: "timeline" as const, title: "Timeline", icon: Calendar },
  ]

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
    keywords: ["revenue", "quarterly", "results", "growth", "performance", "team", "success", "metrics"],
    topics: ["Financial Performance", "Quarterly Review", "Revenue Growth", "Team Performance"],
    actionItems: [
      "Follow up on Q4 projections",
      "Schedule team meeting for next week",
      "Prepare detailed revenue breakdown",
      "Review marketing strategy",
      "Update stakeholder presentation",
    ],
    summary: "Positive quarterly review discussing 23% revenue growth and planning next steps for continued success.",
    participants: [
      { name: "John Doe", speakingTime: 60, sentiment: "positive" },
      { name: "Sarah Smith", speakingTime: 40, sentiment: "positive" },
    ],
    timeline: [
      { time: "10:30", event: "John Doe joined", type: "join" },
      { time: "10:31", event: "Sarah Smith joined", type: "join" },
      { time: "10:35", event: "Screen sharing started", type: "action" },
    ],
  }

  // Simulate live transcription
  useEffect(() => {
    if (callState === "active") {
      const interval = setInterval(() => {
        const newTranscription: TranscriptionEntry = {
          id: Date.now().toString(),
          speaker: Math.random() > 0.5 ? "John Doe" : "Sarah Smith",
          text: "This is a simulated live transcription entry with more detailed content...",
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

  // Transcription panel resize handlers
  const handleTranscriptionResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizingTranscription(true)
    setResizeTranscriptionStart({
      x: e.clientX,
      width: transcriptionWidth,
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
      const newWidth = Math.max(600, resizeStart.width + (e.clientX - resizeStart.x))
      const newHeight = Math.max(400, resizeStart.height + (e.clientY - resizeStart.y))
      setSize({ width: newWidth, height: newHeight })
    }
    if (isResizingTranscription) {
      const newWidth = Math.max(
        300,
        Math.min(size.width - 350, resizeTranscriptionStart.width + (e.clientX - resizeTranscriptionStart.x)),
      )
      setTranscriptionWidth(newWidth)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
    setIsResizingTranscription(false)
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
    if (isDragging || isResizing || isResizingTranscription) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, isResizing, isResizingTranscription, dragStart, resizeStart, resizeTranscriptionStart])

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

  // Panel management functions
  const addPanel = (type: InsightPanel["type"]) => {
    const panelType = availablePanelTypes.find((p) => p.type === type)
    if (!panelType) return

    const newPanel: InsightPanel = {
      id: `${type}-${Date.now()}`,
      title: panelType.title,
      icon: panelType.icon,
      type,
      height: 150,
      isCollapsed: false,
    }
    setInsightPanels((prev) => [...prev, newPanel])
  }

  const removePanel = (panelId: string) => {
    setInsightPanels((prev) => prev.filter((p) => p.id !== panelId))
  }

  const togglePanelCollapse = (panelId: string) => {
    setInsightPanels((prev) => prev.map((p) => (p.id === panelId ? { ...p, isCollapsed: !p.isCollapsed } : p)))
  }

  const resizePanel = (panelId: string, newHeight: number) => {
    setInsightPanels((prev) => prev.map((p) => (p.id === panelId ? { ...p, height: Math.max(80, newHeight) } : p)))
  }

  // Panel resize component
  const PanelResizeHandle = ({ panelId }: { panelId: string }) => {
    const [isResizingPanel, setIsResizingPanel] = useState(false)
    const [resizePanelStart, setResizePanelStart] = useState({ y: 0, height: 0 })

    const handlePanelResizeStart = (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsResizingPanel(true)
      const panel = insightPanels.find((p) => p.id === panelId)
      setResizePanelStart({
        y: e.clientY,
        height: panel?.height || 150,
      })
    }

    useEffect(() => {
      const handlePanelMouseMove = (e: MouseEvent) => {
        if (isResizingPanel) {
          const newHeight = resizePanelStart.height + (e.clientY - resizePanelStart.y)
          resizePanel(panelId, newHeight)
        }
      }

      const handlePanelMouseUp = () => {
        setIsResizingPanel(false)
      }

      if (isResizingPanel) {
        document.addEventListener("mousemove", handlePanelMouseMove)
        document.addEventListener("mouseup", handlePanelMouseUp)
        return () => {
          document.removeEventListener("mousemove", handlePanelMouseMove)
          document.removeEventListener("mouseup", handlePanelMouseUp)
        }
      }
    }, [isResizingPanel, resizePanelStart, panelId])

    return (
      <div
        className="h-2 cursor-row-resize hover:bg-blue-200 transition-colors flex items-center justify-center group"
        onMouseDown={handlePanelResizeStart}
      >
        <GripHorizontal className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    )
  }

  // Render panel content based on type
  const renderPanelContent = (panel: InsightPanel) => {
    if (panel.isCollapsed) return null

    switch (panel.type) {
      case "sentiment":
        return (
          <div className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <Badge
                variant={insights.sentiment === "positive" ? "default" : "secondary"}
                className={insights.sentiment === "positive" ? "bg-green-100 text-green-800 border-green-200" : ""}
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
        )

      case "analytics":
        return (
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold">05:23</div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">3</div>
                <div className="text-xs text-muted-foreground">People</div>
              </div>
            </div>
            <div className="space-y-2">
              {insights.participants.map((participant, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs">{participant.name}</span>
                    <span className="text-xs text-muted-foreground">{participant.speakingTime}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${index === 0 ? "bg-blue-500" : "bg-purple-500"}`}
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
          <div className="p-3">
            <div className="flex flex-wrap gap-1.5">
              {insights.keywords.slice(0, 8).map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-xs py-0.5 px-2">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )

      case "actions":
        return (
          <div className="p-3 space-y-2">
            {insights.actionItems.slice(0, 4).map((action, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-background rounded border text-xs">
                <div className="w-3 h-3 border rounded mt-0.5 flex-shrink-0"></div>
                <span className="leading-relaxed">{action}</span>
              </div>
            ))}
          </div>
        )

      case "summary":
        return (
          <div className="p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">{insights.summary}</p>
          </div>
        )

      case "participants":
        return (
          <div className="p-3 space-y-2">
            {insights.participants.map((participant, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-background rounded border">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-medium">{participant.name}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {participant.sentiment}
                </Badge>
              </div>
            ))}
          </div>
        )

      case "timeline":
        return (
          <div className="p-3 space-y-2">
            {insights.timeline.map((event, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground font-mono">{event.time}</span>
                <div
                  className={`w-2 h-2 rounded-full ${event.type === "join" ? "bg-green-500" : event.type === "leave" ? "bg-red-500" : "bg-blue-500"}`}
                ></div>
                <span>{event.event}</span>
              </div>
            ))}
          </div>
        )

      default:
        return <div className="p-3 text-xs text-muted-foreground">Panel content</div>
    }
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

  const insightPanelsWidth = size.width - transcriptionWidth - 20

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

        {/* Main Content Area - Unified View */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Live Transcription */}
          <div className="flex flex-col border-r" style={{ width: `${transcriptionWidth}px` }}>
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

          {/* Transcription Resize Handle */}
          <div
            ref={transcriptionResizeRef}
            className="w-1 cursor-col-resize hover:bg-blue-200 transition-colors flex items-center justify-center group"
            onMouseDown={handleTranscriptionResizeStart}
          >
            <GripVertical className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Right Panel - Multiple Insight Panels */}
          <div className="flex flex-col bg-muted/20" style={{ width: `${insightPanelsWidth}px` }}>
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <h3 className="font-medium">Real-time Insights</h3>
              </div>
              <div className="flex items-center gap-1">
                {availablePanelTypes
                  .filter((type) => !insightPanels.some((panel) => panel.type === type.type))
                  .map((type) => (
                    <Button
                      key={type.type}
                      variant="ghost"
                      size="sm"
                      onClick={() => addPanel(type.type)}
                      className="h-6 w-6 p-0"
                      title={`Add ${type.title}`}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  ))}
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-0">
                {insightPanels.map((panel, index) => (
                  <div key={panel.id} className="border-b last:border-b-0">
                    {/* Panel Header */}
                    <div className="p-3 bg-background/50 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <panel.icon className="w-4 h-4" />
                        <h4 className="font-medium text-sm">{panel.title}</h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePanelCollapse(panel.id)}
                          className="h-6 w-6 p-0"
                        >
                          {panel.isCollapsed ? <Plus className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => removePanel(panel.id)} className="h-6 w-6 p-0">
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Panel Content */}
                    {!panel.isCollapsed && (
                      <div style={{ height: `${panel.height}px` }} className="overflow-auto">
                        {renderPanelContent(panel)}
                      </div>
                    )}

                    {/* Panel Resize Handle */}
                    {!panel.isCollapsed && index < insightPanels.length - 1 && <PanelResizeHandle panelId={panel.id} />}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            <div className="p-3 border-t bg-background/50">
              <div className="space-y-2">
                <Button size="sm" className="w-full text-xs h-8">
                  <Zap className="w-3 h-3 mr-2" />
                  Generate Report
                </Button>
                <Button variant="outline" size="sm" className="w-full text-xs h-8 bg-transparent">
                  Export All Data
                </Button>
              </div>
            </div>
          </div>
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
