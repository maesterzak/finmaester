"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Zap, Calendar } from 'lucide-react'

export function UIImprovements() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Tips & Highlights
        </CardTitle>
        <CardDescription>Make the most of your financial dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tips" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tips">Quick Tips</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="tips" className="space-y-3">
            <div className="p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Set Monthly Budgets</p>
                  <p className="text-xs text-muted-foreground">
                    Create category budgets to track spending and receive alerts when you're close to limits.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Track Subscriptions</p>
                  <p className="text-xs text-muted-foreground">
                    Add all your recurring expenses to see the total impact on your monthly budget.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Review Income Trends</p>
                  <p className="text-xs text-muted-foreground">
                    Check the income analytics tab to see your earning patterns and growth over time.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-3">
            <div className="p-3 rounded-lg border bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-sm">First Transaction</p>
                    <p className="text-xs text-muted-foreground">Add your first transaction</p>
                  </div>
                </div>
                <Badge>In Progress</Badge>
              </div>
            </div>
            <div className="p-3 rounded-lg border bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Budget Master</p>
                    <p className="text-xs text-muted-foreground">Set up 5 budget categories</p>
                  </div>
                </div>
                <Badge className="bg-green-500">Achieved</Badge>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
