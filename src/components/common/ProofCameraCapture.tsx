import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  MapPin,
  Clock,
  RotateCcw,
  Check,
  X,
  Upload,
  Sliders,
  ShieldCheck,
  AlertCircle,
  Eye,
  RefreshCw,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { Button } from './Button';
import { Img } from './Img';

interface ProofCameraCaptureProps {
  beforePhotoUrl?: string;
  ticketCode: string;
  department: string;
  staffName: string;
  staffBadge: string;
  initialCoords?: { lat: number; lng: number };
  onCaptureComplete: (data: {
    photoUrl: string;
    coords: { lat: number; lng: number; accuracy?: number };
    timestamp: string;
  }) => void;
  onCancel?: () => void;
}

export const ProofCameraCapture: React.FC<ProofCameraCaptureProps> = ({
  beforePhotoUrl,
  ticketCode,
  department,
  staffName,
  staffBadge,
  initialCoords,
  onCaptureComplete,
  onCancel
}) => {
  // Mode: 'camera' | 'captured' | 'compare'
  const [viewMode, setViewMode] = useState<'camera' | 'captured' | 'compare'>('camera');
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100%

  // Hardware states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; accuracy?: number }>(
    initialCoords || { lat: 24.8607, lng: 67.0011, accuracy: 5 }
  );
  const [isLocating, setIsLocating] = useState(false);
  const [timestamp, setTimestamp] = useState<string>(new Date().toISOString());

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Acquire current GPS position
  const fetchLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy)
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation warning, using municipal dispatch fallback coordinates:', err.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Start Camera Stream
  const startCamera = async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not accessible in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera stream initialisation notice:', err.message);
      setCameraError(
        'Physical camera stream could not be started. You can upload or select an inspection photo below.'
      );
      setCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    fetchLocation();
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  // Capture frame from video and stamp official watermark
  const handleShutter = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw camera image
    ctx.drawImage(video, 0, 0, width, height);

    // Apply municipal inspection watermark overlay
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]} PKT`;

    // Dark gradient banner at bottom
    const bannerHeight = 85;
    const grad = ctx.createLinearGradient(0, height - bannerHeight - 20, 0, height);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.3, 'rgba(20, 35, 31, 0.85)');
    grad.addColorStop(1, 'rgba(20, 35, 31, 0.98)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, height - bannerHeight - 20, width, bannerHeight + 20);

    // Green Accent Bar
    ctx.fillStyle = '#1E8E6E';
    ctx.fillRect(0, height - bannerHeight - 20, width, 3);

    // Watermark text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`CIVIC CARE PK · RESOLUTION PROOF · ${ticketCode}`, 16, height - 60);

    ctx.font = 'normal 12px sans-serif';
    ctx.fillStyle = '#D1DCD7';
    ctx.fillText(
      `GPS: ${gpsCoords.lat.toFixed(6)}°N, ${gpsCoords.lng.toFixed(6)}°E (±${gpsCoords.accuracy || 5}m) · ${formattedDate}`,
      16,
      height - 40
    );

    ctx.fillStyle = '#34D399';
    ctx.fillText(`OFFICER: ${staffName} (${staffBadge}) · DEPT: ${department}`, 16, height - 20);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPhotoUrl(dataUrl);
    setTimestamp(formattedDate);
    stopCamera();
    setViewMode(beforePhotoUrl ? 'compare' : 'captured');
  };

  // Handle manual file upload with auto-watermarking
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const width = img.width || 800;
        const height = img.height || 600;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, width, height);

        // Watermark
        const now = new Date();
        const formattedDate = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]} PKT`;
        const bannerHeight = 85;
        const grad = ctx.createLinearGradient(0, height - bannerHeight - 20, 0, height);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.3, 'rgba(20, 35, 31, 0.85)');
        grad.addColorStop(1, 'rgba(20, 35, 31, 0.98)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, height - bannerHeight - 20, width, bannerHeight + 20);

        ctx.fillStyle = '#1E8E6E';
        ctx.fillRect(0, height - bannerHeight - 20, width, 4);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 15px monospace';
        ctx.fillText(`CIVIC CARE PK · RESOLUTION PROOF · ${ticketCode}`, 16, height - 60);

        ctx.font = 'normal 13px sans-serif';
        ctx.fillStyle = '#D1DCD7';
        ctx.fillText(
          `GPS: ${gpsCoords.lat.toFixed(6)}°N, ${gpsCoords.lng.toFixed(6)}°E · ${formattedDate}`,
          16,
          height - 38
        );

        ctx.fillStyle = '#34D399';
        ctx.fillText(`OFFICER: ${staffName} (${staffBadge}) · DEPT: ${department}`, 16, height - 18);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setCapturedPhotoUrl(dataUrl);
        setTimestamp(formattedDate);
        stopCamera();
        setViewMode(beforePhotoUrl ? 'compare' : 'captured');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedPhotoUrl(null);
    setViewMode('camera');
    startCamera();
  };

  const handleConfirm = () => {
    if (!capturedPhotoUrl) return;
    onCaptureComplete({
      photoUrl: capturedPhotoUrl,
      coords: gpsCoords,
      timestamp
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E3EAE7] shadow-xl overflow-hidden space-y-4 p-5 sm:p-6">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E3EAE7]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F4EF] text-[#1E8E6E] border border-[#B2E4D4]">
              Field Verification Camera
            </span>
            <span className="text-xs font-mono font-bold text-[#14231F]">{ticketCode}</span>
          </div>
          <h3 className="text-base font-extrabold text-[#14231F]">
            {viewMode === 'camera'
              ? 'Capture Resolution Evidence'
              : viewMode === 'compare'
              ? 'Before vs After Resolution Comparison'
              : 'Verified Resolution Proof'}
          </h3>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-xl border border-[#E3EAE7] text-[#6B7C77] hover:bg-[#F5F8F7]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mode Switcher Tabs if photo captured */}
      {capturedPhotoUrl && (
        <div className="flex items-center gap-2 border-b border-[#E3EAE7] pb-3 text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode('compare')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              viewMode === 'compare'
                ? 'bg-[#1E8E6E] text-white shadow-xs'
                : 'bg-[#F5F8F7] text-[#6B7C77] hover:text-[#14231F]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Before / After Slider</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('captured')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              viewMode === 'captured'
                ? 'bg-[#1E8E6E] text-white shadow-xs'
                : 'bg-[#F5F8F7] text-[#6B7C77] hover:text-[#14231F]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Captured Proof Only</span>
          </button>
        </div>
      )}

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* 1. VIEW MODE: CAMERA LIVE FEED */}
      {viewMode === 'camera' && (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-[#14231F] shadow-inner">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6 space-y-3 text-white max-w-sm">
                <Camera className="w-10 h-10 text-white/50 mx-auto" />
                <p className="text-xs text-white/80 font-medium">
                  {cameraError || 'Initializing device camera viewfinder...'}
                </p>
                <div className="flex justify-center gap-2">
                  <Button size="sm" variant="secondary" onClick={startCamera}>
                    <RefreshCw className="w-3.5 h-3.5 me-1" />
                    Retry Camera
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3.5 h-3.5 me-1" />
                    Upload Photo
                  </Button>
                </div>
              </div>
            )}

            {/* Viewfinder crosshairs & grid overlay */}
            {cameraActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
                <div className="flex items-center justify-between text-[11px] text-white bg-black/50 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/20 font-mono">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE GPS VIEWFINDER
                  </span>
                  <span>{gpsCoords.lat.toFixed(5)}°N, {gpsCoords.lng.toFixed(5)}°E</span>
                </div>

                {/* Center target crosshair */}
                <div className="self-center w-24 h-24 border-2 border-white/40 border-dashed rounded-2xl flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                </div>

                <div className="flex items-center justify-between text-[10px] text-white/90 bg-black/60 px-3 py-1 rounded-lg">
                  <span>Target: {ticketCode}</span>
                  <span>Officer: {staffBadge}</span>
                </div>
              </div>
            )}
          </div>

          {/* GPS telemetry card */}
          <div className="p-3 rounded-2xl bg-[#F5F8F7] border border-[#E3EAE7] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#14231F]">
              <MapPin className="w-4 h-4 text-[#1E8E6E] shrink-0" />
              <div>
                <span className="font-bold">Municipal Geotag: </span>
                <span className="font-mono text-[11px] text-[#1E8E6E]">
                  {gpsCoords.lat.toFixed(6)}°N, {gpsCoords.lng.toFixed(6)}°E
                </span>
                <span className="text-[#6B7C77] text-[10px] ms-1.5">
                  (Accuracy: ±{gpsCoords.accuracy || 4}m)
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchLocation}
              disabled={isLocating}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#E3EAE7] text-[11px] font-semibold text-[#14231F] hover:bg-[#E6F4EF] transition-colors"
            >
              {isLocating ? 'Acquiring GPS...' : 'Refresh GPS'}
            </button>
          </div>

          {/* Shutter and controls */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                className="p-2.5 rounded-xl border border-[#E3EAE7] bg-[#F5F8F7] text-[#14231F] hover:bg-white text-xs font-semibold flex items-center gap-1.5"
                title="Switch Camera (Front / Rear)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Flip Camera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl border border-[#E3EAE7] bg-[#F5F8F7] text-[#14231F] hover:bg-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pick File</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            <Button
              type="button"
              size="md"
              variant="primary"
              disabled={!cameraActive}
              onClick={handleShutter}
              className="px-6 font-bold shadow-md hover:shadow-lg"
              leftIcon={<Camera className="w-4 h-4" />}
            >
              Capture Proof Photo
            </Button>
          </div>
        </div>
      )}

      {/* 2. VIEW MODE: BEFORE / AFTER INTERACTIVE COMPARISON SLIDER */}
      {viewMode === 'compare' && capturedPhotoUrl && (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden aspect-video border border-[#E3EAE7] bg-black select-none">
            {/* BEFORE PHOTO (Underneath / Background) */}
            <div className="absolute inset-0">
              <Img
                src={beforePhotoUrl || '/images/karachi-broken-pipe.jpg'}
                alt="Before repair resident complaint"
                aspectRatio="aspect-video"
                className="w-full h-full object-cover filter brightness-[0.95]"
              />
              <span className="absolute top-3 start-3 px-2.5 py-1 rounded-lg bg-black/70 text-white font-bold text-[11px] backdrop-blur-xs border border-white/20">
                BEFORE (Citizen Report)
              </span>
            </div>

            {/* AFTER PHOTO (Clipped by slider handle) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <div className="w-[100vw] max-w-[1200px] h-full">
                <img
                  src={capturedPhotoUrl}
                  alt="After repair proof"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute top-3 start-3 px-2.5 py-1 rounded-lg bg-[#1E8E6E]/90 text-white font-bold text-[11px] backdrop-blur-xs border border-white/20">
                AFTER (Verified Repair)
              </span>
            </div>

            {/* Slider Dividing Bar */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-[0_0_12px_rgba(0,0,0,0.5)] z-20"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-7 h-7 rounded-full bg-white text-[#14231F] border-2 border-[#1E8E6E] shadow-md flex items-center justify-center -translate-x-1/2">
                <Sliders className="w-3.5 h-3.5 text-[#1E8E6E]" />
              </div>
            </div>

            {/* Range Input for accessibility and dragging */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              aria-label="Comparison slider"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[#6B7C77]">
            <span>Drag slider horizontally to inspect before vs after field work.</span>
            <span className="font-bold text-[#1E8E6E]">{sliderPosition}% Split</span>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#E3EAE7]">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleRetake}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Retake Photo
            </Button>

            <Button
              type="button"
              size="md"
              variant="primary"
              onClick={handleConfirm}
              className="font-bold shadow-md"
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Confirm & Attach Proof
            </Button>
          </div>
        </div>
      )}

      {/* 3. VIEW MODE: CAPTURED WATERMARKED PHOTO ONLY */}
      {viewMode === 'captured' && capturedPhotoUrl && (
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden aspect-video border border-[#E3EAE7] shadow-sm">
            <img
              src={capturedPhotoUrl}
              alt="Municipal verification proof"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-3 rounded-2xl bg-[#E6F4EF] border border-[#C8EBD9] text-xs text-[#166F57] space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1E8E6E]" />
              <span>Official Geotagged Watermark Applied</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Resolution timestamp, GPS coordinates ({gpsCoords.lat}°, {gpsCoords.lng}°), and Officer credentials ({staffBadge}) are permanently baked into this evidence file for the municipal audit log.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#E3EAE7]">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleRetake}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Retake Photo
            </Button>

            <Button
              type="button"
              size="md"
              variant="primary"
              onClick={handleConfirm}
              className="font-bold shadow-md"
              leftIcon={<Check className="w-4 h-4" />}
            >
              Confirm & Attach Proof
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
