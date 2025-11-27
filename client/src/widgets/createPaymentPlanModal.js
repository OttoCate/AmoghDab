import { useEffect, useState } from 'react'
import { Modal } from 'antd'
import { Form, Input, Select, DatePicker } from 'antd'
import app from '../axiosConfig'
import { InputNumber } from 'antd'
import dayjs from 'dayjs'

const PaymentPlanCreateModal = ({
  isModalOpen,
  handleCancel,
  handleFetchPaymentPlans,
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleOk = async () => {
    try {
      if (loading) return
      const { subject, content, amount, dueDate, state } = form.getFieldsValue()
      if (
        !subject?.trim() ||
        !amount ||
        !dueDate ||
        !state?.trim() ||
        !content?.trim()
      )
        return alert('Vui lòng nhập đầy đủ thông tin')
      setLoading(true)
      if (isModalOpen?._id) {
        await app.patch(`/api/update-payment-plan/${isModalOpen?._id}`, {
          subject,
          content,
          amount,
          dueDate,
          state,
        })
      } else {
        await app.post('/api/create-payment-plan', {
          subject,
          content,
          amount,
          dueDate,
        })
      }
      await handleFetchPaymentPlans()
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
    if (isModalOpen?._id) {
      form.setFieldValue('subject', isModalOpen?.subject)
      form.setFieldValue('content', isModalOpen?.content)
      form.setFieldValue('amount', isModalOpen?.amount)
      form.setFieldValue('dueDate', dayjs(isModalOpen?.dueDate))
      form.setFieldValue('state', isModalOpen?.state)
    } else {
      form.setFieldValue('state', 'ongoing')
    }
  }, [])

  return (
    <Modal
      okText="Xác nhận"
      cancelText="Hủy"
      confirmLoading={loading}
      title={
        isModalOpen?._id
          ? 'Cập nhật kế hoạch thanh toán'
          : 'Tạo kế hoạch thanh toán mới'
      }
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
          name="subject"
          label="Đối tượng"
          rules={[{ required: true, message: 'Nhập đối tượng!' }]}
        >
          <Input className="w-full" placeholder="" />
        </Form.Item>
        <Form.Item
          name="content"
          label="Nội dung"
          rules={[{ required: true, message: 'Nhập nội dung!' }]}
        >
          <Input className="w-full" placeholder="" />
        </Form.Item>
        <Form.Item
          name="dueDate"
          label="Ngày thanh toán"
          rules={[{ required: true, message: 'Nhập ngày thanh toán!' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="amount"
          label="Giá trị"
          rules={[{ required: true, message: 'Nhập giá trị thanh toán!' }]}
        >
          <InputNumber
            inputMode="decimal"
            style={{ width: '100%' }}
            formatter={(value) =>
              value
                ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') // thousands with comma
                : ''
            }
            parser={(value) =>
              value
                ? parseFloat(value.toString().replace(/,/g, '')) // remove commas
                : 0
            }
            min={0}
          />
        </Form.Item>
        <Form.Item
          name="state"
          label="Trạng thái"
          style={{ flex: 1 }}
          rules={[{ required: true, message: 'Hãy chọn trạng thái!' }]}
        >
          <Select
            showSearch
            disabled={!isModalOpen?._id}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={[
              { value: 'ongoing', label: 'Đang thực hiện' },
              { value: 'done', label: 'Hoàn thành' },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default PaymentPlanCreateModal
