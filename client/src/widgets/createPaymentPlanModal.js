import { useEffect, useState } from 'react'
import { Modal } from 'antd'
import { Form, Input, Select, DatePicker, Space } from 'antd'
import app from '../axiosConfig'
import { InputNumber } from 'antd'
import dayjs from 'dayjs'
import { useZustand } from '../zustand'

const PaymentPlanCreateModal = ({
  isModalOpen,
  handleCancel,
  handleFetchPaymentPlans,
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { companies, auth } = useZustand()

  const handleOk = async () => {
    try {
      if (loading) return
      const {
        subject,
        content,
        amount,
        dueDate,
        companyId,
        document,
        currency,
        exchangeRate,
        conversedValue,
        total,
        state,
        note,
      } = form.getFieldsValue()
      if (
        !subject?.trim() ||
        !amount ||
        !dueDate ||
        !state?.trim() ||
        !content?.trim() ||
        !companyId
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
          companyId,
          document,
          currency,
          exchangeRate,
          total,
          conversedValue,
          note,
        })
      } else {
        await app.post('/api/create-payment-plan', {
          subject,
          content,
          amount,
          dueDate,
          state,
          companyId,
          document,
          currency,
          exchangeRate,
          total,
          conversedValue,
          note,
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

  const handleCalculateValueConversed = () => {
    const { exchangeRate, amount } = form.getFieldsValue()
    form.setFieldValue('conversedValue', exchangeRate * amount)
  }

  useEffect(() => {
    if (isModalOpen?._id) {
      form.setFieldValue('subject', isModalOpen?.subject)
      form.setFieldValue('content', isModalOpen?.content)
      form.setFieldValue('amount', isModalOpen?.amount)
      form.setFieldValue('dueDate', dayjs(isModalOpen?.dueDate))
      form.setFieldValue('state', isModalOpen?.state)
      form.setFieldValue('document', isModalOpen?.document)
      form.setFieldValue('exchangeRate', isModalOpen?.exchangeRate)
      form.setFieldValue('currency', isModalOpen?.currency)
      form.setFieldValue('total', isModalOpen?.total)
      form.setFieldValue('companyId', isModalOpen?.companyId?._id)
      form.setFieldValue('conversedValue', isModalOpen?.conversedValue)
      form.setFieldValue('note', isModalOpen?.note)
    } else {
      form.setFieldValue('state', 'ongoing')
      form.setFieldValue('currency', 'vnd')
      form.setFieldValue('exchangeRate', 1)
    }
  }, [])

  return (
    <Modal
      okText="Xác nhận"
      cancelText="Hủy"
      width={800}
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
          name="companyId"
          label="Công ty"
          rules={[
            { required: true, message: 'Tài khoản này thuộc công ty nào!' },
          ]}
        >
          <Select
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={companies
              .filter((i) => auth.companyIds.includes(i._id))
              .map((i) => {
                return { value: i._id, label: i.name }
              })}
          />
        </Form.Item>
        <Space.Compact style={{ display: 'flex' }}>
          <Form.Item
            name="subject"
            label="Đối tượng"
            style={{ flex: 1 }}
            rules={[{ required: true, message: 'Nhập đối tượng thanh toán!' }]}
          >
            <Input className="w-full" placeholder="" />
          </Form.Item>
          <Form.Item name="document" label="Chứng từ gốc" style={{ flex: 1 }}>
            <Input className="w-full" placeholder="" />
          </Form.Item>
        </Space.Compact>
        <Form.Item
          name="content"
          label="Nội dung"
          rules={[{ required: true, message: 'Nhập nội dung thanh toán!' }]}
        >
          <Input className="w-full" placeholder="" />
        </Form.Item>
        <Space.Compact style={{ display: 'flex' }}>
          <Form.Item
            name="dueDate"
            label="Ngày thanh toán"
            style={{ flex: 1 }}
            rules={[{ required: true, message: 'Nhập ngày thanh toán!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            style={{ flex: 1 }}
            name="currency"
            label="Loại tiền"
            rules={[
              {
                required: true,
                message: 'Hãy cho biết tài khoản này thuộc tiền tệ gì!',
              },
            ]}
          >
            <Select
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={[
                { value: 'vnd', label: 'VND' },
                { value: 'usd', label: 'USD' },
                { value: 'cny', label: 'CNY' },
                { value: 'thb', label: 'THB' },
              ]}
            />
          </Form.Item>
        </Space.Compact>
        <Space.Compact style={{ display: 'flex' }}>
          <Form.Item
            name="total"
            label="Tổng thành tiền"
            style={{ flex: 1 }}
            rules={[{ required: true, message: 'Nhập giá trị!' }]}
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
            name="amount"
            label="Giá trị thanh toán"
            style={{ flex: 1 }}
            rules={[{ required: true, message: 'Nhập giá trị thanh toán!' }]}
          >
            <InputNumber
              inputMode="decimal"
              style={{ width: '100%' }}
              onChange={handleCalculateValueConversed}
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
            name="exchangeRate"
            label="Tỷ giá hối đoái"
            style={{ flex: 1 }}
            rules={[{ required: true, message: 'Nhập tỷ giá hối đoái!' }]}
          >
            <InputNumber
              inputMode="decimal"
              style={{ width: '100%' }}
              onChange={handleCalculateValueConversed}
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
            name="conversedValue"
            label="Giá trị quy đổi (VND)"
            style={{ flex: 1 }}
          >
            <InputNumber
              inputMode="decimal"
              readOnly={true}
              disabled={true}
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
        </Space.Compact>
        <Space.Compact style={{ display: 'flex' }}>
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
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={[
                { value: 'ongoing', label: 'Đang thực hiện' },
                { value: 'done', label: 'Hoàn thành' },
              ]}
            />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú" style={{ flex: 3 }}>
            <Input className="w-full" placeholder="" />
          </Form.Item>
        </Space.Compact>
      </Form>
    </Modal>
  )
}

export default PaymentPlanCreateModal
