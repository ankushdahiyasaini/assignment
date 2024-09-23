import React, { useContext, useEffect } from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import { AuthContext } from './context/AuthContext';
import Users from './components/dashboard/admin/Users';
import Groups from './components/groups/Groups';
import GroupChat from './components/groups/GroupChat';

function App() {
  const { user, login } = useContext(AuthContext);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await login(token);
        } catch (error) {
          console.error('Authentication check failed', error);
        }
      }
    };

    checkAuth();
  }, []);

  return (
    <Router>
      <Box
        className="App"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
        }}
      >
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 2,
            overflowY: 'auto', 
          }}
        >
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />}>
              <Route path="groups" element={<Groups />} />
              <Route path="/group-chat/:groupId" element={<GroupChat />} />
              <Route path="users" element={<Users />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Route>
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
