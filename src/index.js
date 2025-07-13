import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import Home from './pages/public/Home/Home';

import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrivateRoute } from './components/PrivateRoutes/PrivateRoutes';
import Login from './pages/public/Login/Login';
// import Register from './pages/public/Register/Register';
import AuthContextProvider from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'primereact/resources/primereact.min.css';
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import { PrimeReactProvider } from "primereact/api";
// import { AdminLayout } from './components/AdminLayout/AdminLayout';
import AdminRoutes from './components/AdminRoutes/AdminRoutes';
import PageNotFound from './components/PageNotFound/PageNotFound';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
const client = new QueryClient()
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PrimeReactProvider>
      <BrowserRouter>
        <AuthContextProvider>
          <QueryClientProvider client={client}>
            <Routes>
              <Route path="/" element={<Login />} />
              {/* <Route path="/register" element={<Register />} /> */}
              <Route path="/home" element={<Home />} />
              {/* <Route path='/carros/:id' element={<CarDetail />} /> */}
              <Route element={<PrivateRoute allowedRoles={['ROLE_ADMIN']} />}>
                <Route path="/admin/*">
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