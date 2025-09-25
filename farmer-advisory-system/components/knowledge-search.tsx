"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen, AlertTriangle, Info } from "lucide-react"
import { searchKnowledgeBase, type KnowledgeEntry } from "@/lib/knowledge-base"

const categoryColors = {
  pest: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  disease: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  crop: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  weather: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  subsidy: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  market: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  soil: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  fertilizer: "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200",
}

const severityIcons = {
  low: <Info className="h-4 w-4 text-blue-500" />,
  medium: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  high: <AlertTriangle className="h-4 w-4 text-orange-500" />,
  critical: <AlertTriangle className="h-4 w-4 text-red-500" />,
}

export function KnowledgeSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<KnowledgeEntry[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    // Simulate search delay for better UX
    setTimeout(() => {
      const results = searchKnowledgeBase(searchQuery)
      setSearchResults(results)
      setIsSearching(false)
    }, 500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Knowledge Base Search</h3>
      </div>

      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Search for agricultural information..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Found {searchResults.length} relevant entries:</h4>
          {searchResults.map((entry) => (
            <Card key={entry.id} className="p-4 border-l-4 border-l-primary">
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-semibold text-foreground">{entry.title}</h5>
                <div className="flex items-center gap-2">
                  {entry.severity && severityIcons[entry.severity]}
                  <Badge className={categoryColors[entry.category]}>{entry.category}</Badge>
                </div>
              </div>

              <div className="text-sm text-muted-foreground mb-3 line-clamp-3">{entry.content.split("\n")[0]}...</div>

              <div className="flex flex-wrap gap-1">
                {entry.keywords.slice(0, 5).map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>

              {(entry.cropType || entry.season || entry.region) && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {entry.cropType && `Crop: ${entry.cropType} • `}
                  {entry.season && `Season: ${entry.season} • `}
                  {entry.region && `Region: ${entry.region}`}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {searchQuery && searchResults.length === 0 && !isSearching && (
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No results found for "{searchQuery}"</p>
          <p className="text-sm">Try different keywords or ask the AI assistant</p>
        </div>
      )}
    </Card>
  )
}
