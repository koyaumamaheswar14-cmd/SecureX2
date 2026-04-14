import { Link, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, Search, Bell, BookOpen, LogOut, Menu, X, Terminal } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../firebase/auth';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Scanner', path: '/scanner', icon: Search },
    { name: 'Intelligence', path: '/intelligence', icon: Terminal },
    { name: 'Alerts', path: '/alerts', icon: Bell },
    { name: 'Awareness', path: '/awareness', icon: BookOpen },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <Shield className="w-8 h-8 text-accent-cyan group-hover:scale-110 transition-transform" />
            <span className="text-xl font-display font-bold tracking-tighter text-text-primary">
              SECURE<span className="text-accent-cyan">X</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent-cyan transition-colors"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-medium text-accent-red hover:opacity-80 transition-opacity"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="px-6 py-2 bg-accent-cyan text-bg-primary font-bold rounded-full hover:glow-cyan transition-all"
              >
                Get Protected
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-text-muted hover:text-accent-cyan transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-bg-secondary border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {user ? (
                <>
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 text-lg font-medium text-text-muted hover:text-accent-cyan transition-colors"
                    >
                      <link.icon className="w-5 h-5" />
                      {link.name}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 text-lg font-medium text-accent-red w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-3 bg-accent-cyan text-bg-primary font-bold rounded-xl text-center"
                >
                  Get Protected
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
