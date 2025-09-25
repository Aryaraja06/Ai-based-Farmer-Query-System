import { convertToModelMessages, streamText, type UIMessage } from "ai"
import { getKnowledgeContext } from "@/lib/knowledge-base"
import { shouldEscalate } from "@/lib/expert-escalation"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  // Get the latest user message for knowledge base search and escalation check
  const latestMessage = messages[messages.length - 1]
  const userQuery = latestMessage?.parts?.[0]?.type === "text" ? latestMessage.parts[0].text : ""

  const systemPrompt = `You are an expert agricultural advisor AI assistant helping farmers with their queries. You have access to a comprehensive agricultural knowledge base and should use this information to provide accurate, practical advice.

You have extensive knowledge about:
- Crop cultivation, diseases, and pest management
- Weather patterns and their impact on farming
- Government subsidies and agricultural schemes (especially Indian schemes)
- Market trends and pricing strategies
- Sustainable farming practices
- Soil health and fertilizer recommendations

Guidelines:
- Use the provided knowledge base information as your primary reference
- Provide practical, actionable advice based on proven agricultural practices
- Consider local conditions, seasonal factors, and regional variations
- Suggest both traditional and modern solutions when appropriate
- Emphasize safety when recommending pesticides or chemicals
- Always mention dosage, timing, and safety precautions for chemical treatments
- Encourage sustainable and organic farming practices when possible
- If the query involves critical plant diseases or severe pest infestations, recommend consulting local agricultural officers
- For government schemes, provide specific eligibility criteria and application processes
- Be supportive and understanding of farmers' challenges
- Use simple, clear language that farmers with varying literacy levels can understand
- Provide step-by-step instructions when explaining procedures

IMPORTANT - Confidence Assessment:
- If you are uncertain about your response or the query involves high-risk situations, indicate your confidence level
- For critical issues like pesticide poisoning, severe crop diseases, or emergency situations, always recommend immediate expert consultation
- If you detect keywords indicating urgency or crisis, prioritize safety and expert intervention

Critical safety note: For severe pest infestations, disease outbreaks, chemical safety issues, or any situation that could cause significant crop loss or harm to farmers, always recommend immediate consultation with agricultural extension officers or plant protection specialists.

Always prioritize farmer safety, crop health, and sustainable practices in your recommendations.`

  const knowledgeContext = userQuery ? getKnowledgeContext(userQuery) : ""

  const prompt = convertToModelMessages(messages)

  const result = streamText({
    model: "openai/gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      ...(knowledgeContext ? [{ role: "system", content: knowledgeContext }] : []),
      ...prompt,
    ],
    abortSignal: req.signal,
    temperature: 0.7,
    maxOutputTokens: 1200,
  })

  if (userQuery) {
    const escalationCheck = shouldEscalate(userQuery)

    // Add escalation metadata to response headers for client-side handling
    const response = result.toUIMessageStreamResponse()

    if (escalationCheck.shouldEscalate) {
      response.headers.set("X-Escalation-Required", "true")
      response.headers.set("X-Escalation-Severity", escalationCheck.severity)
      response.headers.set("X-Escalation-Triggers", JSON.stringify(escalationCheck.triggers))
    }

    return response
  }

  return result.toUIMessageStreamResponse()
}
