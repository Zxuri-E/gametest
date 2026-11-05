import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useProjectStore } from '../../store/useProjectStore';

export const AppShell: React.FC = () => {
  const { fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas-950 font-sans text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-canvas-950 bg-grid-pattern">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

