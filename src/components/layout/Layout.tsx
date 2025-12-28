import { ReactNode } from "react";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-6 overflow-x-hidden">
        {children}
      </main>
      <footer className="py-3 sm:py-4 text-center text-muted-foreground text-xs sm:text-sm no-print">
        <p>Made with 💖 by Uncle Joseph for Cristina</p>
      </footer>
    </div>
  );
};

export default Layout;
