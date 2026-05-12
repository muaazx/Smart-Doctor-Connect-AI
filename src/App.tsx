import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Button } from './components/ui/button';
import { Heart, Search, User, Menu, X, LogOut, LayoutDashboard, Stethoscope } from 'lucide-react';
import { logout } from './lib/firebase';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import DoctorProfile from './pages/DoctorProfile';
import Auth from './pages/Auth';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import { Toaster } from './components/ui/sonner';

function Navbar() {
  const { user, role, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="h-16 bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-sm">
              <Stethoscope size={18} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              SMART<span className="text-blue-600">DOCTOR</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/doctors" className="text-slate-500 hover:text-blue-600 transition-colors text-sm font-semibold">Find Doctors</Link>
            {!loading && user ? (
              <div className="flex items-center space-x-4">
                <Link to={role === 'doctor' ? "/dashboard/doctor" : "/dashboard/patient"}>
                  <Button variant="ghost" size="sm" className="text-slate-600 font-semibold gap-2 border border-slate-200 shadow-sm">
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-400 hover:text-red-600 transition-colors">
                  <LogOut size={16} />
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-sm rounded-md h-9 px-5">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-3 absolute w-full shadow-lg">
          <Link to="/doctors" className="block text-slate-600 font-semibold py-2" onClick={() => setIsOpen(false)}>Find Doctors</Link>
          {!loading && user ? (
            <>
              <Link to={role === 'doctor' ? "/dashboard/doctor" : "/dashboard/patient"} className="block text-slate-600 font-semibold py-2" onClick={() => setIsOpen(false)}>Dashboard</Link>
              <Button variant="outline" className="w-full justify-start gap-2 border-slate-200" onClick={handleLogout}>
                <LogOut size={16} />
                Logout
              </Button>
            </>
          ) : (
            <Link to="/auth" onClick={() => setIsOpen(false)}>
              <Button className="w-full bg-blue-600">Sign In</Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Toaster position="top-right" closeButton richColors />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<SearchResults />} />
            <Route path="/doctor/:id" element={<DoctorProfile />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
            <Route path="/dashboard/patient" element={<PatientDashboard />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
