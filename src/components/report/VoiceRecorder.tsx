import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { transcribeAudio } from "@/services/awsService";

const languages = [
  { code: "en", label: "English", short: "EN" },
  { code: "hi", label: "हिन्दी", short: "HI" },
  { code: "mr", label: "मराठी", short: "MR" },
];

interface VoiceRecorderProps {
  onTranscription: (text: string, language: string) => void;
}

const VoiceRecorder = ({ onTranscription }: VoiceRecorderProps) => {
  const [language, setLanguage] = useState("en");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setIsProcessing(true);
        const text = await transcribeAudio(blob, language);
        setTranscription(text);
        onTranscription(text, language);
        setIsProcessing(false);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setTranscription("");
    } catch {
      console.error("Microphone access denied");
    }
  }, [isRecording, language, onTranscription]);

  return (
    <div className="space-y-4">
      {/* Language Toggle */}
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <div className="flex rounded-lg bg-secondary p-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                language === lang.code
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mic Button */}
      <div className="flex flex-col items-center gap-4 py-6">
        <button
          onClick={toggleRecording}
          disabled={isProcessing}
          className={`relative flex h-24 w-24 items-center justify-center rounded-full transition-all ${
            isRecording
              ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30"
              : "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl"
          } ${isProcessing ? "opacity-50" : ""}`}
        >
          {isProcessing ? (
            <Loader2 className="h-10 w-10 animate-spin" />
          ) : isRecording ? (
            <MicOff className="h-10 w-10" />
          ) : (
            <Mic className="h-10 w-10" />
          )}
          {isRecording && (
            <span className="absolute inset-0 animate-ping rounded-full bg-destructive/20" />
          )}
        </button>
        <p className="text-sm font-medium text-muted-foreground">
          {isProcessing
            ? "Transcribing..."
            : isRecording
            ? "Listening... Tap to stop"
            : "Tap to speak your report"}
        </p>
      </div>

      {/* Transcription Output */}
      {transcription && (
        <div className="glass-card rounded-xl p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Transcription ({languages.find((l) => l.code === language)?.label})
          </p>
          <p className="text-sm leading-relaxed text-foreground">{transcription}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
