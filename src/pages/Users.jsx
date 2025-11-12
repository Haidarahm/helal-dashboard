import React, { useEffect, useMemo, useState, useRef } from "react";
import { Table, Typography, Spin, Empty, Button, Select, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import useUsersStore from "../store/usersStore";
import useMeetingsStore from "../store/meetingsStore";

const { Title } = Typography;
const { Search } = Input;

export const Users = () => {
  const { users, pagination, loading, fetchUsers, searchUsers } =
    useUsersStore();
  const { meetings, fetchMeetings, sendUsersEmailRoom, sending } =
    useMeetingsStore();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [meetingId, setMeetingId] = useState(null);
  const [showMeetingSelect, setShowMeetingSelect] = useState(false);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debounceTimerRef = useRef(null);

  // Debounced search function
  const handleSearch = (value) => {
    const trimmedValue = value?.trim() || "";

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    setSearchTerm(value);

    // If search is empty, fetch all users immediately
    if (!trimmedValue) {
      setPage(1);
      fetchUsers(1, perPage);
      return;
    }

    // Set new timer for debounce (1 second)
    debounceTimerRef.current = setTimeout(() => {
      searchUsers(trimmedValue);
      debounceTimerRef.current = null;
    }, 1000);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Fetch users when page or perPage changes (only if not searching)
  useEffect(() => {
    // Only fetch if not searching and search term is empty
    if (
      (!searchTerm || searchTerm.trim() === "") &&
      !debounceTimerRef.current
    ) {
      fetchUsers(page, perPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        <div className="mb-4">
          <Search
            placeholder="Search users by name or email"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onSearch={(value) => handleSearch(value)}
            style={{ maxWidth: 400 }}
          />
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
            pagination={
              searchTerm && searchTerm.trim() !== ""
                ? false // Hide pagination when searching
                : {
                    current: pagination.current_page,
                    total: pagination.total,
                    pageSize: pagination.per_page,
                    showSizeChanger: true,
                    onChange: (p, ps) => {
                      setPage(p);
                      setPerPage(ps);
                    },
                  }
            }
            bordered
          />
        )}
      </div>
    </div>
  );
};
