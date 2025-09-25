// Agricultural Knowledge Base for RAG implementation
export interface KnowledgeEntry {
  id: string
  category: "pest" | "disease" | "crop" | "weather" | "subsidy" | "market" | "soil" | "fertilizer"
  title: string
  content: string
  keywords: string[]
  region?: string
  season?: string
  cropType?: string
  severity?: "low" | "medium" | "high" | "critical"
}

export const agriculturalKnowledgeBase: KnowledgeEntry[] = [
  // Pest Management
  {
    id: "pest-001",
    category: "pest",
    title: "Aphid Infestation Management",
    content: `Aphids are small, soft-bodied insects that feed on plant sap. Signs include curled leaves, sticky honeydew, and stunted growth.

Treatment:
- Spray with neem oil solution (2-3ml per liter water)
- Use insecticidal soap spray
- Introduce beneficial insects like ladybugs
- Remove heavily infested plant parts
- Apply systemic insecticides if severe (consult agricultural officer)

Prevention:
- Regular monitoring of crops
- Maintain proper plant spacing for air circulation
- Avoid over-fertilization with nitrogen
- Use reflective mulches to deter aphids`,
    keywords: ["aphid", "insect", "pest", "sap", "honeydew", "neem oil", "ladybug"],
    severity: "medium",
  },
  {
    id: "pest-002",
    category: "pest",
    title: "Bollworm Control in Cotton",
    content: `Bollworms are major pests of cotton, causing significant yield losses by feeding on bolls and flowers.

Identification:
- Small holes in bolls and flowers
- Caterpillars inside damaged bolls
- Frass (insect droppings) near feeding sites

Management:
- Use pheromone traps for monitoring
- Apply Bt cotton varieties if available
- Spray with approved insecticides (follow label instructions)
- Practice crop rotation with non-host crops
- Remove and destroy damaged bolls

Critical: Contact agricultural extension officer for severe infestations`,
    keywords: ["bollworm", "cotton", "caterpillar", "boll", "pheromone trap", "bt cotton"],
    cropType: "cotton",
    severity: "high",
  },

  // Crop Diseases
  {
    id: "disease-001",
    category: "disease",
    title: "Rice Blast Disease",
    content: `Rice blast is a fungal disease causing significant yield losses in rice crops.

Symptoms:
- Diamond-shaped lesions on leaves with gray centers
- Neck rot causing panicle breakage
- Node infection leading to lodging

Management:
- Use resistant varieties when available
- Avoid excessive nitrogen fertilization
- Ensure proper drainage in fields
- Apply fungicides like Tricyclazole or Carbendazim
- Remove infected plant debris
- Practice crop rotation

Timing: Apply preventive fungicides before flowering stage`,
    keywords: ["rice blast", "fungal disease", "lesions", "panicle", "tricyclazole", "resistant varieties"],
    cropType: "rice",
    severity: "high",
  },

  // Weather Advisory
  {
    id: "weather-001",
    category: "weather",
    title: "Monsoon Preparation Guidelines",
    content: `Preparing crops for monsoon season is crucial for successful farming.

Pre-monsoon activities:
- Clean drainage channels and water outlets
- Prepare seedbeds for transplanting
- Stock up on fungicides and bactericides
- Repair farm equipment and storage facilities
- Plan crop calendar based on rainfall predictions

During monsoon:
- Monitor for waterlogging and take drainage measures
- Watch for disease outbreaks due to high humidity
- Avoid fertilizer application during heavy rains
- Protect harvested crops from moisture

Post-monsoon:
- Assess crop damage and plan recovery measures
- Apply post-emergence herbicides if needed
- Resume regular fertilization schedule`,
    keywords: ["monsoon", "rainfall", "drainage", "waterlogging", "humidity", "seedbed"],
    season: "monsoon",
  },

  // Government Subsidies
  {
    id: "subsidy-001",
    category: "subsidy",
    title: "PM-KISAN Scheme Benefits",
    content: `PM-KISAN provides direct income support to farmer families.

Eligibility:
- All landholding farmer families
- Excludes institutional landholders
- Excludes farmers paying income tax

Benefits:
- ₹6,000 per year in three installments
- ₹2,000 every four months
- Direct transfer to bank accounts

Application process:
- Visit nearest Common Service Center (CSC)
- Provide Aadhaar card, bank details, land records
- Complete online registration
- Verify details with village revenue officer

Documents required:
- Aadhaar card
- Bank account details
- Land ownership documents
- Mobile number for SMS updates`,
    keywords: ["pm-kisan", "subsidy", "income support", "aadhaar", "bank account", "land records"],
    region: "india",
  },

  // Market Information
  {
    id: "market-001",
    category: "market",
    title: "Optimal Timing for Crop Sales",
    content: `Strategic timing of crop sales can significantly improve farmer income.

General principles:
- Avoid selling immediately after harvest when prices are lowest
- Monitor market trends and price forecasts
- Consider storage costs vs. potential price gains
- Diversify sales across different time periods

Storage considerations:
- Ensure proper drying to safe moisture levels
- Use appropriate storage structures
- Monitor for pest and disease issues
- Calculate storage costs vs. expected price increase

Market intelligence:
- Check daily prices on eNAM portal
- Follow commodity price trends
- Connect with farmer producer organizations (FPOs)
- Consider contract farming opportunities

Risk management:
- Don't store entire harvest - sell portions gradually
- Keep emergency funds for storage maintenance
- Have backup buyers identified`,
    keywords: ["market timing", "crop sales", "storage", "enam", "price trends", "fpo"],
    category: "market",
  },

  // Soil Health
  {
    id: "soil-001",
    category: "soil",
    title: "Soil Testing and Nutrient Management",
    content: `Regular soil testing is essential for optimal crop nutrition and yield.

Soil testing process:
- Collect samples from multiple points in field
- Test every 2-3 years or when changing crops
- Get analysis from certified laboratories
- Understand NPK levels, pH, and organic matter content

Interpreting results:
- pH: 6.0-7.5 ideal for most crops
- Organic matter: Should be >1.5%
- NPK levels guide fertilizer recommendations
- Micronutrient deficiencies need specific attention

Soil improvement:
- Add organic matter through compost or FYM
- Use lime to correct acidic soils
- Apply gypsum for alkaline soils
- Practice crop rotation to maintain soil health
- Avoid over-tillage to prevent erosion

Nutrient management:
- Follow soil test recommendations
- Use balanced fertilizers
- Apply nutrients at right time and method
- Consider slow-release fertilizers`,
    keywords: ["soil testing", "npk", "ph", "organic matter", "fertilizer", "lime", "gypsum"],
    category: "soil",
  },
]

// RAG functionality for knowledge retrieval
export function searchKnowledgeBase(query: string, category?: string): KnowledgeEntry[] {
  const queryLower = query.toLowerCase()
  const queryWords = queryLower.split(" ").filter((word) => word.length > 2)

  let relevantEntries = agriculturalKnowledgeBase.filter((entry) => {
    // Filter by category if specified
    if (category && entry.category !== category) return false

    // Check if query matches title, content, or keywords
    const titleMatch = entry.title.toLowerCase().includes(queryLower)
    const contentMatch = entry.content.toLowerCase().includes(queryLower)
    const keywordMatch = entry.keywords.some((keyword) =>
      queryWords.some((word) => keyword.toLowerCase().includes(word)),
    )

    return titleMatch || contentMatch || keywordMatch
  })

  // Score and sort by relevance
  relevantEntries = relevantEntries.map((entry) => {
    let score = 0

    // Title matches get highest score
    if (entry.title.toLowerCase().includes(queryLower)) score += 10

    // Keyword matches
    entry.keywords.forEach((keyword) => {
      if (queryWords.some((word) => keyword.toLowerCase().includes(word))) {
        score += 5
      }
    })

    // Content matches
    queryWords.forEach((word) => {
      const contentLower = entry.content.toLowerCase()
      const matches = (contentLower.match(new RegExp(word, "g")) || []).length
      score += matches
    })

    return { ...entry, score }
  })

  return relevantEntries.sort((a, b) => (b as any).score - (a as any).score).slice(0, 5) // Return top 5 most relevant entries
}

export function getKnowledgeContext(query: string): string {
  const relevantEntries = searchKnowledgeBase(query)

  if (relevantEntries.length === 0) {
    return "No specific knowledge base entries found for this query."
  }

  const context = relevantEntries
    .map((entry) => `**${entry.title}** (${entry.category})\n${entry.content}`)
    .join("\n\n---\n\n")

  return `Relevant agricultural knowledge:\n\n${context}`
}
