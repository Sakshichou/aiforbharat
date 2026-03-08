import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, StopCircle, RotateCcw, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoCaptureProps {
  onCapture: (blob: Blob) => void;
}

const CAPTURE_DURATION = 5;

const VideoCapture = ({ onCapture }: VideoCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [state, setState] = useState<"idle" | "preview" | "countdown" | "recording" | "done">("idle");
  const [countdown, setCountdown] = useState(CAPTURE_DURATION);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      setStream(mediaStream);
      setState("preview");
    } catch {
      setError("Camera access denied. Please allow camera permissions.");
    }
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [state, stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  const startRecording = useCallback(() => {
    if (!stream) return;

    chunksRef.current = [];
    const options = MediaRecorder.isTypeSupported("video/webm") ? { mimeType: "video/webm" } : undefined;
    const recorder = new MediaRecorder(stream, options);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const type = options ? "video/webm" : "video/mp4";
      const blob = new Blob(chunksRef.current, { type });
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      setCapturedBlob(blob);
      setState("done");
      stream.getTracks().forEach((t) => t.stop());
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setState("recording");
    setCountdown(CAPTURE_DURATION);
  }, [stream]);

  useEffect(() => {
    if (state !== "recording") return;
    if (countdown <= 0) {
      mediaRecorderRef.current?.stop();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [state, countdown]);

  const reset = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    setStream(null);
    setRecordedUrl(null);
    setCapturedBlob(null);
    setState("idle");
    setCountdown(CAPTURE_DURATION);
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-foreground/5">
        {state === "idle" && (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Live Video Evidence</p>
            <p className="text-xs text-muted-foreground">
              5-second live capture only — no gallery uploads allowed
            </p>
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {error}
              </div>
            )}
            <Button onClick={startCamera} className="mt-2">
              <Camera className="mr-2 h-4 w-4" />
              Open Camera
            </Button>
          </div>
        )}

        {(state === "preview" || state === "recording") && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            {state === "recording" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-24 w-24 animate-countdown-pulse items-center justify-center rounded-full bg-destructive/80 text-4xl font-bold text-destructive-foreground shadow-2xl">
                  {countdown}
                </div>
              </div>
            )}
            {state === "recording" && (
              <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-destructive px-3 py-1 text-xs font-bold text-destructive-foreground">
                <span className="h-2 w-2 animate-pulse rounded-full bg-destructive-foreground" />
                REC
              </div>
            )}
          </>
        )}

        {state === "done" && recordedUrl && (
          <video
            src={recordedUrl}
            controls
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="flex gap-2">
        {state === "preview" && (
          <Button onClick={startRecording} className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground">
            <StopCircle className="mr-2 h-4 w-4" />
            Start 5s Capture
          </Button>
        )}
        {state === "done" && (
          <>
            <Button variant="outline" onClick={reset} className="flex-1">
              <RotateCcw className="mr-2 h-4 w-4" />
              Retake
            </Button>
            <Button className="flex-1" onClick={() => capturedBlob && onCapture(capturedBlob)}>
              <Check className="mr-2 h-4 w-4" />
              Submit Evidence
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoCapture;
