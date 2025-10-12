import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import Home from './pages/public/Home/Home';

import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrivateRoute } from './components/PrivateRoutes/PrivateRoutes';
import { PublicRoute } from './components/PublicRoute/PublicRoute';
import Login from './pages/public/Login/Login';
import Register from './pages/public/Register/Register';
import AuthContextProvider from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import { PrimeReactProvider } from "primereact/api";
import AdminRoutes from './components/AdminRoutes/AdminRoutes';
import PageNotFound from './components/PageNotFound/PageNotFound';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ForgotPassword from './pages/public/ForgotPassword/ForgotPassword';
import AdminLayout from './components/AdminLayout/AdminLayout';

const client = new QueryClient()
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PrimeReactProvider>
      <BrowserRouter>
        <AuthContextProvider>
          <QueryClientProvider client={client}>
            <Routes>
              {/* Rotas Públicas - Admins não podem acessar */}
              <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/forgot-password/:email" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

              {/* Rota Home - Apenas usuários normais */}
              <Route path="/home" element={<PublicRoute><Home /></PublicRoute>} />

              {/* Rotas Admin - Apenas ROLE_ADMIN */}
              <Route element={<PrivateRoute allowedRoles={['ROLE_ADMIN']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route path="*" element={<AdminRoutes />} />
                </Route>
              </Route>

              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </QueryClientProvider>
          <ToastContainer />
        </AuthContextProvider>
      </BrowserRouter>
    </PrimeReactProvider>
  </React.StrictMode>
);