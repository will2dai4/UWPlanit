'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthGuard } from '@/components/auth/auth-guard'
import { usePlans, useCreatePlan, useDeletePlan } from '@/hooks/use-plans'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Calendar } from 'lucide-react'

export default function PlansPage() {
  return (
    <AuthGuard>
      <PlansContent />
    </AuthGuard>
  )
}

function PlansContent() {
  const { data: plans, isLoading } = usePlans()
  const createPlan = useCreatePlan()
  const deletePlan = useDeletePlan()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newPlanName, setNewPlanName] = useState('')

  const handleCreatePlan = async () => {
    if (!newPlanName.trim()) return

    try {
      await createPlan.mutateAsync({ name: newPlanName.trim() })
      setNewPlanName('')
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Failed to create plan:', error)
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return

    try {
      await deletePlan.mutateAsync(planId)
    } catch (error) {
      console.error('Failed to delete plan:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Plans</h1>
          <p className="text-muted-foreground mt-2">Create and manage your course plans</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Plan</DialogTitle>
              <DialogDescription>Give your course plan a name to get started.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Computer Science - 1A"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreatePlan()
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePlan} disabled={createPlan.isPending}>
                Create Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {plans && plans.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.plan_id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>
                  <Link href={`/plans/${plan.plan_id}`} className="hover:text-primary">
                    {plan.name}
                  </Link>
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  {new Date(plan.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => handleDeletePlan(plan.plan_id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Plans Yet</CardTitle>
            <CardDescription>Create your first course plan to get started!</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

