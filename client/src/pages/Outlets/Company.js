import { useState, useEffect } from 'react'
import { Table, Tag } from 'antd'
import app from '../../axiosConfig'
import { useCompanies } from '../../zustand'

const User = () => {
  const [companies, setCompanies] = useState([])
  const { companies: currentCompanies } = useCompanies()
  const columns = [
    {
      title: 'Tên công ty',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
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
  ]

  useEffect(() => {
    if (currentCompanies.length > 0) setCompanies(currentCompanies)
  }, [])
  return (
    <Table
      columns={columns}
      dataSource={companies}
      bordered
      size="small"
      rowKey={(record) => record._id}
      pagination={{ pageSize: 80 }}
    />
  )
}
export default User
