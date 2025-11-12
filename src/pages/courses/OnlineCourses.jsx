import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Typography,
  Spin,
  Empty,
  Modal,
  Form,
  Input,
  Upload,
  DatePicker,
  TimePicker,
  Image,
} from "antd";
import useOnlineCoursesStore from "../../store/onlineCoursesStore";

const { Title, Text } = Typography;

const OnlineCourses = () => {
  const { onlineCourses, pagination, loading, fetchOnlineCourses } =
    useOnlineCoursesStore();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [lang] = useState("ar");

  useEffect(() => {
    fetchOnlineCourses({ lang, page, per_page: perPage });
  }, [lang, page, perPage]);

  const dataSource = useMemo(
    () => (onlineCourses || []).map((c) => ({ key: c.id, ...c })),
    [onlineCourses]
  );

  const columns = [
    { title: "#", key: "order", width: 70, render: (_t, _r, i) => i + 1 },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Price (AED)",
      dataIndex: "price_aed",
      key: "price_aed",
      width: 120,
    },
    {
      title: "Price (USD)",
      dataIndex: "price_usd",
      key: "price_usd",
      width: 120,
    },
    {
      title: "Cover",
      dataIndex: "cover_image",
      key: "cover_image",
      width: 120,
      render: (src) =>
        src ? (
          <Image
            src={src}
            width={80}
            height={50}
            style={{ objectFit: "cover" }}
          />
        ) : (
          "-"
        ),
    },
    {
      title: "Meet URL",
      dataIndex: "meet_url",
      key: "meet_url",
      render: (url) =>
        url ? (
          <a href={url} target="_blank" rel="noreferrer">
            {url}
          </a>
        ) : (
          "-"
        ),
    },
    {
      title: "Appointment",
      key: "appointment",
      render: (_, row) => {
        const ap = row.appointment || {};
        if (!ap || (!ap.date && !ap.start_time)) return "-";

        const date = ap.date ? new Date(ap.date).toLocaleDateString() : "";
        const trimSeconds = (t) =>
          typeof t === "string" ? t.split(":").slice(0, 2).join(":") : "";
        const timeRange =
          ap.start_time && ap.end_time
            ? `${trimSeconds(ap.start_time)} - ${trimSeconds(ap.end_time)}`
            : trimSeconds(ap.start_time);

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {date && <Text>{date}</Text>}
            {timeRange && <Text type="secondary">{timeRange}</Text>}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <Title level={2} className="!mb-0">
            Online Courses
          </Title>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : dataSource.length === 0 ? (
          <Empty description="No online courses found" />
        ) : (
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={{
              current: pagination?.current_page || page,
              total: pagination?.total || dataSource.length,
              pageSize: pagination?.per_page || perPage,
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

export default OnlineCourses;
