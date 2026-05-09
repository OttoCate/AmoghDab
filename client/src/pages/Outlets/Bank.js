import { useState, useEffect, useRef } from 'react'
import { Table, Tag, Button, Space } from 'antd'
import { useZustand } from '../../zustand'
import { FiPlus } from 'react-icons/fi'
import BankCreateModal from '../../widgets/createBankModal'
import { Input } from 'antd'
import Highlighter from 'react-highlight-words'
import { SearchOutlined } from '@ant-design/icons'
import app from '../../axiosConfig'

const Bank = () => {
  const [banks, setBanks] = useState([])
  const { banks: currentBanks, auth, setBankState } = useZustand()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [searchedColumn, setSearchedColumn] = useState('')
  const searchInput = useRef(null)
  const [loading, setLoading] = useState(false)

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

  const handleFetchBanks = async () => {
    try {
      const { data } = await app.get('/api/get-banks')
      setBanks(data.data)
      setBankState(data.data)
    } catch (error) {
      alert(error?.response?.data?.msg || error)
    }
  }

  const handleChangeActiveState = async (activeState, id) => {
    try {
      if (loading) return
      setLoading(true)
      await app.patch(`/api/update-bank/${id}`, {
        active: activeState,
      })
      await handleFetchBanks()
    } catch (error) {
      alert(error?.response?.data?.msg || error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Tên ngân hàng',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Đang hoạt động',
      dataIndex: 'active',
      align: 'center',
      key: 'active',
      width: 150,
      filters: [
        {
          text: 'Khả dụng',
          value: true,
        },
        {
          text: 'Bị vô hiệu',
          value: false,
        },
      ],
      onFilter: (value, record) => record.active === value,
      render: (active) => (
        <Tag color={active ? 'green' : 'volcano'}>
          {active ? 'Khả dụng' : 'Bị vô hiệu'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      align: 'center',
      key: 'action',
      width: 150,
      render: (_) => (
        <Space size="middle">
          <Button
            color="default"
            variant="outlined"
            size="small"
            onClick={() => showModal(_)}
          >
            Chỉnh sửa
          </Button>
          {_.active ? (
            <Button
              color="danger"
              variant="filled"
              size="small"
              onClick={() => handleChangeActiveState(false, _._id)}
            >
              Vô hiệu
            </Button>
          ) : (
            <Button
              color="primary"
              variant="filled"
              size="small"
              onClick={() => handleChangeActiveState(true, _._id)}
            >
              Kích hoạt
            </Button>
          )}
        </Space>
      ),
    },
  ]

  useEffect(() => {
    if (currentBanks.length > 0) setBanks(currentBanks)
  }, [])
  return (
    <>
      <Button
        color="primary"
        onClick={() => showModal(true)}
        variant="filled"
        style={{ marginBottom: 16 }}
        icon={<FiPlus />}
      >
        Tạo ngân hàng
      </Button>
      <Table
        columns={columns}
        dataSource={banks}
        bordered
        size="small"
        rowKey={(record) => record._id}
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
        <BankCreateModal
          handleCancel={handleCancel}
          isModalOpen={isModalOpen}
          handleFetchBanks={handleFetchBanks}
        />
      )}
    </>
  )
}
export default Bank
