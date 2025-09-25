"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, Upload, X, Loader2, Eye, AlertTriangle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onImageAnalysis: (analysis: ImageAnalysisResult) => void
  disabled?: boolean
}

export interface ImageAnalysisResult {
  id: string
  imageUrl: string
  analysis: {
    primaryIssue: string
    confidence: number
    category: "pest" | "disease" | "nutrient_deficiency" | "healthy" | "environmental_stress"
    severity: "low" | "medium" | "high" | "critical"
    description: string
    recommendations: string[]
    urgency: boolean
  }
  timestamp: Date
}

export function ImageUpload({ onImageAnalysis, disabled = false }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [analysisResults, setAnalysisResults] = useState<ImageAnalysisResult[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleFiles = useCallback((files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))
    if (imageFiles.length === 0) return

    setSelectedImages(imageFiles)

    // Create preview URLs
    const urls = imageFiles.map((file) => URL.createObjectURL(file))
    setPreviewUrls(urls)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    const newUrls = previewUrls.filter((_, i) => i !== index)

    // Revoke the URL to free memory
    URL.revokeObjectURL(previewUrls[index])

    setSelectedImages(newImages)
    setPreviewUrls(newUrls)
  }

  const analyzeImages = async () => {
    if (selectedImages.length === 0) return

    setAnalyzing(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < selectedImages.length; i++) {
        const file = selectedImages[i]
        setUploadProgress(((i + 1) / selectedImages.length) * 50) // First 50% for upload

        // Convert file to base64
        const base64 = await fileToBase64(file)

        // Simulate analysis progress
        setUploadProgress(50 + ((i + 1) / selectedImages.length) * 50)

        // Call analysis API
        const response = await fetch("/api/analyze-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: base64,
            filename: file.name,
            mimeType: file.type,
          }),
        })

        if (!response.ok) {
          throw new Error("Analysis failed")
        }

        const result = await response.json()
        const analysisResult: ImageAnalysisResult = {
          id: crypto.randomUUID(),
          imageUrl: previewUrls[i],
          analysis: result.analysis,
          timestamp: new Date(),
        }

        setAnalysisResults((prev) => [...prev, analysisResult])
        onImageAnalysis(analysisResult)
      }
    } catch (error) {
      console.error("Image analysis failed:", error)
    } finally {
      setAnalyzing(false)
      setUploadProgress(0)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(",")[1]) // Remove data:image/jpeg;base64, prefix
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pest":
      case "disease":
      case "environmental_stress":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default:
        return <Eye className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={cn(
          "p-6 border-2 border-dashed transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled && "opacity-50 cursor-not-allowed",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center gap-4">
            <Camera className="h-12 w-12 text-muted-foreground" />
            <Upload className="h-12 w-12 text-muted-foreground" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Upload Crop Images for Analysis</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Take photos of affected plants, leaves, or crops to identify pests, diseases, and other issues
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => cameraInputRef.current?.click()}
              disabled={disabled || analyzing}
              className="gap-2"
            >
              <Camera className="h-4 w-4" />
              Take Photo
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || analyzing}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Images
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Supports JPG, PNG, WebP. Max 5MB per image. Multiple images allowed.
          </p>
        </div>

        <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileInput} className="hidden" />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInput}
          className="hidden"
        />
      </Card>

      {/* Image Previews */}
      {previewUrls.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Selected Images ({selectedImages.length})</h4>
            <Button onClick={analyzeImages} disabled={analyzing || selectedImages.length === 0} className="gap-2">
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Analyze Images
                </>
              )}
            </Button>
          </div>

          {analyzing && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Processing images...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url || "/placeholder.svg"}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-xs bg-black/50 text-white px-2 py-1 rounded truncate">
                    {selectedImages[index].name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisResults.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">Analysis Results</h4>
          {analysisResults.map((result) => (
            <Card key={result.id} className="p-4">
              <div className="flex gap-4">
                <img
                  src={result.imageUrl || "/placeholder.svg"}
                  alt="Analyzed crop"
                  className="w-24 h-24 object-cover rounded-lg border flex-shrink-0"
                />
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getCategoryIcon(result.analysis.category)}
                        <h5 className="font-semibold text-foreground">{result.analysis.primaryIssue}</h5>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(result.analysis.severity)}>
                          {result.analysis.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{result.analysis.category.replace("_", " ")}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(result.analysis.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                    {result.analysis.urgency && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Urgent
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">{result.analysis.description}</p>

                  <div>
                    <h6 className="text-sm font-medium mb-2">Recommendations:</h6>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {result.analysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
