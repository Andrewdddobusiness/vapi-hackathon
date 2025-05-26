"use client";

import { useState, useEffect } from "react";
import Vapi from "@vapi-ai/web";

// Initialize Vapi with your public API key
const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);

interface Transcript {
  speaker: "user" | "assistant";
  text: string;
  timestamp: string;
}

export default function Home() {
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "calling" | "ended">("idle");
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [detectedLanguage, setDetectedLanguage] = useState("EN");
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  // ——— Vapi Event Wiring ———
  useEffect(() => {
    const onCallStart = () => {
      setCallStatus("calling");
      setCallStartTime(Date.now());
      setTranscripts([]);
    };
    const onCallEnd = () => {
      setCallStatus("ended");
      setCallStartTime(null);
    };
    const onError = (err: any) => {
      console.error("Vapi error:", err);
      setCallStatus("idle");
    };
    const onMessage = (msg: any) => {
      if (msg.type === "transcript" && msg.text) {
        setTranscripts((prev) => [
          ...prev,
          { speaker: "user", text: msg.text, timestamp: new Date().toLocaleTimeString() },
        ]);
      } else if (msg.type === "message" && msg.message?.role === "assistant") {
        setTranscripts((prev) => [
          ...prev,
          { speaker: "assistant", text: msg.message.content, timestamp: new Date().toLocaleTimeString() },
        ]);
      }
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("error", onError);
    vapi.on("message", onMessage);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("error", onError);
      vapi.off("message", onMessage);
    };
  }, []);

  // ——— Call Duration Timer ———
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callStatus === "calling" && callStartTime) {
      timer = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callStatus, callStartTime]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ——— Handlers ———
  const handleStartCall = async () => {
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    if (!assistantId) {
      console.error("Missing NEXT_PUBLIC_VAPI_ASSISTANT_ID");
      return;
    }
    setCallStatus("connecting");

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await vapi.start(assistantId);
    } catch (err: any) {
      console.error("Start call error:", err);
      alert("Could not start call: " + (err.message || err));
      setCallStatus("idle");
    }
  };

  const handleEndCall = () => {
    setCallStatus("ended");
    vapi.stop();
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center bg-white">
      {/* Hero */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-black">UniVoice</h1>
        <p className="text-gray-800">Ask about UTS admissions—right in your browser.</p>
      </header>

      {/* Card */}
      <main className="w-full max-w-[360px] bg-gray-50 rounded-lg shadow-lg p-6">
        {/* Timer & Language */}
        <div className="flex justify-between items-center mb-4">
          {callStatus === "calling" && (
            <span className="text-black font-medium">🕒 {formatDuration(callDuration)}</span>
          )}
          <span className="px-2 py-1 bg-blue-200 rounded text-black">{detectedLanguage}</span>
        </div>

        {/* Call Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={callStatus === "calling" || callStatus === "connecting" ? handleEndCall : handleStartCall}
            className={`px-6 py-2 rounded-full text-white cursor-pointer ${
              callStatus === "calling" || callStatus === "connecting"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {callStatus === "idle" && "Start Call"}
            {callStatus === "connecting" && "Connecting…"}
            {callStatus === "calling" && "End Call"}
            {callStatus === "ended" && "Call Ended"}
          </button>
        </div>

        {/* Transcript Panel */}
        <div className="h-48 overflow-y-auto bg-white border border-gray-200 rounded p-3 mb-4">
          {transcripts.map((t, i) => (
            <div key={i} className="mb-2">
              <span className="text-xs text-gray-400">{t.timestamp}</span>
              <p className={`${t.speaker === "user" ? "text-blue-700" : "text-green-700"} text-base`}>
                <strong>{t.speaker === "user" ? "You" : "Assistant"}:</strong> {t.text}
              </p>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="bg-gray-100 p-3 rounded mb-4 text-sm text-black">
          <p>💡 Speak naturally—ask deadlines, fees, tours…</p>
          <p>🔊 Interrupt to test barge-in.</p>
        </div>
        <div className="text-xs text-gray-500 text-center">Example data for UTS admissions</div>
      </main>
    </div>
  );
}
