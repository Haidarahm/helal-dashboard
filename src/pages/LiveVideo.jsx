import React, { useState, useRef, useEffect } from "react";
import { liveVideoApi } from "../apis/liveVideo";
import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiXCircle,
} from "react-icons/fi";
import Pusher from "pusher-js";

const VideoControls = ({
  isMicOn,
  isCameraOn,
  onToggleMic,
  onToggleCamera,
}) => (
  <div
    style={{
      marginTop: 20,
      display: "flex",
      gap: 18,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <button
      onClick={onToggleMic}
      title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
      style={{
        border: "none",
        outline: "none",
        borderRadius: "50%",
        width: 48,
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 28,
        background: isMicOn ? "#e1eeff" : "#fee7ea",
        color: isMicOn ? "#2564eb" : "#c41f32",
        boxShadow: isMicOn ? "0 2px 4px #c9e1fc80" : "0 2px 4px #fcd9df70",
        transition: "all 0.16s",
        cursor: "pointer",
      }}
    >
      {isMicOn ? <FiMic /> : <FiMicOff />}
    </button>
    <button
      onClick={onToggleCamera}
      title={isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
      style={{
        border: "none",
        outline: "none",
        borderRadius: "50%",
        width: 48,
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 28,
        background: isCameraOn ? "#e1eeff" : "#fdecc4",
        color: isCameraOn ? "#2564eb" : "#d89614",
        boxShadow: isCameraOn ? "0 2px 4px #c9e1fc80" : "0 2px 4px #fbedcc80",
        transition: "all 0.16s",
        cursor: "pointer",
      }}
    >
      {isCameraOn ? <FiVideo /> : <FiVideoOff />}
    </button>
  </div>
);

export const LiveVideo = () => {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pusherConnected, setPusherConnected] = useState(false);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const pusherRef = useRef(null);
  const channelRef = useRef(null);

  // Assign stream to video element after broadcast starts (fixes timing issues)
  useEffect(() => {
    if (isBroadcasting && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [isBroadcasting]);

  // Setup Pusher on broadcast start (signaling/demo only)
  useEffect(() => {
    if (isBroadcasting && roomId) {
      const pusherKey = import.meta.env.VITE_PUSHER_KEY;
      const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER;
      if (!pusherKey || !pusherCluster) {
        setError("Pusher key/cluster missing in environment config.");
        return;
      }
      Pusher.logToConsole = true;
      const pusher = new Pusher(pusherKey, {
        cluster: pusherCluster,
        forceTLS: true,
      });
      pusherRef.current = pusher;
      const channel = pusher.subscribe(roomId);
      channelRef.current = channel;
      channel.bind_global((event, data) => {
        console.log(`[Pusher][${roomId}] Event:`, event, data);
      });
      channel.bind("signal", (data) => {
        console.log(`[Pusher][${roomId}] SIGNAL`, data);
      });
      setPusherConnected(true);
      return () => {
        channel.unbind_all();
        channel.unsubscribe();
        pusher.disconnect();
        pusherRef.current = null;
        channelRef.current = null;
        setPusherConnected(false);
      };
    }
  }, [isBroadcasting, roomId]);

  const handleStartBroadcast = async () => {
    setIsLoading(true);
    setError("");
    if (!roomId) {
      setError("Room ID is required");
      setIsLoading(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      await liveVideoApi.startBroadcast(roomId);
      setIsBroadcasting(true);
    } catch (err) {
      setError(
        err?.message ||
          (err?.name === "NotAllowedError"
            ? "Permission denied for camera/microphone."
            : "Failed to start broadcast.")
      );
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = () => {
    // Stop media
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    // Disconnect Pusher
    if (channelRef.current) {
      channelRef.current.unbind_all();
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    if (pusherRef.current) {
      pusherRef.current.disconnect();
      pusherRef.current = null;
    }
    setPusherConnected(false);
    // Reset broadcast state
    setIsBroadcasting(false);
    setIsMicOn(true);
    setIsCameraOn(true);
    setError("");
  };

  const handleToggleMic = () => {
    setIsMicOn((m) => !m);
    if (mediaStreamRef.current) {
      mediaStreamRef.current
        .getAudioTracks()
        .forEach((track) => (track.enabled = !isMicOn));
    }
  };

  const handleToggleCamera = () => {
    setIsCameraOn((c) => !c);
    if (mediaStreamRef.current) {
      mediaStreamRef.current
        .getVideoTracks()
        .forEach((track) => (track.enabled = !isCameraOn));
    }
  };

  return (
    <div style={{ maxWidth: 460, margin: "36px auto", padding: 0 }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
          padding: 32,
          minHeight: 370,
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            marginBottom: 22,
            marginTop: 0,
            letterSpacing: 0.2,
            color: "#26324A",
          }}
        >
          Admin Live Video Broadcast
        </h2>
        {pusherConnected && (
          <div style={{ fontSize: 14, color: "#339966", marginBottom: 8 }}>
            Pusher connected: <b>{roomId}</b>
          </div>
        )}
        {!isBroadcasting && (
          <div style={{ marginBottom: 22 }}>
            <label
              htmlFor="roomId"
              style={{ fontWeight: 500, display: "block", marginBottom: 6 }}
            >
              Enter Room ID
            </label>
            <input
              id="roomId"
              type="text"
              placeholder="Type your broadcast room id..."
              autoComplete="off"
              style={{
                width: "100%",
                fontSize: 15,
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                padding: "8px 12px",
                marginBottom: 10,
                outline: "none",
                marginRight: 8,
              }}
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              disabled={isLoading}
            />
            <button
              onClick={handleStartBroadcast}
              disabled={!roomId || isLoading}
              style={{
                padding: "8px 28px",
                borderRadius: 6,
                background: "#2056e8",
                color: "#fff",
                fontWeight: 600,
                fontSize: 16,
                letterSpacing: 0.02,
                border: "none",
                marginTop: 3,
                marginBottom: 2,
                outline: "none",
                boxShadow: "0 2px 4px rgba(32,86,232,0.07)",
                opacity: !roomId || isLoading ? 0.65 : 1,
                cursor: !roomId || isLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {isLoading ? (
                "Starting..."
              ) : (
                <>
                  <FiVideo style={{ marginRight: 4, marginTop: -2 }} />
                  Start Broadcast
                </>
              )}
            </button>
          </div>
        )}
        {error && (
          <div
            style={{
              background: "#fde8e8",
              border: "1px solid #fbb6b6",
              color: "#cc1f1a",
              padding: "7px 13px",
              borderRadius: 7,
              margin: "12px 0 14px 0",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}
        {isBroadcasting && (
          <>
            <div style={{ marginBottom: 11, fontSize: 15 }}>
              Broadcasting to <b>Room:</b>{" "}
              <span style={{ color: "#2066e7" }}>{roomId}</span>
            </div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                background: "#1b2131",
                borderRadius: 8,
                boxShadow: "0 0 7px #e1e3f7",
                marginBottom: 12,
              }}
            />
            <VideoControls
              isMicOn={isMicOn}
              isCameraOn={isCameraOn}
              onToggleMic={handleToggleMic}
              onToggleCamera={handleToggleCamera}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 24,
              }}
            >
              <button
                onClick={handleEndSession}
                style={{
                  background: "#fa5252",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  padding: "10px 28px",
                  fontWeight: 600,
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 2px 6px #e8131344",
                  cursor: "pointer",
                  transition: "background 0.18s",
                }}
              >
                <FiXCircle style={{ fontSize: 22, marginRight: 6 }} />
                End Session
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LiveVideo;
