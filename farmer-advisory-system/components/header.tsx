import { Sprout, Globe, Mic, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Sprout className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AgriAI</h1>
              <p className="text-sm text-muted-foreground">Farmer Advisory System</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Mic className="h-3 w-3" />
              Voice Input
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Volume2 className="h-3 w-3" />
              Audio Output
            </Badge>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Globe className="h-4 w-4" />
              മലയാളം
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
