import { useState, useEffect, useRef } from 'react'
import { Table, Button, Space, Tooltip, Tag, Typography } from 'antd'
import { useZustand } from '../../zustand'
import { FiPlus } from 'react-icons/fi'
import SourceCreateModal from '../../widgets/createSourceModal'
import { Input } from 'antd'
import Highlighter from 'react-highlight-words'
import { SearchOutlined } from '@ant-design/icons'
import app from '../../axiosConfig'
import moment from 'moment'
import { MdEdit } from 'react-icons/md'
import { MdDelete } from 'react-icons/md'
import { FaFileExport } from 'react-icons/fa'
import * as FileSaver from 'file-saver'
import { FaUpload } from 'react-icons/fa'
import { sysmtemUserRole, validExcelFile } from '../../globalVariables'
import _ from 'lodash'

const { Text } = Typography

const PaymentPlan = () => {
  const [sources, setSources] = useState([])
  const {
    sources: currentSources,
    setSourceState,
    auth,
    companies,
    bankAccounts,
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

  const handleFetchSources = async () => {
    try {
      const { data } = await app.get('/api/get-sources')
      setSources(data.data)
      setSourceState(data.data)
    } catch (error) {
      alert(error?.response?.data?.msg || error)
    }
  }

  const handleDeleteRecord = async (record) => {
    try {
      if (loading) return
      if (!window.confirm('Bạn có chắc muốn xóa dữ liệu này?')) return
      setLoading(true)
      await app.delete(`/api/delete-source/${record._id}`)
      const newSources = [...sources].filter((i) => i._id !== record._id)
      setSources(newSources)
      setSourceState(newSources)
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
      data: sources.map((i) => {
        let myObj = {
          ...i,
          companyId: i.companyId?.name,
          bankAccountId:
            bankAccounts.find((item) => item._id === i.bankAccountId)
              ?.accountNumber || '',
        }
        delete myObj.updatedAt
        delete myObj.updatedBy
        return myObj
      }),
      fileName: 'Dữ liệu nguồn',
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
          const allCompaniesValid = data.every(
            (i) =>
              companies.find((item) => item.name === i.companyId) &&
              ['cash', 'bank'].find((o) => o === i.type) &&
              ['vnd', 'usd', 'cny', 'thb'].find((e) => e === i.currency)
          )

          if (!allCompaniesValid) {
            fileInputRef.current.value = ''
            setIsProcessing(false)
            worker.terminate()
            return alert(
              'Kiểm tra lại công ty, loại và đơn vị tiền tệ xem có tồn tại trong hệ thống không?'
            )
          }

          const myMapList = data.map((i) => {
            const {
              _id,
              companyId,
              currency,
              type,
              value,
              name,
              bankAccountId,
            } = i
            const newCompanyId = companies.find(
              (item) => item.name === companyId
            )

            const newBankAccountId = bankAccounts.find(
              (item) => item.accountNumber === bankAccountId
            )

            if (
              !name?.trim() ||
              !currency?.trim() ||
              !companyId ||
              !type ||
              !value ||
              (type === 'cash' && bankAccountId.trim()) ||
              (type === 'bank' && !bankAccountId.trim())
            ) {
              fileInputRef.current.value = ''
              setIsProcessing(false)
              worker.terminate()
              return alert('Đảm bảo dữ liệu phải đầy đủ và hợp lệ')
            }

            const myData = {
              companyId: newCompanyId._id,
              currency,
              type,
              value,
              name,
              bankAccountId: newBankAccountId,
            }

            return _id
              ? app.patch(`/api/update-source/${_id}`, myData)
              : app.post('/api/create-source', myData)
          })

          await Promise.all(myMapList)
          await handleFetchSources()
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
      width: 250,
      fixed: 'left',
      ...getColumnSearchProps('company'),
    },
    {
      title: 'Sổ',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      align: 'center',
      width: 110,
      filters: [
        {
          text: 'Tiền mặt',
          value: 'cash',
        },
        {
          text: 'Ngân hàng',
          value: 'bank',
        },
      ],
      onFilter: (value, record) => record.type === value,
      render: (state) => (
        <Tag color={state === 'cash' ? 'green' : 'red'}>
          {state === 'cash' ? 'Tiền mặt' : 'Ngân hàng'}
        </Tag>
      ),
    },
    {
      title: 'Tiền tệ',
      dataIndex: 'currency',
      key: 'currency',
      width: 110,
      align: 'center',
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
      title: 'Số dư',
      dataIndex: 'value',
      key: 'value',
      align: 'right',
      sorter: (a, b) => a.value - b.value,
      render: (value) => {
        return <span>{Intl.NumberFormat().format(value)}</span>
      },
    },
    {
      title: 'Lần cập nhật gần nhất',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      align: 'center',
      sorter: (a, b) => moment(a.updatedAt) - moment(b.updatedAt),
      render: (value) => (
        <span>{moment(value).format('DD/MM/YYYY HH:mm:ss')}</span>
      ),
    },
    {
      title: 'Người cập nhật gần nhất',
      dataIndex: 'personUpdating',
      key: 'personUpdating',
      ...getColumnSearchProps('personUpdating'),
    },
    {
      title: 'Hành động',
      align: 'center',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_) =>
        auth.role === sysmtemUserRole.basic ? (
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
    if (currentSources.length > 0) setSources(currentSources)
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
        {auth.role === sysmtemUserRole.basic ? (
          <></>
        ) : (
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
        )}
      </Space.Compact>
      <Table
        columns={columns}
        dataSource={sources.map((i) => {
          return {
            ...i,
            company: i?.companyId?.name,
            personUpdating: i?.updatedBy?.name,
          }
        })}
        bordered
        size="small"
        rowKey={(record) => record._id}
        scroll={{ x: 'max-content' }}
        pagination={{
          pageSize: 80,
          simple: true,
          size: 'small',
          position: ['bottomRight'],
          showTotal: (total, range) => (
            <span>
              {range[0]}-{range[1]} / {total}
            </span>
          ),
        }}
        summary={(pageData) => {
          let totalValue = 0

          pageData.forEach(({ value }) => {
            totalValue += value
          })

          return (
            <>
              <Table.Summary.Row style={{ background: '#FAFAFA' }}>
                <Table.Summary.Cell>
                  <Text style={{ fontWeight: 600 }}>Tổng cộng</Text>
                </Table.Summary.Cell>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Table.Summary.Cell key={i}></Table.Summary.Cell>
                ))}
                <Table.Summary.Cell align="end">
                  <Text style={{ fontWeight: 600 }}>
                    {pageData.length > 0 &&
                    pageData.every((i) => i.currency === pageData[0].currency)
                      ? Intl.NumberFormat().format(totalValue)
                      : ''}
                  </Text>
                </Table.Summary.Cell>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Table.Summary.Cell key={i}></Table.Summary.Cell>
                ))}
              </Table.Summary.Row>
            </>
          )
        }}
      />
      {isModalOpen && (
        <SourceCreateModal
          handleCancel={handleCancel}
          isModalOpen={isModalOpen}
          handleFetchSources={handleFetchSources}
        />
      )}
    </>
  )
}
export default PaymentPlan
