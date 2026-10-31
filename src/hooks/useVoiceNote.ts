import { useEffect, useRef, useState } from "react";
export function useVoiceNote(onRecorded: (blob: Blob) => void) {
  const [recording, setRecording] = useState(false),
    [error, setError] = useState("");
  const recorder = useRef<MediaRecorder | null>(null),
    stream = useRef<MediaStream | null>(null),
    alive = useRef(true),
    callback = useRef(onRecorded),
    limit = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requesting = useRef(false);
  callback.current = onRecorded;
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (limit.current) clearTimeout(limit.current);
      if (recorder.current?.state === "recording") recorder.current.stop();
      stream.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);
  async function start() {
    if (requesting.current || recorder.current?.state === "recording") return;
    requesting.current = true;
    setError("");
    try {
      if (
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === "undefined"
      )
        throw Error("Audio recording unavailable. Please type your message.");
      const capture = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (!alive.current) {
        capture.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = capture;
      const rec = new MediaRecorder(capture),
        chunks: BlobPart[] = [];
      recorder.current = rec;
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      rec.onstop = () => {
        if (limit.current) clearTimeout(limit.current);
        capture.getTracks().forEach((t) => t.stop());
        if (!alive.current) return;
        setRecording(false);
        const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
        if (blob.size) callback.current(blob);
        else setError("No audio captured. Please try again.");
      };
      rec.onerror = () => {
        capture.getTracks().forEach((t) => t.stop());
        if (alive.current) {
          setRecording(false);
          setError("Recording failed. Please use text.");
        }
      };
      rec.start();
      setRecording(true);
      limit.current = setTimeout(() => {
        if (rec.state === "recording") rec.stop();
      }, 120000);
    } catch {
      stream.current?.getTracks().forEach((t) => t.stop());
      if (alive.current)
        setError(
          "Microphone unavailable or permission denied. Please use text.",
        );
    } finally {
      requesting.current = false;
    }
  }
  return {
    recording,
    error,
    start,
    stop: () => {
      if (recorder.current?.state === "recording") recorder.current.stop();
    },
  };
}
