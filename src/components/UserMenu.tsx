import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { User, LogOut, Trophy, ChevronDown, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

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

type AuthMode = "choice" | "signup" | "login";

export function UserMenu() {
  const { isLoggedIn, userName, userAvatar, login, signup, logout, isLoading } =
    useUser();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🦊");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("choice");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Check if username exists when in signup mode
  const userExists = useQuery(
    api.users.checkUserExists,
    authMode === "signup" && name.trim().length >= 2
      ? { name: name.trim() }
      : "skip",
  );

  const resetForm = () => {
    setName("");
    setPin("");
    setSelectedAvatar("🦊");
    setAuthMode("choice");
    setError("");
    setIsSubmitting(false);
  };

  const handleClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || pin.length !== 4) return;

    setIsSubmitting(true);
    setError("");

    try {
      await signup(name.trim(), pin, selectedAvatar);
      toast.success("Account created! Your progress will be saved.");
      handleClose(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || pin.length !== 4) return;

    setIsSubmitting(true);
    setError("");

    try {
      await login(name.trim(), pin, selectedAvatar);
      toast.success("Welcome back!");
      handleClose(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinChange = (value: string) => {
    // Only allow digits and max 4 characters
    const digits = value.replace(/\D/g, "").slice(0, 4);
    setPin(digits);
    setError("");
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
      </Button>
    );
  }

  if (!isLoggedIn) {
    return (
      <Dialog open={dialogOpen} onOpenChange={handleClose}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-primary/50 hover:border-primary hover:bg-primary/10"
          >
            <User className="w-4 h-4" />
            <span className="hidden md:inline">Sign In</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          {authMode === "choice" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-center text-2xl">
                  Track Your Progress!
                </DialogTitle>
              </DialogHeader>

              <p className="text-center text-muted-foreground text-sm mb-6">
                Save your scores, earn achievements, and see which tables you've
                mastered!
              </p>

              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => setAuthMode("signup")}
                >
                  Create New Account
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => setAuthMode("login")}
                >
                  I Already Have an Account
                </Button>
              </div>
            </>
          )}

          {authMode === "signup" && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAuthMode("choice");
                      setError("");
                    }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <DialogTitle className="text-xl">
                    Create Your Account
                  </DialogTitle>
                </div>
              </DialogHeader>

              <form onSubmit={handleSignup} className="space-y-5">
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
                    Create a 4-digit PIN
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    You'll need this to sign in again on other devices
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={pin}
                    onChange={(e) => handlePinChange(e.target.value)}
                    placeholder="Enter 4 digits..."
                    className="w-full h-11 px-4 text-2xl text-center tracking-[0.5em] border-2 border-border rounded-xl focus:border-primary focus:outline-none bg-background font-mono"
                    maxLength={4}
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
                  <p className="text-sm text-destructive text-center">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={
                    !name.trim() ||
                    pin.length !== 4 ||
                    isSubmitting ||
                    userExists === true
                  }
                >
                  {isSubmitting
                    ? "Creating..."
                    : `Create Account ${selectedAvatar}`}
                </Button>
              </form>
            </>
          )}

          {authMode === "login" && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAuthMode("choice");
                      setError("");
                    }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <DialogTitle className="text-xl">Welcome Back!</DialogTitle>
                </div>
              </DialogHeader>

              <form onSubmit={handleLogin} className="space-y-5">
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
                  <label className="block text-sm font-medium mb-2">
                    Your PIN
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={pin}
                    onChange={(e) => handlePinChange(e.target.value)}
                    placeholder="Enter your 4-digit PIN..."
                    className="w-full h-11 px-4 text-2xl text-center tracking-[0.5em] border-2 border-border rounded-xl focus:border-primary focus:outline-none bg-background font-mono"
                    maxLength={4}
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
                  <p className="text-sm text-destructive text-center">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={!name.trim() || pin.length !== 4 || isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span className="text-lg">{userAvatar}</span>
          <span className="hidden md:inline capitalize">{userName}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-2 text-center">
          <div className="text-3xl mb-1">{userAvatar}</div>
          <div className="font-semibold capitalize">{userName}</div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            to="/progress"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            My Progress
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className="flex items-center gap-2 text-destructive cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
