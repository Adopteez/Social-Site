import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import InstallPrompt from './components/InstallPrompt';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import GroupMembership from './pages/GroupMembership';
import Messages from './pages/Messages';
import Events from './pages/Events';
import AdminDashboard from './pages/AdminDashboard';
import AdminMembers from './pages/AdminMembers';
import AdminReports from './pages/AdminReports';
import AdminExclusions from './pages/AdminExclusions';
import AdminGroups from './pages/AdminGroups';
import AdminBlog from './pages/AdminBlog';
import AdminBlogEditor from './pages/AdminBlogEditor';
import AdminFeedback from './pages/AdminFeedback';
import AdminPayments from './pages/AdminPayments';
import PartnerGroupAdmin from './pages/PartnerGroupAdmin';
import Landing from './pages/Landing';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Pricing from './pages/Pricing';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import './i18n/config';

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
        <InstallPrompt />
        <Routes>
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success" element={<Success />} />
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Layout>
                  <Home />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Layout>
                  <Profile />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/groups"
            element={
              <PrivateRoute>
                <Layout>
                  <Groups />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/groups/:groupId/membership"
            element={
              <PrivateRoute>
                <Layout>
                  <GroupMembership />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/groups/:groupId"
            element={
              <PrivateRoute>
                <Layout>
                  <GroupDetail />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/groups/:groupId/admin"
            element={
              <PrivateRoute>
                <Layout>
                  <PartnerGroupAdmin />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <Layout>
                  <Messages />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/events"
            element={
              <PrivateRoute>
                <Layout>
                  <Events />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/members"
            element={
              <PrivateRoute>
                <Layout>
                  <AdminMembers />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <PrivateRoute>
                <Layout>
                  <AdminReports />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/exclusions"
            element={
              <PrivateRoute>
                <Layout>
                  <AdminExclusions />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/groups"
            element={
              <PrivateRoute>
                <Layout>
                  <AdminGroups />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/blog"
            element={
              <PrivateRoute>
                <Layout>
                  <AdminBlog />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/blog/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <AdminBlogEditor />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/feedback"
            element={
              <PrivateRoute>
                <Layout>
                  <AdminFeedback />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <PrivateRoute>
                <Layout>
                  <AdminPayments />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/landing" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
