import React from "react";
import { ChatContainer } from "../components/ChatContainer";
import { Dashboard } from "../components/Dashboard";
import { ChatBox } from "../components/ChatBox";
import { useWebSocketContext } from "../hooks/useWebSocketContext";
import loadingAnimation from "../assets/lotties/loading-animation.json";
import Lottie from "lottie-react";

export const ChatPage: React.FC = () => {
  const { selectedChatUser } = useWebSocketContext();
  return (
    <ChatContainer>
      <Dashboard />
      {selectedChatUser && <ChatBox />}
      {!selectedChatUser && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Lottie
            animationData={loadingAnimation}
            loop={true}
            style={{ width: "30vw", aspectRatio: "1/1" }}
          />
          <h1 className="text-2xl font-bold">Select a user to chat</h1>
        </div>
      )}
    </ChatContainer>
  );
};
