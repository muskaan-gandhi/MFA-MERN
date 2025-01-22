import { Navigate, Route, Routes } from "react-router-dom"
import { useEffect } from "react"

import FloatingShapes from "./components/floatingShapes"
import SignUpPage from "./pages/SignUpPage"
import LogInPage from "./pages/LogInPage"
import EmailVerificationPage from "./pages/EmailVerificationPage"
import { useAuthStore } from "./store/authStore"
import HomePage from "./pages/HomePage"
import Loading from "./pages/Loading"
import ForgotPassPage from "./pages/ForgotPassPage"
import ResetPassPage from "./pages/ResetPassPage"

// protect route that require auth
const ProtectedRoute = ({children}) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated){
    return <Navigate to="/login" replace />
  }
  if (!user.isVerified){
    return <Navigate to="/verify-email" replace />
  }
  return children
}

//redirect existing user back to the homepage and not allow access the login/signup page
const RedirectAuthenticatedUser = ({children}) => {
  const {isAuthenticated, user} = useAuthStore()

  if(isAuthenticated && user.isVerified){
    return <Navigate to= "/" replace />
  }
  return children
}

function App() {
  const {isCheckingAuth, checkAuth} = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if(isCheckingAuth) return <Loading/>

  return (
    <div className='min-h-screen bg-gradient-to-br
    from-gray-900 via-green-900 to-emerald-900 flex 
    items-center justify-center relative overflow-hidden'>
      <FloatingShapes color="bg-green-500" size="w-64 h-64" top="-5%" left="10%" delay={0} />
      <FloatingShapes color="bg-emerald-500" size="w-48 h-48" top="70%" left="88%" delay={5} />
      <FloatingShapes color="bg-lime-500" size="w-32 h-32" top="40%" left="-10%" delay={2} />

      <Routes>
        <Route path='/' element={<ProtectedRoute><HomePage/></ProtectedRoute>}/>
        <Route path='/signup' element={
          <RedirectAuthenticatedUser>
            <SignUpPage/>
          </RedirectAuthenticatedUser>
        }/>
        <Route path='/login' element={
          <RedirectAuthenticatedUser>
          <LogInPage/>
        </RedirectAuthenticatedUser>
        }/>
        <Route path='/verify-email' element={<EmailVerificationPage/>}/>
        <Route path='/forgot-password' element={
          <RedirectAuthenticatedUser>
            <ForgotPassPage/>
          </RedirectAuthenticatedUser>
        }/>
        <Route path='/reset-password/:token' element={
          <RedirectAuthenticatedUser>
            <ResetPassPage/>
          </RedirectAuthenticatedUser>
        }/>
        <Route path="*" element={<Navigate to = "/"/>} />
      </Routes>
    </div>
  )
}

export default App
