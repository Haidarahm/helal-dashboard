import React, { useEffect, useRef, useState } from "react";

const LiveVideo = () => {
  const [meetUrl, setMeetUrl] = useState("");
  const [joinedUrl, setJoinedUrl] = useState("");
  const [error, setError] = useState("");

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      // Immediately stop tracks; we only needed the permission prompt
      stream.getTracks().forEach((t) => t.stop());
    } catch (e) {
      setError(
        e?.message ||
          "Microphone/Camera permission was denied. You can still try to join the meeting."
      );
    }
  };

  const normalizeUrl = (val) => {
    if (!val) return "";
    // If user typed just the room name, prefix with Jitsi domain
    if (!/^https?:\/\//i.test(val)) {
      return `https://meet.jit.si/${val}`;
    }
    return val;
  };

  const handleJoin = async () => {
    setError("");
    const url = normalizeUrl(meetUrl.trim());
    if (!url) {
      setError("Please enter a meeting URL or room name");
      return;
    }
    // Ask for mic/camera so the browser prompts upfront
    await requestPermissions();
    setJoinedUrl(url);
  };

  return (
    <div style={{ maxWidth: 960, margin: "24px auto", padding: 0 }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
          padding: 24,
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            marginBottom: 14,
            marginTop: 0,
            letterSpacing: 0.2,
            color: "#26324A",
          }}
        >
          Join Jitsi Meeting
        </h2>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Enter Jitsi URL or room name (e.g., https://meet.jit.si/room or my-room)"
            value={meetUrl}
            onChange={(e) => setMeetUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleJoin();
            }}
            style={{
              flex: 1,
              fontSize: 15,
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              padding: "8px 12px",
              outline: "none",
            }}
          />
          <button
            onClick={handleJoin}
            style={{
              padding: "8px 18px",
              borderRadius: 6,
              background: "#2056e8",
              color: "#fff",
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: 0.2,
              border: "none",
              outline: "none",
              cursor: "pointer",
            }}
          >
            Join
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "#fde8e8",
              border: "1px solid #fbb6b6",
              color: "#cc1f1a",
              padding: "7px 13px",
              borderRadius: 7,
              margin: "8px 0 14px 0",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {joinedUrl ? (
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16/9",
              background: "#0e1729",
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid #e5e7eb",
            }}
          >
            <iframe
              title="jitsi-meeting"
              src={joinedUrl}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                border: 0,
              }}
              allow="camera; microphone; autoplay; clipboard-write; fullscreen; display-capture"
              allowFullScreen
            />
          </div>
        ) : (
          <div style={{ color: "#667085", fontSize: 14 }}>
            Enter a Jitsi room or full URL to join.
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveVideo;
