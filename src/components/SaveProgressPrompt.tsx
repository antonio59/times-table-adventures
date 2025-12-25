import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
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
  const { loginWithId } = useUser();
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🦊");
  const [isSaving, setIsSaving] = useState(false);

  // Call Convex mutations directly to avoid React state timing issues
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  const recordSession = useMutation(api.gameSessions.recordSession);
  const updateMasteryBatch = useMutation(api.tableMastery.updateMasteryBatch);
  const checkAchievements = useMutation(api.achievements.checkAchievements);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      // Create user and get ID directly from mutation
      const userId = await getOrCreateUser({
        name: name.trim(),
        avatar: selectedAvatar,
      });

      // Record the session with the userId we just got
      await recordSession({
        userId,
        gameType: session.gameType,
        tablesUsed: session.tablesUsed,
        score: session.score,
        totalQuestions: session.totalQuestions,
        correctAnswers: session.correctAnswers,
        bestStreak: session.bestStreak,
        timeSpent: session.timeSpent,
      });

      // Record table mastery if provided
      if (tableResults.length > 0) {
        await updateMasteryBatch({
          userId,
          results: tableResults,
        });
      }

      // Check for achievements
      const newAchievements = await checkAchievements({
        userId,
        gameType: session.gameType,
        score: session.score,
        totalQuestions: session.totalQuestions,
        correctAnswers: session.correctAnswers,
        bestStreak: session.bestStreak,
      });

      if (newAchievements.length > 0) {
        newAchievements.forEach((type) => {
          toast.success(`Achievement Unlocked: ${type.replace(/_/g, " ")}!`, {
            icon: "🏆",
          });
        });
      }

      // Update the user context with the new user
      loginWithId(userId, name.trim(), selectedAvatar);

      toast.success("Progress saved!");
      onClose();
    } catch (error) {
      console.error("Failed to save progress:", error);
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
