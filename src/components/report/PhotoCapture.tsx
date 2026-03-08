import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, RotateCcw, Check, AlertCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface GeoLocation {
    lat: number;
    lng: number;
}

interface PhotoCaptureProps {
    onCapture: (blob: Blob, location: GeoLocation) => void;
}

const PhotoCapture = ({ onCapture }: PhotoCaptureProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [state, setState] = useState<"idle" | "preview" | "done">("idle");
    const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
    const [location, setLocation] = useState<GeoLocation | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const startCamera = useCallback(async () => {
        try {
            setError(null);
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
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
        return () => stopStream();
    }, [stream]);

    const stopStream = () => {
        if (stream) {
            stream.getTracks().forEach((t) => t.stop());
        }
    };

    const takePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");
        if (!context) return;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get geolocation while processing image
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setLocation(newLocation);
                    finalizeCapture(canvas, newLocation);
                },
                (navError) => {
                    console.error("Error getting location", navError);
                    // Still finalize capture even if location fails, let parent or user handle validation
                    // For a strict flow, you could show an error here instead
                    finalizeCapture(canvas, null);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            finalizeCapture(canvas, null);
        }

    }, [stream]);

    const finalizeCapture = (canvas: HTMLCanvasElement, loc: GeoLocation | null) => {
        canvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                setCapturedUrl(url);
                setCapturedBlob(blob);
                setState("done");
                stopStream();
            }
        }, "image/jpeg", 0.9);
    };

    const reset = () => {
        stopStream();
        setStream(null);
        setCapturedUrl(null);
        setCapturedBlob(null);
        setLocation(null);
        setState("idle");
    };

    const submit = () => {
        if (capturedBlob && location) {
            onCapture(capturedBlob, location);
        } else if (capturedBlob && !location) {
            setError("Location is required for evidence. Please ensure location permissions are granted and try again.");
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-foreground/5">
                {state === "idle" && (
                    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                            <MapPin className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-foreground">Geotagged Photo</p>
                        <p className="text-xs text-muted-foreground">
                            Capture a clear photo of the issue. Location will be automatically recorded.
                        </p>
                        {error && (
                            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                                <AlertCircle className="h-3 w-3 shrink-0" />
                                <span className="text-left">{error}</span>
                            </div>
                        )}
                        <Button onClick={startCamera} className="mt-2">
                            <Camera className="mr-2 h-4 w-4" />
                            Open Camera
                        </Button>
                    </div>
                )}

                {(state === "preview") && (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="h-full w-full object-cover"
                        />
                        {/* Hidden canvas used for capturing the frame */}
                        <canvas ref={canvasRef} className="hidden" />
                    </>
                )}

                {state === "done" && capturedUrl && (
                    <div className="relative h-full w-full">
                        <img
                            src={capturedUrl}
                            alt="Captured evidence"
                            className="h-full w-full object-cover"
                        />
                        {location && (
                            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-1.5 backdrop-blur-md">
                                <MapPin className="h-3.5 w-3.5 text-primary" />
                                <div className="text-[10px] text-white">
                                    <div>Lat: {location.lat.toFixed(5)}</div>
                                    <div>Lng: {location.lng.toFixed(5)}</div>
                                </div>
                            </div>
                        )}
                        {!location && (
                            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-destructive/80 px-3 py-1.5 backdrop-blur-md">
                                <AlertCircle className="h-3.5 w-3.5 text-white" />
                                <span className="text-[10px] font-medium text-white">Location unavailable</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                {state === "preview" && (
                    <Button onClick={takePhoto} className="w-full">
                        <Camera className="mr-2 h-4 w-4" />
                        Take Photo
                    </Button>
                )}
                {state === "done" && (
                    <>
                        <Button variant="outline" onClick={reset} className="flex-1">
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Retake
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={submit}
                            disabled={!location}
                        >
                            <Check className="mr-2 h-4 w-4" />
                            Save Photo
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PhotoCapture;
