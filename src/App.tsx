// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './components/theme/theme';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Dashboard from './pages/Dashboard';
import Collections from './pages/Collections';
import { useAuth } from './contexts/AuthContext';
import CreateCollection from './pages/CreateCollection';
import CollectionPhotos from './pages/CollectionPhotos';
import AddPhoto from './pages/AddPhoto';
import TeacherList from './pages/TeacherList';
import CreateTeacher from './pages/CreateTeacher';
import EditTeacher from './pages/EditTeacher';
import CreateParent from './pages/CreateParent';
import EditParent from './pages/EditParent';
import Parents from './pages/Parents';




// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/collections"
              element={
                <ProtectedRoute>
                  <Collections />
                </ProtectedRoute>
              }
            />
            <Route
              path="/collections/create"
              element={
                <ProtectedRoute>
                  <CreateCollection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/collections/:id/cards"
              element={
                <ProtectedRoute>
                  <CollectionPhotos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/collections/:id/photos/add"
              element={
                <ProtectedRoute>
                  <AddPhoto />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers"
              element={
                <ProtectedRoute>
                  <TeacherList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers/create"
              element={
                <ProtectedRoute>
                  <CreateTeacher />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers/:id/edit"
              element={
                <ProtectedRoute>
                  <EditTeacher />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parents"
              element={
                <ProtectedRoute>
                  <Parents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parents/create"
              element={
                <ProtectedRoute>
                  <CreateParent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parents/:id/edit"
              element={
                <ProtectedRoute>
                  <EditParent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;