import { useEffect, useCallback } from "react";

export type ShortcutKey =
  | "1"
  | "2"
  | "3"
  | "4"
  | "Enter"
  | "Escape"
  | "Space"
  | "?";

export interface KeyboardShortcut {
  key: ShortcutKey;
  description: string;
  action: () => void;
  disabled?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow Enter and Escape in input fields
        if (event.key !== "Enter" && event.key !== "Escape") {
          return;
        }
      }

      const shortcut = shortcuts.find((s) => {
        if (s.disabled) return false;
        if (s.key === "?" && event.key === "?" && event.shiftKey) return true;
        if (s.key === "Space" && event.key === " ") return true;
        return s.key === event.key;
      });

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    },
    [shortcuts, enabled],
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled]);
}

// Common shortcut presets
export const QUIZ_SHORTCUTS = {
  OPTION_1: "1" as ShortcutKey,
  OPTION_2: "2" as ShortcutKey,
  OPTION_3: "3" as ShortcutKey,
  OPTION_4: "4" as ShortcutKey,
  SUBMIT: "Enter" as ShortcutKey,
  BACK: "Escape" as ShortcutKey,
  HELP: "?" as ShortcutKey,
};
