import { useEffect, useState } from 'react'
import { Modal } from 'antd'
import { Form, Input } from 'antd'
import app from '../axiosConfig'

const BankCreateModal = ({ isModalOpen, handleCancel, handleFetchBanks }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleOk = async () => {
    try {
      if (loading) return
      const { name } = form.getFieldsValue()
      if (!name?.trim()) return alert('Vui lòng nhập đầy đủ thông tin')
      setLoading(true)
      if (isModalOpen?._id) {
        await app.patch(`/api/update-bank/${isModalOpen?._id}`, { name })
      } else {
        await app.post('/api/create-bank', { name })
      }
      await handleFetchBanks()
      handleClose()
    } catch (error) {
      alert(error?.response?.data?.msg || error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    form.resetFields()
    handleCancel()
  }

  useEffect(() => {
    if (isModalOpen?._id) form.setFieldValue('name', isModalOpen?.name)
  }, [])

  return (
    <Modal
      okText="Xác nhận"
      cancelText="Hủy"
      confirmLoading={loading}
      title={isModalOpen?._id ? 'Cập nhật ngân hàng' : 'Tạo ngân hàng mới'}
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
          name="name"
          label="Tên ngân hàng"
          rules={[{ required: true, message: 'Hãy nhập tên ngân hàng!' }]}
        >
          <Input className="w-full" placeholder="Ngân hàng ABC gì đó..." />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default BankCreateModal
