import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RoleSelection from './pages/RoleSelection';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import BoMList from './pages/BoMList';
import BoMEditor from './pages/BoMEditor';
import BoMCompare from './pages/BoMCompare';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/bom" element={<Layout><BoMList /></Layout>} />
        <Route path="/bom/edit/:productId/:bomId?" element={<Layout><BoMEditor /></Layout>} />
        <Route path="/bom/compare/:bomId" element={<Layout><BoMCompare /></Layout>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
