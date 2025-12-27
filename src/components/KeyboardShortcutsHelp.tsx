import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  context?: "quiz" | "practice" | "daily" | "general";
}

const generalShortcuts: ShortcutItem[] = [
  { keys: ["?"], description: "Show keyboard shortcuts" },
  { keys: ["Esc"], description: "Go back / Close modal" },
];

const quizShortcuts: ShortcutItem[] = [
  { keys: ["1"], description: "Select first answer" },
  { keys: ["2"], description: "Select second answer" },
  { keys: ["3"], description: "Select third answer" },
  { keys: ["4"], description: "Select fourth answer" },
  { keys: ["Enter"], description: "Submit answer" },
  { keys: ["Space"], description: "Start game / Next question" },
];

const practiceShortcuts: ShortcutItem[] = [
  { keys: ["Enter"], description: "Check answer / Next card" },
  { keys: ["Space"], description: "Flip card / Show answer" },
];

const dailyShortcuts: ShortcutItem[] = [
  { keys: ["Enter"], description: "Submit answer" },
  { keys: ["Space"], description: "Start challenge" },
];

export function KeyboardShortcutsHelp({
  isOpen,
  onClose,
  context = "general",
}: KeyboardShortcutsHelpProps) {
  const contextShortcuts =
    context === "quiz"
      ? quizShortcuts
      : context === "practice"
        ? practiceShortcuts
        : context === "daily"
          ? dailyShortcuts
          : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-card rounded-2xl shadow-xl border border-border z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Keyboard Shortcuts</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {contextShortcuts.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    {context === "quiz"
                      ? "Quiz"
                      : context === "practice"
                        ? "Practice"
                        : "Daily Challenge"}
                  </h3>
                  <div className="space-y-2">
                    {contextShortcuts.map((shortcut, idx) => (
                      <ShortcutRow key={idx} {...shortcut} />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                  General
                </h3>
                <div className="space-y-2">
                  {generalShortcuts.map((shortcut, idx) => (
                    <ShortcutRow key={idx} {...shortcut} />
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">
                Press <kbd className="kbd">Esc</kbd> or click outside to close
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ShortcutRow({ keys, description }: ShortcutItem) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-foreground">{description}</span>
      <div className="flex gap-1">
        {keys.map((key, idx) => (
          <kbd
            key={idx}
            className="px-2 py-1 bg-muted rounded text-xs font-mono font-semibold border border-border shadow-sm"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}

export default KeyboardShortcutsHelp;
