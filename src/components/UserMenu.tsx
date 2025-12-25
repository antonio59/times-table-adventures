import { useState } from "react";
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
import { User, LogOut, Trophy, ChevronDown } from "lucide-react";

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

export function UserMenu() {
  const { isLoggedIn, userName, userAvatar, login, logout, isLoading } =
    useUser();
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🦊");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      await login(name.trim(), selectedAvatar);
      setDialogOpen(false);
      setName("");
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              Save Your Learning!
            </DialogTitle>
          </DialogHeader>

          <p className="text-center text-muted-foreground text-sm mb-4">
            Enter your name to track scores, earn achievements, and see which
            tables you've mastered!
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
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
                    className={`text-3xl p-2 rounded-xl transition-all ${
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
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full h-12 px-4 text-lg border-2 border-border rounded-xl focus:border-primary focus:outline-none bg-background"
                autoFocus
                maxLength={20}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={!name.trim()}
            >
              Start Tracking! {selectedAvatar}
            </Button>
          </form>
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
