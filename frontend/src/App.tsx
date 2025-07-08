import { useEffect } from "react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
  }
}

function App() {
  useEffect(() => {
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-signin")!,
      { theme: "outline", size: "large" }
    );
  }, []);

  const handleCredentialResponse = async (response: { credential: string }) => {
    const credential = response.credential;
    console.log("Google ID Token:", credential);

    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      const user = await res.json();
      console.log("User from backend:", user);
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Teachly Chat App</h1>
      <div id="google-signin"></div>
    </div>
  );
}

export default App;
