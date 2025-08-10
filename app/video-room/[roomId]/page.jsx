"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import io from "socket.io-client";

export default function VideoRoom() {
  const { roomId } = useParams();
  const { data: session } = useSession();
  const [socket, setSocket] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  useEffect(() => {
    if (!session?.user?.id) return;

    initializeWebRTC();
    
    return () => {
      cleanup();
    };
  }, [roomId, session]);

  const initializeWebRTC = async () => {
    try {
      // Initialize socket
      const socketInstance = io();
      setSocket(socketInstance);

      // Register user/doctor
      if (session.user.isDoctor) {
        socketInstance.emit("register-doctor", { doctorId: session.user.id });
      } else {
        socketInstance.emit("register-user", { userId: session.user.id });
      }

      // Join room
      socketInstance.emit("join-room", roomId);

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const pc = new RTCPeerConnection(iceServers);
      setPeerConnection(pc);

      // Add local stream to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketInstance.emit("ice-candidate", {
            roomId,
            candidate: event.candidate,
          });
        }
      };

      // Socket event listeners
      socketInstance.on("offer", async (offer) => {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketInstance.emit("answer", { roomId, answer });
        setIsCallActive(true);
      });

      socketInstance.on("answer", async (answer) => {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        setIsCallActive(true);
      });

      socketInstance.on("ice-candidate", async (candidate) => {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      });

      socketInstance.on("user-disconnected", () => {
        setIsCallActive(false);
        setRemoteStream(null);
      });

    } catch (error) {
      console.error("Error initializing WebRTC:", error);
    }
  };

  const startCall = async () => {
    if (!peerConnection || !socket) return;

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit("offer", { roomId, offer });
      setIsCallActive(true);
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  const endCall = () => {
    cleanup();
    if (socket) {
      socket.emit("end-call", roomId);
    }
    setIsCallActive(false);
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }
    if (socket) {
      socket.disconnect();
    }
  };

  if (!session) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="bg-gray-800 text-white p-4 border-b border-gray-700">
        <h1 className="text-xl font-semibold">Video Call</h1>
        <p className="text-sm text-gray-300">Room ID: {roomId}</p>
      </div>

      <div className="flex-1 relative">
        {/* Remote video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Local video */}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute top-4 right-4 w-48 h-36 object-cover rounded-lg border-2 border-white"
        />

        {/* No remote stream message */}
        {!remoteStream && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <p className="text-xl mb-4">Waiting for other participant...</p>
              {!isCallActive && (
                <button
                  onClick={startCall}
                  className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold"
                >
                  Start Call
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex justify-center space-x-4">
        <button
          onClick={toggleMute}
          className={`p-3 rounded-full ${
            isMuted ? "bg-red-500" : "bg-gray-600"
          } text-white hover:opacity-80`}
        >
          {isMuted ? "🔇" : "🎤"}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${
            isVideoOff ? "bg-red-500" : "bg-gray-600"
          } text-white hover:opacity-80`}
        >
          {isVideoOff ? "📹" : "📷"}
        </button>

        <button
          onClick={endCall}
          className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600"
        >
          📞
        </button>
      </div>
    </div>
  );
}