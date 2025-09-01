import React, { useEffect, useRef} from "react";

const Video = ({ stream }) => {
const ref = useRef(null);
  useEffect(() => {
    ref.current.srcObject = stream;
  }, [stream]);
  return <video playsInline autoPlay ref={ref} className="peerVideo" />;
};
export default Video
