"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Send,
  Loader2,
  Leaf,
  Bug,
  CloudRain,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Sprout,
  BookOpen,
  Volume2,
  Camera,
  UserCheck,
} from "lucide-react"
import { KnowledgeSearch } from "./knowledge-search"
import { VoiceControls } from "./voice-controls"
import { ImageUpload, type ImageAnalysisResult } from "./image-upload"
import { EscalationAlert } from "./escalation-alert"
import { shouldEscalate, type EscalationCase, type EscalationTrigger } from "@/lib/expert-escalation"

const quickQuestions = [
  { icon: Bug, text: "How to identify and control aphids in my crops?", category: "pest" },
  { icon: Leaf, text: "What are the symptoms of rice blast disease?", category: "disease" },
  { icon: CloudRain, text: "How should I prepare my fields for monsoon?", category: "weather" },
  { icon: DollarSign, text: "What are the eligibility criteria for PM-KISAN scheme?", category: "subsidy" },
  { icon: TrendingUp, text: "When is the best time to sell my harvest?", category: "market" },
]

export function FarmerAdvisoryChat() {
  const [input, setInput] = useState("")
  const [currentLanguage, setCurrentLanguage] = useState("en-US")
  const [lastAssistantMessage, setLastAssistantMessage] = useState("")
  const [showEscalationAlert, setShowEscalationAlert] = useState(false)
  const [escalationData, setEscalationData] = useState<{
    query: string
    triggers: EscalationTrigger[]
    severity: "medium" | "high" | "critical"
  } | null>(null)
  const [escalatedCases, setEscalatedCases] = useState<Partial<EscalationCase>[]>([])

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/farmer-chat" }),
    onFinish: (message, { response }) => {
      const escalationRequired = response?.headers.get("X-Escalation-Required") === "true"
      if (escalationRequired) {
        const severity = (response?.headers.get("X-Escalation-Severity") as "medium" | "high" | "critical") || "medium"
        const triggersHeader = response?.headers.get("X-Escalation-Triggers")
        const triggers = triggersHeader ? JSON.parse(triggersHeader) : []

        // Get the user's last message
        const lastUserMessage = messages[messages.length - 2] // -2 because the assistant message was just added
        const userQuery = lastUserMessage?.parts?.[0]?.type === "text" ? lastUserMessage.parts[0].text : ""

        setEscalationData({
          query: userQuery,
          triggers,
          severity,
        })
        setShowEscalationAlert(true)
      }
    },
  })

  // Update last assistant message for TTS
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === "assistant") {
      const textContent = lastMessage.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join(" ")
      setLastAssistantMessage(textContent)
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && status !== "in_progress") {
      sendMessage({ text: input })
      setInput("")
    }
  }

  const handleQuickQuestion = (question: string) => {
    if (status !== "in_progress") {
      sendMessage({ text: question })
    }
  }

  const handleVoiceTranscript = (transcript: string) => {
    setInput(transcript)
  }

  const handleImageAnalysis = (result: ImageAnalysisResult) => {
    const analysisMessage = `I uploaded an image for analysis. Here are the results:

**Issue Identified:** ${result.analysis.primaryIssue}
**Category:** ${result.analysis.category.replace("_", " ")}
**Severity:** ${result.analysis.severity}
**Confidence:** ${Math.round(result.analysis.confidence * 100)}%

**Description:** ${result.analysis.description}

**Recommendations:**
${result.analysis.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join("\n")}

${result.analysis.urgency ? "⚠️ This issue requires urgent attention!" : ""}

Can you provide additional advice or clarification on this analysis?`

    sendMessage({ text: analysisMessage })

    // Check if image analysis should trigger escalation
    const escalationCheck = shouldEscalate(analysisMessage, result.analysis.confidence, result.analysis)
    if (escalationCheck.shouldEscalate) {
      setEscalationData({
        query: analysisMessage,
        triggers: escalationCheck.triggers,
        severity: escalationCheck.severity,
      })
      setShowEscalationAlert(true)
    }
  }

  const handleManualEscalation = () => {
    const lastUserMessage =
      messages[messages.length - 1]?.role === "user" ? messages[messages.length - 1] : messages[messages.length - 2]

    const userQuery = lastUserMessage?.parts?.[0]?.type === "text" ? lastUserMessage.parts[0].text : ""

    if (userQuery) {
      const escalationCheck = shouldEscalate(userQuery, undefined, undefined, true)
      setEscalationData({
        query: userQuery,
        triggers: escalationCheck.triggers,
        severity: escalationCheck.severity,
      })
      setShowEscalationAlert(true)
    }
  }

  const handleEscalate = (escalationCase: Partial<EscalationCase>) => {
    setEscalatedCases((prev) => [...prev, escalationCase])
    // In a real app, this would send to a backend API
    console.log("Escalation case created:", escalationCase)
  }

  const handleDeclineEscalation = () => {
    setShowEscalationAlert(false)
    setEscalationData(null)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <Sprout className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Image Analysis
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Knowledge Base
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          {/* Expert Escalation Status */}
          {escalatedCases.length > 0 && (
            <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                <h4 className="font-semibold text-green-800 dark:text-green-200">Expert Consultation Active</h4>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                You have {escalatedCases.length} case(s) under expert review. You will be contacted within 2-4 hours.
              </p>
            </Card>
          )}

          {/* Voice Controls */}
          <VoiceControls
            onTranscriptChange={handleVoiceTranscript}
            textToSpeak={lastAssistantMessage}
            language={currentLanguage}
          />

          {/* Quick Questions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Common Questions</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {quickQuestions.map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex items-start gap-3 text-left hover:bg-accent hover:text-accent-foreground bg-transparent"
                  onClick={() => handleQuickQuestion(item.text)}
                  disabled={status === "in_progress"}
                >
                  <item.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.text}</span>
                </Button>
              ))}
            </div>
          </Card>

          {/* Chat Messages */}
          <Card className="min-h-[400px] p-6">
            <div className="space-y-4 mb-6">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <Leaf className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Welcome to AgriAI Assistant</h3>
                  <p className="text-muted-foreground text-pretty max-w-md mx-auto">
                    Ask me anything about farming using text, voice, or images. Critical issues will be escalated to
                    agricultural experts automatically.
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Volume2 className="h-4 w-4" />
                      <span>Voice</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Camera className="h-4 w-4" />
                      <span>Image Analysis</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UserCheck className="h-4 w-4" />
                      <span>Expert Escalation</span>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="p-2 bg-primary rounded-full flex-shrink-0">
                        <Sprout className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {message.parts.map((part, index) => {
                        if (part.type === "text") {
                          return (
                            <div key={index} className="whitespace-pre-wrap">
                              {part.text}
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                  </div>
                ))
              )}

              {status === "in_progress" && (
                <div className="flex gap-3 justify-start">
                  <div className="p-2 bg-primary rounded-full">
                    <Sprout className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Analyzing query and checking for expert escalation...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about crops, pests, weather, subsidies, or market prices... (critical issues will be escalated to experts)"
                    className="min-h-[60px] resize-none"
                    disabled={status === "in_progress"}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button type="submit" disabled={!input.trim() || status === "in_progress"} className="h-[60px] px-6">
                    {status === "in_progress" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                  {messages.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleManualEscalation}
                      className="gap-1 text-xs bg-transparent"
                    >
                      <UserCheck className="h-3 w-3" />
                      Expert
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  Critical issues are automatically escalated to agricultural experts. For emergencies, contact your
                  local agricultural officer immediately.
                </span>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="image" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Crop Image Analysis</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Upload photos of your crops to identify pests, diseases, nutrient deficiencies, and get expert
              recommendations. Critical issues will be escalated to specialists.
            </p>
            <ImageUpload onImageAnalysis={handleImageAnalysis} disabled={status === "in_progress"} />
          </Card>
        </TabsContent>

        <TabsContent value="knowledge">
          <KnowledgeSearch />
        </TabsContent>
      </Tabs>

      {/* Escalation Alert Dialog */}
      {showEscalationAlert && escalationData && (
        <EscalationAlert
          isOpen={showEscalationAlert}
          onClose={() => setShowEscalationAlert(false)}
          query={escalationData.query}
          triggers={escalationData.triggers}
          severity={escalationData.severity}
          onEscalate={handleEscalate}
          onDecline={handleDeclineEscalation}
        />
      )}
    </div>
  )
}
