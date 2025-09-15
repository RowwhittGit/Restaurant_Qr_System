import { Route, Routes } from 'react-router-dom'

import CustomerOrder from './pages/customer/CustomerOrderspage'
import AdminPage from './pages/admin/AdminPage'
import KitchenPage from './pages/kitchen/KitchenPage'
import AdminMenu from './pages/admin/AdminMenu'
import AdminMenuCreate from './pages/admin/CreateMenu'
import AdminMenuUpdate from './pages/admin/AdminEditMenu'
import HomePage from './pages/customer/Home'
// import More from './pages/customer/More'
import AdminKitchen from './pages/admin/AdminKitchen'
import Chart from './pages/admin/Chart'
import LocationCheck from './pages/admin/LocationCheck'
import Chart2 from './pages/admin/Chart2'
import Chart3 from './pages/admin/Chart3'
import Login from './pages/Login'
import GoToRestaurant from './pages/GoToRestaurant'


function App() {
  return (
    <div>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<HomePage />} />
        <Route path='/more' element={<LocationCheck />} />
        <Route path='/orders' element={<CustomerOrder />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/menu" element={<AdminMenu />} />
        <Route path="/admin/menu/create" element={<AdminMenuCreate />} />
        <Route path="/admin/menu/update/:id" element={<AdminMenuUpdate />} />
        <Route path='/admin/kitchen' element={<AdminKitchen />} />
        <Route path='/admin/chart' element={<Chart />} />
        <Route path='/admin/chart/2' element={<Chart2 />} />
        <Route path='/admin/chart/3' element={<Chart3 />} />
        <Route path='/error' element={<GoToRestaurant />} />

      </Routes>
    </div>
  )
}

export default App
