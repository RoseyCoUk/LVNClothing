import React, { useState, useEffect } from 'react';

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  className = '',
  mobileClassName = '',
  tabletClassName = '',
  desktopClassName = '',
  breakpoint = 'md'
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Determine which class to use based on screen size
  const getResponsiveClass = () => {
    if (isMobile) return mobileClassName;
    if (isTablet) return tabletClassName;
    if (isDesktop) return desktopClassName;
    return className;
  };

  return (
    <div className={`${className} ${getResponsiveClass()}`}>
      {children}
    </div>
  );
};

export default ResponsiveWrapper;
