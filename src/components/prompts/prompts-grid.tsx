import type { Prompt } from '@/lib/database.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function PromptsGrid({ prompts, viewMode }: { prompts: Prompt[]; viewMode: 'grid' | 'list' }) {
  if (!prompts?.length) return null

  return (
    <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
      {prompts.map((p) => (
        <Card key={p.id}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="truncate text-base">{p.title}</CardTitle>
              {p.is_favorite ? (
                <span className="ml-2 text-yellow-500" aria-label="Favorite">★</span>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {p.description ? (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
            ) : null}
            <div className="mt-3">
              <pre className="whitespace-pre-wrap text-sm text-foreground bg-muted/30 p-2 rounded-md border max-h-40 overflow-auto">{p.content}</pre>
            </div>
            {p.tags?.length ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <Badge key={t} variant="secondary">{t}</Badge>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
