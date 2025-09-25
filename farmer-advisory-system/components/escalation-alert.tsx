"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Phone, Mail, User, MapPin, Clock, CheckCircle, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { EscalationCase, EscalationTrigger } from "@/lib/expert-escalation"
import { findBestExpert, calculateUrgencyLevel } from "@/lib/expert-escalation"

interface EscalationAlertProps {
  isOpen: boolean
  onClose: () => void
  query: string
  triggers: EscalationTrigger[]
  severity: "medium" | "high" | "critical"
  onEscalate: (escalationCase: Partial<EscalationCase>) => void
  onDecline: () => void
}

export function EscalationAlert({
  isOpen,
  onClose,
  query,
  triggers,
  severity,
  onEscalate,
  onDecline,
}: EscalationAlertProps) {
  const [farmerDetails, setFarmerDetails] = useState({
    name: "",
    phone: "",
    email: "",
    location: {
      state: "Kerala",
      district: "",
      village: "",
    },
    cropType: "",
    farmSize: "",
  })
  const [category, setCategory] = useState<
    "pest" | "disease" | "crop_failure" | "chemical_safety" | "emergency" | "other"
  >("other")
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const urgencyLevel = calculateUrgencyLevel(severity, triggers, category)
  const recommendedExpert = findBestExpert({
    category,
    location: farmerDetails.location,
    severity,
  })

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getUrgencyColor = (level: number) => {
    if (level >= 4) return "text-red-600"
    if (level >= 3) return "text-orange-600"
    return "text-yellow-600"
  }

  const handleEscalate = async () => {
    setIsSubmitting(true)

    const escalationCase: Partial<EscalationCase> = {
      id: crypto.randomUUID(),
      farmerId: crypto.randomUUID(),
      farmerName: farmerDetails.name,
      farmerContact: farmerDetails.phone || farmerDetails.email,
      query: query + (additionalInfo ? `\n\nAdditional Information: ${additionalInfo}` : ""),
      queryType: "text",
      escalationTriggers: triggers,
      severity,
      category,
      status: "pending",
      assignedExpert: recommendedExpert?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      location: farmerDetails.location,
      cropType: farmerDetails.cropType,
      farmSize: farmerDetails.farmSize,
      urgencyLevel,
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onEscalate(escalationCase)
    setIsSubmitting(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Expert Consultation Required
          </DialogTitle>
          <DialogDescription>
            Your query has been flagged for expert review. Please provide additional details to connect you with the
            right agricultural specialist.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Escalation Reasons */}
          <Card className="p-4 border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <h4 className="font-semibold text-orange-800 dark:text-orange-200">Why this needs expert attention:</h4>
            </div>
            <div className="space-y-2">
              {triggers.map((trigger, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <span className="text-sm text-orange-700 dark:text-orange-300">
                    {trigger.description}
                    {trigger.keywords && trigger.keywords.length > 0 && (
                      <span className="ml-2">({trigger.keywords.join(", ")})</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3">
              <Badge className={getSeverityColor(severity)}>{severity.toUpperCase()} PRIORITY</Badge>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className={`text-sm font-medium ${getUrgencyColor(urgencyLevel)}`}>
                  Urgency Level: {urgencyLevel}/5
                </span>
              </div>
            </div>
          </Card>

          {/* Farmer Details */}
          <div className="space-y-4">
            <h4 className="font-semibold">Your Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={farmerDetails.name}
                  onChange={(e) => setFarmerDetails((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={farmerDetails.phone}
                  onChange={(e) => setFarmerDetails((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91-XXXXXXXXXX"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={farmerDetails.email}
                  onChange={(e) => setFarmerDetails((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  value={farmerDetails.location.district}
                  onChange={(e) =>
                    setFarmerDetails((prev) => ({
                      ...prev,
                      location: { ...prev.location, district: e.target.value },
                    }))
                  }
                  placeholder="Your district"
                  required
                />
              </div>
              <div>
                <Label htmlFor="village">Village/Area</Label>
                <Input
                  id="village"
                  value={farmerDetails.location.village}
                  onChange={(e) =>
                    setFarmerDetails((prev) => ({
                      ...prev,
                      location: { ...prev.location, village: e.target.value },
                    }))
                  }
                  placeholder="Your village or area"
                />
              </div>
              <div>
                <Label htmlFor="cropType">Crop Type</Label>
                <Input
                  id="cropType"
                  value={farmerDetails.cropType}
                  onChange={(e) => setFarmerDetails((prev) => ({ ...prev, cropType: e.target.value }))}
                  placeholder="e.g., Rice, Coconut, Pepper"
                />
              </div>
            </div>
          </div>

          {/* Issue Category */}
          <div>
            <Label htmlFor="category">Issue Category *</Label>
            <Select value={category} onValueChange={(value: any) => setCategory(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select issue category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pest">Pest Infestation</SelectItem>
                <SelectItem value="disease">Plant Disease</SelectItem>
                <SelectItem value="crop_failure">Crop Failure/Loss</SelectItem>
                <SelectItem value="chemical_safety">Chemical Safety/Poisoning</SelectItem>
                <SelectItem value="emergency">Agricultural Emergency</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Information */}
          <div>
            <Label htmlFor="additionalInfo">Additional Information</Label>
            <Textarea
              id="additionalInfo"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Any additional details that might help the expert understand your situation better..."
              className="min-h-[80px]"
            />
          </div>

          {/* Recommended Expert */}
          {recommendedExpert && (
            <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <h4 className="font-semibold text-green-800 dark:text-green-200">Recommended Expert</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{recommendedExpert.name}</span>
                  <Badge variant="outline" className="text-xs">
                    ⭐ {recommendedExpert.rating}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{recommendedExpert.location.districts.join(", ")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Specializations: {recommendedExpert.specializations.join(", ")}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{recommendedExpert.phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>{recommendedExpert.email}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleEscalate}
              disabled={!farmerDetails.name || !farmerDetails.phone || !farmerDetails.location.district || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Connecting to Expert...
                </>
              ) : (
                "Connect with Expert"
              )}
            </Button>
            <Button variant="outline" onClick={onDecline} disabled={isSubmitting}>
              <X className="h-4 w-4 mr-2" />
              Continue with AI
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            By connecting with an expert, you agree to share your query and contact details for agricultural assistance.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
