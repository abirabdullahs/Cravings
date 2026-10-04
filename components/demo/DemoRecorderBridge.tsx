"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const MESSAGE_SOURCE = "cravings-demo-bridge";
const RECORDER_ORIGIN_KEY = `${MESSAGE_SOURCE}-origin`;
const RECORDER_ORIGINS = new Set([
  "http://localhost:3000",
  "https://cravings-demo-recorder.uwalid826.chatgpt.site",
]);

export function DemoRecorderBridge() {
  const pathname = usePathname();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "1") {
      window.sessionStorage.setItem(MESSAGE_SOURCE, "enabled");

      try {
        const referrerOrigin = document.referrer
          ? new URL(document.referrer).origin
          : "";
        if (RECORDER_ORIGINS.has(referrerOrigin)) {
          window.sessionStorage.setItem(RECORDER_ORIGIN_KEY, referrerOrigin);
        }
      } catch {
        window.sessionStorage.removeItem(RECORDER_ORIGIN_KEY);
      }
    }

    if (window.sessionStorage.getItem(MESSAGE_SOURCE) !== "enabled") return;

    const channel = new BroadcastChannel(MESSAGE_SOURCE);
    const recorderOrigin =
      window.sessionStorage.getItem(RECORDER_ORIGIN_KEY) ?? "";
    const sendToRecorder = (
      type: "ready" | "route" | "next" | "previous" | "stop",
    ) => {
      const message = {
        source: MESSAGE_SOURCE,
        messageId: crypto.randomUUID(),
        type,
        pathname,
      };
      channel.postMessage(message);
      if (
        window.opener &&
        !window.opener.closed &&
        RECORDER_ORIGINS.has(recorderOrigin)
      ) {
        window.opener.postMessage(message, recorderOrigin);
      }
    };

    sendToRecorder("ready");
    sendToRecorder("route");

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey) return;

      if (event.code === "Period") {
        event.preventDefault();
        sendToRecorder("next");
      } else if (event.code === "Comma") {
        event.preventDefault();
        sendToRecorder("previous");
      } else if (event.code === "KeyS") {
        event.preventDefault();
        sendToRecorder("stop");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      channel.close();
    };
  }, [pathname]);

  return null;
}
