import { useState, useEffect } from 'react'
import { Layout, Menu, theme } from 'antd'
import { Avatar } from 'antd'
import { useZustand } from '../zustand'
import { FaRegBuilding } from 'react-icons/fa'
import { Dropdown } from 'antd'
import { PoweroffOutlined, LockOutlined } from '@ant-design/icons'
import { FaCaretDown } from 'react-icons/fa'
import app from '../axiosConfig'
import ChangePasswordModal from '../widgets/changePasswordModal'
import { Outlet, useNavigate } from 'react-router'
import Loading from '../widgets/loading'
import { FaRegUser } from 'react-icons/fa6'
import { BsBank2 } from 'react-icons/bs'
const { Header, Content, Sider } = Layout

const siderStyle = {
  overflow: 'auto',
  height: '100vh',
  position: 'sticky',
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: 'thin',
  scrollbarGutter: 'stable',
}

const App = () => {
  const { auth, logout } = useZustand()
  const { setUserState, setCompanyState, setBankState, setBankAccountState } =
    useZustand()
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [sidebarIndex, setSidebarIndex] = useState('1')
  const navigate = useNavigate()

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const handleLogout = async (needConfirm = true) => {
    if (needConfirm && !window.confirm('Bạn có muốn đăng xuất?')) return
    await app.delete('/api/log-out')
    logout()
  }

  const handleNavigate = (name, value) => {
    setSidebarIndex(value.toString())
    navigate(name)
  }

  const navbarItems = [
    {
      key: 1,
      icon: <FaRegUser />,
      label: 'Người dùng',
      onClick: () => {
        handleNavigate('/', 1)
      },
    },
    {
      key: 2,
      icon: <FaRegBuilding />,
      label: 'Công ty',
      onClick: () => {
        handleNavigate('/company', 2)
      },
    },
    {
      key: 3,
      icon: <BsBank2 />,
      label: 'Ngân hàng',
      onClick: () => {
        handleNavigate('/bank', 3)
      },
    },
  ]

  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const handleChangePassword = async (oldPass, newPass) => {
    try {
      if (loading) return
      setLoading(true)
      await app.patch('/api/change-password', { oldPass, newPass })
      alert('Đã đổi mật khẩu thành công! Vui lòng đăng nhập lại')
      await handleLogout(false)
    } catch (error) {
      alert(error?.response?.data?.msg || error)
    } finally {
      setLoading(false)
    }
  }

  const handleFetchData = async () => {
    try {
      setIsFetching(true)
      const result = await Promise.all([
        app.get(`/api/get-users`),
        app.get('/api/get-companies'),
        app.get('/api/get-banks'),
        app.get('/api/get-bank-accounts'),
      ])

      setUserState(result[0]?.data?.data)
      setCompanyState(result[1]?.data?.data)
      setBankState(result[2]?.data?.data)
      setBankAccountState(result[3]?.data?.data)
    } catch (error) {
      alert(error?.response?.data?.msg || error)
    } finally {
      setIsFetching(false)
    }
  }

  const items = [
    {
      label: 'Đổi mật khẩu',
      key: '0',
      icon: <LockOutlined />,
      onClick: showModal,
    },
    {
      type: 'divider',
    },
    {
      label: 'Đăng xuất',
      key: '1',
      danger: true,
      icon: <PoweroffOutlined />,
      onClick: handleLogout,
    },
  ]

  useEffect(() => {
    handleFetchData()
  }, [])

  if (isFetching) return <Loading />

  return (
    <Layout hasSider>
      <Sider style={siderStyle}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[sidebarIndex]}
          items={navbarItems}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '1px 1px 3px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 1rem',
          }}
        >
          {isModalOpen && (
            <ChangePasswordModal
              handleCancel={handleCancel}
              isModalOpen={isModalOpen}
              handleChangePassword={handleChangePassword}
              loading={loading}
            />
          )}
          <Dropdown
            menu={{
              items,
            }}
            trigger={['click']}
          >
            <span onClick={(e) => e.preventDefault()}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                <Avatar style={{ backgroundColor: '#f56a00' }}>
                  {auth?.name.slice(0, 1).toUpperCase()}
                </Avatar>
                <span className="text-xm mr-1">{auth.name}</span>
                <FaCaretDown />
              </div>
            </span>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px 16px 24px', overflow: 'initial' }}>
          <div
            style={{
              padding: 24,
              boxShadow: '1px 1px 1px rgba(0,0,0,0.1)',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
export default App
