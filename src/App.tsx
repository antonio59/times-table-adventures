import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Tables from "./pages/Tables";
import Practice from "./pages/Practice";
import Quiz from "./pages/Quiz";
import Print from "./pages/Print";
import WordProblems from "./pages/WordProblems";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tables" element={<Tables />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/stories" element={<WordProblems />} />
          <Route path="/print" element={<Print />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
