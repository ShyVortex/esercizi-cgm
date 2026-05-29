import './index.css'
import App from './App.tsx'
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from 'react-router';
import LoginPage from './pages/LoginPage.tsx';
import SignupPage from './pages/SignupPage.tsx';
import PublicPage from './pages/PublicPage.tsx';
import PrivatePage from './pages/PrivatePage.tsx';

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route index element={<App />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="signup" element={<SignupPage />} />
      <Route path="public" element={<PublicPage />} />
      <Route path='private' element={<PrivatePage />} />
    </Routes>
  </BrowserRouter>,
);
