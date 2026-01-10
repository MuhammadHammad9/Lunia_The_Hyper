import { useCallback, useRef, useEffect, useState } from 'react';
import { createContext, useContext, ReactNode } from 'react';

// Web Audio API based sound effects for luxury micro-interactions
const useSoundEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientRef = useRef<{ oscillators: OscillatorNode[]; gain: GainNode; lfo: OscillatorNode } | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lunia-sound-enabled');
      return saved === 'true';
    }
    return false;
  });
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Initialize AudioContext on first user interaction
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }
    setHasUserInteracted(true);
    return audioContextRef.current;
  }, []);

  useEffect(() => {
    const handleInteraction = () => {
      initAudio();
    };

    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [initAudio]);

  // Persist sound preference
  useEffect(() => {
    localStorage.setItem('lunia-sound-enabled', String(isSoundEnabled));
  }, [isSoundEnabled]);

  // Create ambient sound using oscillators for a calming drone
  const createAmbientSound = useCallback((ctx: AudioContext) => {
    // Create a calming ambient drone using multiple oscillators
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const frequencies = [60, 90, 120, 180]; // Low harmonic frequencies
    const oscillators: OscillatorNode[] = [];

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      oscGain.gain.setValueAtTime(0.02 / (i + 1), ctx.currentTime); // Decreasing volume for harmonics
      
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();
      oscillators.push(osc);
    });

    // Add subtle LFO modulation for movement
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.1, ctx.currentTime); // Very slow modulation
    lfoGain.gain.setValueAtTime(5, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(oscillators[0].frequency);
    lfo.start();

    return { 
      oscillators,
      gain: masterGain,
      lfo
    };
  }, []);

  // Start ambient sound
  const startAmbient = useCallback(() => {
    if (!audioContextRef.current || ambientRef.current) return;
    
    const ctx = audioContextRef.current;
    const ambient = createAmbientSound(ctx);
    
    // Fade in
    ambient.gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 2);
    ambientRef.current = ambient;
    setIsAmbientPlaying(true);
  }, [createAmbientSound]);

  // Stop ambient sound
  const stopAmbient = useCallback(() => {
    if (ambientRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      const { oscillators, gain, lfo } = ambientRef.current;
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1);
      setTimeout(() => {
        oscillators.forEach(osc => osc.stop());
        lfo.stop();
        ambientRef.current = null;
      }, 1000);
    }
    setIsAmbientPlaying(false);
  }, []);

  // Toggle sound on/off
  const toggleSoundEnabled = useCallback(() => {
    const newState = !isSoundEnabled;
    setIsSoundEnabled(newState);
    
    if (!hasUserInteracted) {
      initAudio();
    }
    
    if (newState && audioContextRef.current) {
      startAmbient();
    } else {
      stopAmbient();
    }
  }, [isSoundEnabled, hasUserInteracted, initAudio, startAmbient, stopAmbient]);

  // Auto-start ambient when sound is enabled and user has interacted
  useEffect(() => {
    if (isSoundEnabled && hasUserInteracted && !isAmbientPlaying) {
      startAmbient();
    }
  }, [isSoundEnabled, hasUserInteracted, isAmbientPlaying, startAmbient]);

  const playTone = useCallback((frequency: number, duration: number, volume: number = 0.05, type: OscillatorType = 'sine') => {
    if (!audioContextRef.current || !isSoundEnabled) return;

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
  }, [isSoundEnabled]);

  // Subtle hover sound - soft high frequency
  const playHover = useCallback(() => {
    playTone(2400, 0.08, 0.015, 'sine');
  }, [playTone]);

  // Click sound - crisp pop
  const playClick = useCallback(() => {
    playTone(800, 0.06, 0.03, 'sine');
    setTimeout(() => playTone(1200, 0.04, 0.015, 'sine'), 20);
  }, [playTone]);

  // Success sound - ascending notes
  const playSuccess = useCallback(() => {
    playTone(523.25, 0.12, 0.02, 'sine');
    setTimeout(() => playTone(659.25, 0.12, 0.02, 'sine'), 80);
    setTimeout(() => playTone(783.99, 0.15, 0.03, 'sine'), 160);
  }, [playTone]);

  // Toggle sound - soft switch
  const playToggle = useCallback(() => {
    playTone(1046.5, 0.05, 0.02, 'sine');
    setTimeout(() => playTone(1318.5, 0.08, 0.015, 'sine'), 30);
  }, [playTone]);

  // Add to cart sound - satisfying confirmation
  const playAddToCart = useCallback(() => {
    playTone(440, 0.08, 0.02, 'sine');
    setTimeout(() => playTone(554.37, 0.08, 0.02, 'sine'), 50);
    setTimeout(() => playTone(659.25, 0.12, 0.03, 'sine'), 100);
  }, [playTone]);

  // Page open sound - whoosh-like
  const playPageOpen = useCallback(() => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => playTone(400 + i * 100, 0.06, 0.008, 'sine'), i * 20);
    }
  }, [playTone]);

  // Page close sound - reverse whoosh
  const playPageClose = useCallback(() => {
    for (let i = 4; i >= 0; i--) {
      setTimeout(() => playTone(400 + i * 100, 0.06, 0.008, 'sine'), (4 - i) * 20);
    }
  }, [playTone]);

  // Modal open sound
  const playModalOpen = useCallback(() => {
    playTone(600, 0.1, 0.02, 'sine');
    setTimeout(() => playTone(800, 0.08, 0.015, 'sine'), 50);
  }, [playTone]);

  // Modal close sound
  const playModalClose = useCallback(() => {
    playTone(800, 0.08, 0.015, 'sine');
    setTimeout(() => playTone(600, 0.1, 0.02, 'sine'), 50);
  }, [playTone]);

  return {
    playHover,
    playClick,
    playSuccess,
    playToggle,
    playAddToCart,
    playPageOpen,
    playPageClose,
    playModalOpen,
    playModalClose,
    isSoundEnabled,
    toggleSoundEnabled,
    isAmbientPlaying,
  };
};

// Create a singleton context for global sound access
interface SoundContextType {
  playHover: () => void;
  playClick: () => void;
  playSuccess: () => void;
  playToggle: () => void;
  playAddToCart: () => void;
  playPageOpen: () => void;
  playPageClose: () => void;
  playModalOpen: () => void;
  playModalClose: () => void;
  isSoundEnabled: boolean;
  toggleSoundEnabled: () => void;
  isAmbientPlaying: boolean;
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
      playModalOpen: () => {},
      playModalClose: () => {},
      isSoundEnabled: false,
      toggleSoundEnabled: () => {},
      isAmbientPlaying: false,
    };
  }
  return context;
};
