import { useCallback, useRef, useEffect } from 'react';

// Web Audio API based sound effects for luxury micro-interactions
export const useSoundEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isEnabledRef = useRef(true);

  useEffect(() => {
    // Initialize AudioContext on first user interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };

    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });

    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, []);

  const playTone = useCallback((frequency: number, duration: number, volume: number = 0.05, type: OscillatorType = 'sine') => {
    if (!audioContextRef.current || !isEnabledRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Envelope for smooth attack/decay
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, []);

  // Subtle hover sound - soft high frequency
  const playHover = useCallback(() => {
    playTone(2400, 0.08, 0.02, 'sine');
  }, [playTone]);

  // Click sound - crisp pop
  const playClick = useCallback(() => {
    playTone(800, 0.06, 0.04, 'sine');
    setTimeout(() => playTone(1200, 0.04, 0.02, 'sine'), 20);
  }, [playTone]);

  // Success sound - ascending notes
  const playSuccess = useCallback(() => {
    playTone(523.25, 0.12, 0.03, 'sine'); // C5
    setTimeout(() => playTone(659.25, 0.12, 0.03, 'sine'), 80); // E5
    setTimeout(() => playTone(783.99, 0.15, 0.04, 'sine'), 160); // G5
  }, [playTone]);

  // Toggle sound - soft switch
  const playToggle = useCallback(() => {
    playTone(1046.5, 0.05, 0.03, 'sine');
    setTimeout(() => playTone(1318.5, 0.08, 0.02, 'sine'), 30);
  }, [playTone]);

  // Add to cart sound - satisfying confirmation
  const playAddToCart = useCallback(() => {
    playTone(440, 0.08, 0.03, 'sine');
    setTimeout(() => playTone(554.37, 0.08, 0.03, 'sine'), 50);
    setTimeout(() => playTone(659.25, 0.12, 0.04, 'sine'), 100);
  }, [playTone]);

  // Page open sound - whoosh-like
  const playPageOpen = useCallback(() => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => playTone(400 + i * 100, 0.06, 0.01, 'sine'), i * 20);
    }
  }, [playTone]);

  // Page close sound - reverse whoosh
  const playPageClose = useCallback(() => {
    for (let i = 4; i >= 0; i--) {
      setTimeout(() => playTone(400 + i * 100, 0.06, 0.01, 'sine'), (4 - i) * 20);
    }
  }, [playTone]);

  const toggleSound = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
  }, []);

  return {
    playHover,
    playClick,
    playSuccess,
    playToggle,
    playAddToCart,
    playPageOpen,
    playPageClose,
    toggleSound,
  };
};

// Create a singleton context for global sound access
import { createContext, useContext, ReactNode } from 'react';

interface SoundContextType {
  playHover: () => void;
  playClick: () => void;
  playSuccess: () => void;
  playToggle: () => void;
  playAddToCart: () => void;
  playPageOpen: () => void;
  playPageClose: () => void;
  toggleSound: (enabled: boolean) => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export const SoundProvider = ({ children }: { children: ReactNode }) => {
  const sounds = useSoundEffects();
  return <SoundContext.Provider value={sounds}>{children}</SoundContext.Provider>;
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    // Return no-op functions if not in provider
    return {
      playHover: () => {},
      playClick: () => {},
      playSuccess: () => {},
      playToggle: () => {},
      playAddToCart: () => {},
      playPageOpen: () => {},
      playPageClose: () => {},
      toggleSound: () => {},
    };
  }
  return context;
};
