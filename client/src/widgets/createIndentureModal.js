import { useEffect, useState } from 'react'
import { Modal, Space } from 'antd'
import { Form, Input, Select, DatePicker } from 'antd'
import app from '../axiosConfig'
import { useZustand } from '../zustand'
import { InputNumber } from 'antd'
import moment from 'moment'
import dayjs from 'dayjs'

const IndentureCreateModal = ({
  isModalOpen,
  handleCancel,
  handleFetchIndentures,
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { banks, companies, auth } = useZustand()

  const handleOk = async () => {
    try {
      if (loading) return
      const {
        number,
        bankId,
        amount,
        date,
        dueDate,
        interestRate,
        interestAmount,
        residual,
        state,
        companyId,
      } = form.getFieldsValue()
      if (
        !number?.trim() ||
        !amount ||
        !date ||
        !dueDate ||
        !interestRate ||
        !residual ||
        !state?.trim() ||
        !companyId?.trim()
      )
        return alert('Vui lòng nhập đầy đủ thông tin')
      setLoading(true)
      if (isModalOpen?._id) {
        await app.patch(`/api/update-indenture/${isModalOpen?._id}`, {
          number,
          bankId,
          amount,
          date,
          dueDate,
          interestRate,
          interestAmount,
          residual,
          state,
          companyId,
        })
      } else {
        await app.post('/api/create-indenture', {
          number,
          bankId,
          amount,
          date,
          dueDate,
          interestRate,
          interestAmount,
          residual,
          state,
          companyId,
        })
      }
      await handleFetchIndentures()
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
      console.log(isModalOpen)
      form.setFieldValue('number', isModalOpen?.number)
      form.setFieldValue('bankId', isModalOpen?.bankId?._id)
      form.setFieldValue('amount', isModalOpen?.amount)
      form.setFieldValue('date', dayjs(isModalOpen?.date))
      form.setFieldValue('dueDate', dayjs(isModalOpen?.dueDate))
      form.setFieldValue('interestRate', isModalOpen?.interestRate)
      form.setFieldValue('interestAmount', isModalOpen?.interestAmount)
      form.setFieldValue('residual', isModalOpen?.residual)
      form.setFieldValue('state', isModalOpen?.state)
      form.setFieldValue('companyId', isModalOpen?.companyId?._id)
    }
  }, [])

  return (
    <Modal
      okText="Xác nhận"
      cancelText="Hủy"
      confirmLoading={loading}
      title={isModalOpen?._id ? 'Cập nhật khế ước' : 'Tạo khế ước mới'}
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
        <Space direction="vertical">
          <Space.Compact direction="horizontal" size="middle">
            <Form.Item
              name="number"
              label="Số khế ước ngân hàng"
              rules={[{ required: true, message: 'Nhập đầy đủ!' }]}
            >
              <Input className="w-full" placeholder="" />
            </Form.Item>
            <Form.Item
              name="date"
              label="Ngày"
              rules={[{ required: true, message: 'Nhập đầy đủ!' }]}
            >
              <DatePicker />
            </Form.Item>
            <Form.Item
              name="dueDate"
              label="Ngày đến hạn"
              rules={[{ required: true, message: 'Nhập đầy đủ!' }]}
            >
              <DatePicker />
            </Form.Item>
          </Space.Compact>
          <Space.Compact
            direction="horizontal"
            size="middle"
            style={{ display: 'flex', width: '100%' }}
          >
            <Form.Item
              name="amount"
              label="Giá trị"
              style={{ flex: 3 }}
              rules={[{ required: true, message: 'Nhập đầy đủ!' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                inputMode="decimal"
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
              name="interestRate"
              style={{ flex: 2 }}
              label="Lãi suất"
              rules={[{ required: true, message: 'Nhập đầy đủ!' }]}
            >
              <InputNumber
                inputMode="decimal"
                style={{ width: '100%' }}
                min={0}
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
                addonAfter="%"
              />
            </Form.Item>
            <Form.Item
              name="interestAmount"
              style={{ flex: 3 }}
              label="Giá trị lãi"
              rules={[{ required: true, message: 'Nhập đầy đủ!' }]}
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
          </Space.Compact>
        </Space>
        <Space.Compact
          direction="horizontal"
          size="middle"
          style={{ display: 'flex', width: '100%' }}
        >
          <Form.Item
            name="residual"
            label="Giá trị còn lại"
            style={{ flex: 1 }}
            rules={[{ required: true, message: 'Nhập đầy đủ!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              inputMode="decimal"
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
        </Space.Compact>
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
      </Form>
    </Modal>
  )
}

export default IndentureCreateModal
