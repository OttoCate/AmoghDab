import React from 'react'
import { Button, Form, Input } from 'antd'
import enLogo from '../images/logo.png'

const onFinish = (values) => {
  console.log('Success:', values)
}
const onFinishFailed = (errorInfo) => {
  console.log('Failed:', errorInfo)
}
const Login = () => (
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
      onFinishFailed={onFinishFailed}
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

      <Form.Item label={null}>
        <Button
          type="primary"
          htmlType="submit"
          style={{ width: '100%', marginTop: 10 }}
        >
          Đăng nhập
        </Button>
      </Form.Item>
    </Form>
  </div>
)

export default Login
