import React, { useEffect, useMemo } from "react";
import { Table, Button, Spin, Empty, Typography, message } from "antd";
import { FiCopy } from "react-icons/fi";
import useMeetingsStore from "../store/meetingsStore";

const { Title } = Typography;

const Meetings = () => {
  const { meetings, loading, fetchMeetings } = useMeetingsStore();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const dataSource = useMemo(
    () => (meetings || []).map((m) => ({ key: m.id, ...m })),
    [meetings]
  );

  const handleCopyUrl = async (url) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      message.success("Meet URL copied to clipboard!");
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        message.success("Meet URL copied to clipboard!");
      } catch (error) {
        message.error("Failed to copy URL");
      }
      document.body.removeChild(textArea);
    }
  };

  const columns = [
    {
      title: "#",
      key: "order",
      width: 70,
      render: (_text, _record, index) => index + 1,
    },
    { title: "Summary", dataIndex: "summary", key: "summary" },
    { title: "Start Time", dataIndex: "start_time", key: "start_time" },
    {
      title: "Duration (min)",
      dataIndex: "duration",
      key: "duration",
      width: 120,
    },
    {
      title: "Meet URL",
      dataIndex: "meet_url",
      key: "meet_url",
      render: (url) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a href={url} target="_blank" rel="noreferrer" style={{ flex: 1 }}>
            {url}
          </a>
          {url && (
            <Button
              type="text"
              icon={<FiCopy />}
              size="small"
              onClick={() => handleCopyUrl(url)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "4px 8px",
              }}
            />
          )}
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 140,
      render: () => <Button type="link">Send emails</Button>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <Title level={2} className="!mb-0">
            Meetings
          </Title>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : dataSource.length === 0 ? (
          <Empty description="No meetings found" />
        ) : (
          <Table columns={columns} dataSource={dataSource} bordered />
        )}
      </div>
    </div>
  );
};

export default Meetings;
