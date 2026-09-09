import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import UserLogin from './pages/UserLogin.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import UserDashboard from './pages/UserDashboard.jsx'

import Home from './pages/admin/Home.jsx'
import CreateUser from './pages/admin/CreateUser.jsx'
import ManageAccounts from './pages/admin/ManageAccounts.jsx'
import FileDetails from './pages/admin/FileDetails.jsx'
import ReportDetails from './pages/admin/ReportDetails.jsx'

import UserHome from './pages/user/Home.jsx'
import ShareFile from './pages/user/ShareFile.jsx'
import Library from './pages/user/Library.jsx'
import Profile from './pages/user/Profile.jsx'
import SubjectFiles from './pages/user/SubjectFiles.jsx'

import ProtectedRoute from './components/ProtectedRoutes.jsx'

function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        <Route path="/UserDashboard" element={
          <ProtectedRoute role = "user">
            <UserDashboard />
          </ProtectedRoute>
        }>
          <Route index element={<UserHome />} />
          <Route path="subject/:subjectCode" element={<SubjectFiles />} />
          <Route path="share" element={<ShareFile />} />
          <Route path="library" element={<Library />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="/AdminDashboard" element={
          <ProtectedRoute role = "admin">
            <AdminDashboard />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
          <Route path="create" element={<CreateUser />} />
          <Route path="manage" element={<ManageAccounts />} />
          <Route path="files" element={<FileDetails />} />
          <Route path="reports" element={<ReportDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App