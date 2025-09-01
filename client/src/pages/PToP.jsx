
// import Peer from "simple-peer";
// import { useSocket } from "../context/SocketProvider";
// import { useEffect, useRef, useState, useCallback } from "react";
// import peer from "../service/peer";
// import { motion } from "framer-motion";
// import Button from "../components/ui/Button";
// import Card from "../components/ui/Card";
// import {
//   Mic,
//   MicOff,
//   Video,
//   VideoOff,
//   PhoneOff,
//   MonitorUp,
// } from "lucide-react";

// export default function PToP() {
//   const socket = useSocket();
//   const [remoteSocketId, setRemoteSocketId] = useState(null);
//   const [myStream, setMyStream] = useState();
//   const [remoteStream, setRemoteStream] = useState();
//   const myVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);

//   const [micOn, setMicOn] = useState(true);
//   const [videoOn, setVideoOn] = useState(true);

//   const toggleMic = () => {
//     if (myStream) {
//       myStream.getAudioTracks().forEach((track) => (track.enabled = !micOn));
//       setMicOn(!micOn);
//     }
//   };
//   const toggleVideo = () => {
//     if (myStream) {
//       myStream.getVideoTracks().forEach((track) => (track.enabled = !videoOn));
//       setVideoOn(!videoOn);
//     }
//   };
//   const handleEndCall = () => {
//     window.location.reload(); // Simple way to disconnect
//   };

//   const handleUserJoined = useCallback((data) => {
//     console.log(`user:joined`, data.email);
//     setRemoteSocketId(data.id);
//   }, []);

//   const handleCallUser = useCallback(async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({
//       audio: true,
//       video: true,
//     });

//     setMyStream(stream);
//     for (const track of stream.getTracks()) {
//       peer.peer.addTrack(track, stream);
//     }
//     const offer = await peer.getOffer();
//     socket.emit("user:call", { to: remoteSocketId, offer }); //2
//   }, [remoteSocketId, socket]);

//   const sendStream = useCallback(() => {
//     for (const track of myStream.getTracks()) {
//       peer.peer.addTrack(track, myStream);
//     }
//   }, [myStream]);
//   const handleIncomingCall = useCallback(
//     async ({ from, offer }) => {
//       setRemoteSocketId(from);
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//         video: true,
//       });
//       setMyStream(stream);
//       for (const track of stream.getTracks()) {
//         peer.peer.addTrack(track, stream);
//       }
//       const ans = await peer.getAnswer(offer);
//       socket.emit("call:accepted", { to: from, ans });
//     },
//     [socket]
//   );

//   const handleCallAccepted = useCallback(
//     async ({ ans }) => {
//       await peer.setLocalDescription(ans);
//       if (myStream) {
//         sendStream();
//       }
//     },
//     [myStream, sendStream]
//   );

//   const handleNegoNeeded = useCallback(async () => {
//     const offer = await peer.getOffer();
//     socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
//   }, [remoteSocketId, socket]);

//   const handleNegoNeededIncoming = useCallback(
//     async ({ from, offer }) => {
//       const ans = await peer.getAnswer(offer);
//       socket.emit("peer:nego:done", { to: from, ans });
//     },
//     [socket]
//   );

//   const handleNegoNeededFinal = useCallback(async ({ ans }) => {
//     await peer.setLocalDescription(ans);
//   }, []);

//   useEffect(() => {
//     peer.peer.addEventListener("negotiationneeded", handleNegoNeeded); //5
//     return () => {
//       peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
//     };
//   });

//   useEffect(() => {
//     peer.peer.addEventListener("track", async (ev) => {
//       const remoteStream = ev.streams;
//       setRemoteStream(remoteStream[0]);
//     });
//   });

//   useEffect(() => {
//     if (myVideoRef.current && myStream) {
//       myVideoRef.current.srcObject = myStream;
//     }
//     if (remoteVideoRef.current && remoteStream) {
//       remoteVideoRef.current.srcObject = remoteStream;
//     }
//   }, [myStream, remoteStream]);

//   useEffect(() => {
//     socket.on("user:joined", handleUserJoined); //1
//     socket.on("incoming:call", handleIncomingCall); //3
//     socket.on("call:accepted", handleCallAccepted); //4
//     socket.on("peer:nego:needed", handleNegoNeededIncoming); //5
//     socket.on("peer:nego:final", handleNegoNeededFinal); //6

//     return () => {
//       socket.off("user:joined", handleUserJoined);
//       socket.off("incoming:call", handleIncomingCall);
//       socket.off("call:accepted", handleCallAccepted);
//       socket.off("peer:nego:needed", handleNegoNeededIncoming);
//       socket.off("peer:nego:final", handleNegoNeededFinal);
//     };
//   }, [
//     handleCallAccepted,
//     handleIncomingCall,
//     handleNegoNeededFinal,
//     handleNegoNeededIncoming,
//     handleUserJoined,
//     socket,
//   ]);

//   useEffect(() => {
//     if (!peer?.peer) return;

//     peer.peer.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit("peer:candidate", {
//           candidate: event.candidate,
//           to: remoteSocketId,
//         });
//       }
//     };

//     socket.on("peer:candidate", ({ candidate }) => {
//       peer.peer.addIceCandidate(new RTCIceCandidate(candidate));
//     });

//     return () => {
//       socket.off("peer:candidate");
//     };
//   }, [socket, remoteSocketId]);

//   return (
//     <div className="min-h-screen w-full bg-gray-100 dark:bg-slate-900 p-6 flex flex-col items-center gap-6">
//       {/* Header */}
//       <motion.h1
//         className="text-3xl font-bold text-gray-800 dark:text-white"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//       >
//         Meeting Room
//       </motion.h1>

//       {/* Connection Status */}
//       <motion.h4
//         className="text-lg text-gray-600 dark:text-gray-300"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//       >
//         {remoteSocketId ? "✅ Connected to a user" : "⌛ Waiting for user..."}
//       </motion.h4>

//       {/* Call Button */}
//       {remoteSocketId && (
//         <Button
//           variant="accent"
//           onClick={handleCallUser}
//           className="rounded-xl px-6 py-2"
//         >
//           Start Call
//         </Button>
//       )}

//       {/* Streams Section */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
//         {/* My Stream */}
//         {myStream && (
//           <Card className="overflow-hidden flex flex-col items-center gap-4">
//             <motion.h3 className="text-xl font-semibold text-center">
//               My Stream
//             </motion.h3>

//             <video
//               ref={myVideoRef}
//               autoPlay
//               muted
//               playsInline
//               className="w-full h-64 bg-black rounded-xl shadow-inner"
//             />

//             {/* Toolbar */}
//             <div className="flex justify-center gap-3 mt-3">
//               <Button
//                 variant="ghost"
//                 onClick={toggleMic}
//                 className="rounded-full p-2"
//               >
//                 {micOn ? <Mic /> : <MicOff />}
//               </Button>
//               <Button
//                 variant="ghost"
//                 onClick={toggleVideo}
//                 className="rounded-full p-2"
//               >
//                 {videoOn ? <Video /> : <VideoOff />}
//               </Button>
//               <Button variant="ghost" className="rounded-full p-2">
//                 <MonitorUp />
//               </Button>
//               <Button
//                 variant="primary"
//                 onClick={handleEndCall}
//                 className="rounded-full p-2 bg-red-500 hover:bg-red-600"
//               >
//                 <PhoneOff />
//               </Button>
//             </div>
//           </Card>
//         )}

//         {/* Remote Stream */}
//         {remoteStream && (
//           <Card className="overflow-hidden flex flex-col items-center gap-4">
//             <motion.h3 className="text-xl font-semibold text-center">
//               Remote Stream
//             </motion.h3>

//             <video
//               ref={remoteVideoRef}
//               autoPlay
//               playsInline
//               className="w-full h-64 bg-black rounded-xl shadow-inner"
//             />
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// }




// server for PToP 

// const emailToSocketIdMap = new Map();
// const SocketIdToEmailMap = new Map();

// io.on("connection", (socket) => {
//   console.log(`Socket Connected`, socket.id);

//   socket.on("room:join", (data) => {
//     const { email, roomId } = data;
//     emailToSocketIdMap.set(email, socket.id);
//     SocketIdToEmailMap.set(socket.id, email);

//     io.to(roomId).emit("user:joined", { email, id: socket.id }); //send message to all existing user that new user added
//     socket.join(roomId); //if no one then create rooms otherwise add

//     io.to(socket.id).emit("room:join", data);
//   });

//   socket.on("user:call", ({ to, offer }) => {
//     //2
//     io.to(to).emit("incoming:call", { from: socket.id, offer });
//   });
//   socket.on("call:accepted", ({ to, ans }) => {
//     //3
//     io.to(to).emit("call:accepted", { from: socket.id, ans });
//   });
//   socket.on("peer:nego:needed", ({ offer, to }) => {
//     //4
//     io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
//   });
//   socket.on("peer:nego:done", ({ to, ans }) => {
//     //5
//     io.to(to).emit("peer:nego:final", { from: socket.id, ans });
//   });
//   socket.on("peer:candidate", ({ to, candidate }) => {
//     io.to(to).emit("peer:candidate", { from: socket.id, candidate });
//   });
// });