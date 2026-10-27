import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, ScanFace, X } from 'lucide-react';
import { readSavedTryOn, saveTryOn, savedTryOnKey } from '../utils/savedTryOn';
import { drawTryOnRuler } from '../utils/tryOnRuler';
import { frameSizing } from '../utils/frameSizing';
import { loadTryOnFrame } from '../utils/tryOnFrame';
import { tryOnPlacement } from '../utils/tryOnPlacement';
import './VirtualTryOn.css';

const modelUrl =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

export default function VirtualTryOn({ name, image, size, onClose }) {
  const sizing = frameSizing(size);
  const sizeFactor = sizing.factor;
  const dialogRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const adjustments = useRef({ scale: 1 });
  const captureReady = useRef(false);
  const [savedFit, setSavedFit] = useState(() => {
    try {
      return readSavedTryOn(window.localStorage);
    } catch {
      return null;
    }
  });
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const dialog = dialogRef.current;
    const focus = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (focus?.isConnected) focus.focus();
    };
  }, []);

  useEffect(() => {
    function pauseWhenHidden() {
      if (document.hidden) setRunning(false);
    }
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => document.removeEventListener('visibilitychange', pauseWhenHidden);
  }, []);

  useEffect(() => {
    if (!running || !image) return;
    let cancelled = false;
    let stream;
    let frame;
    let detector;
    let animation;
    let lastTime = -1;
    let lastDetection = 0;
    let landmarks;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    function release() {
      captureReady.current = false;
      stream?.getTracks().forEach((track) => track.stop());
      if (video.srcObject === stream) video.srcObject = null;
      cancelAnimationFrame(animation);
      detector?.close();
      detector = null;
      frame?.dispose();
      frame = null;
    }
    async function start() {
      try {
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia)
          throw new Error('Camera try-on needs HTTPS and a browser with camera support.');
        frame = await loadTryOnFrame(image, controller.signal);
        if (cancelled) {
          release();
          return;
        }
        const [{ FaceLandmarker, FilesetResolver }, response] = await Promise.all([
          import('@mediapipe/tasks-vision'),
          fetch(modelUrl, { signal: controller.signal }),
        ]);
        if (!response.ok)
          throw new Error('Unable to download face tracking. Check your connection and try again.');
        const buffer = new Uint8Array(await response.arrayBuffer());
        clearTimeout(timeout);
        if (cancelled) return;
        const vision = await FilesetResolver.forVisionTasks(
          `${window.location.origin}/try-on/wasm`,
        );
        if (cancelled) return;
        detector = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetBuffer: buffer, delegate: 'CPU' },
          runningMode: 'VIDEO',
          numFaces: 1,
        });
        if (cancelled) {
          release();
          return;
        }
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        });
        if (cancelled) {
          release();
          return;
        }
        video.srcObject = stream;
        await video.play();
        if (cancelled) {
          release();
          return;
        }
        function draw(now) {
          if (cancelled) return;
          try {
            if (video.readyState >= 2 && video.videoWidth > 0) {
              if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
              }
              // Limit inference frequency so controls stay responsive on mobile.
              if (now - lastDetection > 100 && video.currentTime !== lastTime) {
                landmarks = detector.detectForVideo(video, now).faceLandmarks[0];
                lastTime = video.currentTime;
                lastDetection = now;
                setStatus(
                  landmarks
                    ? 'Face detected · slowly turn or tilt your head'
                    : 'Face the camera in good light and remove your glasses',
                );
              }
              context.save();
              context.translate(canvas.width, 0);
              context.scale(-1, 1);
              context.drawImage(video, 0, 0, canvas.width, canvas.height);
              const placement = tryOnPlacement(
                landmarks,
                canvas.width,
                canvas.height,
                frame.aspect,
                adjustments.current.scale * sizeFactor,
                0,
                frame.depthAware,
              );
              captureReady.current = Boolean(placement);
              if (placement) {
                context.translate(placement.x, placement.y);
                context.rotate(placement.angle);
                frame.render(landmarks, canvas.width / canvas.height);
                context.drawImage(
                  frame.source,
                  -placement.width / 2,
                  -placement.height * 0.45,
                  placement.width,
                  placement.height,
                );
                drawTryOnRuler(
                  context,
                  placement,
                  sizing.width ? sizing.width * adjustments.current.scale : null,
                  true,
                  landmarks?.[10]
                    ? { x: landmarks[10].x * canvas.width, y: landmarks[10].y * canvas.height }
                    : null,
                );
              }
              context.restore();
            }
            animation = requestAnimationFrame(draw);
          } catch {
            release();
            setError('Face tracking stopped. Restart the camera to try again.');
            setRunning(false);
          }
        }
        animation = requestAnimationFrame(draw);
      } catch (failure) {
        release();
        if (cancelled) return;
        const messages = {
          NotAllowedError:
            'Camera access was denied. Allow camera access in your browser settings, then try again.',
          NotFoundError: 'No camera was found. Try a device with a front camera.',
          NotReadableError: 'Your camera is busy. Close other apps using it and try again.',
          AbortError: 'Face tracking took too long to load. Check your connection and try again.',
        };
        setError(
          messages[failure.name] || failure.message || 'Unable to start try-on. Please try again.',
        );
        setRunning(false);
      }
    }
    start();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
      release();
    };
  }, [running, image, sizeFactor, sizing.width]);

  function captureFit() {
    if (!running || !captureReady.current || !sizing.width) {
      setError('Start the camera and face it clearly before capturing a frame with a known size.');
      return;
    }
    try {
      const canvas = canvasRef.current;
      const thumbnail = document.createElement('canvas');
      thumbnail.width = Math.min(canvas.width, 640);
      thumbnail.height = Math.round((canvas.height * thumbnail.width) / canvas.width);
      thumbnail.getContext('2d').drawImage(canvas, 0, 0, thumbnail.width, thumbnail.height);
      const fit = {
        name,
        size,
        scale,
        widthMm: Number((sizing.width * scale).toFixed(1)),
        date: new Date().toISOString(),
        snapshot: thumbnail.toDataURL('image/jpeg', 0.8),
      };
      saveTryOn(window.localStorage, fit);
      setSavedFit(fit);
      setError('');
    } catch {
      setError(
        'Unable to save this capture. Check browser storage permissions and that the frame asset allows cross-origin access.',
      );
    }
  }
  function removeSavedFit() {
    try {
      window.localStorage.removeItem(savedTryOnKey);
      setSavedFit(null);
    } catch {
      setError('Unable to remove the saved capture from browser storage.');
    }
  }
  function toggleCamera() {
    if (!running) {
      setError('');
      setStatus('Loading face tracking, then opening your camera…');
    }
    setRunning((value) => !value);
  }
  return createPortal(
    <dialog
      ref={dialogRef}
      className="product-popup virtual-try-on"
      aria-labelledby="try-on-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="try-on-heading">
        <div>
          <h2 id="try-on-title">Virtual Try-On</h2>
          <p>{name}</p>
        </div>
        <button autoFocus onClick={onClose} aria-label="Close virtual try-on">
          <X size={24} />
        </button>
      </div>
      {image ? (
        <>
          <p className="try-on-intro">
            See how these frames look on you. Face the camera in good light with your glasses off.
          </p>
          <div className="try-on-stage">
            <video ref={videoRef} muted playsInline className="try-on-video" aria-hidden="true" />
            <canvas
              ref={canvasRef}
              hidden={!running}
              aria-label="Live camera preview with the selected glasses"
            />
            {!running && (
              <div className="try-on-placeholder">
                <ScanFace size={56} />
                <p>Your camera preview appears here</p>
              </div>
            )}
          </div>
          <p className="try-on-status" role="status">
            {running ? status : 'Camera is off'}
          </p>
          {error && (
            <p className="try-on-error" role="alert">
              {error}
            </p>
          )}
          <div className="try-on-camera-actions">
            <button className="try-on-start" onClick={toggleCamera}>
              <Camera size={18} />
              {running ? 'Stop camera' : 'Start camera'}
            </button>
            <button
              type="button"
              className="try-on-start"
              disabled={!running || !sizing.width}
              onClick={captureFit}
            >
              Capture &amp; save fit
            </button>
          </div>
          <p className="try-on-status">
            Frame front width:{' '}
            {sizing.width ? `${(sizing.width * scale).toFixed(1)} mm` : 'Not specified'}
            {sizing.width && <span> · estimated from size {sizing.size}</span>}
          </p>
          <div className="try-on-adjustments">
            <label>
              Frame size{sizing.label ? ` (${sizing.size} · ${sizing.label})` : ''} ·{' '}
              {Math.round(scale * 100)}%
              <input
                type="range"
                min="0.75"
                max="1"
                step="0.01"
                value={scale}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  adjustments.current.scale = value;
                  setScale(value);
                }}
              />
            </label>
            <button
              onClick={() => {
                adjustments.current = { scale: 1 };
                setScale(1);
              }}
            >
              Reset fit
            </button>
          </div>
          {savedFit && (
            <section className="try-on-saved" aria-label="Saved fit reference">
              <h3>Saved fit reference</h3>
              <img src={savedFit.snapshot} alt={`Saved virtual try-on of ${savedFit.name}`} />
              <p>
                {savedFit.name} · {savedFit.size} · {savedFit.widthMm.toFixed(1)} mm ·{' '}
                {Math.round(savedFit.scale * 100)}%
              </p>
              <p>Saved {new Date(savedFit.date).toLocaleDateString()}</p>
              {sizing.width && (
                <p>
                  Current preview is {Math.abs(sizing.width * scale - savedFit.widthMm).toFixed(1)}{' '}
                  mm {sizing.width * scale >= savedFit.widthMm ? 'wider' : 'narrower'} than this
                  reference.
                </p>
              )}
              <a href={savedFit.snapshot} download="my-frame-fit.jpg">
                Download capture
              </a>
              <button type="button" onClick={removeSavedFit}>
                Delete saved fit
              </button>
              <p>
                Stored on this device. A new capture replaces this reference. Compare visually;
                estimated widths do not guarantee physical fit.
              </p>
            </section>
          )}
          <p className="try-on-note">
            Video is processed on your device and is never uploaded. A snapshot is saved on this
            device only when you select Capture & save fit. The face-tracking model downloads when
            you start. Size proportions follow Total Frame Front Width. This is a visual preview,
            not a physical measurement; XL uses the 146 mm minimum.
          </p>
        </>
      ) : (
        <div className="try-on-unavailable">
          <ScanFace size={56} />
          <h3>Try-on is coming for this frame</h3>
          <p>
            A try-on image hasn’t been added for this selected frame yet. You can still explore the
            product photos.
          </p>
          <button className="try-on-start" onClick={onClose}>
            Back to product
          </button>
        </div>
      )}
    </dialog>,
    document.body,
  );
}
