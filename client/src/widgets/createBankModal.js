import { useEffect, useState } from 'react'
import { Modal } from 'antd'
import { Form, Input } from 'antd'
import app from '../axiosConfig'
import { useZustand } from '../zustand'

const BankCreateModal = ({ isModalOpen, handleCancel, setBanks }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { setBankState } = useZustand()

  const handleFetchBanks = async () => {
    try {
      const { data } = await app.get('/api/get-banks')
      setBanks(data.data)
      setBankState(data.data)
    } catch (error) {
      alert(error?.response?.data?.msg || error)
    }
  }

  const handleOk = async () => {
    try {
      if (loading) return
      const { name } = form.getFieldsValue()
      if (!name?.trim()) return alert('Vui lòng nhập đầy đủ thông tin')
      setLoading(true)
      await app.post('/api/create-bank', { name })
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
    form.setFieldValue('role', 'basic')
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
