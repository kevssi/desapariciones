import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBreadcrumb } from '../context/BreadcrumbContext';
import './Breadcrumb.css';

export const Breadcrumb = () => {
  const { crumbs } = useBreadcrumb();
  const location = useLocation();

  // No mostrar en login/register
  if (['/login', '/register'].includes(location.pathname)) return null;
  // No mostrar si solo hay "Inicio"
  if (crumbs.length <= 1) return null;

  return (
    <nav className="breadcrumb-bar" aria-label="Breadcrumb">
      <div className="breadcrumb-container">
        <ol className="breadcrumb-list">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <li key={index} className="breadcrumb-item">
                {!isLast ? (
                  <>
                    <Link to={crumb.path} className="breadcrumb-link">
                      {crumb.label}
                    </Link>
                    <span className="breadcrumb-sep" aria-hidden="true">›</span>
                  </>
                ) : (
                  <span className="breadcrumb-current">
                    {crumb.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
