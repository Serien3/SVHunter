import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppShell from './AppShell';
import PipelinePage from '../features/pipeline/PipelinePage';
import AlgorithmPage from '../features/algorithm/AlgorithmPage';
import ResultsPage from '../features/results/ResultsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/pipeline" replace /> },
      { path: 'pipeline', element: <PipelinePage /> },
      { path: 'algorithm', element: <AlgorithmPage /> },
      { path: 'results', element: <ResultsPage /> },
    ],
  },
]);
