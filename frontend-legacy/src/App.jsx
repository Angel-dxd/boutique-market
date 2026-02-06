import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoginView from './features/auth/LoginView';
import LogoutConfirmation from './features/auth/LogoutConfirmation';
import MarketLayout from './layout/MarketLayout';
import MarketHome from './features/market/MarketHome';
import Pedidos from './features/market/Pedidos';
import Proveedores from './features/market/Proveedores';
import Inventario from './features/market/Inventario';
import Estadisticas from './features/market/Estadisticas';
import Herramientas from './features/market/Herramientas';
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
            <BoutiqueProvider>
                <Routes>
                    {/* Entry Point: Login */}
                    <Route path="/" element={<LoginView />} />
                    <Route path="/logout" element={<LogoutConfirmation />} />

                    {/* Entorno de Estética Marquez (Oh-Nails) */}
                    <Route path="/boutique-welcome" element={<BoutiqueLayout />}>
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
                        <Route path="pedidos" element={<Pedidos />} />
                        <Route path="proveedores" element={<Proveedores />} />
                        <Route path="inventario" element={<Inventario />} />
                        <Route path="estadisticas" element={<Estadisticas />} />
                        <Route path="herramientas" element={<Herramientas />} />
                    </Route>
                </Routes>
            </BoutiqueProvider>
        </Router>
    );
}

export default App;