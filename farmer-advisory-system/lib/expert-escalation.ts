// Expert Escalation System for handling high-risk agricultural queries
export interface EscalationTrigger {
  type: "confidence" | "keywords" | "severity" | "image_analysis" | "manual"
  threshold?: number
  keywords?: string[]
  description: string
}

export interface EscalationCase {
  id: string
  farmerId: string
  farmerName?: string
  farmerContact?: string
  query: string
  queryType: "text" | "voice" | "image"
  imageUrls?: string[]
  aiResponse?: string
  confidence?: number
  escalationTriggers: EscalationTrigger[]
  severity: "medium" | "high" | "critical"
  category: "pest" | "disease" | "crop_failure" | "chemical_safety" | "emergency" | "other"
  status: "pending" | "assigned" | "in_review" | "resolved" | "closed"
  assignedExpert?: string
  expertResponse?: string
  createdAt: Date
  updatedAt: Date
  location?: {
    state: string
    district: string
    village?: string
  }
  cropType?: string
  farmSize?: string
  urgencyLevel: 1 | 2 | 3 | 4 | 5 // 5 being most urgent
}

export interface Expert {
  id: string
  name: string
  email: string
  phone: string
  specializations: string[]
  languages: string[]
  location: {
    state: string
    districts: string[]
  }
  availability: "available" | "busy" | "offline"
  rating: number
  casesHandled: number
}

// Escalation triggers configuration
export const escalationTriggers: EscalationTrigger[] = [
  {
    type: "confidence",
    threshold: 0.6,
    description: "AI confidence below 60%",
  },
  {
    type: "keywords",
    keywords: [
      "dying",
      "dead",
      "emergency",
      "urgent",
      "help",
      "crisis",
      "disaster",
      "pesticide poisoning",
      "chemical burn",
      "crop failure",
      "total loss",
      "spreading fast",
      "entire field",
      "never seen before",
      "getting worse",
      "immediate action",
      "save my crop",
      "losing everything",
    ],
    description: "High-risk keywords detected",
  },
  {
    type: "severity",
    description: "Critical severity level from image analysis",
  },
  {
    type: "image_analysis",
    threshold: 0.7,
    description: "Image analysis confidence below 70% or unknown pest/disease",
  },
]

// Check if query should be escalated
export function shouldEscalate(
  query: string,
  aiConfidence?: number,
  imageAnalysis?: any,
  manualEscalation = false,
): { shouldEscalate: boolean; triggers: EscalationTrigger[]; severity: "medium" | "high" | "critical" } {
  const triggeredReasons: EscalationTrigger[] = []
  let severity: "medium" | "high" | "critical" = "medium"

  // Manual escalation
  if (manualEscalation) {
    triggeredReasons.push({
      type: "manual",
      description: "Manually escalated by user",
    })
    severity = "high"
  }

  // Check AI confidence
  if (aiConfidence !== undefined && aiConfidence < 0.6) {
    triggeredReasons.push(escalationTriggers[0])
    if (aiConfidence < 0.4) severity = "high"
  }

  // Check for high-risk keywords
  const queryLower = query.toLowerCase()
  const riskKeywords = escalationTriggers[1].keywords || []
  const foundKeywords = riskKeywords.filter((keyword) => queryLower.includes(keyword))

  if (foundKeywords.length > 0) {
    triggeredReasons.push({
      ...escalationTriggers[1],
      keywords: foundKeywords,
    })

    // Critical keywords
    const criticalKeywords = ["dying", "dead", "emergency", "pesticide poisoning", "chemical burn", "disaster"]
    if (foundKeywords.some((keyword) => criticalKeywords.includes(keyword))) {
      severity = "critical"
    } else {
      severity = "high"
    }
  }

  // Check image analysis
  if (imageAnalysis) {
    if (imageAnalysis.confidence < 0.7 || imageAnalysis.severity === "critical") {
      triggeredReasons.push(escalationTriggers[3])
      if (imageAnalysis.severity === "critical") {
        severity = "critical"
      } else {
        severity = "high"
      }
    }
  }

  return {
    shouldEscalate: triggeredReasons.length > 0,
    triggers: triggeredReasons,
    severity,
  }
}

// Determine urgency level
export function calculateUrgencyLevel(
  severity: "medium" | "high" | "critical",
  triggers: EscalationTrigger[],
  category: string,
): 1 | 2 | 3 | 4 | 5 {
  let urgency: 1 | 2 | 3 | 4 | 5 = 1

  // Base urgency on severity
  switch (severity) {
    case "critical":
      urgency = 5
      break
    case "high":
      urgency = 4
      break
    case "medium":
      urgency = 2
      break
  }

  // Adjust based on category
  if (category === "emergency" || category === "chemical_safety") {
    urgency = 5
  } else if (category === "crop_failure") {
    urgency = Math.max(urgency, 4) as 1 | 2 | 3 | 4 | 5
  }

  // Adjust based on triggers
  const hasManualEscalation = triggers.some((t) => t.type === "manual")
  const hasCriticalKeywords = triggers.some(
    (t) =>
      t.type === "keywords" &&
      t.keywords?.some((k) => ["dying", "dead", "emergency", "pesticide poisoning"].includes(k)),
  )

  if (hasManualEscalation || hasCriticalKeywords) {
    urgency = Math.max(urgency, 4) as 1 | 2 | 3 | 4 | 5
  }

  return urgency
}

// Mock expert database
export const mockExperts: Expert[] = [
  {
    id: "expert-001",
    name: "Dr. Rajesh Kumar",
    email: "rajesh.kumar@agri.gov.in",
    phone: "+91-9876543210",
    specializations: ["pest management", "crop diseases", "integrated pest management"],
    languages: ["English", "Hindi", "Malayalam"],
    location: {
      state: "Kerala",
      districts: ["Thiruvananthapuram", "Kollam", "Pathanamthitta"],
    },
    availability: "available",
    rating: 4.8,
    casesHandled: 156,
  },
  {
    id: "expert-002",
    name: "Dr. Priya Nair",
    email: "priya.nair@kau.in",
    phone: "+91-9876543211",
    specializations: ["soil health", "nutrient management", "organic farming"],
    languages: ["English", "Malayalam", "Tamil"],
    location: {
      state: "Kerala",
      districts: ["Kottayam", "Idukki", "Ernakulam"],
    },
    availability: "available",
    rating: 4.9,
    casesHandled: 203,
  },
  {
    id: "expert-003",
    name: "Dr. Suresh Menon",
    email: "suresh.menon@agri.kerala.gov.in",
    phone: "+91-9876543212",
    specializations: ["crop protection", "chemical safety", "emergency response"],
    languages: ["English", "Malayalam", "Hindi"],
    location: {
      state: "Kerala",
      districts: ["Thrissur", "Palakkad", "Malappuram"],
    },
    availability: "busy",
    rating: 4.7,
    casesHandled: 89,
  },
]

// Find best expert for a case
export function findBestExpert(
  escalationCase: Partial<EscalationCase>,
  experts: Expert[] = mockExperts,
): Expert | null {
  const availableExperts = experts.filter((expert) => expert.availability === "available")

  if (availableExperts.length === 0) {
    // If no available experts, return the least busy one
    return (
      experts.sort((a, b) => {
        if (a.availability === "available") return -1
        if (b.availability === "available") return 1
        return a.casesHandled - b.casesHandled
      })[0] || null
    )
  }

  // Score experts based on specialization, location, and rating
  const scoredExperts = availableExperts.map((expert) => {
    let score = 0

    // Specialization match
    if (escalationCase.category) {
      const categoryKeywords = {
        pest: ["pest", "insect", "bug"],
        disease: ["disease", "fungal", "bacterial", "viral"],
        crop_failure: ["crop", "yield", "production"],
        chemical_safety: ["chemical", "safety", "pesticide", "poisoning"],
        emergency: ["emergency", "crisis", "urgent"],
      }

      const keywords = categoryKeywords[escalationCase.category as keyof typeof categoryKeywords] || []
      const matchingSpecs = expert.specializations.filter((spec) =>
        keywords.some((keyword) => spec.toLowerCase().includes(keyword)),
      )
      score += matchingSpecs.length * 10
    }

    // Location proximity (same state gets bonus)
    if (escalationCase.location?.state === expert.location.state) {
      score += 5
      // Same district gets additional bonus
      if (escalationCase.location?.district && expert.location.districts.includes(escalationCase.location.district)) {
        score += 5
      }
    }

    // Rating and experience
    score += expert.rating * 2
    score += Math.min(expert.casesHandled / 10, 10) // Cap experience bonus at 10

    return { expert, score }
  })

  // Return expert with highest score
  scoredExperts.sort((a, b) => b.score - a.score)
  return scoredExperts[0]?.expert || null
}
