"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Mic, MicOff, Volume2, Play, Pause, Square, Settings } from "lucide-react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface VoiceControlsProps {
  onTranscriptChange: (transcript: string) => void
  textToSpeak?: string
  language?: string
}

export function VoiceControls({ onTranscriptChange, textToSpeak, language = "en-US" }: VoiceControlsProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [speechRate, setSpeechRate] = useState([1])
  const [speechPitch, setSpeechPitch] = useState([1])
  const [speechVolume, setSpeechVolume] = useState([1])

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: speechRecognitionSupported,
    error: speechError,
  } = useSpeechRecognition({
    language,
    continuous: true,
    interimResults: true,
  })

  const {
    speak,
    stop: stopSpeaking,
    pause: pauseSpeaking,
    resume: resumeSpeaking,
    isSpeaking,
    isPaused,
    isSupported: textToSpeechSupported,
    voices,
    setVoice,
    currentVoice,
  } = useTextToSpeech({
    language,
    rate: speechRate[0],
    pitch: speechPitch[0],
    volume: speechVolume[0],
  })

  // Update transcript when it changes
  useEffect(() => {
    if (transcript) {
      onTranscriptChange(transcript)
    }
  }, [transcript, onTranscriptChange])

  // Speak text when textToSpeak changes
  useEffect(() => {
    if (textToSpeak && textToSpeak.trim()) {
      speak(textToSpeak)
    }
  }, [textToSpeak, speak])

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      resetTranscript()
      startListening()
    }
  }

  const handleSpeechToggle = () => {
    if (isSpeaking) {
      if (isPaused) {
        resumeSpeaking()
      } else {
        pauseSpeaking()
      }
    } else {
      stopSpeaking()
    }
  }

  const getLanguageVoices = () => {
    return voices.filter((voice) => voice.lang.startsWith(language.split("-")[0]) || voice.lang === language)
  }

  if (!speechRecognitionSupported && !textToSpeechSupported) {
    return (
      <Card className="p-4 bg-muted">
        <p className="text-sm text-muted-foreground text-center">
          Voice features are not supported in this browser. Please use Chrome, Edge, or Safari for voice functionality.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Voice Controls</h3>
        <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </div>

      <div className="flex items-center gap-2">
        {speechRecognitionSupported && (
          <div className="flex items-center gap-2">
            <Button
              variant={isListening ? "destructive" : "outline"}
              size="sm"
              onClick={handleVoiceToggle}
              className="gap-2"
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isListening ? "Stop" : "Speak"}
            </Button>
            {isListening && (
              <Badge variant="secondary" className="animate-pulse">
                Listening...
              </Badge>
            )}
          </div>
        )}

        {textToSpeechSupported && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSpeechToggle}
              disabled={!textToSpeak}
              className="gap-2 bg-transparent"
            >
              {isSpeaking ? (
                isPaused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
              {isSpeaking ? (isPaused ? "Resume" : "Pause") : "Read"}
            </Button>
            {isSpeaking && (
              <Button variant="ghost" size="sm" onClick={stopSpeaking}>
                <Square className="h-4 w-4" />
              </Button>
            )}
            {isSpeaking && (
              <Badge variant="secondary" className="animate-pulse">
                Speaking...
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Live transcript display */}
      {(transcript || interimTranscript) && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm">
            <span className="text-foreground">{transcript}</span>
            <span className="text-muted-foreground italic">{interimTranscript}</span>
          </p>
        </div>
      )}

      {speechError && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">Speech recognition error: {speechError}</p>
        </div>
      )}

      {/* Voice Settings */}
      <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <CollapsibleContent className="space-y-4 pt-4 border-t">
          {textToSpeechSupported && getLanguageVoices().length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Voice</label>
              <Select
                value={currentVoice?.name || ""}
                onValueChange={(value) => {
                  const voice = voices.find((v) => v.name === value)
                  if (voice) setVoice(voice)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {getLanguageVoices().map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Speech Rate: {speechRate[0]}</label>
            <Slider value={speechRate} onValueChange={setSpeechRate} min={0.5} max={2} step={0.1} className="w-full" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Speech Pitch: {speechPitch[0]}</label>
            <Slider
              value={speechPitch}
              onValueChange={setSpeechPitch}
              min={0.5}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Volume: {speechVolume[0]}</label>
            <Slider
              value={speechVolume}
              onValueChange={setSpeechVolume}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
