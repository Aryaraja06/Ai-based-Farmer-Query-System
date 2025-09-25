"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface SpeechRecognitionOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
}

interface UseSpeechRecognitionReturn {
  isListening: boolean
  transcript: string
  interimTranscript: string
  finalTranscript: string
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  isSupported: boolean
  error: string | null
}

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const { language = "en-US", continuous = false, interimResults = true, maxAlternatives = 1 } = options

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [finalTranscript, setFinalTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  const recognitionRef = useRef<any | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      setIsSupported(!!SpeechRecognition)

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        const recognition = recognitionRef.current

        recognition.language = language
        recognition.continuous = continuous
        recognition.interimResults = interimResults
        recognition.maxAlternatives = maxAlternatives

        recognition.onstart = () => {
          setIsListening(true)
          setError(null)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognition.onerror = (event) => {
          setError(event.error)
          setIsListening(false)
        }

        recognition.onresult = (event) => {
          let interim = ""
          let final = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            if (result.isFinal) {
              final += result[0].transcript
            } else {
              interim += result[0].transcript
            }
          }

          setInterimTranscript(interim)
          if (final) {
            setFinalTranscript((prev) => prev + final)
            setTranscript((prev) => prev + final)
          }
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [language, continuous, interimResults, maxAlternatives])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setError(null)
      recognitionRef.current.start()
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  const resetTranscript = useCallback(() => {
    setTranscript("")
    setInterimTranscript("")
    setFinalTranscript("")
  }, [])

  return {
    isListening,
    transcript,
    interimTranscript,
    finalTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
  }
}
