
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login'
import Chat from './Chat'
import Admin from './Admin'
import Staff from './Staff'
import UserList from './UserList'
import UserCreate from './UserCreate'
import UserEdit from './UserEdit'
import SessionManage from './SessionManage'
import Register from './Register'

// Check login status and role permissions
function ProtectedRoute({ allowedRoles, children }) {
  const token = localStorage.getItem('access_token')
  const role = localStorage.getItem('role')

  if (!token) {
    return <Navigate to="/" replace />
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<Login />} />
          {/*Registration Page*/}
        <Route path="/register" element={<Register />} />
        {/* Customer Chat Page */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <Chat />
            </ProtectedRoute>
          }
        />

        {/* customer_service workspace */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['customer_service']}>
              <Staff />
            </ProtectedRoute>
          }
        />

        {/* Admin background */}
          {/* Admin Home */}
        <Route
            path="/admin"
            element={
            <ProtectedRoute allowedRoles={['admin']}>
            <Admin />
            </ProtectedRoute>
            }
        />


        {/* User List Page */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserList />
            </ProtectedRoute>
          }
        />

        {/* Create User Page */}
        <Route
          path="/admin/users/create"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserCreate />
            </ProtectedRoute>
          }
        />

        {/* Edit User Page */}
        <Route
          path="/admin/users/:userId/edit"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserEdit />
            </ProtectedRoute>
          }
        />

          {/*Session Management Page*/}
          <Route
            path="/admin/sessions"
            element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <SessionManage />
                </ProtectedRoute>
            }
          />


        {/* Unknown Path */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App