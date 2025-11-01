import React, { useEffect, useMemo, useState } from "react";
import { Table, Tag, Typography, Spin, Empty } from "antd";
import useUsersStore from "../store/usersStore";

const { Title } = Typography;

export const Users = () => {
  const { users, pagination, loading, fetchUsers } = useUsersStore();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    fetchUsers(page, perPage);
  }, [page, perPage]);

  const dataSource = useMemo(
    () => (users || []).map((u) => ({ key: u.id, ...u })),
    [users]
  );

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "Active",
      dataIndex: "is_active",
      key: "is_active",
      render: (val) =>
        val ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="default">Inactive</Tag>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <Title level={2} className="!mb-0">
            Users
          </Title>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : dataSource.length === 0 ? (
          <Empty description="No users found" />
        ) : (
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={{
              current: pagination.current_page,
              total: pagination.total,
              pageSize: pagination.per_page,
              showSizeChanger: true,
              onChange: (p, ps) => {
                setPage(p);
                setPerPage(ps);
              },
            }}
            bordered
          />
        )}
      </div>
    </div>
  );
};
