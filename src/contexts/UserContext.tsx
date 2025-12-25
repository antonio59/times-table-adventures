import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

type GameType =
  | "practice"
  | "quiz"
  | "speed"
  | "memory"
  | "missing"
  | "stories";

export interface GameSession {
  gameType: GameType;
  tablesUsed: number[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  bestStreak: number;
  timeSpent: number;
}

export interface TableResult {
  tableNumber: number;
  correct: boolean;
  timeMs: number;
}

interface PendingSession {
  session: GameSession;
  tableResults: TableResult[];
}

interface UserContextType {
  userId: Id<"users"> | null;
  userName: string | null;
  userAvatar: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  pendingSession: PendingSession | null;
  login: (name: string, pin: string, avatar?: string) => Promise<void>;
  signup: (name: string, pin: string, avatar?: string) => Promise<void>;
  loginWithId: (id: Id<"users">, name: string, avatar?: string) => void;
  logout: () => void;
  recordGame: (
    session: GameSession,
    tableResults?: TableResult[],
  ) => Promise<string[]>;
  setPendingSession: (session: PendingSession | null) => void;
  savePendingSession: () => Promise<string[]>;
  clearPendingSession: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = "times-table-user";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingSession, setPendingSession] = useState<PendingSession | null>(
    null,
  );

  const createUserMutation = useMutation(api.users.createUser);
  const loginUserMutation = useMutation(api.users.loginUser);
  const recordSession = useMutation(api.gameSessions.recordSession);
  const updateMasteryBatch = useMutation(api.tableMastery.updateMasteryBatch);
  const checkAchievements = useMutation(api.achievements.checkAchievements);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      try {
        const { name, avatar, id } = JSON.parse(stored);
        setUserName(name);
        setUserAvatar(avatar);
        setUserId(id as Id<"users">);
      } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Sign up a new user
  const signup = useCallback(
    async (name: string, pin: string, avatar?: string) => {
      setIsLoading(true);
      try {
        const id = await createUserMutation({ name, pin, avatar });
        const normalizedName = name.toLowerCase().trim();
        setUserId(id);
        setUserName(normalizedName);
        setUserAvatar(avatar ?? null);
        localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify({ name: normalizedName, avatar, id }),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [createUserMutation],
  );

  // Login existing user with PIN
  const login = useCallback(
    async (name: string, pin: string, avatar?: string) => {
      setIsLoading(true);
      try {
        const result = await loginUserMutation({ name, pin });
        setUserId(result.userId);
        setUserName(result.name);
        setUserAvatar(avatar ?? result.avatar ?? null);
        localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify({
            name: result.name,
            avatar: avatar ?? result.avatar,
            id: result.userId,
          }),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [loginUserMutation],
  );

  const logout = useCallback(() => {
    setUserId(null);
    setUserName(null);
    setUserAvatar(null);
    setPendingSession(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  // Login with an existing user ID (used by SaveProgressPrompt after direct mutation)
  const loginWithId = useCallback(
    (id: Id<"users">, name: string, avatar?: string) => {
      const normalizedName = name.toLowerCase().trim();
      setUserId(id);
      setUserName(normalizedName);
      setUserAvatar(avatar ?? null);
      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify({ name: normalizedName, avatar, id }),
      );
    },
    [],
  );

  const recordGame = useCallback(
    async (
      session: GameSession,
      tableResults?: TableResult[],
    ): Promise<string[]> => {
      if (!userId) return [];

      // Record the session
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
      if (tableResults && tableResults.length > 0) {
        await updateMasteryBatch({
          userId,
          results: tableResults,
        });
      }

      // Check for new achievements
      const newAchievements = await checkAchievements({
        userId,
        gameType: session.gameType,
        score: session.score,
        totalQuestions: session.totalQuestions,
        correctAnswers: session.correctAnswers,
        bestStreak: session.bestStreak,
      });

      return newAchievements;
    },
    [userId, recordSession, updateMasteryBatch, checkAchievements],
  );

  const savePendingSession = useCallback(async (): Promise<string[]> => {
    if (!userId || !pendingSession) return [];

    const achievements = await recordGame(
      pendingSession.session,
      pendingSession.tableResults,
    );
    setPendingSession(null);
    return achievements;
  }, [userId, pendingSession, recordGame]);

  const clearPendingSession = useCallback(() => {
    setPendingSession(null);
  }, []);

  return (
    <UserContext.Provider
      value={{
        userId,
        userName,
        userAvatar,
        isLoading,
        isLoggedIn: !!userId,
        pendingSession,
        login,
        signup,
        loginWithId,
        logout,
        recordGame,
        setPendingSession,
        savePendingSession,
        clearPendingSession,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
