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
import DoctorDashboard from './pages/dashboard/DoctorDashboard';
import PatientDashboard from './pages/dashboard/PatientDashboard';
import { Toaster } from './components/ui/sonner';
import { ThemeToggle } from './components/ThemeToggle';

function Navbar() {
  const { user, role, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="h-20 glass sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <Stethoscope size={22} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
              SMART<span className="text-blue-600">DOCTOR</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/doctors" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-bold uppercase tracking-widest">Find Doctors</Link>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>

            <ThemeToggle />

            {!loading && user ? (
              <div className="flex items-center space-x-4">
                <Link to={role === 'doctor' ? "/dashboard/doctor" : "/dashboard/patient"}>
                  <Button variant="outline" size="sm" className="font-bold gap-2 rounded-full px-5 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                    <LayoutDashboard size={16} className="text-blue-600" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all">
                  <LogOut size={18} />
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button size="lg" className="bg-blue-600 text-white font-black hover:bg-blue-700 shadow-xl shadow-blue-500/20 rounded-full h-11 px-8 uppercase tracking-widest text-[10px]">
                  Join Network
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 dark:text-slate-400 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 space-y-4 absolute w-full shadow-2xl animate-in slide-in-from-top duration-300">
          <Link to="/doctors" className="block text-slate-600 dark:text-slate-300 font-bold py-2 uppercase tracking-widest text-xs" onClick={() => setIsOpen(false)}>Find Doctors</Link>
          {!loading && user ? (
            <>
              <Link to={role === 'doctor' ? "/dashboard/doctor" : "/dashboard/patient"} className="block text-slate-600 dark:text-slate-300 font-bold py-2 uppercase tracking-widest text-xs" onClick={() => setIsOpen(false)}>Dashboard</Link>
              <Button variant="destructive" className="w-full justify-center gap-2 rounded-xl h-12 font-bold uppercase tracking-widest text-xs" onClick={handleLogout}>
                <LogOut size={16} />
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth" onClick={() => setIsOpen(false)}>
              <Button className="w-full bg-blue-600 h-12 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20">Sign In</Button>
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
