import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hourglass, Menu, X } from 'lucide-react';
import { authUtils } from './utils/auth';
import UserMenu from './UserMenu';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Navbar */}
      <nav className="px-4 py-3 md:px-6 transition-colors duration-200"
        style={{
          backgroundColor: 'var(--color-bg-main)',
          borderBottom: '1px solid var(--color-border)'
        }}>
        <div className="flex items-center justify-between">
          {/* Mobile/Tablet Hamburger Menu + Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Button - Only visible on mobile/tablet */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg transition-colors duration-200"
              style={{
                color: 'var(--color-text-primary)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Logo */}
            <Link to='/' className="flex items-center gap-2">
              <Hourglass className="h-6 w-6 md:h-8 md:w-8" style={{ color: 'var(--color-text-primary)' }} />
              <span className="text-xl md:text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>OpenEvents</span>
              <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full"
                style={{
                  backgroundColor: 'var(--color-button-primary-bg)',
                  color: 'var(--color-button-primary-text)'
                }}>
                BETA
              </span>
            </Link>
          </div>

          {/* Theme Toggle + Login Button / User Menu */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {authUtils.isAuthenticated() ? (
              <UserMenu />
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="px-4 py-2 md:px-6 md:py-2 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: 'var(--color-button-primary-bg)',
                  color: 'var(--color-button-primary-text)'
                }}
              >
                Login
              </motion.button>
            )}
          </div>
        </div>
      </nav>


    </>
  );
};

export default Navbar;
