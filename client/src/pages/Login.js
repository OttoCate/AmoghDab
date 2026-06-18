import React, { useState } from 'react'
import { Button, Form, Input } from 'antd'
import enLogo from '../images/logo.png'
import { useNavigate } from 'react-router'
import app from '../axiosConfig'
import { useZustand } from '../zustand'
import { getErrorMessage } from '../functions/getErrorMessage'

const Login = () => {
  const { setAuth } = useZustand()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values) => {
    try {
      const { username, password } = values
      if (loading) return
      setLoading(true)

      const {
        data: { data },
      } = await app.post('/api/login', {
        username,
        password,
      })

      setAuth(data)
      navigate('/')
    } catch (error) {
      const msg = getErrorMessage(error?.response?.data?.msg)
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleClickToMisaDataTransformer = () => {
    window.open('/misa-data-transformer', '_blank')
  }

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <img alt="logo" src={enLogo} style={{ height: 130, marginBottom: 10 }} />
      <Form
        name="basic"
        layout="vertical"
        style={{ width: 300 }}
        onFinish={onFinish}
      >
        <Form.Item
          label="Tên đăng nhập"
          name="username"
          style={{ fontSize: 14 }}
          rules={[{ required: true, message: 'Hãy nhập tên đăng nhập!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          style={{ fontSize: 14 }}
          rules={[{ required: true, message: 'Hãy nhập mật khẩu!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item label={null} style={{ marginBottom: 15 }}>
          <Button
            type="primary"
            disabled={loading}
            htmlType="submit"
            style={{ width: '100%', marginTop: 10 }}
          >
            Đăng nhập
          </Button>
        </Form.Item>
        <Button
          type="link"
          style={{ width: '100%' }}
          disabled={loading}
          onClick={handleClickToMisaDataTransformer}
        >
          Truy cập trang chuyển đổi dữ liệu MISA
        </Button>
      </Form>
    </div>
  )
}

export default Login
