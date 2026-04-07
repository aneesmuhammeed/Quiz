import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ExamApp from './ExamApp';
import AdminDashboard from './AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ExamApp />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
