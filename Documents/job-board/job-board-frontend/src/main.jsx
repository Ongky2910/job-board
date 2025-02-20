import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; 
import App from "./App";
import { UserProvider } from "./context/UserContext";
import "./index.css";

console.log("🔥 React masih berjalan!");
console.log("✅ UserProvider diimport dengan sukses!");


ReactDOM.createRoot(document.getElementById("root")).render(
<BrowserRouter>
    <UserProvider> 
      <App />
    </UserProvider>
  </BrowserRouter>
);
