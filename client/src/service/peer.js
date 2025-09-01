// need for PToP connection without simple-peer

// class PeerManager {
//   constructor() {
//     this.peers = {}; // { socketId: RTCPeerConnection }
//     this.stream = null; // local stream (video+audio)
//   }

//   // set my own local stream once
//   setLocalStream(stream) {
//     this.stream = stream;
//   }

//   // create or get existing peer connection for a user
//   createPeer(remoteId) {
//     if (this.peers[remoteId]) {
//       return this.peers[remoteId];
//     }

//     const pc = new RTCPeerConnection({
//       iceServers: [
//         {
//           urls: [
//             "stun:stun.l.google.com:19302",
//             "stun:global.stun.twilio.com:3478",
//           ],
//         },
//       ],
//     });

//     // add my local tracks
//     if (this.stream) {
//       this.stream.getTracks().forEach((track) => {
//         pc.addTrack(track, this.stream);
//       });
//     }

//     // store peer
//     this.peers[remoteId] = pc;
//     return pc;
//   }

//   // create an SDP offer for a given peer
//   async getOffer(remoteId) {
//     const pc = this.createPeer(remoteId);
//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(new RTCSessionDescription(offer));
//     return offer;
//   }

//   // create an SDP answer when receiving an offer
//   async getAnswer(remoteId, offer) {
//     const pc = this.createPeer(remoteId);
//     await pc.setRemoteDescription(new RTCSessionDescription(offer));
//     const answer = await pc.createAnswer();
//     await pc.setLocalDescription(new RTCSessionDescription(answer));
//     return answer;
//   }

//   // set remote description (answer or offer)
//   async setRemoteDescription(remoteId, sdp) {
//     const pc = this.createPeer(remoteId);
//     await pc.setRemoteDescription(new RTCSessionDescription(sdp));
//   }

//   // add received ICE candidate
//   async addIceCandidate(remoteId, candidate) {
//     const pc = this.createPeer(remoteId);
//     if (candidate) {
//       try {
//         await pc.addIceCandidate(new RTCIceCandidate(candidate));
//       } catch (err) {
//         console.error("Error adding ice candidate", err);
//       }
//     }
//   }

//   // attach event handler for ontrack
//   onTrack(remoteId, callback) {
//     const pc = this.createPeer(remoteId);
//     pc.ontrack = (event) => {
//       callback(event.streams[0], remoteId);
//     };
//   }

//   // attach event handler for ICE candidates
//   onIceCandidate(remoteId, callback) {
//     const pc = this.createPeer(remoteId);
//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         callback(event.candidate, remoteId);
//       }
//     };
//   }
// }

// export default new PeerManager();
