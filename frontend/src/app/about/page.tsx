import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">About UWPlanit</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              UWPlanit is designed to help University of Waterloo students plan their academic journey with confidence. We
              provide interactive tools to visualize course prerequisites, explore relationships, and build personalized
              course plans.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Source</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              All course data is sourced from the official{' '}
              <a
                href="https://openapi.data.uwaterloo.ca/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                University of Waterloo Open Data API
              </a>
              . Our system automatically syncs course information weekly to ensure you always have the most up-to-date data.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technology</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Built with modern web technologies:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Next.js 14 with React Server Components</li>
              <li>Cytoscape.js for graph visualization</li>
              <li>PostgreSQL for data storage</li>
              <li>Redis for caching</li>
              <li>Supabase for authentication</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Source</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              UWPlanit is an open-source project. We welcome contributions from the community. Visit our GitHub repository
              to learn more or report issues.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

