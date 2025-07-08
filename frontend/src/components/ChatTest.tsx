import { useEffect, useRef, useState } from "react";

const ChatTest = ({ userId, toId }: { userId: string; toId: string }) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    fetch(`http://localhost:8000/history/${userId}/${toId}`)
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((m: { from: number; message: string }) =>
          m.from === parseInt(userId)
            ? `Tú: ${m.message}`
            : `De ${m.from}: ${m.message}`
        );
        setMessages(formatted);
      });
    const socket = new WebSocket(`ws://localhost:8000/ws/chat/${userId}`);
    socketRef.current = socket;
  
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages(prev => [...prev, `De ${msg.from}: ${msg.message}`]);
    };
  
    return () => {
      socket.close();
    };
  }, [userId, toId]);
  

  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:8000/ws/chat/${userId}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages((prev) => [...prev, `De ${msg.from}: ${msg.message}`]);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, [userId]);

  const sendMessage = () => {
    if (socketRef.current && input) {
      socketRef.current.send(JSON.stringify({ to: toId, message: input }));
      setMessages((prev) => [...prev, `Tú: ${input}`]);
      setInput("");
    }
  };

  return (
    <div>
      <h2>Chat entre usuario {userId} y {toId}</h2>
      <div style={{ border: "1px solid #ccc", padding: 10, height: 200, overflowY: "scroll" }}>
        {messages.map((msg, idx) => (
          <div key={idx}>{msg}</div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Escribe un mensaje"
      />
      <button onClick={sendMessage}>Enviar</button>
    </div>
  );
};

export default ChatTest;
