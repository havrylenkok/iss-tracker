import { Suspense } from "react"
import ISSTracker from "./components/iss-tracker"
import { ThemeProvider } from "./components/theme-provider"

export default function Page() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <main className="w-full h-screen bg-background">
        <Suspense fallback={<div>Loading...</div>}>
          <ISSTracker />
        </Suspense>
      </main>
    </ThemeProvider>
  )
}

