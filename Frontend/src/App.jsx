import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppShell } from './components/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingScreen } from './components/LoadingScreen';
import { useTheme } from './context/ThemeContext';

const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const ReservationsPage = lazy(() => import('./pages/ReservationsPage').then((module) => ({ default: module.ReservationsPage })));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));

function RouteTransition({ children }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.22 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function ThemeHotkeyListener() {
  const { toggleTheme } = useTheme();

  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
      }

      if (event.key.toLowerCase() === 't' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const activeElement = document.activeElement;
        const isTyping = activeElement && ['INPUT', 'TEXTAREA'].includes(activeElement.tagName);

        if (!isTyping) {
          toggleTheme();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme]);

  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeHotkeyListener />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <RouteTransition>
                  <DashboardPage />
                </RouteTransition>
              }
            />
            <Route
              path="reservations"
              element={
                <RouteTransition>
                  <ReservationsPage />
                </RouteTransition>
              }
            />
            <Route
              path="customers"
              element={
                <RouteTransition>
                  <CustomersPage />
                </RouteTransition>
              }
            />
            <Route
              path="services"
              element={
                <RouteTransition>
                  <ServicesPage />
                </RouteTransition>
              }
            />
            <Route
              path="reports"
              element={
                <RouteTransition>
                  <ReportsPage />
                </RouteTransition>
              }
            />
            <Route
              path="users"
              element={
                <RouteTransition>
                  <UsersPage />
                </RouteTransition>
              }
            />
            <Route
              path="calendar"
              element={
                <RouteTransition>
                  <CalendarPage />
                </RouteTransition>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}