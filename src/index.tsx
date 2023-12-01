// File: index.tsx
// This file is the entry point for the React frontend application. It mounts the root React component into the DOM.

import { createRoot } from "react-dom/client";
import App from "./components/app"; // Import the top-level App component.

const container = document.getElementById("app"); // Get the DOM element where the React app will mount.
const root = createRoot(container); // Create a root for the React application.

root.render(<App initialData={(window as any).initialData} />); // Render the App component with initial data.
