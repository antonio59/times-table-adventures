import { useState } from "react";
import { useUser, GameSession, TableResult } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Save, X } from "lucide-react";

const AVATARS = [
  "🦊",
  "🐼",
  "🦁",
  "🐸",
  "🐱",
  "🐶",
  "🦄",
  "🐰",
  "🐻",
  "🐨",
  "🦋",
  "🌟",
];

interface SaveProgressPromptProps {
  session: GameSession;
  tableResults?: TableResult[];
  onClose: () => void;
}

export function SaveProgressPrompt({
  session,
  tableResults = [],
  onClose,
}: SaveProgressPromptProps) {
  const { login, recordGame } = useUser();
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🦊");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      // Login first
      await login(name.trim(), selectedAvatar);

      // Small delay to ensure userId is set
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Record the game - we need to call this after login completes
      // The recordGame function will now have the userId
      const newAchievements = await recordGame(session, tableResults);

      if (newAchievements.length > 0) {
        newAchievements.forEach((type) => {
          toast.success(`Achievement Unlocked: ${type.replace(/_/g, " ")}!`, {
            icon: "🏆",
          });
        });
      }

      toast.success("Progress saved!");
      onClose();
    } catch (error) {
      toast.error("Failed to save. Try again!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Save Your Progress?
          </DialogTitle>
        </DialogHeader>

        <div className="text-center mb-4">
          <div className="text-4xl mb-2">
            {session.correctAnswers}/{session.totalQuestions} correct!
          </div>
          <p className="text-muted-foreground text-sm">
            Enter your name to save your score and track your learning
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Pick an avatar
            </label>
            <div className="flex flex-wrap gap-2 justify-center">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`text-2xl p-1.5 rounded-lg transition-all ${
                    selectedAvatar === avatar
                      ? "bg-primary/20 ring-2 ring-primary scale-110"
                      : "hover:bg-muted"
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Your name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full h-11 px-4 text-lg border-2 border-border rounded-xl focus:border-primary focus:outline-none bg-background"
              autoFocus
              maxLength={20}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
              Skip
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!name.trim() || isSaving}
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
