import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
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
import { User, LogOut, Trophy, ChevronDown, ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";

const PIN_LENGTH = 6;
const PROFILE_COLORS = [
  "from-yellow-400 to-orange-500",
  "from-blue-400 to-purple-500",
  "from-green-400 to-emerald-500",
  "from-pink-400 to-rose-500",
  "from-cyan-400 to-teal-500",
  "from-indigo-400 to-violet-500",
];

type AuthMode = "profiles" | "pin" | "signup";

export function UserMenu() {
  const { isLoggedIn, userName, userAvatar, login, signup, logout, isLoading } =
    useUser();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("profiles");
  const [selectedProfile, setSelectedProfile] = useState<{
    name: string;
    avatar: string;
  } | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [signupName, setSignupName] = useState("");
  const [signupAvatar, setSignupAvatar] = useState("🦊");
  const [signupPin, setSignupPin] = useState("");
  const [signupPinConfirm, setSignupPinConfirm] = useState("");

  const AVATARS = [
    "🦊", "🐼", "🦁", "🐸", "🐱", "🐶", "🦄", "🐰", "🐻", "🐨", "🦋", "🌟",
  ];

  const allUsers = useQuery(api.users.getAllUsers, {});

  useEffect(() => {
    if (allUsers && allUsers.length === 0 && !dialogOpen) {
      setAuthMode("signup");
    }
  }, [allUsers, dialogOpen]);

  const resetForm = () => {
    setAuthMode("profiles");
    setSelectedProfile(null);
    setPin("");
    setError("");
    setIsSubmitting(false);
    setSignupName("");
    setSignupAvatar("🦊");
    setSignupPin("");
    setSignupPinConfirm("");
  };

  const handleClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) resetForm();
  };

  const handlePinPress = async (num: string) => {
    if (pin.length >= PIN_LENGTH || !selectedProfile || isSubmitting) return;
    const newPin = pin + num;
    setPin(newPin);
    setError("");

    if (newPin.length === PIN_LENGTH) {
      setIsSubmitting(true);
      try {
        await login(selectedProfile.name, newPin, selectedProfile.avatar);
        toast.success("Welcome back!");
        handleClose(false);
      } catch (err) {
        setError("Incorrect passcode. Try again!");
        setPin("");
        setTimeout(() => setError(""), 2000);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError("");
  };

  const handleSignup = async () => {
    if (!signupName.trim()) { setError("Enter your name!"); return; }
    if (signupPin.length !== PIN_LENGTH) { setError(`Passcode must be ${PIN_LENGTH} digits`); return; }
    if (signupPin !== signupPinConfirm) { setError("Passcodes don't match!"); return; }
    setIsSubmitting(true);
    setError("");
    try {
      await signup(signupName.trim(), signupPin, signupAvatar);
      toast.success("Account created! Your progress will be saved.");
      handleClose(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
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
            className="gap-2 border-primary/50 hover:border-primary hover:bg-primary/10 min-w-[40px] min-h-[40px] p-2"
          >
            <User className="w-5 h-5" />
            <span className="hidden md:inline">Sign In</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          {authMode === "profiles" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-center text-2xl">
                  Who's playing? 🎮
                </DialogTitle>
              </DialogHeader>

              <p className="text-center text-muted-foreground text-sm mb-4">
                Pick your profile
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {(allUsers || []).map((user, i) => (
                  <button
                    key={user._id}
                    onClick={() => {
                      setSelectedProfile({
                        name: user.name,
                        avatar: user.avatar || "🦊",
                      });
                      setAuthMode("pin");
                      setPin("");
                      setError("");
                    }}
                    className={`bg-gradient-to-br ${
                      PROFILE_COLORS[i % PROFILE_COLORS.length]
                    } p-5 rounded-2xl shadow-lg text-white flex flex-col items-center gap-2 hover:scale-105 transition-transform active:scale-95`}
                  >
                    <span className="text-4xl">{user.avatar || "🦊"}</span>
                    <span className="font-bold capitalize text-sm">
                      {user.name}
                    </span>
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full gap-2 border-dashed"
                onClick={() => {
                  setAuthMode("signup");
                  setError("");
                }}
              >
                <Plus className="w-4 h-4" /> New Player
              </Button>
            </>
          )}

          {authMode === "pin" && selectedProfile && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between w-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAuthMode("profiles");
                      setPin("");
                      setError("");
                    }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedProfile.avatar}</span>
                    <span className="font-bold capitalize">
                      {selectedProfile.name}
                    </span>
                  </div>
                  <div className="w-8" />
                </div>
              </DialogHeader>

              <div className="text-center mb-6">
                <div className="text-2xl mb-2">🔒</div>
                <h3 className="text-lg font-semibold mb-4">Enter your passcode</h3>
                <div className="flex justify-center gap-3 mb-2">
                  {[...Array(PIN_LENGTH)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full transition-all duration-300 ${
                        i < pin.length
                          ? "bg-primary scale-110"
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                {error && (
                  <p className="text-sm text-destructive font-medium mt-2">
                    {error}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handlePinPress(num.toString())}
                    className="bg-muted hover:bg-muted/80 text-foreground text-2xl font-bold py-3 rounded-xl transition-colors active:scale-95"
                  >
                    {num}
                  </button>
                ))}
                <div />
                <button
                  onClick={() => handlePinPress("0")}
                  className="bg-muted hover:bg-muted/80 text-foreground text-2xl font-bold py-3 rounded-xl transition-colors active:scale-95"
                >
                  0
                </button>
                <button
                  onClick={handleBackspace}
                  className="text-muted-foreground hover:text-foreground flex items-center justify-center"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
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
                      setAuthMode("profiles");
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

              <div>
                <label className="block text-sm font-medium mb-2">
                  Pick an avatar
                </label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center mb-4">
                  {AVATARS.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setSignupAvatar(avatar)}
                      className={`text-xl sm:text-2xl p-2 min-w-[44px] min-h-[44px] rounded-lg transition-all flex items-center justify-center ${
                        signupAvatar === avatar
                          ? "bg-primary/20 ring-2 ring-primary scale-110"
                          : "hover:bg-muted active:bg-muted"
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Your name
                  </label>
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => {
                      setSignupName(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter your name..."
                    className="w-full h-11 px-4 text-lg border-2 border-border rounded-xl focus:border-primary focus:outline-none bg-background"
                    autoFocus
                    maxLength={20}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Create a 6-digit passcode
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={signupPin}
                    onChange={(e) => {
                      setSignupPin(
                        e.target.value.replace(/\D/g, "").slice(0, 4)
                      );
                      setError("");
                    }}
                    placeholder="Enter 6 digits..."
                    className="w-full h-11 px-4 text-2xl text-center tracking-[0.5em] border-2 border-border rounded-xl focus:border-primary focus:outline-none bg-background font-mono"
                    maxLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Confirm passcode
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={signupPinConfirm}
                    onChange={(e) => {
                      setSignupPinConfirm(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      );
                      setError("");
                    }}
                    placeholder="Confirm passcode"
                    className="w-full h-11 px-4 text-2xl text-center tracking-[0.5em] border-2 border-border rounded-xl focus:border-primary focus:outline-none bg-background font-mono"
                    maxLength={6}
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive text-center">
                    {error}
                  </p>
                )}

                <Button
                  onClick={handleSignup}
                  size="lg"
                  className="w-full"
                  disabled={
                    !signupName.trim() ||
                    signupPin.length !== 4 ||
                    signupPinConfirm.length !== 4 ||
                    isSubmitting
                  }
                >
                  {isSubmitting
                    ? "Creating..."
                    : `Create Account ${signupAvatar}`}
                </Button>
              </div>
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
