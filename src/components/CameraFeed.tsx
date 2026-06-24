"use client";

import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from "react";

export interface CameraFeedHandle {
  getVideoElement: () => HTMLVideoElement | null;
  getSnapshotCanvas: () => HTMLCanvasElement | null;
}

interface CameraFeedProps {
  onFrameCapture?: (canvas: HTMLCanvasElement) => void;
}

const CameraFeed = forwardRef<CameraFeedHandle, CameraFeedProps>(function CameraFeed({ onFrameCapture }, ref) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [torchOn, setTorchOn] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [error, setError] = useState("");

  useImperativeHandle(ref, () => ({
    getVideoElement: () => videoRef.current,
    getSnapshotCanvas: () => canvasRef.current,
  }));

  const startCamera = useCallback(async (f: "environment" | "user") => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setFrozen(false);
    setTorchOn(false);
    setError("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: f, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (e: any) {
      setError(e.message || "Camera access denied");
    }
  }, [stream]);

  useEffect(() => {
    startCamera(facing);
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
  }, []);

  const flip = () => {
    const next = facing === "environment" ? "user" : "environment";
    setFacing(next);
    startCamera(next);
  };

  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({
        advanced: [{ torch: !torchOn }] as any,
      });
      setTorchOn(!torchOn);
    } catch {
      // torch not supported
    }
  };

  const freeze = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(v, 0, 0);
    setFrozen(true);
    onFrameCapture?.(c);
  };

  const unfreeze = () => setFrozen(false);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover ${frozen ? "hidden" : ""}`}
      />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full object-cover ${frozen ? "" : "hidden"}`}
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 p-6">
          <p className="text-white text-center">{error}</p>
        </div>
      )}
      <button
        onClick={frozen ? unfreeze : freeze}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-black/30"
        aria-label={frozen ? "Unfreeze" : "Freeze frame"}
      >
        <div className={`w-10 h-10 rounded-sm ${frozen ? "bg-gray-400" : "bg-white"}`} />
      </button>
      <button
        onClick={flip}
        className="absolute bottom-24 right-6 z-30 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center"
        aria-label="Flip camera"
      >
        <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
          <path d="M15 9h4l-2-2m0 0a7 7 0 00-12 4m12-4v4M9 15H5l2 2m0 0a7 7 0 0012-4m-12 4v-4" stroke="white" strokeWidth="2" fill="none" />
        </svg>
      </button>
      {facing === "environment" && (
        <button
          onClick={toggleTorch}
          className="absolute bottom-24 right-[4.5rem] z-30 w-10 h-10 rounded-full flex items-center justify-center"
          aria-label={torchOn ? "Turn off flashlight" : "Turn on flashlight"}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
            <path d="M9 18l-3-3 3-3M15 6l3 3-3 3" stroke={torchOn ? "#FFD700" : "rgba(255,255,255,0.7)"} strokeWidth="2" strokeLinecap="round" />
            <path d="M12 2v4M12 18v4M4 12H2M22 12h-2" stroke={torchOn ? "#FFD700" : "rgba(255,255,255,0.5)"} strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="12" r="3" fill={torchOn ? "#FFD700" : "rgba(255,255,255,0.2)"} />
          </svg>
        </button>
      )}
    </>
  );
});

export default CameraFeed;
