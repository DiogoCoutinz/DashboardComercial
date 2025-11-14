import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Comerciais from './pages/Comerciais'
import Canais from './pages/Canais'
import Funil from './pages/Funil'
import PPF from './pages/PPF'
import MF from './pages/MF'
import GrowthKPIs from './pages/GrowthKPIs'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/comerciais" element={<Comerciais />} />
          <Route path="/canais" element={<Canais />} />
          <Route path="/funil" element={<Funil />} />
          <Route path="/ppf" element={<PPF />} />
          <Route path="/mf" element={<MF />} />
          <Route path="/growth" element={<GrowthKPIs />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

