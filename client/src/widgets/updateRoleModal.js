import { useEffect, useState } from 'react'
import { Modal } from 'antd'
import { Form, Select } from 'antd'
import { sysmtemUserRole } from '../globalVariables'

const UpdateRoleModal = ({
  isModalOpen,
  handleCancel,
  handleUpdateRole,
  loading,
}) => {
  const [form] = Form.useForm()
  const [role, setRole] = useState(isModalOpen?.role)

  const handleOk = () => {
    if (loading) return
    if (!role.trim()) return alert('Vui lòng nhập đầy đủ thông tin')
    handleUpdateRole(role, isModalOpen?._id)
  }

  const handleClose = () => {
    form.resetFields()
    handleCancel()
  }

  useEffect(() => {
    form.setFieldValue('role', isModalOpen?.role)
  }, [])

  return (
    <Modal
      okText="Xác nhận"
      cancelText="Hủy"
      confirmLoading={loading}
      title="Cập nhật quyền"
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
          name="role"
          label="Quyền của người dùng"
          rules={[{ required: true, message: 'Hãy chọn quyền muốn cập nhật!' }]}
        >
          <Select
            onChange={(value) => setRole(value)}
            options={[
              { value: sysmtemUserRole.basic, label: <span>Cơ bản</span> },
              {
                value: sysmtemUserRole.editor,
                label: <span>Người chỉnh sửa</span>,
              },
              { value: sysmtemUserRole.manager, label: <span>Quản lý</span> },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UpdateRoleModal
