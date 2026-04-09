import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomeFeedPage from './pages/HomeFeedPage';
import PostDetailsPage from './pages/PostDetailsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SavedPostsPage from './pages/SavedPostsPage';
import { AuthContext } from './context/AuthContext';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = React.useContext(AuthContext);
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  const { currentUser } = React.useContext(AuthContext);

  return (
    <BrowserRouter>
      <div className="app-container">
        {currentUser && <Navbar />}
        <main className="main-content" style={{ marginTop: currentUser ? '70px' : '0' }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <HomeFeedPage />
              </ProtectedRoute>
            } />
            <Route path="/post/:id" element={
              <ProtectedRoute>
                <PostDetailsPage />
              </ProtectedRoute>
            } />
            <Route path="/profile/:id" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/saved" element={
              <ProtectedRoute>
                <SavedPostsPage />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
