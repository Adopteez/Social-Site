import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
// Importér evt. flere sider efter behov

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }
  return user ? children : <Navigate to="/landing" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }
  return !user ? children : <Navigate to="/home" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Offentlig forside (Landing) */}
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />

          {/* Eksempel på beskyttet side */}
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Layout>
                  <div className="text-xl font-bold text-center mt-20">Velkommen til medlemssiden!</div>
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Hvis du har flere sider, indsæt dem her */}
          {/* ... */}

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/landing" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
