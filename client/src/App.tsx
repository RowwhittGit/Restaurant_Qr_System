import { Route, Routes } from 'react-router-dom'
import More from './pages/More'
// import Orders from './pages/Orders'
import HomePage from './pages/Home'
import CustomerOrder from './pages/CustomerOrderspage'
import AdminPage from './pages/AdminPage'
import KitchenPage from './pages/KitchenPage'

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/more' element={<More />} />
        <Route path='/orders' element={<CustomerOrder />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  )
}

export default App
