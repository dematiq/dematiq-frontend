import { Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from '../components/layout/PublicLayout'
import AdminLayout from '../components/layout/AdminLayout'
import ProtectedRoute from './ProtectedRoute'
import Products from '../pages/public/Products'
import ProductDetail from '../pages/public/ProductDetail'
import Cart from '../pages/public/Cart'
import Quote from '../pages/public/Quote'
import Checkout from '../pages/public/Checkout'
import Login from '../pages/public/Login'
import Register from '../pages/public/Register'
import VerifyEmail from '../pages/public/VerifyEmail'
import Contact from '../pages/public/Contact'
import Profile from '../pages/public/Profile'
import PaymentSuccess from '../pages/public/PaymentSuccess'
import Brands from '../pages/public/Brands'
import Dashboard from '../pages/admin/Dashboard'
import ProductsAdmin from '../pages/admin/ProductsAdmin'
import CategoriesAdmin from '../pages/admin/CategoriesAdmin'
import Orders from '../pages/admin/Orders'
import Users from '../pages/admin/Users'
import BrandsAdmin from '../pages/admin/BrandsAdmin'
import Settings from '../pages/admin/Settings'


function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Products />} />
        <Route path="/inicio" element={<Navigate to="/" replace />} />
        <Route path="/productos" element={<Navigate to="/" replace />} />
        <Route path="/productos/:id" element={<ProductDetail />} />
        <Route path="/cotizar" element={<Quote />} />
        <Route path="/carrito" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/iniciar-sesion" element={<Login />} />
        <Route path="/registrarse" element={<Register />} />
        <Route path="/verificar-email" element={<VerifyEmail />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="/marcas" element={<Brands />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/pago-exitoso" element={<PaymentSuccess />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/productos" element={<ProductsAdmin />} />
          <Route path="/admin/categorias" element={<CategoriesAdmin />} />
          <Route path="/admin/ordenes" element={<Orders />} />
          <Route path="/admin/usuarios" element={<Users />} />
          <Route path="/admin/marcas" element={<BrandsAdmin />} />
          <Route path="/admin/configuracion" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default AppRouter
