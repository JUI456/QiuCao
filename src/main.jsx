import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import BerlinPage from "./pages/BerlinPage.jsx";
import ChangelogPage from "./pages/ChangelogPage.jsx";
import DetailPage from "./pages/DetailPage.jsx";
import DecryptGame from "./components/DecryptGame.jsx";
import HeartPopups from "./components/HeartPopups.jsx";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/berlin" element={<BerlinPage />} />
      <Route path="/changelog" element={<ChangelogPage />} />
      <Route path="/game" element={<DecryptGame />} />
      <Route path="/heart" element={<HeartPopups />} />
      <Route path="/detail/:pageId" element={<DetailPage />} />
    </Routes>
  </BrowserRouter>,
);
