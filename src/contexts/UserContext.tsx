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
  login: (name: string, avatar?: string) => Promise<void>;
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

  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
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
      } catch (e) {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (name: string, avatar?: string) => {
      setIsLoading(true);
      try {
        const id = await getOrCreateUser({ name, avatar });
        setUserId(id);
        setUserName(name.toLowerCase().trim());
        setUserAvatar(avatar ?? null);
        localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify({ name: name.toLowerCase().trim(), avatar, id }),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [getOrCreateUser],
  );

  const logout = useCallback(() => {
    setUserId(null);
    setUserName(null);
    setUserAvatar(null);
    setPendingSession(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

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
