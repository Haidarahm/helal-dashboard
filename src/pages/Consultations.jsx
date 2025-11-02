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
  DatePicker,
  TimePicker,
} from "antd";
import useConsultationStore from "../store/consultationStore";
import dayjs from "dayjs";

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
  const [currentRow, setCurrentRow] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchConsultations(page, perPage);
  }, [page, perPage]);

  const dataSource = useMemo(
    () => (consultations || []).map((c) => ({ key: c.id, ...c })),
    [consultations]
  );

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
      title: "Is Done",
      dataIndex: "is_done",
      key: "is_done",
      render: (v) => (v ? "Yes" : "No"),
    },
    { title: "Date", dataIndex: "consultation_date", key: "consultation_date" },
    { title: "Time", dataIndex: "consultation_time", key: "consultation_time" },
    { title: "Created", dataIndex: "created_at", key: "created_at" },
    {
      title: "Action",
      key: "action",
      width: 160,
      render: (_t, row) => (
        <Button
          type="link"
          onClick={() => {
            setCurrentRow(row);
            setOpen(true);
            form.resetFields();
          }}
        >
          Send response
        </Button>
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
          <Table
          className="w-full"
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
    </div>
  );
};
