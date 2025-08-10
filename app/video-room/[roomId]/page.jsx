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
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [hasOffered, setHasOffered] = useState(false);
  const [mediaError, setMediaError] = useState(null);
  const remoteStreamRef = useRef(null);

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

    let mounted = true;
    let pc = null;
    let socketInstance = null;

    const initCall = async () => {
      try {
        // Get media first - handle multiple tab scenario
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
            audio: true,
          });
          console.log('✅ Media access granted');
        } catch (error) {
          console.error('❌ Media access failed:', error.name, error.message);
          if (error.name === 'NotAllowedError') {
            setMediaError('Camera/microphone access denied. Please allow access and refresh.');
          } else if (error.name === 'NotReadableError') {
            setMediaError('Camera/microphone is being used by another tab. Please close other video tabs and refresh.');
          } else {
            setMediaError('Failed to access camera/microphone. Please check your device.');
          }
          return; // Don't throw, just return to prevent reload loop
        }

        if (!mounted) return;

        console.log('Local stream tracks:', stream.getTracks().map(t => ({ kind: t.kind, readyState: t.readyState })));
        
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          // Force video to be visible
          localVideoRef.current.style.display = 'block';
          
          // Proper play promise handling
          const playPromise = localVideoRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('Local video started playing');
              })
              .catch(error => {
                console.log('Local video play failed:', error);
              });
          }
        }

        // Create persistent remote stream
        const remoteStream = new MediaStream();
        remoteStreamRef.current = remoteStream;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }

        // Create peer connection
        pc = new RTCPeerConnection(iceServers);
        setPeerConnection(pc);

        // Add tracks
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Handle remote stream
        pc.ontrack = (event) => {
          console.log('Received remote track:', event.track.kind, event.track.readyState);
          const track = event.track;
          
          if (remoteStreamRef.current) {
            // Add track to persistent remote stream
            remoteStreamRef.current.addTrack(track);
            console.log('Added track to remote stream. Total tracks:', remoteStreamRef.current.getTracks().length);
            
            // Ensure video element has the stream and plays
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStreamRef.current;
              
              // Proper play promise handling
              const playPromise = remoteVideoRef.current.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    console.log('Remote video started playing');
                  })
                  .catch(error => {
                    console.log('Remote video play failed:', error);
                  });
              }
            }
            
            setRemoteStream(remoteStreamRef.current);
            setIsConnected(true);
          }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate && socketInstance) {
            socketInstance.emit("ice-candidate", {
              roomId,
              candidate: event.candidate,
            });
          }
        };

        // Initialize socket with unique connection
        socketInstance = io({
          forceNew: true,
          transports: ['websocket']
        });
        setSocket(socketInstance);
        
        console.log('🔌 Socket connected:', socketInstance.id);

        // Register user/doctor first
        if (session.user.isDoctor) {
          socketInstance.emit("register-doctor", { doctorId: session.user.id });
          console.log('Doctor registered:', session.user.id);
        } else {
          socketInstance.emit("register-user", { userId: session.user.id });
          console.log('User registered:', session.user.id);
        }

        // Join room
        socketInstance.emit("join-room", roomId);
        console.log('Joined room:', roomId, 'as', session.user.isDoctor ? 'doctor' : 'patient');

        // Socket events
        socketInstance.on("offer", async (offer) => {
          try {
            console.log('Patient received offer, current state:', pc.signalingState);
            if (pc.signalingState === 'stable') {
              await pc.setRemoteDescription(offer);
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              socketInstance.emit("answer", { roomId, answer });
              console.log('Patient sent answer');
            } else {
              console.log('Patient ignoring offer, wrong state:', pc.signalingState);
            }
          } catch (error) {
            console.error("Patient error handling offer:", error);
          }
        });

        socketInstance.on("answer", async (answer) => {
          try {
            console.log('Received answer, current state:', pc.signalingState);
            if (pc.signalingState === 'have-local-offer') {
              await pc.setRemoteDescription(answer);
            } else {
              console.log('Ignoring answer, wrong state:', pc.signalingState);
            }
          } catch (error) {
            console.error("Error handling answer:", error);
          }
        });

        socketInstance.on("ice-candidate", async (candidate) => {
          try {
            if (pc.remoteDescription) {
              await pc.addIceCandidate(candidate);
            } else {
              console.log('Queuing ICE candidate');
              setTimeout(() => {
                if (pc.remoteDescription) {
                  pc.addIceCandidate(candidate).catch(console.error);
                }
              }, 1000);
            }
          } catch (error) {
            console.error("Error adding ICE candidate:", error);
          }
        });

        // Doctor creates offer after delay
        if (session.user.isDoctor) {
          setTimeout(async () => {
            try {
              if (pc.signalingState === 'stable' && !hasOffered) {
                console.log('Doctor creating offer, signaling state:', pc.signalingState);
                setHasOffered(true);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                console.log('Doctor sending offer to room:', roomId);
                socketInstance.emit("offer", { roomId, offer });
              } else {
                console.log('Doctor cannot create offer:', { state: pc.signalingState, hasOffered });
              }
            } catch (error) {
              console.error("Doctor error creating offer:", error);
              setHasOffered(false);
            }
          }, 3000);
        }
      } catch (error) {
        console.error("Error initializing call:", error);
        // Show user-friendly error message
        if (error.name === 'NotReadableError' || error.name === 'NotAllowedError') {
          // Media access issues - likely multiple tabs
          return;
        }
      }
    };

    initCall();

    return () => {
      mounted = false;
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (pc) {
        pc.close();
      }
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [roomId, session?.user?.id]);

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

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }
    if (socket) {
      socket.disconnect();
    }
    window.location.href = "/";
  };

  if (!session) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (mediaError) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-red-50 to-orange-50 items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-200 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-red-800 text-xl font-semibold mb-4">Media Access Error</h2>
          <p className="text-red-600 mb-6">{mediaError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <h1 className="text-emerald-800 font-medium">Therapy Session</h1>
          </div>
          <div className="text-sm text-emerald-600">🌿 Safe Space</div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full max-w-6xl mx-auto">
          {/* Remote participant */}
          <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-emerald-100">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              preload="metadata"
              controls={false}
              className="w-full h-full object-cover"
              style={{ 
                display: remoteStream ? "block" : "none",
                backgroundColor: '#000'
              }}
              onLoadedMetadata={() => console.log('Remote video metadata loaded')}
              onCanPlay={() => console.log('Remote video can play')}
              onError={(e) => console.error('Remote video error:', e)}
            />
            {!remoteStream && (
              <div className="h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
                <div className="text-center">
                  <div className="w-24 h-24 bg-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">
                      {session?.user?.isDoctor ? "😊" : "👩‍⚕️"}
                    </span>
                  </div>
                  <p className="text-emerald-700 font-medium mb-2">
                    {session?.user?.isDoctor ? "Your Patient" : "Your Therapist"}
                  </p>
                  <p className="text-emerald-500 text-sm">Connecting...</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-emerald-600/90 text-white px-3 py-1 rounded-full text-sm font-medium">
              {session?.user?.isDoctor ? "Patient" : "Therapist"}
            </div>
          </div>

          {/* Local participant */}
          <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-emerald-100">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              preload="metadata"
              controls={false}
              className="w-full h-full object-cover"
              style={{ 
                display: isVideoOff ? "none" : "block",
                backgroundColor: '#000'
              }}
              onLoadedMetadata={() => console.log('Local video metadata loaded')}
              onCanPlay={() => console.log('Local video can play')}
              onError={(e) => console.error('Local video error:', e)}
            />
            {isVideoOff && (
              <div className="h-full flex items-center justify-center bg-gradient-to-br from-teal-100 to-emerald-100">
                <div className="text-center">
                  <div className="w-24 h-24 bg-teal-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">
                      {session?.user?.isDoctor ? "👩‍⚕️" : "😊"}
                    </span>
                  </div>
                  <p className="text-teal-700 font-medium">
                    {session?.user?.name || "You"}
                  </p>
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-teal-600/90 text-white px-3 py-1 rounded-full text-sm font-medium">
              You
            </div>
            {isMuted && (
              <div className="absolute top-4 left-4 bg-red-400 text-white p-2 rounded-full">
                🔇
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="pb-6">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl ${
              isMuted
                ? "bg-red-400 hover:bg-red-500"
                : "bg-white hover:bg-emerald-50 border-2 border-emerald-200"
            } flex items-center justify-center`}
          >
            <span className={`text-xl ${isMuted ? "text-white" : "text-emerald-600"}`}>
              {isMuted ? "🔇" : "🎤"}
            </span>
          </button>

          <button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl ${
              isVideoOff
                ? "bg-red-400 hover:bg-red-500"
                : "bg-white hover:bg-emerald-50 border-2 border-emerald-200"
            } flex items-center justify-center`}
          >
            <span className={`text-xl ${isVideoOff ? "text-white" : "text-emerald-600"}`}>
              {isVideoOff ? "📹" : "📷"}
            </span>
          </button>

          <button
            onClick={endCall}
            className="w-14 h-14 rounded-full bg-red-400 hover:bg-red-500 text-white transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            <span className="text-xl">📞</span>
          </button>
        </div>
      </div>
    </div>
  );
}