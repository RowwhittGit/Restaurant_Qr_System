import { Route, Routes } from 'react-router-dom'
import More from './pages/More'
// import Orders from './pages/Orders'
import HomePage from './pages/Home'
import CustomerOrder from './pages/CustomerOrderspage'
import AdminPage from './pages/AdminPage'
import KitchenPage from './pages/KitchenPage'
import AdminMenu from './pages/AdminMenu'
import AdminMenuCreate from './pages/CreateMenu'

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


      </Routes>
    </div>
  )
}

export default App
