import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowRight,
  BarChart3,
  CalendarRange,
  FileText,
  Lock,
  PiggyBank,
  Globe,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react"

// Tailwind only generates classes it can see in full, so colours are spelled out here
const FEATURES = [
  {
    icon: CalendarRange,
    title: "Daily, weekly & monthly views",
    description:
      "See income, expenses and savings rate for today, this week, this month or any date range, and search your notes to total up anything.",
    iconClass: "bg-emerald-500/10 text-emerald-500",
  },
  {
    icon: Globe,
    title: "Works in your currency",
    description:
      "Dollars, euros, pounds, naira, rupees, shillings and 40+ more. Pick yours and every amount, chart and report follows.",
    iconClass: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: Target,
    title: "Budgets that warn early",
    description:
      "Set a monthly budget per category and get told when you're on pace to overspend, before the month is over.",
    iconClass: "bg-amber-500/10 text-amber-500",
  },
  {
    icon: Sparkles,
    title: "AI spending coach",
    description:
      "Get a plain-English read on your spending habits and specific ways to cut costs, then ask follow-up questions.",
    iconClass: "bg-purple-500/10 text-purple-500",
  },
  {
    icon: PiggyBank,
    title: "Investment portfolio",
    description:
      "Track every fund, stock and crypto token in one place, and set a monthly investing target with a pace to hit it.",
    iconClass: "bg-cyan-500/10 text-cyan-500",
  },
  {
    icon: FileText,
    title: "Reports you can share",
    description: "Turn any period into a clean report. Print it, save it as PDF, download a CSV or share a summary.",
    iconClass: "bg-rose-500/10 text-rose-500",
  },
]

const STEPS = [
  {
    icon: Wallet,
    title: "Create your account",
    description: "Sign up free with your email or Google account. It takes under a minute.",
  },
  {
    icon: Target,
    title: "Set up categories",
    description: "Choose your currency and add the categories you spend on, like food, rent and transport, with a budget for each.",
  },
  {
    icon: TrendingUp,
    title: "Record and review",
    description: "Log income, expenses and investments as they happen and watch the insights build up.",
  },
]

const SECURITY_POINTS = [
  { icon: Lock, text: "Sign in with email and password or Google, powered by Firebase Authentication" },
  { icon: ShieldCheck, text: "Your records are private to your account and encrypted by Google Cloud" },
  { icon: Sparkles, text: "The AI coach only sees a summary of your spending, never your full transaction list" },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" aria-label="FinMaester home">
              <Logo variant="full" size="md" />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How it works
              </a>
              <a href="#security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/signup">
                  Get started
                  <ArrowRight className="ml-1.5 h-4 w-4 hidden sm:inline" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-16 sm:pt-40 sm:pb-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-secondary/20 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 sm:mb-8">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs sm:text-sm font-medium text-primary">Free personal finance tracker · 45+ currencies</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance">
              Know exactly where your <span className="text-primary">money</span> goes
            </h1>

            <p className="mt-5 sm:mt-6 text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
              FinMaester keeps your income, expenses and investments in one place, in the currency you use, shows how
              your spending changes day to day, and uses AI to point out where you can cut back.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto text-base px-8 h-12">
                <Link href="/auth/signup">
                  Create a free account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 h-12 bg-transparent">
                <a href="#features">See what it does</a>
              </Button>
            </div>
          </div>

          {/* Product preview (illustrative figures) */}
          <div className="mt-14 sm:mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative rounded-xl border border-border bg-card shadow-2xl shadow-primary/10 overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/50">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs text-muted-foreground">This month · example</span>
              </div>
              <div className="p-4 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                  <PreviewTile label="Income" value="$6,500" icon={TrendingUp} tone="emerald" />
                  <PreviewTile label="Expenses" value="$2,845" icon={TrendingDown} tone="red" />
                  <PreviewTile label="Invested" value="$1,200" icon={PiggyBank} tone="blue" />
                </div>
                <div className="h-40 sm:h-48 bg-muted/30 rounded-lg flex items-end justify-center gap-2 sm:gap-3 px-4 pb-4">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div
                      key={i}
                      className="w-6 sm:w-8 bg-gradient-to-t from-primary to-primary/50 rounded-t"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-28 bg-muted/30 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
              Everything you need to take control of your money
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">
              Simple enough to use every day, detailed enough to change your habits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {FEATURES.map((feature) => (
              <Card
                key={feature.title}
                className="group border-border/50 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <CardContent className="p-5 sm:p-6">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${feature.iconClass}`}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 sm:py-28 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">Up and running in minutes</h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">Three steps to a clearer picture of your money</p>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
            {STEPS.map((item, index) => (
              <li key={item.title} className="relative flex flex-col items-center text-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground max-w-xs">{item.description}</p>
                {index < STEPS.length - 1 && (
                  <div
                    className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-border"
                    aria-hidden
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Privacy */}
      <section id="security" className="py-16 sm:py-28 bg-muted/30 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance mb-5">
                Your finances stay yours
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-8">
                FinMaester is built on Google Firebase. Your records are tied to your account and only you can see them.
              </p>
              <ul className="space-y-4">
                {SECURITY_POINTS.map((item) => (
                  <li key={item.text} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-foreground pt-2">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative hidden sm:block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
              <Card className="relative border-border/50">
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="h-14 w-14 text-primary" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">Private by default</h3>
                  <p className="text-muted-foreground mt-2 max-w-xs">
                    Your records are tied to your account. Just a clear view of your own money.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 border border-primary/20 overflow-hidden">
            <div className="relative px-6 py-12 sm:px-16 sm:py-20 text-center">
              <BarChart3 className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance mb-4">
                Start tracking in the next minute
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                It&apos;s free. Add today&apos;s spending and FinMaester will start showing you patterns right away.
              </p>
              <Button asChild size="lg" className="w-full sm:w-auto text-base px-8 h-12">
                <Link href="/auth/signup">
                  Create a free account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo variant="full" size="sm" />
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/auth/login" className="hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link href="/auth/signup" className="hover:text-foreground transition-colors">
              Create account
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} FinMaester</p>
        </div>
      </footer>
    </div>
  )
}

const TONES = {
  emerald: { card: "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20", icon: "bg-emerald-500/20 text-emerald-500" },
  red: { card: "from-red-500/10 to-red-600/5 border-red-500/20", icon: "bg-red-500/20 text-red-500" },
  blue: { card: "from-blue-500/10 to-blue-600/5 border-blue-500/20", icon: "bg-blue-500/20 text-blue-500" },
}

function PreviewTile({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: string
  icon: typeof Wallet
  tone: keyof typeof TONES
}) {
  return (
    <Card className={`bg-gradient-to-br ${TONES[tone].card}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{value}</p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${TONES[tone].icon}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
