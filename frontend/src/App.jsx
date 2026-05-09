import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { CartProvider }      from './context/CartContext.jsx'
import { AuthProvider }      from './context/AuthContext.jsx'
import { DesignProvider }    from './context/DesignContext.jsx'
import ProtectedRoute        from './Components/Auth/ProtectedRoute.jsx'
import Inicio                from './Pages/Inicio.jsx'
import Tienda                from './Pages/Tienda.jsx'
import Carrito               from './Pages/Carrito.jsx'
import Login                 from './Pages/Login.jsx'
import Register              from './Pages/Register.jsx'
import Dashboard             from './Pages/Admin/Dashboard.jsx'
import POSPage               from './Pages/POS/POSPage.jsx'
import POSReports            from './Pages/POS/POSReports.jsx'
import PagoExito             from './Pages/Pago/PagoExito.jsx'
import PagoError             from './Pages/Pago/PagoError.jsx'
import CompradorDashboard    from './Pages/Comprador/CompradorDashboard.jsx'
import About                from './Pages/About.jsx'

const App = () => {
  const [orderPopup, setOrderPopup] = React.useState(false)
  const handleOrderPopup = () => setOrderPopup(!orderPopup)

  React.useEffect(() => {
    AOS.init({ offset: 100, duration: 800, easing: 'ease-in-sine', delay: 100 })
    AOS.refresh()
  }, [])

  return (
    <DesignProvider>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Públicas ── */}
            <Route path="/" element={
              <Inicio handleOrderPopup={handleOrderPopup} orderPopup={orderPopup} setOrderPopup={setOrderPopup}/>
            }/>
            <Route path="/tienda"   element={
              <Tienda handleOrderPopup={handleOrderPopup} orderPopup={orderPopup} setOrderPopup={setOrderPopup}/>
            }/>
            <Route path="/about"    element={<About />}    />
            <Route path="/carrito"  element={<Carrito />}  />
            <Route path="/login"    element={<Login />}    />
            <Route path="/register" element={<Register />} />

            {/* ── Resultados de pago MercadoPago ── */}
            <Route path="/pago/exito"     element={<PagoExito />} />
            <Route path="/pago/error"     element={<PagoError />} />
            <Route path="/pago/pendiente" element={<PagoError />} />

            {/* ── Mi cuenta (cualquier usuario logueado) ── */}
            <Route path="/mi-cuenta" element={
              <ProtectedRoute>
                <CompradorDashboard />
              </ProtectedRoute>
            }/>

            {/* ── Admin ── */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole={['admin', 'admin_complejo']}>
                <Dashboard />
              </ProtectedRoute>
            }/>

            {/* ── POS ── */}
            <Route path="/pos" element={
              <ProtectedRoute requiredRole={['admin', 'pos']}>
                <POSPage />
              </ProtectedRoute>
            }/>
            <Route path="/pos/reports" element={
              <ProtectedRoute requiredRole={['admin', 'pos']}>
                <POSReports />
              </ProtectedRoute>
            }/>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
    </DesignProvider>
  )
}

export default App
