import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import Dashboard from './Dashboard.js';
import CollectionPage from './CollectionPage';
import { SignUp } from './components/auth/SignUp.jsx';
import { SignIn } from './components/auth/SignIn.jsx';
import AuthDetails from './components/auth/AuthDetails.jsx';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

const App = () => {
  const [user, setUser] = React.useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/collection/:id" element={<CollectionPage />} />
          {user ? (
            <Route path="/profile" element={<AuthDetails />} />
          ) : (
            <Route path="/login" element={<SignIn />} />
          )}
          {!user && <Route path="/register" element={<SignUp />} />}
        </Routes>
      </div>
    </Router>
  );
};

export default App;