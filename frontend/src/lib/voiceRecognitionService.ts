"use client";

/**
 * AASRA Multilingual Voice Intelligence & Dual-Path Speech Recognition Service
 * 
 * Features:
 * - Dual-Path Architecture:
 *   1. Web Speech API: Fast zero-latency interim live transcript streaming on HUD.
 *   2. MediaRecorder: Parallel raw acoustic audio capture (audio/webm, audio/wav, audio/mp4).
 * - Real acoustic Multilingual Speech-to-Text via server-side Gemini 2.5 Flash.
 * - Automatic Source Language Detection independent of UI language.
 * - Smart Voice Activity Detection (VAD) & Adaptive Endpointing:
 *   * Distinguishes natural 1–2 second thinking pauses from finished thoughts.
 *   * 3500ms continuous silence buffer after speech before auto-submission.
 *   * Web Audio API RMS energy monitoring to prevent premature cutoffs.
 *   * Safety timeout (max 45s) to prevent indefinite recording.
 * - Granular lifecycle states: IDLE | LISTENING | TRANSCRIBING | TRANSLATING | THINKING | PROCESSING | RESPONDING | ERROR
 * - Manual Stop & Cancel controls
 */

export type VoiceState =
  | "IDLE"
  | "LISTENING"
  | "TRANSCRIBING"
  | "TRANSLATING"
  | "THINKING"
  | "PROCESSING"
  | "RESPONDING"
  | "ERROR";

export interface SpeechPayload {
  transcript: string;
  audioBase64?: string;
  audioMimeType?: string;
}

export interface VoiceRecognitionOptions {
  languageKey?: string; // UI language code (e.g. 'hi', 'en', 'mr')
  onStateChange?: (state: VoiceState) => void;
  onInterimTranscript?: (transcript: string) => void;
  onFinalTranscript?: (transcript: string) => void;
  onFinalSpeechPayload?: (payload: SpeechPayload) => void;
  onAudioLevelChange?: (level: number) => void; // 0 to 1 normalized volume
  onError?: (errorType: string, userFriendlyMessage: string) => void;
  endpointingSilenceMs?: number; // default 3500ms
  maxRecordingDurationMs?: number; // default 45000ms
}

// BCP-47 language codes for speech recognition
export const SPEECH_LANG_MAP: Record<string, string> = {
  hi: "hi-IN",
  en: "en-IN",
  mr: "mr-IN",
  pa: "pa-IN",
  gu: "gu-IN",
  te: "te-IN",
  ta: "ta-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  bn: "bn-IN",
  or: "or-IN",
  as: "as-IN",
};

export class VoiceRecognitionService {
  private recognition: any = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordedMimeType = "audio/webm";
  private animFrameId: number | null = null;

  private isListeningActive = false;
  private state: VoiceState = "IDLE";
  private accumulatedFinalText = "";
  private currentInterimText = "";
  private speechDetected = false;

  private silenceTimer: any = null;
  private maxDurationTimer: any = null;
  private options: VoiceRecognitionOptions = {};

  constructor(options?: VoiceRecognitionOptions) {
    if (options) this.options = options;
  }

  public setOptions(options: Partial<VoiceRecognitionOptions>) {
    this.options = { ...this.options, ...options };
    if (options.languageKey && this.recognition) {
      this.recognition.lang = SPEECH_LANG_MAP[options.languageKey] || "hi-IN";
    }
  }

  public setLanguage(langKey: string) {
    this.options.languageKey = langKey;
    if (this.recognition) {
      this.recognition.lang = SPEECH_LANG_MAP[langKey] || "hi-IN";
    }
  }

  public isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public getState(): VoiceState {
    return this.state;
  }

  private setState(newState: VoiceState) {
    this.state = newState;
    if (this.options.onStateChange) {
      this.options.onStateChange(newState);
    }
  }

  /**
   * Start dual-path listening:
   * 1. MediaRecorder captures high-fidelity audio for true multilingual server STT
   * 2. Web Speech API provides zero-latency interim live HUD feedback
   */
  public async startListening(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition && !navigator.mediaDevices) {
      this.setState("ERROR");
      if (this.options.onError) {
        this.options.onError(
          "not_supported",
          "Voice recognition is not supported in this browser. Please use Chrome, Edge, or Android Chrome."
        );
      }
      return false;
    }

    this.clearAllTimers();
    this.accumulatedFinalText = "";
    this.currentInterimText = "";
    this.speechDetected = false;
    this.isListeningActive = true;
    this.audioChunks = [];

    // 1. Initialize Microphone Stream & MediaRecorder for Raw Audio Capture
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        this.mediaStream = stream;

        // Determine best supported recording mime type
        let mimeType = "audio/webm";
        if (typeof MediaRecorder !== "undefined") {
          if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
            mimeType = "audio/webm;codecs=opus";
          } else if (MediaRecorder.isTypeSupported("audio/webm")) {
            mimeType = "audio/webm";
          } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
            mimeType = "audio/mp4";
          } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
            mimeType = "audio/ogg";
          }
          this.recordedMimeType = mimeType;

          try {
            this.mediaRecorder = new MediaRecorder(stream, { mimeType });
            this.mediaRecorder.ondataavailable = (event) => {
              if (event.data && event.data.size > 0) {
                this.audioChunks.push(event.data);
              }
            };
            this.mediaRecorder.start(250); // Collect chunk every 250ms
          } catch (recErr) {
            console.warn("[VoiceService] MediaRecorder init fallback:", recErr);
          }
        }

        // Initialize Web Audio API for live VAD and energy monitoring
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
          const source = this.audioContext.createMediaStreamSource(stream);
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 256;
          source.connect(this.analyser);
          this.startAudioLevelLoop();
        }
      }
    } catch (err: any) {
      console.warn("[VoiceService] Mic stream notice:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        this.isListeningActive = false;
        this.setState("ERROR");
        if (this.options.onError) {
          this.options.onError(
            "permission_denied",
            "Microphone permission allow karein, tab main aapki baat sun paunga."
          );
        }
        return false;
      }
    }

    // 2. Initialize Browser Speech Recognition for Fast Interim Feedback
    try {
      if (SpeechRecognition) {
        if (this.recognition) {
          try { this.recognition.abort(); } catch (_) { }
        }

        this.recognition = new SpeechRecognition();
        const langKey = this.options.languageKey || "hi";
        this.recognition.lang = SPEECH_LANG_MAP[langKey] || "hi-IN";
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 3;

        this.recognition.onstart = () => {
          if (this.isListeningActive) {
            this.setState("LISTENING");
          }
        };

        this.recognition.onresult = (event: any) => {
          let interimStr = "";
          let newFinalChunk = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            if (result.isFinal) {
              newFinalChunk += result[0].transcript + " ";
            } else {
              interimStr += result[0].transcript;
            }
          }

          if (newFinalChunk) {
            this.accumulatedFinalText += newFinalChunk;
            this.speechDetected = true;
          }

          this.currentInterimText = interimStr;
          const liveText = (this.accumulatedFinalText + interimStr).trim();

          if (liveText.length > 0) {
            this.speechDetected = true;
            if (this.options.onInterimTranscript) {
              this.options.onInterimTranscript(liveText);
            }
          }

          // Adaptive Pause Handling:
          // 3500ms buffer so normal 1-2 second thinking pauses do NOT cut the user off.
          const endpointMs = this.options.endpointingSilenceMs || 3500;
          this.resetSilenceTimer(endpointMs);
        };

        this.recognition.onerror = (event: any) => {
          console.warn("[VoiceService] Recognition event:", event.error);
          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            this.isListeningActive = false;
            this.setState("ERROR");
            this.cleanupAudio();
            if (this.options.onError) {
              this.options.onError(
                "permission_denied",
                "Microphone permission allow karein, tab main aapki baat sun paunga."
              );
            }
          } else if (event.error === "no-speech") {
            if (this.isListeningActive && this.speechDetected) {
              this.resetSilenceTimer(3000);
            }
          }
        };

        this.recognition.onend = () => {
          if (this.isListeningActive) {
            try {
              this.recognition.start();
            } catch (_) { }
          } else {
            if (this.state === "LISTENING") {
              this.setState("IDLE");
            }
            this.cleanupAudio();
          }
        };

        this.recognition.start();
      } else {
        // Fallback if no SpeechRecognition: Still listen via MediaRecorder
        this.setState("LISTENING");
      }

      // Safety limit (45s)
      const maxMs = this.options.maxRecordingDurationMs || 45000;
      this.maxDurationTimer = setTimeout(() => {
        if (this.isListeningActive) {
          this.stopListening();
        }
      }, maxMs);

      return true;
    } catch (err: any) {
      console.warn("[VoiceService] Exception during start:", err);
      this.isListeningActive = false;
      this.setState("ERROR");
      this.cleanupAudio();
      if (this.options.onError) {
        this.options.onError("exception", "Mic shuru karne mein dikkat aayi. Ek baar phir try karein.");
      }
      return false;
    }
  }

  /**
   * Reset silence timer for endpoint detection
   */
  private resetSilenceTimer(delayMs: number) {
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    this.silenceTimer = setTimeout(() => {
      if (this.isListeningActive) {
        const fullTranscript = (this.accumulatedFinalText + this.currentInterimText).trim();
        if (fullTranscript.length > 0 || this.audioChunks.length > 0) {
          // User genuinely finished speaking
          this.stopListening();
        }
      }
    }, delayMs);
  }

  /**
   * Stop listening and trigger final audio/transcript payload
   */
  public async stopListening() {
    this.clearAllTimers();
    this.isListeningActive = false;

    if (this.recognition) {
      try { this.recognition.stop(); } catch (_) { }
    }

    const interimQuery = (this.accumulatedFinalText + this.currentInterimText).trim();
    this.accumulatedFinalText = "";
    this.currentInterimText = "";

    // Stop MediaRecorder and extract recorded audio Blob
    let audioBase64: string | undefined = undefined;
    let audioBlob: Blob | null = null;

    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      try {
        const stopPromise = new Promise<void>((resolve) => {
          if (!this.mediaRecorder) return resolve();
          this.mediaRecorder.onstop = () => resolve();
          this.mediaRecorder.stop();
        });
        await stopPromise;
      } catch (err) {
        console.warn("[VoiceService] MediaRecorder stop error:", err);
      }
    }

    if (this.audioChunks.length > 0) {
      audioBlob = new Blob(this.audioChunks, { type: this.recordedMimeType });
      try {
        const arrayBuf = await audioBlob.arrayBuffer();
        audioBase64 = this.arrayBufferToBase64(arrayBuf);
      } catch (bufErr) {
        console.warn("[VoiceService] Audio buffer encoding notice:", bufErr);
      }
    }

    this.cleanupAudio();

    if (interimQuery || audioBase64) {
      this.setState("TRANSCRIBING");
      
      const payload: SpeechPayload = {
        transcript: interimQuery,
        audioBase64,
        audioMimeType: this.recordedMimeType,
      };

      if (this.options.onFinalSpeechPayload) {
        this.options.onFinalSpeechPayload(payload);
      } else if (this.options.onFinalTranscript) {
        this.options.onFinalTranscript(interimQuery);
      }
    } else {
      this.setState("IDLE");
    }
  }

  /**
   * Cancel and discard current speech recording without submitting
   */
  public cancelListening() {
    this.clearAllTimers();
    this.isListeningActive = false;
    this.audioChunks = [];

    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      try { this.mediaRecorder.stop(); } catch (_) { }
    }

    if (this.recognition) {
      try { this.recognition.abort(); } catch (_) { }
    }

    this.cleanupAudio();
    this.accumulatedFinalText = "";
    this.currentInterimText = "";
    this.setState("IDLE");

    if (this.options.onInterimTranscript) {
      this.options.onInterimTranscript("");
    }
  }

  /**
   * Monitor audio volume loop
   */
  private startAudioLevelLoop() {
    if (!this.analyser) return;
    const buffer = new Uint8Array(this.analyser.frequencyBinCount);

    const checkLevel = () => {
      if (!this.isListeningActive || !this.analyser) {
        if (this.options.onAudioLevelChange) this.options.onAudioLevelChange(0);
        return;
      }

      this.analyser.getByteFrequencyData(buffer);
      let sum = 0;
      for (let i = 0; i < buffer.length; i++) {
        sum += buffer[i];
      }
      const avg = sum / buffer.length;
      const normalized = Math.min(1, avg / 128); // 0 to 1

      if (this.options.onAudioLevelChange) {
        this.options.onAudioLevelChange(normalized);
      }

      // If active vocal energy is detected, extend the pause buffer
      if (normalized > 0.25 && this.isListeningActive) {
        const endpointMs = this.options.endpointingSilenceMs || 3500;
        this.resetSilenceTimer(endpointMs);
      }

      this.animFrameId = requestAnimationFrame(checkLevel);
    };

    this.animFrameId = requestAnimationFrame(checkLevel);
  }

  private cleanupAudio() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      try { this.audioContext.close(); } catch (_) { }
      this.audioContext = null;
    }
    this.analyser = null;
    this.mediaRecorder = null;
  }

  private clearAllTimers() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.maxDurationTimer) {
      clearTimeout(this.maxDurationTimer);
      this.maxDurationTimer = null;
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
