import MisaDataTransformer from './MisaTransformer'
import Home from './App'
import Login from './Login'
import { Navigate, Routes, Route, BrowserRouter } from 'react-router'
import PrivateRoute from '../privateRoute'
import { useZustand } from '../zustand'
import Loading from '../widgets/loading'
import { useState, useEffect } from 'react'
import app from '../axiosConfig'
import Company from './Outlets/Company'
import User from './Outlets/User'
import Bank from './Outlets/Bank'
import BankAccount from './Outlets/BankAccount'
import Indenture from './Outlets/Indenture'

const Main = () => {
  const { auth, setAuth } = useZustand()
  const [checkingAuth, setCheckingAuth] = useState(false)

  const checkAuth = async () => {
    try {
      setCheckingAuth(true)
      const {
        data: { data },
      } = await app.get('/api/check-auth')
      if (data) {
        setAuth(data)
      }
    } catch (error) {
      if (error?.response?.data?.noCookies) return
      alert(error?.response?.data?.msg || error)
    } finally {
      setCheckingAuth(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  if (checkingAuth) return <Loading />

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<User />} />
          <Route path="company" element={<Company />} />
          <Route path="bank" element={<Bank />} />
          <Route path="bank-account" element={<BankAccount />} />
          <Route path="indenture" element={<Indenture />} />
        </Route>
        <Route path="/login" element={auth ? <Navigate to="/" /> : <Login />} />
        <Route
          path="/misa-data-transformer"
          element={<MisaDataTransformer />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default Main
