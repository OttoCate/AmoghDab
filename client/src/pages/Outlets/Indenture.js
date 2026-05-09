import { useState, useEffect, useRef } from 'react'
import { Table, Button, Space, Tag, Tooltip } from 'antd'
import { useZustand } from '../../zustand'
import { FiPlus } from 'react-icons/fi'
import IndentureCreateModal from '../../widgets/createIndentureModal'
import { Input } from 'antd'
import Highlighter from 'react-highlight-words'
import { SearchOutlined } from '@ant-design/icons'
import app from '../../axiosConfig'
import moment from 'moment'
import { MdEdit } from 'react-icons/md'
import { sysmtemUserRole } from '../../globalVariables'

const Indenture = () => {
  const [indentures, setIndentures] = useState([])
  const {
    indentures: currentIndentures,
    auth,
    setIndentureState,
  } = useZustand()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [searchedColumn, setSearchedColumn] = useState('')
  const searchInput = useRef(null)

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

  const handleFetchIndentures = async () => {
    try {
      const { data } = await app.get('/api/get-indentures')
      setIndentures(data.data)
      setIndentureState(data.data)
    } catch (error) {
      alert(error?.response?.data?.msg || error)
    }
  }

  const columns = [
    {
      title: 'Công ty',
      dataIndex: 'company',
      key: 'company',
      width: 200,
      ...getColumnSearchProps('company'),
    },
    {
      title: 'Ngân hàng',
      dataIndex: 'bank',
      key: 'bank',
      width: 250,
      ...getColumnSearchProps('bank'),
    },
    {
      title: 'Số khế ước',
      dataIndex: 'number',
      key: 'number',
      width: 150,
      fixed: 'left',
      ...getColumnSearchProps('number'),
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      align: 'right',
      sorter: (a, b) => moment(a.date) - moment(b.date),
      width: 100,
      render: (value) => <span>{moment(value).format('DD/MM/YYYY')}</span>,
    },
    {
      title: 'Ngày đến hạn',
      dataIndex: 'dueDate',
      key: 'dueDate',
      align: 'right',
      width: 130,
      sorter: (a, b) => moment(a.dueDate) - moment(b.dueDate),
      render: (date) => {
        return <span>{moment(date).format('DD/MM/YYYY')}</span>
      },
    },
    {
      title: 'Giá trị',
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
      title: 'Lãi suất',
      dataIndex: 'interestRate',
      key: 'interestRate',
      width: 100,
      sorter: (a, b) => a.interestRate - b.interestRate,
      align: 'right',
    },
    {
      title: 'Giá trị lãi',
      dataIndex: 'interestAmount',
      key: 'interestAmount',
      align: 'right',
      sorter: (a, b) => a.interestAmount - b.interestAmount,
      width: 130,
      render: (value) => {
        return <span>{Intl.NumberFormat().format(value)}</span>
      },
    },
    {
      title: 'Còn lại',
      dataIndex: 'residual',
      key: 'residual',
      sorter: (a, b) => a.residual - b.residual,
      align: 'right',
      width: 130,
      render: (value) => {
        return <span>{Intl.NumberFormat().format(value)}</span>
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      align: 'center',
      fixed: 'right',
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
      fixed: 'right',
      width: 100,
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
          </Space>
        ),
    },
  ]

  useEffect(() => {
    if (currentIndentures.length > 0) setIndentures(currentIndentures)
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
        Tạo khế ước ngân hàng
      </Button>
      <Table
        columns={columns}
        dataSource={[...indentures].map((i) => {
          return { ...i, bank: i.bankId?.name, company: i.companyId?.name }
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
        <IndentureCreateModal
          handleCancel={handleCancel}
          isModalOpen={isModalOpen}
          handleFetchIndentures={handleFetchIndentures}
        />
      )}
    </>
  )
}
export default Indenture
