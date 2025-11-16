import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  Button,
  Typography,
  Spin,
  Empty,
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
} from "antd";
import useConsultationStore from "../store/consultationStore";
import dayjs from "dayjs";
import { FiEye } from "react-icons/fi";

const { Title } = Typography;

export const Consultations = () => {
  const {
    consultations,
    pagination,
    loading,
    fetchConsultations,
    sendConsultationResponse,
    sending,
  } = useConsultationStore();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [form] = Form.useForm();
  const containerRef = useRef(null);
  const [tableKey, setTableKey] = useState(0);

  useEffect(() => {
    fetchConsultations(page, perPage);
  }, [page, perPage]);

  // Re-render table when container size changes (e.g., sidebar open/close)
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => setTableKey((k) => k + 1));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const dataSource = useMemo(
    () => (consultations || []).map((c) => ({ key: c.id, ...c })),
    [consultations]
  );

  const trimTime = (t) =>
    typeof t === "string" ? t.split(":").slice(0, 2).join(":") : t || "-";

  const columns = [
    { title: "#", key: "order", width: 70, render: (_t, _r, i) => i + 1 },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
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
      title: "Date",
      key: "consultation_date",
      render: (_v, row) =>
        row?.appointment?.date
          ? dayjs(row.appointment.date).format("YYYY-MM-DD")
          : "-",
    },
    {
      title: "Time",
      key: "consultation_time",
      render: (_v, row) => {
        const start = row?.appointment?.start_time;
        const end = row?.appointment?.end_time;
        if (!start && !end) return "-";
        const s = trimTime(start);
        const e = trimTime(end);
        return start && end ? `${s} - ${e}` : start ? s : e;
      },
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      render: (_t, row) => (
        <Button
          type="text"
          onClick={() => {
            setCurrentRow(row);
            setViewOpen(true);
          }}
          icon={<FiEye />}
          aria-label="View"
        />
      ),
    },
  ];

  const handleOk = async () => {
    const values = await form.validateFields();
    const date = values.date ? dayjs(values.date).format("YYYY-MM-DD") : "";
    const time = values.time ? dayjs(values.time).format("HH:mm") : "";
    await sendConsultationResponse({
      consultation_id: currentRow?.id,
      meet_url: values.meet_url,
      date,
      time,
    });
    setOpen(false);
    setCurrentRow(null);
    fetchConsultations(page, perPage);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center  justify-between mb-4">
          <Title level={2} className="!mb-0">
            Consultations
          </Title>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : dataSource.length === 0 ? (
          <Empty description="No consultations found" />
        ) : (
          <div ref={containerRef} style={{ width: "100%" }}>
            <Table
              key={tableKey}
              className="w-full"
              columns={columns}
              dataSource={dataSource}
              style={{ width: "100%" }}
              tableLayout="fixed"
              scroll={{ x: "max-content" }}
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
          </div>
        )}
      </div>

      <Modal
        title="Send consultation response"
        open={open}
        onCancel={() => {
          setOpen(false);
          setCurrentRow(null);
        }}
        onOk={handleOk}
        okButtonProps={{ loading: sending }}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="meet_url"
            label="Meeting URL"
            rules={[{ required: true, message: "Please enter meeting url" }]}
          >
            <Input placeholder="https://meet.jit.si/meeting_..." />
          </Form.Item>
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: "Please select date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="time"
            label="Time"
            rules={[{ required: true, message: "Please select time" }]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Consultation Details"
        open={viewOpen}
        onCancel={() => {
          setViewOpen(false);
          setCurrentRow(null);
        }}
        footer={null}
        destroyOnClose
        width={720}
      >
        {currentRow && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
            {/* Emphasized appointment summary */}
            <div
              style={{
                background: "#F8FAFF",
                border: "1px solid #E5EDFF",
                borderRadius: 12,
                padding: 14,
              }}
            >
              <div
                style={{ fontWeight: 700, color: "#1f2937", marginBottom: 8 }}
              >
                Appointment
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Date</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {currentRow.appointment?.date
                      ? dayjs(currentRow.appointment.date).format("YYYY-MM-DD")
                      : "-"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Start</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {trimTime(currentRow.appointment?.start_time)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>End</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {trimTime(currentRow.appointment?.end_time)}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {/* Basic fields */}
              <div>
                <strong>Name</strong>
                <div>{currentRow.name || "-"}</div>
              </div>
              <div>
                <strong>Email</strong>
                <div>{currentRow.email || "-"}</div>
              </div>
              <div>
                <strong>Phone</strong>
                <div>{currentRow.phone || "-"}</div>
              </div>
              <div>
                <strong>Meet URL</strong>
                <div>
                  {currentRow.meet_url ? (
                    <a
                      href={currentRow.meet_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {currentRow.meet_url}
                    </a>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
              <div>
                <strong>Currency</strong>
                <div>{currentRow.currency || "-"}</div>
              </div>

              {/* Information (without created_at/updated_at) */}
              {currentRow.information && (
                <div style={{ gridColumn: "1 / -1", marginTop: 8 }}>
                  <strong>Information</strong>
                  <div
                    style={{
                      background: "#fafafa",
                      border: "1px solid #eee",
                      borderRadius: 8,
                      padding: 10,
                      marginTop: 6,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                      }}
                    >
                      <div>
                        <strong>Type (EN)</strong>
                        <div>{currentRow.information.type_en || "-"}</div>
                      </div>
                      <div>
                        <strong>Type (AR)</strong>
                        <div dir="rtl">
                          {currentRow.information.type_ar || "-"}
                        </div>
                      </div>
                      <div>
                        <strong>Price (AED)</strong>
                        <div>{currentRow.information.price_aed ?? "-"}</div>
                      </div>
                      <div>
                        <strong>Price (USD)</strong>
                        <div>{currentRow.information.price_usd ?? "-"}</div>
                      </div>
                      <div>
                        <strong>Duration (min)</strong>
                        <div>{currentRow.information.duration ?? "-"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appointment moved to emphasized header above */}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
