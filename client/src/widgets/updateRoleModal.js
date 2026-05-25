import { useEffect } from 'react'
import { Modal } from 'antd'
import { Form, Select } from 'antd'
import { sysmtemUserRole } from '../globalVariables'
import { useZustand } from '../zustand'

const UpdateRoleModal = ({
  isModalOpen,
  handleCancel,
  handleUpdateRole,
  loading,
}) => {
  const [form] = Form.useForm()
  const { companies } = useZustand()

  const handleOk = () => {
    if (loading) return
    const { role, companyIds } = form.getFieldsValue()
    if (!role.trim()) return alert('Vui lòng nhập đầy đủ thông tin')
    handleUpdateRole(role, isModalOpen?._id, companyIds)
  }

  const handleClose = () => {
    form.resetFields()
    handleCancel()
  }

  useEffect(() => {
    form.setFieldValue('role', isModalOpen?.role)
    form.setFieldValue('companyIds', isModalOpen?.companyIds)
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
            options={[
              { value: sysmtemUserRole.basic, label: <span>Cơ bản</span> },
              { value: sysmtemUserRole.manager, label: <span>Quản lý</span> },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="companyIds"
          label="Công ty người dùng đảm nhận"
          rules={[{ required: true, message: 'Hãy chọn công ty!' }]}
        >
          <Select
            mode="tags"
            maxTagCount={1}
            options={companies.map((i) => {
              return { value: i._id, label: i.name }
            })}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UpdateRoleModal
