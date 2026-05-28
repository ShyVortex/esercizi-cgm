import './index.css'
import App from './App.tsx'
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from 'react-router';

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route index element={<App />} />
    </Routes>
  </BrowserRouter>,
);
