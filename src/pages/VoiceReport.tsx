import { useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import VoiceRecorder from "@/components/report/VoiceRecorder";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Send, Volume2 } from "lucide-react";

const VoiceReport = () => {
  const [transcribedText, setTranscribedText] = useState("");
  const [language, setLanguage] = useState("en");

  const handleTranscription = (text: string, lang: string) => {
    setTranscribedText(text);
    setLanguage(lang);
  };

  const handleSubmit = () => {
    if (!transcribedText) {
      toast.error("Please record your report first");
      return;
    }
    toast.success("Voice report submitted successfully!");
    setTranscribedText("");
  };

  return (
    <div className="min-h-screen pb-24">
      <AppHeader title="Voice Report" />
      <main className="p-4 space-y-4">
        <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-3">
          <Volume2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Multilingual Voice Input</p>
            <p className="text-xs text-muted-foreground">
              Speak in English, Hindi, or Marathi. Your voice will be transcribed automatically
              for Bharat accessibility.
            </p>
          </div>
        </div>

        <VoiceRecorder onTranscription={handleTranscription} />

        {transcribedText && (
          <Button onClick={handleSubmit} className="w-full">
            <Send className="mr-2 h-4 w-4" />
            Submit Voice Report
          </Button>
        )}
      </main>
    </div>
  );
};

export default VoiceReport;
