import { useState } from 'react'
import { Modal } from 'antd'

import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { Input, Form } from 'antd'

const ChangePasswordModal = ({
  isModalOpen,
  handleCancel,
  handleChangePassword,
  loading,
}) => {
  const [form] = Form.useForm()
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')

  const handleOk = () => {
    if (loading) return
    if (!oldPass.trim() || !newPass.trim())
      return alert('Vui lòng nhập đầy đủ thông tin')
    handleChangePassword(oldPass, newPass)
    form.resetFields()
  }

  const handleClose = () => {
    form.resetFields()
    handleCancel()
  }

  return (
    <Modal
      okText="Xác nhận"
      cancelText="Hủy"
      confirmLoading={loading}
      title="Đổi mật khẩu"
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleClose}
    >
      <Form
        form={form}
        name="dynamic_ruleEdit"
        onFinish={handleOk}
        layout="vertical"
      >
        <Form.Item
          name="oldPass"
          label="Mật khẩu cũ"
          rules={[{ required: true, message: 'Hãy nhập mật khẩu cũ!' }]}
        >
          <Input.Password
            className="w-full"
            value={oldPass}
            onChange={(e) => setOldPass(e.target.value)}
            placeholder="Nhập mật khẩu cũ"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>
        <Form.Item
          name="newPass"
          label="Mật khẩu mới"
          rules={[{ required: true, message: 'Hãy nhập mật khẩu mới!' }]}
        >
          <Input.Password
            className="w-full"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            placeholder="Nhập mật khẩu mới"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ChangePasswordModal
