"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Vapi from "@vapi-ai/web";
import { HyperText } from "@/components/magicui/hyper-text";

import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { Pointer } from "@/components/magicui/pointer";
import { Dock, DockIcon } from "@/components/magicui/dock";

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
    vapi.on("end-of-call-report", onCallEnd);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("error", onError);
      vapi.off("message", onMessage);
      vapi.off("end-of-call-report", onCallEnd);
    };
  }, []);

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
    <div className="min-h-screen p-4 flex flex-col items-center justify-center bg-white w-full overflow-hidden cursor-none">
      <FlickeringGrid
        className="absolute inset-0 z-0 [mask-image:radial-gradient(450px_circle_at_center,white,transparent)]"
        squareSize={6}
        gridGap={6}
        color="#52b788"
        maxOpacity={0.8}
        flickerChance={0.5}
      />

      <Pointer className="fill-blue-500" />

      {/* Hero */}
      <header className="flex flex-col items-center text-center mb-8">
        <HyperText className="text-5xl font-bold text-black mb-4">UniVoice</HyperText>
        <p className="text-gray-800">An AI UTS admissions agent ready to answer your questions.</p>
      </header>

      {/* Card */}
      <main className="w-full max-w-md rounded-xl shadow-lg p-6 bg-white/10 backdrop-blur-xl">
        {/* Timer & Language */}
        <div className="flex justify-between items-center mb-4">
          {callStatus === "calling" && (
            <span className="text-black font-medium">🕒 {formatDuration(callDuration)}</span>
          )}
          <span className="px-2 py-1 bg-blue-200 rounded text-zinc-500 text-sm">{detectedLanguage}</span>
        </div>

        {/* Call Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={callStatus === "calling" || callStatus === "connecting" ? handleEndCall : handleStartCall}
            className={`px-6 py-2 rounded-full text-white cursor-none ${
              callStatus === "calling" || callStatus === "connecting"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {callStatus === "idle" && "Start Call"}
            {callStatus === "connecting" && "Connecting…"}
            {callStatus === "calling" && "End Call"}
            {callStatus === "ended" && "Start Call"}
          </button>
        </div>

        {/* Tips */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm text-gray-800">
          <h3 className="text-base font-semibold mb-3">Try asking things like:</h3>
          <ul className="space-y-2 pl-5 marker:text-blue-500 marker:text-lg marker:font-semibold">
            <li>What’s the application deadline for international students?</li>
            <li>Can you tell me the entry requirements for Computer Science?</li>
            <li>How much is tuition for undergraduates?</li>
            <li>Are there any scholarships available?</li>
            <li>How do I book a campus tour?</li>
          </ul>
          <p className="mt-4 text-gray-600 italic">
            You can interrupt the assistant at any time by speaking over it (barge-in).
          </p>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Disclaimer: This is a demo of a “UTS admissions” voice assistant for educational and hackathon purposes only.
          The University of New South Wales (UTS) name, logos, and trademarks are the property of their respective
          owners. This project is not affiliated with, endorsed by, or sponsored by UTS, and all admissions information
          shown is fictitious sample data—please consult uts.edu.au for official policies.
        </div>
      </main>

      <Dock iconMagnification={60} iconDistance={100}>
        <DockIcon className="bg-black/10 dark:bg-white/10">
          <Image src="/github.svg" alt="GitHub" width={40} height={40} className="size-full p-0" />
        </DockIcon>
        <DockIcon className="bg-black/10 dark:bg-white/10">
          <Image src="/linkedin.svg" alt="LinkedIn" width={40} height={40} className="size-full" />
        </DockIcon>
        <DockIcon className="bg-black/10 dark:bg-white/10">
          <Image src="/instagram.svg" alt="Instagram" width={40} height={40} className="size-full" />
        </DockIcon>
        <DockIcon className="bg-black/10 dark:bg-white/10">
          <Image src="/youtube.svg" alt="YouTube" width={40} height={40} className="size-full" />
        </DockIcon>
      </Dock>
    </div>
  );
}
