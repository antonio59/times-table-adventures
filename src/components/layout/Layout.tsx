import { ReactNode } from "react";
import { useUser } from "@/contexts/UserContext";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isRecording } = useUser();

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Skip to content link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Global loading overlay for save operations */}
      <LoadingOverlay
        isLoading={isRecording}
        message="Saving your progress..."
        subMessage="Keep up the great work!"
      />

      <Header />
      <main id="main-content" className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-6 overflow-x-hidden">
        {children}
      </main>
      <footer className="py-3 sm:py-4 text-center text-muted-foreground text-xs sm:text-sm no-print">
        <p>Made with 💖 by Uncle Joseph for Cristina</p>
      </footer>
    </div>
  );
};

export default Layout;
