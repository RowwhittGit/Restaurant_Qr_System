import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import More from './pages/More'
import Orders from './pages/Orders'
import Testing from './pages/Test'

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/more' element={<More />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/test' element={<Testing />} />

      </Routes>
    </div>
  )
}

export default App
