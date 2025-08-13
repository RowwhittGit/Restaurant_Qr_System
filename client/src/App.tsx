import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import More from './pages/More'

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/more' element={<More />} />
      </Routes>
    </div>
  )
}

export default App
