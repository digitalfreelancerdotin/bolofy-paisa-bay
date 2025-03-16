import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Calendar, FileText, ChevronDown, User, Settings, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authUtils } from './utils/auth';
import toast from 'react-hot-toast';

 const UserMenu = ({ isMobile = false, onClose }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const menuRef = useRef();  // Add ref for the menu

  const handleLogout = () => {
    authUtils.logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document
      .addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  const menuItems = [
    {
      type: 'user',
      content: {
        name: currentUser?.name || 'User',
        email: currentUser?.email || 'user@example.com',
      }
    },
    { type: 'divider' },
    { 
      icon: FileText, 
      label: 'My Policies', 
      description: 'View your active policies',
      onClick: () => navigate('/policies') 
    },
    { 
      icon: Calendar, 
      label: 'Financial Calendar', 
      description: 'Track important dates',
      onClick: () => navigate('/calendar') 
    },
    
    { type: 'divider' },
    { 
      icon: LogOut, 
      label: 'Logout', 
      description: 'Sign out of your account',
      onClick: handleLogout,
      danger: true
    }
  ];  
// Render for desktop
if (!isMobile) {
  return (
    <div className="relative"  ref={menuRef}>
     <motion.button
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 onClick={() => setIsOpen(!isOpen)}
 className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 
 rounded-lg text-black hover:shadow-lg transition-all duration-200"
>
 <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-black">
   <User className="w-5 h-5" />
 </div>
 <span className="font-medium">{currentUser?.name || 'User'}</span>
</motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 origin-top-right rounded-xl bg-black/90 shadow-lg border border-amber-500/20 backdrop-blur-sm z-50"
            >
            <div className="py-2">
              {menuItems.map((item, index) => renderMenuItem(item, index, () => setIsOpen(false)))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Render for mobile
return (
  <div className="py-2">
    {menuItems.map((item, index) => renderMenuItem(item, index, onClose))}
  </div>
);
};

// Separate function to render menu items to avoid code duplication
const renderMenuItem = (item, index, closeMenu) => {
if (item.type === 'divider') {
  return <div key={index} className="my-1 border-t border-amber-500/20" />;
}

if (item.type === 'user') {
  return (
      <div
          key={index}
          className="px-4 py-2  border-b border-amber-500/10 backdrop-blur-md">
          <p className="text-xs font-medium text-amber-200">
              {item.content.name}
          </p>
          <p className="text-[0.7rem] text-amber-200/70 truncate">
              {item.content.email}
          </p>
      </div>
  );
}

const Icon = item.icon;
return (
  <motion.button
    key={item.label}
    onClick={() => {
      item.onClick();
      closeMenu && closeMenu();
    }}
    className={`flex items-start gap-2 w-full px-3 py-1.5 rounded-lg text-xs hover:bg-amber-900/30 transition-colors
      ${item.danger ? ' text-red-400 hover:bg-red-900/20' : 'text-amber-100'}`}
    whileHover={{ x: 4 }}
    transition={{ type: "spring", stiffness: 400, damping: 20 }}
  >
    <Icon className={`w-4 h-4 mt-0.5 ${item.danger ? 'text-red-500' : 'text-amber-400'}`} />
    <div className="flex-1 text-left">
      <p className="text-sm font-medium">{item.label}</p>
      <p className={`text-[0.625rem] ${item.danger ? 'text-red-400' : 'text-amber-200/70'}`}>
        {item.description}
      </p>
    </div>
  </motion.button>
);
};

export default UserMenu;