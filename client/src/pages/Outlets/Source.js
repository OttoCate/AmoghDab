import { useState, useEffect, useRef } from 'react'
import { Table, Button, Space, Tooltip } from 'antd'
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

const PaymentPlan = () => {
  const [sources, setSources] = useState([])
  const { sources: currentSources, setSourceState } = useZustand()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [searchedColumn, setSearchedColumn] = useState('')
  const searchInput = useRef(null)
  const [loading, setLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

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
        return {
          ...i,
          companyId: i.companyId?.name,
          updatedBy: i.updatedBy?.name,
        }
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

  const columns = [
    {
      title: 'Công ty',
      dataIndex: 'company',
      key: 'company',
      width: 300,
      fixed: 'left',
      ...getColumnSearchProps('company'),
    },
    {
      title: 'Loại nguồn',
      dataIndex: 'type',
      key: 'type',
      minWidth: 250,
      ...getColumnSearchProps('type'),
    },
    {
      title: 'VND',
      dataIndex: 'vnd',
      key: 'vnd',
      align: 'right',
      sorter: (a, b) => a.vnd - b.vnd,
      width: 130,
      render: (value) => {
        return <span>{Intl.NumberFormat().format(value)}</span>
      },
    },
    {
      title: 'USD',
      dataIndex: 'usd',
      key: 'usd',
      align: 'right',
      sorter: (a, b) => a.usd - b.usd,
      width: 130,
      render: (value) => {
        return <span>{Intl.NumberFormat().format(value)}</span>
      },
    },
    {
      title: 'THB',
      dataIndex: 'thb',
      key: 'thb',
      align: 'right',
      sorter: (a, b) => a.thb - b.thb,
      width: 130,
      render: (value) => {
        return <span>{Intl.NumberFormat().format(value)}</span>
      },
    },
    {
      title: 'Lần cập nhật gần nhất',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      align: 'right',
      sorter: (a, b) => moment(a.updatedAt) - moment(b.updatedAt),
      render: (value) => (
        <span>{moment(value).format('DD/MM/YYYY hh:mm:ss')}</span>
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
      render: (_) => (
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
