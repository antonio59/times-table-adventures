import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
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
import { Save, X, ArrowLeft } from "lucide-react";

const PIN_LENGTH = 6;

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

type SaveMode = "choice" | "signup" | "login";

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
  const [pin, setPin] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🦊");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMode, setSaveMode] = useState<SaveMode>("choice");
  const [error, setError] = useState("");

  // Check if username exists
  const userExists = useQuery(
    api.users.checkUserExists,
    saveMode === "signup" && name.trim().length >= 2
      ? { name: name.trim() }
      : "skip",
  );

  // Call Convex mutations directly to avoid React state timing issues
  const createUser = useMutation(api.users.createUser);
  const loginUser = useMutation(api.users.loginUser);
  const recordSession = useMutation(api.gameSessions.recordSession);
  const updateMasteryBatch = useMutation(api.tableMastery.updateMasteryBatch);
  const checkAchievements = useMutation(api.achievements.checkAchievements);

  const handlePinChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setPin(digits);
    setError("");
  };

  const saveProgress = async (userId: string) => {
    // Record the session
    await recordSession({
      userId: userId as Parameters<typeof recordSession>[0]["userId"],
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
        userId: userId as Parameters<typeof updateMasteryBatch>[0]["userId"],
        results: tableResults,
      });
    }

    // Check for achievements
    const newAchievements = await checkAchievements({
      userId: userId as Parameters<typeof checkAchievements>[0]["userId"],
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
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || pin.length !== PIN_LENGTH) return;

    setIsSaving(true);
    setError("");

    try {
      const userId = await createUser({
        name: name.trim(),
        pin,
        avatar: selectedAvatar,
      });

      await saveProgress(userId);

      loginWithId(userId, name.trim(), selectedAvatar);
      toast.success("Account created and progress saved!");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || pin.length !== PIN_LENGTH) return;

    setIsSaving(true);
    setError("");

    try {
      const result = await loginUser({ name: name.trim(), pin });

      await saveProgress(result.userId);

      loginWithId(result.userId, result.name, result.avatar ?? selectedAvatar);
      toast.success("Progress saved!");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {saveMode === "choice" && "Save Your Progress?"}
            {saveMode === "signup" && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSaveMode("choice");
                    setError("");
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                Create Account
              </div>
            )}
            {saveMode === "login" && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSaveMode("choice");
                    setError("");
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                Sign In
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {saveMode === "choice" && (
          <>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">
                {session.correctAnswers}/{session.totalQuestions} correct!
              </div>
              <p className="text-muted-foreground text-sm">
                Create an account to save your score and track your learning
              </p>
            </div>

            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full"
                onClick={() => setSaveMode("signup")}
              >
                Create New Account
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => setSaveMode("login")}
              >
                I Already Have an Account
              </Button>
              <Button variant="ghost" className="w-full" onClick={onClose}>
                <X className="w-4 h-4 mr-2" />
                Skip for Now
              </Button>
            </div>
          </>
        )}

        {saveMode === "signup" && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Pick an avatar
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`text-xl sm:text-2xl p-2 min-w-[44px] min-h-[44px] rounded-lg transition-all flex items-center justify-center ${
                      selectedAvatar === avatar
                        ? "bg-primary/20 ring-2 ring-primary scale-110"
                        : "hover:bg-muted active:bg-muted"
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="Enter your name..."
                className="w-full h-11 px-4 text-lg border-2 border-border rounded-xl focus:border-primary focus:outline-none bg-background"
                autoFocus
                maxLength={20}
              />
              {userExists && (
                <p className="text-sm text-amber-600 mt-1">
                  This name is taken. Try a different name or sign in.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Create a 6-digit passcode
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Remember this to sign in later!
              </p>
              <input
                type="text"
                inputMode="numeric"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                placeholder="Enter 6 digits..."
                maxLength={6}
              />
              <div className="flex justify-center gap-2 mt-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      pin.length > i ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={
                !name.trim() ||
                pin.length !== PIN_LENGTH ||
                isSaving ||
                userExists === true
              }
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : `Save Progress ${selectedAvatar}`}
            </Button>
          </form>
        )}

        {saveMode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="text-center mb-2">
              <div className="text-3xl mb-1">
                {session.correctAnswers}/{session.totalQuestions} correct!
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="Enter your name..."
                className="w-full h-11 px-4 text-lg border-2 border-border rounded-xl focus:border-primary focus:outline-none bg-background"
                autoFocus
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Your PIN</label>
              <input
                type="text"
                inputMode="numeric"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                placeholder="Enter your 6-digit passcode..."
                className="w-full h-11 px-4 text-2xl text-center tracking-[0.5em] border-2 border-border rounded-xl focus:border-primary focus:outline-none bg-background font-mono"
                maxLength={6}
              />
              <div className="flex justify-center gap-2 mt-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      pin.length > i ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={!name.trim() || pin.length !== PIN_LENGTH || isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Sign In & Save"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
