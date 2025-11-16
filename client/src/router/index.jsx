import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Layout from '../layouts/Layout';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import FarmerDashboard from '../pages/FarmerDashboard';
import FarmerProfile from '../pages/FarmerProfile';
import AddAnimal from '../pages/AddAnimal';
import AnimalsPage from '../pages/AnimalsPage';
import VetDashboard from '../pages/VetDashboard';
import LabDashboard from '../pages/LabDashboard';
import RegulatorDashboard from '../pages/RegulatorDashboard';
import AlertsPage from '../pages/AlertsPage';
import QRVerifyPage from '../pages/QRVerifyPage';
import ConsultationRequestPage from '../pages/ConsultationRequestPage';
import VetConsultationPage from '../pages/VetConsultationPage';
import FarmerConsultationPage from '../pages/FarmerConsultationPage';
import ConsultationChatPage from '../pages/ConsultationChatPage';
import ConsultationVideoPage from '../pages/ConsultationVideoPage';
import AddTreatment from '../pages/AddTreatment';
import MRLUsageOverview from '../pages/MRLUsageOverview';
import ScanQRAddAnimal from '../pages/ScanQRAddAnimal';
import VetProfile from '../pages/VetProfile';
import VetPrescriptionPage from '../pages/VetPrescriptionPage';
import TreatmentHistory from '../pages/TreatmentHistory';
import { useAuth } from '../context/AuthContext';

// Dashboard Redirect Component
const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect based on user role
  switch (user.role) {
    case 'regulator':
      return <Navigate to="/dashboard/regulator" replace />;
    case 'vet':
      return <Navigate to="/dashboard/vet" replace />;
    case 'lab':
      return <Navigate to="/dashboard/lab" replace />;
    case 'farmer':
    default:
      return <Navigate to="/dashboard/farmer" replace />;
  }
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Create router inside a component that has access to AuthProvider
const RouterContent = () => {
  const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardRedirect />,
      },
      {
        path: 'farmer',
        element: (
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farmer/profile',
        element: (
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farmer/animals',
        element: (
          <ProtectedRoute allowedRoles={['farmer']}>
            <AnimalsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farmer/animals/add',
        element: (
          <ProtectedRoute allowedRoles={['farmer']}>
            <AddAnimal />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farmer/scan-qr',
        element: (
          <ProtectedRoute allowedRoles={['farmer']}>
            <ScanQRAddAnimal />
          </ProtectedRoute>
        ),
      },
      {
        path: 'vet',
        element: (
          <ProtectedRoute allowedRoles={['vet']}>
            <VetDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'vet/profile',
        element: (
          <ProtectedRoute allowedRoles={['vet']}>
            <VetProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'lab',
        element: (
          <ProtectedRoute allowedRoles={['lab']}>
            <LabDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'regulator',
        element: (
          <ProtectedRoute allowedRoles={['regulator']}>
            <RegulatorDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'alerts',
        element: <AlertsPage />,
      },
      {
        path: 'consultation/request',
        element: (
          <ProtectedRoute allowedRoles={['farmer']}>
            <ConsultationRequestPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'consultation/vet',
        element: (
          <ProtectedRoute allowedRoles={['vet']}>
            <VetConsultationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'consultation/farmer',
        element: (
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerConsultationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'consultation/:id/chat',
        element: (
          <ProtectedRoute allowedRoles={['farmer', 'vet']}>
            <ConsultationChatPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'consultation/:id/video',
        element: (
          <ProtectedRoute allowedRoles={['farmer', 'vet']}>
            <ConsultationVideoPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'treatment/add',
        element: (
          <ProtectedRoute allowedRoles={['farmer', 'vet']}>
            <AddTreatment />
          </ProtectedRoute>
        ),
      },
      {
        path: 'treatment/history',
        element: (
          <ProtectedRoute allowedRoles={['farmer', 'vet']}>
            <TreatmentHistory />
          </ProtectedRoute>
        ),
      },
      {
        path: 'vet/prescription',
        element: (
          <ProtectedRoute allowedRoles={['vet']}>
            <VetPrescriptionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'mrl-usage',
        element: (
          <ProtectedRoute allowedRoles={['farmer']}>
            <MRLUsageOverview />
          </ProtectedRoute>
        ),
      },
      ],
    },
    {
      path: '/verify/:hash',
      element: <QRVerifyPage />,
    },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
  );

  return <RouterProvider router={router} />;
};

export { RouterContent };

