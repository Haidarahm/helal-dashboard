import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Button,
  message,
} from "antd";
import dayjs from "dayjs";
import useMeetStore from "../store/meetStore";

const StartMeetingModal = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const { createMeeting, loading } = useMeetStore();
  const [createdInfo, setCreatedInfo] = useState(null);

  const handleOk = async () => {
    if (createdInfo) {
      onClose && onClose();
      return;
    }
    const values = await form.validateFields();
    const start = values.start_time
      ? dayjs(values.start_time).format("YYYY-MM-DD HH:mm:ss")
      : "";
    const res = await createMeeting({
      summary: values.summary,
      start_time: start,
      duration: Number(values.duration || 0),
    });
    if (res.success) {
      console.log(res);
      setCreatedInfo(res.data.meeting.meet_url);
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(createdInfo || "");
      message.success("Meeting link copied to clipboard");
    } catch (e) {
      message.error("Failed to copy link");
    }
  };

  return (
    <Modal
      title={createdInfo ? "Meeting Created" : "Start Meeting"}
      open={open}
      onCancel={onClose}
      okText={createdInfo ? "Close" : "Create"}
      onOk={handleOk}
      okButtonProps={{ loading }}
      destroyOnClose
      footer={
        createdInfo
          ? [
              <Button key="copy" type="primary" onClick={copyUrl}>
                Copy Link
              </Button>,
              <Button key="close" onClick={onClose}>
                Close
              </Button>,
            ]
          : undefined
      }
    >
      {createdInfo ? (
        <div>
          <div style={{ marginBottom: 8 }}>
            { "Meeting created successfully"}
          </div>
          <Input readOnly value={createdInfo || ""} />
        </div>
      ) : (
        <Form form={form} layout="vertical">
            <Form.Item
            name="start_time"
            label="Start Time"
            rules={[{ required: true, message: "Please select start time" }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="Select start time"
              placement="topLeft"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            name="summary"
            label="Summary"
            rules={[
              { required: true, message: "Please enter meeting summary" },
            ]}
          >
            <Input placeholder="Team Meeting" />
          </Form.Item>
        
          <Form.Item
            name="duration"
            label="Duration (minutes)"
            rules={[{ required: true, message: "Please enter duration" }]}
          >
            <InputNumber min={1} step={5} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default StartMeetingModal;
