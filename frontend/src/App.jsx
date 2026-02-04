import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoginView from './features/auth/LoginView';
import LogoutConfirmation from './features/auth/LogoutConfirmation';
import MarketLayout from './layout/MarketLayout';
import MarketHome from './features/market/MarketHome';
import BoutiqueLayout from './layout/BoutiqueLayout';
import BoutiqueHome from './features/boutique/BoutiqueHome';
import ClientList from './features/boutique/ClientList';
import FinanceDashboard from './features/boutique/FinanceDashboard';
import ShoppingBoard from './features/boutique/ShoppingBoard';
import AppointmentCalendar from './features/boutique/AppointmentCalendar';
import NailsGallery from './features/boutique/NailsGallery';
import GiftCardManager from './features/boutique/GiftCardManager';
import { BoutiqueProvider } from './context/BoutiqueContext';

function App() {
    return (
        <Router>
            <Routes>
                {/* Entry Point: Login */}
                <Route path="/" element={<LoginView />} />
                <Route path="/logout" element={<LogoutConfirmation />} />

                {/* Entorno de Estética Marquez (Oh-Nails) */}
                <Route path="/boutique-welcome" element={
                    <BoutiqueProvider>
                        <BoutiqueLayout />
                    </BoutiqueProvider>
                }>
                    <Route index element={<BoutiqueHome />} />
                    <Route path="clientes" element={<ClientList />} />
                    <Route path="gastos" element={<FinanceDashboard />} />
                    <Route path="compras" element={<ShoppingBoard />} />
                    <Route path="calendario" element={<AppointmentCalendar />} />
                    <Route path="gift-cards" element={<GiftCardManager />} />
                    <Route path="mis-unas" element={<NailsGallery />} />
                </Route>

                {/* Entorno de El Gallo Azul (Pollería) */}
                <Route path="/market" element={<MarketLayout />}>
                    <Route index element={<MarketHome />} />
                    <Route path="pedidos" element={<div>Gestión de Pedidos</div>} />
                    <Route path="inventario" element={<div>Inventario Pollería</div>} />
                    <Route path="estadisticas" element={<div>Estadísticas</div>} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;