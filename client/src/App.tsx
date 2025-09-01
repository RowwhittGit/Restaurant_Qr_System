import { Route, Routes } from 'react-router-dom'

import CustomerOrder from './pages/customer/CustomerOrderspage'
import AdminPage from './pages/admin/AdminPage'
import KitchenPage from './pages/kitchen/KitchenPage'
import AdminMenu from './pages/admin/AdminMenu'
import AdminMenuCreate from './pages/admin/CreateMenu'
import AdminMenuUpdate from './pages/admin/AdminEditMenu'
import HomePage from './pages/customer/Home'
import More from './pages/customer/More'
import AdminKitchen from './pages/admin/AdminKitchen'


function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/more' element={<More />} />
        <Route path='/orders' element={<CustomerOrder />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/menu" element={<AdminMenu />} />
        <Route path="/admin/menu/create" element={<AdminMenuCreate />} />
        <Route path="/admin/menu/update/:id" element={<AdminMenuUpdate />} />
        <Route path='/admin/kitchen' element={<AdminKitchen />} />


      </Routes>
    </div>
  )
}

export default App
