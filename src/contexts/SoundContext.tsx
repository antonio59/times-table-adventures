import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from "react";

export type SoundEffect =
  | "correct"
  | "wrong"
  | "click"
  | "streak"
  | "levelUp"
  | "gameStart"
  | "gameEnd"
  | "tick"
  | "whoosh";

interface SoundContextType {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  toggle: () => boolean;
  play: (sound: SoundEffect) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const SOUND_ENABLED_KEY = "times-table-sound-enabled";

// Audio context singleton
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    )();
  }
  return audioContext;
};

// Sound synthesis functions using Web Audio API
const createOscillator = (
  ctx: AudioContext,
  frequency: number,
  type: OscillatorType,
  duration: number,
  volume: number = 0.3,
): void => {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = type;

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
};

const playCorrectSound = (ctx: AudioContext): void => {
  // Happy ascending arpeggio
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  notes.forEach((freq, i) => {
    setTimeout(() => {
      createOscillator(ctx, freq, "sine", 0.15, 0.2);
    }, i * 80);
  });
};

const playWrongSound = (ctx: AudioContext): void => {
  // Descending minor sound
  createOscillator(ctx, 311.13, "sawtooth", 0.3, 0.15); // Eb4
  setTimeout(() => {
    createOscillator(ctx, 277.18, "sawtooth", 0.3, 0.15); // Db4
  }, 100);
};

const playClickSound = (ctx: AudioContext): void => {
  // Short click/pop sound
  createOscillator(ctx, 800, "sine", 0.05, 0.15);
};

const playStreakSound = (ctx: AudioContext): void => {
  // Exciting ascending fanfare
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    setTimeout(() => {
      createOscillator(ctx, freq, "triangle", 0.2, 0.25);
    }, i * 60);
  });
};

const playLevelUpSound = (ctx: AudioContext): void => {
  // Victory fanfare
  const notes = [392, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
  notes.forEach((freq, i) => {
    setTimeout(() => {
      createOscillator(ctx, freq, "triangle", 0.25, 0.2);
      createOscillator(ctx, freq * 2, "sine", 0.25, 0.1);
    }, i * 100);
  });
};

const playGameStartSound = (ctx: AudioContext): void => {
  // Ready set go!
  const notes = [440, 440, 659.25]; // A4, A4, E5
  const durations = [0.15, 0.15, 0.3];
  notes.forEach((freq, i) => {
    setTimeout(() => {
      createOscillator(ctx, freq, "square", durations[i], 0.15);
    }, i * 300);
  });
};

const playGameEndSound = (ctx: AudioContext): void => {
  // Completion sound
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    setTimeout(() => {
      createOscillator(ctx, freq, "sine", 0.4, 0.2);
    }, i * 150);
  });
};

const playTickSound = (ctx: AudioContext): void => {
  // Clock tick
  createOscillator(ctx, 1000, "sine", 0.03, 0.1);
};

const playWhooshSound = (ctx: AudioContext): void => {
  // Transition whoosh
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(400, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);

  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.2);
};

const soundPlayers: Record<SoundEffect, (ctx: AudioContext) => void> = {
  correct: playCorrectSound,
  wrong: playWrongSound,
  click: playClickSound,
  streak: playStreakSound,
  levelUp: playLevelUpSound,
  gameStart: playGameStartSound,
  gameEnd: playGameEndSound,
  tick: playTickSound,
  whoosh: playWhooshSound,
};

// eslint-disable-next-line react-refresh/only-export-components
export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState(true);
  const enabledRef = useRef(true);

  // Load preference from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SOUND_ENABLED_KEY);
    if (stored !== null) {
      const value = stored === "true";
      setEnabledState(value);
      enabledRef.current = value;
    }
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value);
    enabledRef.current = value;
    localStorage.setItem(SOUND_ENABLED_KEY, String(value));
  }, []);

  const toggle = useCallback(() => {
    const newValue = !enabledRef.current;
    setEnabled(newValue);
    return newValue;
  }, [setEnabled]);

  const play = useCallback((sound: SoundEffect) => {
    if (!enabledRef.current) return;

    try {
      const ctx = getAudioContext();
      // Resume audio context if it was suspended (browser autoplay policy)
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      soundPlayers[sound](ctx);
    } catch (error) {
      console.warn("Sound playback failed:", error);
    }
  }, []);

  return (
    <SoundContext.Provider value={{ enabled, setEnabled, toggle, play }}>
      {children}
    </SoundContext.Provider>
  );
}
