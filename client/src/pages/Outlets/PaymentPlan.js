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
import { sysmtemUserRole } from '../../globalVariables'

const PaymentPlan = () => {
  const [paymentPlans, setPaymentPlans] = useState([])
  const {
    paymentPlans: currentPaymentPlans,
    auth,
    setPaymentPlanState,
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

  const handleFetchPaymentPlans = async () => {
    try {
      const { data } = await app.get('/api/get-payment-plans')
      setPaymentPlans(data.data)
      setPaymentPlanState(data.data)
    } catch (error) {
      alert(error?.response?.data?.msg || error)
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
      title: 'Đối tượng',
      dataIndex: 'subject',
      key: 'subject',
      fixed: 'left',
      ...getColumnSearchProps('subject'),
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      ...getColumnSearchProps('content'),
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
      title: 'Ngày thanh toán',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 150,
      align: 'right',
      sorter: (a, b) => moment(a.dueDate) - moment(b.dueDate),
      render: (value) => <span>{moment(value).format('DD/MM/YYYY')}</span>,
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
          </Space>
        ),
    },
  ]

  useEffect(() => {
    if (currentPaymentPlans.length > 0) setPaymentPlans(currentPaymentPlans)
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
        Tạo kế hoạch thanh toán
      </Button>
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
