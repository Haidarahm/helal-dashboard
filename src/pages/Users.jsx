import React, { useEffect, useMemo, useState } from "react";
import { Table,  Typography, Spin, Empty, Button, Select } from "antd";
import useUsersStore from "../store/usersStore";
import useMeetingsStore from "../store/meetingsStore";

const { Title } = Typography;

export const Users = () => {
  const { users, pagination, loading, fetchUsers } = useUsersStore();
  const { meetings, fetchMeetings, sendUsersEmailRoom, sending } =
    useMeetingsStore();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [meetingId, setMeetingId] = useState(null);
  const [showMeetingSelect, setShowMeetingSelect] = useState(false);
  const [meetingsLoading, setMeetingsLoading] = useState(false);

  useEffect(() => {
    fetchUsers(page, perPage);
  }, [page, perPage]);

  const dataSource = useMemo(
    () => (users || []).map((u) => ({ key: u.id, ...u })),
    [users]
  );

  const columns = [
    {
      title: "#",
      key: "order",
      width: 70,
      render: (_text, _record, index) => index + 1,
    },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <Title level={2} className="!mb-0">
            Users
          </Title>
          <div className="flex items-center gap-2">
            {showMeetingSelect && (
              <Select
                style={{ minWidth: 260 }}
                placeholder="Select a meeting"
                value={meetingId}
                onChange={(val) => setMeetingId(val)}
                options={(meetings || []).map((m) => ({
                  label: `${m.summary} — ${m.start_time}`,
                  value: m.id,
                }))}
              />
            )}
            <Button
              loading={meetingsLoading}
              disabled={meetingsLoading}
              onClick={async () => {
                setMeetingsLoading(true);
                try {
                  await fetchMeetings();
                  setShowMeetingSelect(true);
                } finally {
                  setMeetingsLoading(false);
                }
              }}
            >
              Check meetings
            </Button>
            <Button
              type="primary"
              disabled={selectedRowKeys.length === 0 || !meetingId || sending}
              loading={sending}
              onClick={async () => {
                await sendUsersEmailRoom(meetingId, selectedRowKeys);
              }}
            >
              Send room
            </Button>
          </div>
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
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys),
            }}
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
