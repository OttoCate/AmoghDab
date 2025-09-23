import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import App from './MisaTransformer'
import Login from './Login'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/login',
    element: <Login />,
  },
])

const Main = () => {
  return <RouterProvider router={router} />
}

export default Main
