import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthGuard } from './components/AuthGuard';
import { Login } from './screens/Login';
import { SignUp } from './screens/Register';
import { Home } from './screens/Home';
import Equipment from './screens/Equipment';
import Users from './screens/ManageUsers';
import { BorrowEquipment } from './screens/BorrowEquipment';
import PendingRegistrations from './screens/PendingRegistrations';
import BorrowRequests from './screens/BorrowRequests';
import History from './screens/History';
import { ReturnEquipment } from './screens/ReturnEquipment';

function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <Router>
          <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route 
            path="/login" 
            element={
              <AuthGuard>
                <Login />
              </AuthGuard>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <AuthGuard>
                <SignUp />
              </AuthGuard>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/equipment"
            element={
              <ProtectedRoute>
                <Equipment />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/borrow"
            element={
              <ProtectedRoute>
                <BorrowEquipment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/borrow-requests"
            element={
              <ProtectedRoute>
                <BorrowRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pending-registrations"
            element={
              <ProtectedRoute>
                <PendingRegistrations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/return-equipment"
            element={
              <ProtectedRoute>
                <ReturnEquipment />
              </ProtectedRoute>
            }
          />
        </Routes>
        </Router>
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;