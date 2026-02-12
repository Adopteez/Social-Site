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
          {/* Forside i Layout */}
          <Route path="/" element={<Layout><Landing /></Layout>} />
          <Route path="/landing" element={<Layout><Landing /></Layout>} />

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

          {/* Flere sider kan tilføjes her */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

