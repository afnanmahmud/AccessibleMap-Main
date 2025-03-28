import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AccessibleMap from './components/AccessibleMap';
import UserProfile from './components/UserProfile';
import SignUpForm from './components/SignUpForm';
import LoginForm from './components/LoginForm';
// import Preferences from './components/Preferences'; // Placeholder component
// import Help from './components/Help'; // Placeholder component
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<AccessibleMap />} />
          <Route path="/map" element={<AccessibleMap />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/login" element={<LoginForm />} />
          {/* <Route path="/preferences" element={<Preferences />} />
          <Route path="/help" element={<Help />} /> */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;