import { useState, useEffect, useRef } from 'react'
import { Space, Table, Tag } from 'antd'
import { Button, Input } from 'antd'
import Highlighter from 'react-highlight-words'
import { SearchOutlined, UserAddOutlined } from '@ant-design/icons'
import app from '../../axiosConfig'
import { useZustand } from '../../zustand'
import UpdateRoleModal from '../../widgets/updateRoleModal'
import { sysmtemUserRole } from '../../globalVariables'
import CreateUserModal from '../../widgets/createUserModal'

const User = () => {
  const { auth } = useZustand()
  const [users, setUsers] = useState([])
  const [searchText, setSearchText] = useState('')
  const [searchedColumn, setSearchedColumn] = useState('')
  const searchInput = useRef(null)
  const { users: currentUsers, setUserState } = useZustand()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isModalCreateUserOpen, setIsModalCreateUserOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSetActiveUser = async (user, activeState) => {
    try {
      if (loading) return
      if (!activeState) {
        let confirm = false
        confirm = window.confirm(
          'Tài khoản bị vô hiệu sẽ không thể đăng nhập và thao tác bất kỳ dữ liệu nào! Bạn có muốn tiếp tục?'
        )
        if (!confirm) return
      }

      setLoading(true)
      await app.patch(`/api/update-user/${user._id}`, {
        active: activeState,
      })
      await handleFetchUsers()
    } catch (error) {
      alert(error?.response?.data?.msg || error)
    } finally {
      setLoading(false)
    }
  }

  const showModal = (user) => {
    setIsModalOpen(user)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const handleUpdateRole = async (role, userId) => {
    try {
      if (loading) return
      setLoading(true)
      await app.patch(`/api/update-user/${userId}`, { role })
      await handleFetchUsers()
      handleCancel()
    } catch (error) {
      alert(error?.response?.data?.msg || error)
    } finally {
      setLoading(false)
    }
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

  const columns = [
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
      align: 'center',
      ...getColumnSearchProps('username'),
    },
    {
      title: 'Tên người dùng',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Đang hoạt động',
      dataIndex: 'active',
      align: 'center',
      key: 'active',
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
      title: 'Vai trò',
      dataIndex: 'role',
      align: 'center',
      key: 'role',
      ...getColumnSearchProps('role'),
      render: (role) => (
        <Tag
          color={
            role === sysmtemUserRole.admin
              ? 'green'
              : role === sysmtemUserRole.editor
              ? 'pink'
              : role === sysmtemUserRole.manager
              ? 'blue'
              : ''
          }
        >
          {role === 'basic'
            ? 'Cơ bản'
            : role === sysmtemUserRole.editor
            ? 'Người chỉnh sửa'
            : role === sysmtemUserRole.manager
            ? 'Quản lý'
            : 'Quản trị viên'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      align: 'center',
      hidden: auth.role === 'basic' || auth.role === sysmtemUserRole.editor,
      key: 'action',
      render: (_, record) =>
        _.role === sysmtemUserRole.admin || _.role === auth.role ? (
          <></>
        ) : (
          <Space size="middle">
            <Button
              color="default"
              variant="outlined"
              size="small"
              onClick={() => showModal(_)}
            >
              Chỉnh quyền
            </Button>
            {_.active ? (
              <Button
                color="danger"
                variant="filled"
                size="small"
                onClick={() => handleSetActiveUser(_, false)}
              >
                Vô hiệu
              </Button>
            ) : (
              <Button
                color="primary"
                variant="filled"
                size="small"
                onClick={() => handleSetActiveUser(_, true)}
              >
                Kích hoạt
              </Button>
            )}
          </Space>
        ),
    },
  ]

  const handleFetchUsers = async () => {
    try {
      const {
        data: { data },
      } = await app.get(`/api/get-users`)
      setUserState(data)
      setUsers(data)
    } catch (error) {
      alert(error?.response?.data?.msg || error)
    }
  }

  useEffect(() => {
    if (currentUsers.length > 0) return setUsers(currentUsers)
    handleFetchUsers()
  }, [])
  return (
    <>
      {['manager', 'admin'].some((i) => i === auth?.role) && (
        <Button
          color="primary"
          onClick={() => setIsModalCreateUserOpen(true)}
          variant="filled"
          style={{ marginBottom: 16 }}
          icon={<UserAddOutlined />}
        >
          Tạo người dùng
        </Button>
      )}
      <Table
        columns={columns}
        dataSource={users}
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
        <UpdateRoleModal
          handleCancel={handleCancel}
          isModalOpen={isModalOpen}
          handleUpdateRole={handleUpdateRole}
          loading={loading}
        />
      )}
      {isModalCreateUserOpen && (
        <CreateUserModal
          handleCancel={() => setIsModalCreateUserOpen(false)}
          isModalOpen={isModalCreateUserOpen}
          loading={loading}
          handleFetchUsers={handleFetchUsers}
        />
      )}
    </>
  )
}
export default User
