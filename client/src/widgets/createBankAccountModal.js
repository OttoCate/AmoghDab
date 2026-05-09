import { useEffect, useState } from 'react'
import { Modal } from 'antd'
import { Form, Input, Select } from 'antd'
import app from '../axiosConfig'
import { useZustand } from '../zustand'

const BankCreateModal = ({
  isModalOpen,
  handleCancel,
  handleFetchBankAccounts,
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { banks, companies } = useZustand()

  const handleOk = async () => {
    try {
      if (loading) return
      const { accountNumber, bankId, companyId, currency } =
        form.getFieldsValue()
      if (
        !accountNumber?.trim() ||
        !bankId?.trim() ||
        !companyId?.trim() ||
        !currency.trim()
      )
        return alert('Vui lòng nhập đầy đủ thông tin')
      setLoading(true)
      if (isModalOpen?._id) {
        await app.patch(`/api/update-bank-account/${isModalOpen?._id}`, {
          accountNumber,
          bankId,
          companyId,
          currency,
        })
      } else {
        await app.post('/api/create-bank-account', {
          accountNumber,
          bankId,
          companyId,
          currency,
        })
      }
      await handleFetchBankAccounts()
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
      form.setFieldValue('accountNumber', isModalOpen?.accountNumber)
      form.setFieldValue('bankId', isModalOpen?.bankId)
      form.setFieldValue('companyId', isModalOpen?.companyId)
      form.setFieldValue('currency', isModalOpen?.currency)
    }
  }, [])

  return (
    <Modal
      okText="Xác nhận"
      cancelText="Hủy"
      confirmLoading={loading}
      title={
        isModalOpen?._id ? 'Cập nhật số tài khoản' : 'Tạo số tài khoản mới'
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
          name="accountNumber"
          label="Số tài khoản"
          rules={[
            { required: true, message: 'Hãy nhập số tài khoản ngân hàng!' },
          ]}
        >
          <Input className="w-full" placeholder="00001057..." />
        </Form.Item>
        <Form.Item
          name="bankId"
          label="Ngân hàng"
          rules={[{ required: true, message: 'Hãy chọn ngân hàng!' }]}
        >
          <Select
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={banks.map((i) => {
              return { value: i._id, label: i.name }
            })}
          />
        </Form.Item>
        <Form.Item
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
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={[
              { value: 'vnd', label: 'VND' },
              { value: 'usd', label: 'USD' },
              { value: 'cny', label: 'CNY' },
            ]}
          />
        </Form.Item>
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
            options={companies.map((i) => {
              return { value: i._id, label: i.name }
            })}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default BankCreateModal
