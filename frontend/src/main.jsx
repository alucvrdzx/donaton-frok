import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import HomePage from './pages/HomePage.jsx'

import DonacionesPage from './pages/DonacionesPage.jsx'
import InventarioPage from './pages/InventarioPage.jsx'
import LogisticaPage from './pages/LogisticaPage.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="donaciones" element={<DonacionesPage />} />
          <Route path="inventario" element={<InventarioPage />} />
          <Route path="logistica" element={<LogisticaPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
