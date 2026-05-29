import { useEffect, useState } from 'react'
import { Modal } from 'antd'
import { Form, Input, Select, DatePicker, Space } from 'antd'
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
  const { companies, auth } = useZustand()

  const handleOk = async () => {
    try {
      if (loading) return
      const { type, vnd, usd, thb, departmentCode, companyId } =
        form.getFieldsValue()
      if ((!type.trim(), !companyId.trim()))
        return alert('Vui lòng nhập đầy đủ thông tin')
      setLoading(true)
      if (isModalOpen?._id) {
        await app.patch(`/api/update-source/${isModalOpen?._id}`, {
          type,
          vnd,
          usd,
          thb,
          departmentCode,
          companyId,
        })
      } else {
        await app.post('/api/create-source', {
          type,
          vnd,
          usd,
          thb,
          departmentCode,
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
      form.setFieldValue('vnd', isModalOpen?.vnd)
      form.setFieldValue('usd', isModalOpen?.usd)
      form.setFieldValue('thb', isModalOpen?.thb)
      form.setFieldValue('departmentCode', isModalOpen?.departmentCode)
      form.setFieldValue('companyId', isModalOpen?.companyId?._id)
    } else {
      form.setFieldValue('vnd', 0)
      form.setFieldValue('usd', 0)
      form.setFieldValue('thb', 0)
    }
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
        <Form.Item
          name="type"
          label="Loại nguồn"
          rules={[{ required: true, message: 'Nhập nội dung!' }]}
        >
          <Input className="w-full" placeholder="" />
        </Form.Item>
        <Form.Item name="departmentCode" label="Mã đơn vị">
          <Input className="w-full" placeholder="" />
        </Form.Item>

        <Space.Compact style={{ display: 'flex' }}>
          <Form.Item name="vnd" label="VNĐ" style={{ flex: 1 }}>
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
          <Form.Item name="usd" label="USD" style={{ flex: 1 }}>
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
          <Form.Item name="thb" label="THB" style={{ flex: 1 }}>
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
        </Space.Compact>
      </Form>
    </Modal>
  )
}

export default SourceCreateModal
