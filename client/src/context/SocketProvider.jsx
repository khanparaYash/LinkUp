import { useMemo } from "react";
import { createContext, useContext } from "react";
import { io } from "socket.io-client";

// eslint-disable-next-line react-refresh/only-export-components
export const SocketContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);

const SocketProvider = ({ children }) => {
  const socket = useMemo(() => io(import.meta.env.VITE_BACKEND ),[]);

  return (
    <SocketContext.Provider value={ socket }>
      {children}
    </SocketContext.Provider>
  );
};
export default SocketProvider;
