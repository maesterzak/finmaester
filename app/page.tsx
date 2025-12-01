import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowRight,
  BarChart3,
  Bell,
  CreditCard,
  Eye,
  Globe,
  Lock,
  PieChart,
  Repeat,
  Shield,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Logo variant="full" size="md" />
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How it Works
              </a>
              <a href="#security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Security
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Finance Tracking</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance">
              Master Your Finances with <span className="text-primary">Intelligence</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
              FinMaester combines smart budgeting, expense tracking, and AI insights to help you take control of your
              money. See where every penny goes, set monthly budgets, and achieve your financial goals.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 bg-primary hover:bg-primary/90">
                  Start Tracking Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-6 bg-transparent">
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-xl mx-auto">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">10K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">$2M+</div>
                <div className="text-sm text-muted-foreground">Tracked Monthly</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative rounded-xl border border-border bg-card shadow-2xl shadow-primary/10 overflow-hidden">
              <div className="p-1 bg-muted/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Balance</p>
                          <p className="text-2xl font-bold text-foreground">$24,580</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Wallet className="h-5 w-5 text-emerald-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Income</p>
                          <p className="text-2xl font-bold text-foreground">$8,250</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-blue-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Expenses</p>
                          <p className="text-2xl font-bold text-foreground">$3,420</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-orange-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="h-48 bg-muted/30 rounded-lg flex items-center justify-center">
                  <div className="flex items-end gap-2 h-32">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <div
                        key={i}
                        className="w-8 bg-gradient-to-t from-primary to-primary/50 rounded-t"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
              Everything you need to manage your finances
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features designed to give you complete control over your money
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: PieChart,
                title: "Monthly Budgets",
                description:
                  "Set custom budgets for each category every month. Get alerts when you're approaching limits.",
                color: "emerald",
              },
              {
                icon: BarChart3,
                title: "Expense Analytics",
                description: "Beautiful charts and insights showing exactly where your money goes each month.",
                color: "blue",
              },
              {
                icon: Bell,
                title: "Smart Notifications",
                description: "Get notified about budget limits, recurring payments, and unusual spending patterns.",
                color: "amber",
              },
              {
                icon: Repeat,
                title: "Recurring Tracking",
                description: "Never miss a subscription or recurring payment with automatic reminders.",
                color: "purple",
              },
              {
                icon: Globe,
                title: "Multi-Currency",
                description:
                  "Support for 10+ currencies with real-time conversion rates for global finance management.",
                color: "cyan",
              },
              {
                icon: Eye,
                title: "Privacy Mode",
                description: "Hide sensitive amounts with one tap when viewing finances in public places.",
                color: "rose",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border-border/50 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-xl bg-${feature.color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className={`h-6 w-6 text-${feature.color}-500`} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">Get started in minutes</h2>
            <p className="mt-4 text-lg text-muted-foreground">Simple steps to take control of your financial life</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: "01",
                title: "Create Your Account",
                description: "Sign up for free in seconds. No credit card required to get started.",
                icon: Zap,
              },
              {
                step: "02",
                title: "Set Your Budgets",
                description: "Create categories and set monthly budgets that make sense for your lifestyle.",
                icon: Wallet,
              },
              {
                step: "03",
                title: "Track & Optimize",
                description: "Log expenses, view analytics, and get AI-powered insights to improve your finances.",
                icon: TrendingUp,
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                      <item.icon className="h-8 w-8 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 sm:py-32 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance mb-6">
                Your data is secure with bank-level encryption
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We take your privacy seriously. Your financial data is encrypted, never sold, and only accessible by
                you. Built on enterprise-grade infrastructure.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Shield, text: "256-bit AES encryption for all data" },
                  { icon: Lock, text: "Two-factor authentication support" },
                  { icon: Eye, text: "Privacy mode to hide sensitive info" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
              <Card className="relative border-border/50">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="h-16 w-16 text-primary" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <h3 className="text-xl font-semibold text-foreground">Enterprise Security</h3>
                    <p className="text-muted-foreground mt-2">Your data never leaves our secure servers</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 border border-primary/20 overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/5" />
            <div className="relative px-6 py-16 sm:px-16 sm:py-24 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance mb-4">
                Ready to master your finances?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Join thousands of users who have transformed their financial habits with FinMaester. Start your journey
                today.
              </p>
              <Link href="/signup">
                <Button size="lg" className="text-base px-8 py-6 bg-primary hover:bg-primary/90">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo variant="full" size="sm" />
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 FinMaester. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
