import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './com/Login.jsx';
import Register from './com/Register.jsx';
import PortfolioTable from './com/PortfolioTable.jsx';
import Dashboard from './com/Dashboard.jsx';
import Admin from './com/Admin.jsx';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Register />} />
      <Route path="/pro" element={<PortfolioTable />} />
      <Route path="/dashborad" element={<Dashboard />} />
      <Route path="/admin" element={<Admin/>} />
    </Routes>
  );
}

export default App;
