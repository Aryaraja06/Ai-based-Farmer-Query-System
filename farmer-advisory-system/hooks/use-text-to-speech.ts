"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface TextToSpeechOptions {
  language?: string
  rate?: number
  pitch?: number
  volume?: number
}

interface UseTextToSpeechReturn {
  speak: (text: string) => void
  stop: () => void
  pause: () => void
  resume: () => void
  isSpeaking: boolean
  isPaused: boolean
  isSupported: boolean
  voices: SpeechSynthesisVoice[]
  setVoice: (voice: SpeechSynthesisVoice) => void
  currentVoice: SpeechSynthesisVoice | null
}

export function useTextToSpeech(options: TextToSpeechOptions = {}): UseTextToSpeechReturn {
  const { language = "en-US", rate = 1, pitch = 1, volume = 1 } = options

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null)

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true)

      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices()
        setVoices(availableVoices)

        // Try to find a voice for the specified language
        const preferredVoice = availableVoices.find((voice) => voice.lang.startsWith(language.split("-")[0]))
        if (preferredVoice) {
          setCurrentVoice(preferredVoice)
        }
      }

      loadVoices()
      speechSynthesis.addEventListener("voiceschanged", loadVoices)

      return () => {
        speechSynthesis.removeEventListener("voiceschanged", loadVoices)
      }
    }
  }, [language])

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) return

      // Stop any current speech
      speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language
      utterance.rate = rate
      utterance.pitch = pitch
      utterance.volume = volume

      if (currentVoice) {
        utterance.voice = currentVoice
      }

      utterance.onstart = () => {
        setIsSpeaking(true)
        setIsPaused(false)
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        setIsPaused(false)
      }

      utterance.onerror = () => {
        setIsSpeaking(false)
        setIsPaused(false)
      }

      utterance.onpause = () => {
        setIsPaused(true)
      }

      utterance.onresume = () => {
        setIsPaused(false)
      }

      utteranceRef.current = utterance
      speechSynthesis.speak(utterance)
    },
    [isSupported, language, rate, pitch, volume, currentVoice],
  )

  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
      setIsPaused(false)
    }
  }, [isSupported])

  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      speechSynthesis.pause()
    }
  }, [isSupported, isSpeaking])

  const resume = useCallback(() => {
    if (isSupported && isPaused) {
      speechSynthesis.resume()
    }
  }, [isSupported, isPaused])

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setCurrentVoice(voice)
  }, [])

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    setVoice,
    currentVoice,
  }
}
