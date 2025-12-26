import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load page components for code splitting
const Index = lazy(() => import("./pages/Index"));
const Tables = lazy(() => import("./pages/Tables"));
const Practice = lazy(() => import("./pages/Practice"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Print = lazy(() => import("./pages/Print"));
const WordProblems = lazy(() => import("./pages/WordProblems"));
const SpeedRace = lazy(() => import("./pages/SpeedRace"));
const MissingNumber = lazy(() => import("./pages/MissingNumber"));
const MemoryMatch = lazy(() => import("./pages/MemoryMatch"));
const DivisionChallenge = lazy(() => import("./pages/DivisionChallenge"));
const PatternPuzzle = lazy(() => import("./pages/PatternPuzzle"));
const TimesTableClimb = lazy(() => import("./pages/TimesTableClimb"));
const Tips = lazy(() => import("./pages/Tips"));
const Progress = lazy(() => import("./pages/Progress"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-secondary/5">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/tables" element={<Tables />} />
                <Route path="/practice" element={<Practice />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/stories" element={<WordProblems />} />
                <Route path="/speed" element={<SpeedRace />} />
                <Route path="/missing" element={<MissingNumber />} />
                <Route path="/memory" element={<MemoryMatch />} />
                <Route path="/division" element={<DivisionChallenge />} />
                <Route path="/pattern" element={<PatternPuzzle />} />
                <Route path="/climb" element={<TimesTableClimb />} />
                <Route path="/tips" element={<Tips />} />
                <Route path="/print" element={<Print />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
