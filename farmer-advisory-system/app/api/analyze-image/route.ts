import { generateObject } from "ai"
import { z } from "zod"

const imageAnalysisSchema = z.object({
  primaryIssue: z.string().describe("The main issue identified in the image"),
  confidence: z.number().min(0).max(1).describe("Confidence level of the analysis (0-1)"),
  category: z
    .enum(["pest", "disease", "nutrient_deficiency", "healthy", "environmental_stress"])
    .describe("Category of the issue"),
  severity: z.enum(["low", "medium", "high", "critical"]).describe("Severity level of the issue"),
  description: z.string().describe("Detailed description of the issue and its characteristics"),
  recommendations: z.array(z.string()).describe("List of actionable recommendations for treatment"),
  urgency: z.boolean().describe("Whether immediate action is required"),
})

export async function POST(req: Request) {
  try {
    const { image, filename, mimeType } = await req.json()

    if (!image) {
      return Response.json({ error: "No image provided" }, { status: 400 })
    }

    const { object: analysis } = await generateObject({
      model: "openai/gpt-4o",
      schema: imageAnalysisSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this agricultural image for pests, diseases, nutrient deficiencies, or other crop issues. 

Please provide:
1. Primary issue identification
2. Confidence level in your analysis
3. Category of the problem
4. Severity assessment
5. Detailed description of what you observe
6. Specific, actionable recommendations for treatment
7. Whether this requires urgent attention

Focus on practical agricultural advice that farmers can implement. Consider both organic and conventional treatment options. If the plant appears healthy, indicate that as well.

Image filename: ${filename || "unknown"}`,
            },
            {
              type: "image",
              image: `data:${mimeType || "image/jpeg"};base64,${image}`,
            },
          ],
        },
      ],
      maxOutputTokens: 1000,
    })

    return Response.json({ analysis })
  } catch (error) {
    console.error("Image analysis error:", error)
    return Response.json({ error: "Failed to analyze image" }, { status: 500 })
  }
}
