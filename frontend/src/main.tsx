import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

/* FUENTES
   - Inter Variable: UI/párrafos
   - Poppins (pesos estáticos): títulos
*/
import "@fontsource-variable/inter/index.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";

createRoot(document.getElementById("root")!).render(<App />);
