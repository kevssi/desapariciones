import React, { createContext, useState, useContext, useCallback } from 'react';

const BreadcrumbContext = createContext(null);

export const BreadcrumbProvider = ({ children }) => {
  const [crumbs, setCrumbs] = useState([{ label: 'Inicio', path: '/' }]);

  const setBreadcrumb = useCallback((items) => {
    // Siempre empieza con Inicio
    const full = [{ label: 'Inicio', path: '/' }, ...items];
    setCrumbs(full);
  }, []);

  const resetBreadcrumb = useCallback(() => {
    setCrumbs([{ label: 'Inicio', path: '/' }]);
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ crumbs, setBreadcrumb, resetBreadcrumb }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumb = () => {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) throw new Error('useBreadcrumb must be used within BreadcrumbProvider');
  return ctx;
};
