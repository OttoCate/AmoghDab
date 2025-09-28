import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import MisaDataTransformer from './MisaTransformer'
import Home from './App'
import Login from './Login'

const router = createBrowserRouter([
  {
    path: '/misa-data-transformer',
    element: <MisaDataTransformer />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <Home />,
  },
])

const Main = () => {
  return <RouterProvider router={router} />
}

export default Main
