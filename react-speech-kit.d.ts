declare module "react-speech-kit" {
  interface SpeechRecognitionOptions {
    onResult: (result: string) => void;
    lang?: string;
    interimResults?: boolean;
  }

  interface SpeechSynthesisOptions {
    onEnd?: () => void;
  }

  interface SpeechSynthesisVoice {
    name: string;
    lang: string;
    voiceURI: string;
  }

  interface SpeechSynthesisUtterance {
    text: string;
    voice?: SpeechSynthesisVoice;
  }

  export function useSpeechRecognition(options: SpeechRecognitionOptions): {
    listen: () => void;
    listening: boolean;
    stop: () => void;
  };

  export function useSpeechSynthesis(options?: SpeechSynthesisOptions): {
    speak: (utterance: SpeechSynthesisUtterance) => void;
    speaking: boolean;
    supported: boolean;
    voices: SpeechSynthesisVoice[];
  };
}
