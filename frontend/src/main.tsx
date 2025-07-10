import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import App from "./App.tsx";
import { ThemeProvider } from "./providers/ThemeProvider";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
