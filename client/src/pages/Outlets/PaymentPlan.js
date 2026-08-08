import { useState, useEffect, useRef } from 'react'
import { Table, Button, Space, Tag, Tooltip } from 'antd'
import { useZustand } from '../../zustand'
import { FiPlus } from 'react-icons/fi'
import PaymentPlanCreateModal from '../../widgets/createPaymentPlanModal'
import { Input } from 'antd'
import Highlighter from 'react-highlight-words'
import { SearchOutlined } from '@ant-design/icons'
import app from '../../axiosConfig'
import moment from 'moment'
import { MdEdit } from 'react-icons/md'
import { sysmtemUserRole, validExcelFile } from '../../globalVariables'
import { MdDelete } from 'react-icons/md'
import { FaFileExport } from 'react-icons/fa'
import * as FileSaver from 'file-saver'
import { FaUpload } from 'react-icons/fa'
import _ from 'lodash'
import { FaCheck } from 'react-icons/fa'

const PaymentPlan = () => {
  const [paymentPlans, setPaymentPlans] = useState([])
  const {
    paymentPlans: currentPaymentPlans,
    auth,
    setPaymentPlanState,
    companies,
  } = useZustand()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [searchedColumn, setSearchedColumn] = useState('')
  const searchInput = useRef(null)
  const [loading, setLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef(null)

  const showModal = (user) => {
    setIsModalOpen(user)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm()
    setSearchText(selectedKeys[0])
    setSearchedColumn(dataIndex)
  }

  const handleReset = (clearFilters) => {
    clearFilters()
    setSearchText('')
  }

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Tìm kiếm
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              })
              setSearchText(selectedKeys[0])
              setSearchedColumn(dataIndex)
            }}
          >
            OK
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close()
            }}
          >
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1677ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ?.toString()
        ?.toLowerCase()
        ?.includes(value?.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100)
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  })

  const handleFetchPaymentPlans = async () => {
    try {
      const { data } = await app.get('/api/get-payment-plans')
      setPaymentPlans(data.data)
      setPaymentPlanState(data.data)
    } catch (error) {
      alert(error?.response?.data?.msg || error)
    }
  }

  const handleDeleteRecord = async (record) => {
    try {
      if (loading) return
      if (!window.confirm('Bạn có chắc muốn xóa dữ liệu này?')) return
      setLoading(true)
      await app.delete(`/api/delete-payment-plan/${record._id}`)
      const newSources = [...paymentPlans].filter((i) => i._id !== record._id)
      setPaymentPlans(newSources)
      setPaymentPlanState(newSources)
    } catch (error) {
      alert(error?.response?.data?.msg || error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckDone = async (record) => {
    try {
      if (loading) return
      setLoading(true)
      await app.patch(`/api/update-payment-plan/${record._id}`, {
        state: 'done',
      })
      const newSources = [...paymentPlans].map((i) =>
        i._id === record._id ? { ...i, state: 'done' } : i
      )
      setPaymentPlans(newSources)
      setPaymentPlanState(newSources)
    } catch (error) {
      alert(error?.response?.data?.msg || error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = () => {
    setIsProcessing(true)
    const worker = new Worker(
      new URL('../../workers/exportToExcelFile.worker.js', import.meta.url)
    )
    worker.postMessage({
      data: paymentPlans.map((i) => {
        let object = {
          ...i,
          companyId: i.companyId?.name,
        }
        delete object._id
        delete object.createdAt
        delete object.updatedAt
        delete object.__v
        return object
      }),
      fileName: 'Dữ liệu kế hoạch thanh toán',
    })
    worker.onmessage = (e) => {
      const { blob, fileName } = e.data
      FileSaver.saveAs(blob, fileName)
      worker.terminate()
      setIsProcessing(false)
    }
    worker.onerror = (err) => {
      console.error('Worker error:', err)
      worker.terminate()
      setIsProcessing(false)
    }
  }

  const handleAddFile = async (e) => {
    try {
      const file = e.target.files
      const fileType = file[0].type
      if (!validExcelFile.includes(fileType))
        return alert('File của bạn phải là excel')

      setIsProcessing(true)
      // Read file into ArrayBuffer
      const buffer = await new Promise((resolve, reject) => {
        const fileReader = new FileReader()
        fileReader.readAsArrayBuffer(file[0])
        fileReader.onload = (e) => resolve(e.target.result)
        fileReader.onerror = (err) => reject(err)
      })

      // Create a worker from public directory
      const worker = new Worker(
        new URL('../../workers/excelWorker.worker.js', import.meta.url)
      )

      // Post the buffer to the worker
      worker.postMessage(buffer)

      // Handle response from the worker
      worker.onmessage = async (e) => {
        const { success, data, error } = e.data
        if (success) {
          const allCompaniesValid = data.every((i) =>
            companies.find((item) => item.name === i.companyId)
          )

          if (!allCompaniesValid) {
            fileInputRef.current.value = ''
            setIsProcessing(false)
            worker.terminate()
            return alert(
              'Có công ty trong file import không có trong hệ thống hoặc không có trong danh sách công ty bạn đảm nhận'
            )
          }

          const myMapList = data.map((i) => {
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
            } = i
            const newCompanyId = companies.find(
              (item) => item.name === companyId
            )
            let myDueDate = undefined
            if (_.isDate(dueDate)) {
              myDueDate = dueDate
            } else if (_.isNumber(dueDate)) {
              const utc_days = Math.floor(dueDate - 25569) // Excel epoch is Jan 1, 1900
              const utc_value = utc_days * 86400 // seconds in a day
              myDueDate = utc_value
            } else {
              myDueDate = dueDate
            }

            if (
              !subject?.trim() ||
              !amount ||
              !myDueDate ||
              !content?.trim() ||
              !companyId ||
              !state
            ) {
              fileInputRef.current.value = ''
              setIsProcessing(false)
              worker.terminate()
              return alert('Đảm bảo dữ liệu phải đầy đủ')
            }
            return app.post('/api/create-payment-plan', {
              subject,
              content,
              amount,
              dueDate: myDueDate,
              companyId: newCompanyId._id,
              document,
              currency,
              exchangeRate,
              total,
              conversedValue,
              note,
            })
          })

          await Promise.all(myMapList)
          await handleFetchPaymentPlans()
          setIsProcessing(false)
        } else {
          alert('Lỗi xử lý file: ' + error)
        }

        worker.terminate()
      }

      // Handle worker errors
      worker.onerror = (err) => {
        console.error('Worker error:', err)
        alert('Đã xảy ra lỗi trong quá trình xử lý file.')
        worker.terminate()
      }
    } catch (error) {
      alert('Lỗi không xác định: ' + error?.response?.data?.msg)
      setIsProcessing(false)
    } finally {
      fileInputRef.current.value = ''
      setIsProcessing(false)
    }
  }

  const columns = [
    {
      title: 'Công ty',
      dataIndex: 'company',
      key: 'company',
      width: 200,
      fixed: 'left',
      ...getColumnSearchProps('company'),
    },
    {
      title: 'Đối tượng',
      dataIndex: 'subject',
      key: 'subject',
      width: 150,
      ...getColumnSearchProps('subject'),
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      width: 150,
      ...getColumnSearchProps('content'),
    },
    {
      title: 'Chứng từ gốc',
      dataIndex: 'document',
      key: 'document',
      ...getColumnSearchProps('document'),
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 150,
      align: 'right',
      sorter: (a, b) => moment(a.dueDate) - moment(b.dueDate),
      render: (value) => <span>{moment(value).format('DD/MM/YYYY')}</span>,
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      sorter: (a, b) => a.total - b.total,
      width: 130,
      render: (value) => {
        return <span>{Intl.NumberFormat().format(value)}</span>
      },
    },
    {
      title: 'Thanh toán',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      sorter: (a, b) => a.amount - b.amount,
      width: 130,
      render: (value) => {
        return <span>{Intl.NumberFormat().format(value)}</span>
      },
    },
    {
      title: 'Tiền tệ',
      dataIndex: 'currency',
      key: 'currency',
      align: 'center',
      fixed: 'right',
      filters: [
        {
          text: 'VND',
          value: 'vnd',
        },
        {
          text: 'USD',
          value: 'usd',
        },
        {
          text: 'THB',
          value: 'thb',
        },
        {
          text: 'CNY',
          value: 'cny',
        },
      ],
      onFilter: (value, record) => record.currency === value,
      render: (state) => <span>{state.toUpperCase()}</span>,
    },
    {
      title: 'Tỷ giá',
      dataIndex: 'exchangeRate',
      key: 'exchangeRate',
      ...getColumnSearchProps('exchangeRate'),
      render: (value) => {
        return <span>{Intl.NumberFormat().format(value)}</span>
      },
    },
    {
      title: 'Giá trị quy đổi (VND)',
      dataIndex: 'conversedValue',
      key: 'conversedValue',
      align: 'right',
      sorter: (a, b) => a.conversedValue - b.conversedValue,
      width: 130,
      render: (value) => {
        return <span>{Intl.NumberFormat().format(value)}</span>
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ...getColumnSearchProps('note'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'state',
      key: 'state',
      align: 'center',
      fixed: 'right',
      width: 110,
      filters: [
        {
          text: 'Chưa xong',
          value: 'ongoing',
        },
        {
          text: 'Hoàn thành',
          value: 'done',
        },
      ],
      onFilter: (value, record) => record.state === value,
      render: (state) => (
        <Tag color={state === 'done' ? 'green' : ''}>
          {state === 'done' ? 'Hoàn thành' : 'Chưa xong'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      align: 'center',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_) =>
        _.state === 'done' && auth.role === sysmtemUserRole.basic ? (
          <></>
        ) : (
          <Space size="middle">
            <Tooltip title="Chỉnh sửa">
              <Button
                color="default"
                variant="outlined"
                size="small"
                icon={<MdEdit />}
                onClick={() => showModal(_)}
              ></Button>
            </Tooltip>
            {_.state !== 'done' && (
              <Tooltip title="Đánh dấu hoàn tất">
                <Button
                  color="default"
                  variant="outlined"
                  size="small"
                  icon={<FaCheck />}
                  onClick={() => handleCheckDone(_)}
                ></Button>
              </Tooltip>
            )}
            <Tooltip title="Xóa">
              <Button
                color="danger"
                size="small"
                variant="filled"
                icon={<MdDelete />}
                onClick={() => handleDeleteRecord(_)}
              ></Button>
            </Tooltip>
          </Space>
        ),
    },
  ]

  useEffect(() => {
    if (currentPaymentPlans.length > 0) setPaymentPlans(currentPaymentPlans)
  }, [])

  return (
    <>
      <Space.Compact>
        <Button
          color="primary"
          onClick={() => showModal(true)}
          variant="filled"
          style={{ marginBottom: 16 }}
          icon={<FiPlus />}
        >
          Tạo
        </Button>
        <Button
          color="primary"
          disabled={isProcessing}
          onClick={handleExportExcel}
          style={{ marginBottom: 16 }}
          icon={<FaFileExport />}
        >
          Export
        </Button>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleAddFile}
          />
          <Button
            icon={<FaUpload />}
            color="primary"
            disabled={isProcessing}
            onClick={() => {
              fileInputRef.current.click()
            }}
          >
            Upload
          </Button>
        </div>
      </Space.Compact>
      <Table
        columns={columns}
        dataSource={paymentPlans.map((i) => {
          return { ...i, company: i?.companyId?.name }
        })}
        bordered
        size="small"
        rowKey={(record) => record._id}
        scroll={{ x: 'max-content' }}
        pagination={{
          pageSize: 40,
          simple: true,
          size: 'small',
          position: ['bottomRight'],
          showTotal: (total, range) => (
            <span>
              {range[0]}-{range[1]} / {total}
            </span>
          ),
        }}
      />
      {isModalOpen && (
        <PaymentPlanCreateModal
          handleCancel={handleCancel}
          isModalOpen={isModalOpen}
          handleFetchPaymentPlans={handleFetchPaymentPlans}
        />
      )}
    </>
  )
}
export default PaymentPlan
