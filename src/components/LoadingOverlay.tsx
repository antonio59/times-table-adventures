import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Save } from "lucide-react";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  subMessage?: string;
}

export function LoadingOverlay({
  isLoading,
  message = "Saving your progress...",
  subMessage = "Just a moment!",
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-2xl p-8 shadow-card border border-border text-center max-w-sm mx-4"
          >
            <div className="relative mb-4">
              <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center">
                <Save className="w-8 h-8 text-primary-foreground" />
              </div>
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-20 h-20 text-primary/30" strokeWidth={1} />
              </motion.div>
            </div>

            <h3 className="text-lg font-bold mb-1">{message}</h3>
            <p className="text-muted-foreground text-sm">{subMessage}</p>

            <div className="mt-4 flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
