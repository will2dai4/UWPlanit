import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LayoutGrid, BookOpen, Share2, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container py-24 md:py-32 lg:py-40">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
            Plan Your UW Journey with
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"> Confidence</span>
          </h1>
          <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
            Visualize course prerequisites, explore relationships, and build your perfect academic plan at the University
            of Waterloo.
          </p>
          <div className="flex gap-4 mt-8">
            <Button size="lg" asChild>
              <Link href="/graph">Explore Graph</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto grid max-w-[1200px] gap-8 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<LayoutGrid className="h-10 w-10" />}
            title="Interactive Graph"
            description="Visualize courses and their relationships with an interactive graph powered by Cytoscape."
          />
          <FeatureCard
            icon={<BookOpen className="h-10 w-10" />}
            title="Course Planning"
            description="Drag and drop courses into your personalized plan and track your progress with checklists."
          />
          <FeatureCard
            icon={<Share2 className="h-10 w-10" />}
            title="Import & Export"
            description="Save your plans as JSON and share them with friends or import existing plans."
          />
          <FeatureCard
            icon={<Zap className="h-10 w-10" />}
            title="Always Updated"
            description="Course data is automatically synced weekly from the UW Open Data API."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-[800px] rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 p-8 md:p-12 text-white">
          <div className="flex flex-col items-center text-center gap-6">
            <h2 className="text-3xl font-bold md:text-4xl">Ready to Plan Your Courses?</h2>
            <p className="text-lg opacity-90 max-w-[600px]">
              Join students already using UWPlanit to navigate their academic journey with confidence.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">Create Free Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <div className="mb-4 text-primary">{icon}</div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

