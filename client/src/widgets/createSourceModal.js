import { useEffect, useState } from 'react'
import { Modal } from 'antd'
import { Form, Input, Select, Space } from 'antd'
import app from '../axiosConfig'
import { InputNumber } from 'antd'
import { useZustand } from '../zustand'

const SourceCreateModal = ({
  isModalOpen,
  handleCancel,
  handleFetchSources,
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { companies, auth, bankAccounts } = useZustand()
  const [isChooseBank, setIsChooseBank] = useState(false)

  const handleOk = async () => {
    try {
      if (loading) return
      const { type, name, value, currency, bankAccountId, companyId } =
        form.getFieldsValue()
      if (
        !type ||
        !companyId ||
        !name ||
        !currency ||
        (type === 'bank' && !bankAccountId) ||
        !value
      )
        return alert('Vui lòng nhập đầy đủ thông tin')
      setLoading(true)
      if (isModalOpen?._id) {
        await app.patch(`/api/update-source/${isModalOpen?._id}`, {
          type,
          name,
          value,
          currency,
          bankAccountId,
          companyId,
        })
      } else {
        await app.post('/api/create-source', {
          type,
          name,
          value,
          currency,
          bankAccountId,
          companyId,
        })
      }
      await handleFetchSources()
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
      form.setFieldValue('type', isModalOpen?.type)
      form.setFieldValue('name', isModalOpen?.name)
      form.setFieldValue('companyId', isModalOpen?.companyId?._id)
      form.setFieldValue('bankAccountId', isModalOpen?.bankAccountId)
      form.setFieldValue('value', isModalOpen?.value)
      form.setFieldValue('currency', isModalOpen?.currency)
    } else {
      form.setFieldValue('type', 'cash')
    }

    setIsChooseBank(form.getFieldValue('type') === 'bank')
  }, [])

  return (
    <Modal
      okText="Xác nhận"
      cancelText="Hủy"
      confirmLoading={loading}
      title={isModalOpen?._id ? 'Cập nhật nguồn' : 'Tạo nguồn mới'}
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
            name="name"
            label="Tên sổ"
            style={{ flex: 4 }}
            rules={[{ required: true, message: 'Nhập tên sổ!' }]}
          >
            <Input className="w-full" placeholder="" />
          </Form.Item>
          <Form.Item
            name="type"
            label="Loại"
            style={{ flex: 2 }}
            rules={[{ required: true, message: 'Sổ này thuộc loại nào?' }]}
          >
            <Select
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              onChange={(value) => {
                if (value === 'cash') {
                  form.setFieldValue('bankAccountId', undefined)
                }
                setIsChooseBank(value === 'bank')
              }}
              options={[
                { value: 'bank', label: 'Ngân hàng' },
                { value: 'cash', label: 'Tiền mặt' },
              ]}
            />
          </Form.Item>
        </Space.Compact>
        {isChooseBank && (
          <Form.Item
            name="bankAccountId"
            label="Số tài khoản"
            rules={[
              {
                required: isChooseBank,
                message: 'Tài khoản này thuộc công ty nào!',
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
              onChange={(value) => {
                const bankAcc = bankAccounts.find((i) => i._id === value)
                if (bankAcc) {
                  form.setFieldValue('currency', bankAcc.currency)
                }
              }}
              options={bankAccounts
                .filter((i) => auth.companyIds.includes(i.companyId._id))
                .map((i) => {
                  return {
                    value: i._id,
                    label: `${
                      i.accountNumber
                    } (${i.currency.toUpperCase()}) - ${i.bankId.name}`,
                  }
                })}
            />
          </Form.Item>
        )}
        <Space.Compact style={{ display: 'flex' }}>
          <Form.Item name="value" label="Giá trị" style={{ flex: 2 }}>
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
              disabled={isChooseBank}
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
      </Form>
    </Modal>
  )
}

export default SourceCreateModal
