import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import BerlinPage from "./pages/BerlinPage.jsx";
import FlyToAutumnPage from "./pages/FlyToAutumnPage.jsx";
import BirthdayPage from "./pages/BirthdayPage.jsx";
import WonderlandPage from "./pages/WonderlandPage.jsx";
import WonderlandChapterPage from "./pages/WonderlandChapterPage.jsx";
import ChangelogPage from "./pages/ChangelogPage.jsx";
import DetailPage from "./pages/DetailPage.jsx";
import TidewaterPage from "./pages/TidewaterPage.jsx";
import DecryptGame from "./components/DecryptGame.jsx";
import HeartPopups from "./components/HeartPopups.jsx";
import DebugDock from "./components/DebugDock.jsx";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/berlin" element={<BerlinPage />} />
      <Route path="/route" element={<FlyToAutumnPage />} />
      <Route path="/birthday" element={<BirthdayPage />} />
      <Route path="/wonderland" element={<WonderlandPage />} />
      <Route path="/wonderland/:chapter" element={<WonderlandChapterPage />} />
      <Route path="/changelog" element={<ChangelogPage />} />
      <Route path="/game" element={<DecryptGame />} />
      <Route path="/heart" element={<HeartPopups />} />
      <Route path="/detail/:pageId" element={<DetailPage />} />
      <Route path="/tidewater" element={<TidewaterPage />} />
    </Routes>
    {/* 站主专用调试面板：?debug=1 开启，访客不可见 */}
    <DebugDock />
  </BrowserRouter>,
);
