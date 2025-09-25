import { FarmerAdvisoryChat } from "@/components/farmer-advisory-chat"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-balance mb-4 text-foreground">AI-Based Farmer Query Support</h1>
            <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              Get instant, accurate advice about crops, pests, weather, subsidies, and market trends. Ask questions in
              text or voice, upload images for pest identification.
            </p>
          </div>
          <FarmerAdvisoryChat />
        </div>
      </main>
    </div>
  )
}
