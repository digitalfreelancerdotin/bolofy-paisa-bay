import React from 'react';

const Footer = () => {
  return (
    <footer className="py-3 px-4 text-center flex-shrink-0 transition-colors duration-200"
      style={{
        backgroundColor: 'var(--color-bg-main)',
        borderTop: '1px solid var(--color-border)'
      }}>
      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
        © 2024 OpenEvents. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
