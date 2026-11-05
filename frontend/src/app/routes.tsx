import React from 'react';
import { RouteObject } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { DashboardPage } from '../features/dashboard';
import { GameStudioPage } from '../features/game-studio';
import { GameWorkspacePage } from '../features/game-preview';
import { TestingCenterPage } from '../features/testing';
import { BugReportsPage } from '../features/bug-reports';
import { ProjectHistoryPage } from '../features/project-history';
import { SettingsPage } from '../features/settings';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'studio',
        element: <GameStudioPage />,
      },
      {
        path: 'workspace',
        element: <GameWorkspacePage />,
      },
      {
        path: 'testing',
        element: <TestingCenterPage />,
      },
      {
        path: 'bugs',
        element: <BugReportsPage />,
      },
      {
        path: 'history',
        element: <ProjectHistoryPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
];

