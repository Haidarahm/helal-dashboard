import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Typography,
  Spin,
  Empty,
  Modal,
  Form,
  Select,
  TimePicker,
  Space,
  Popconfirm,
  message,
  Card,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { FiCalendar, FiClock, FiTrash2 } from "react-icons/fi";
import dayjs from "dayjs";
import useAvailabilityStore from "../store/availabilityStore";

const { Title, Text } = Typography;
const { Option } = Select;

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const Availability = () => {
  const {
    availabilities,
    loading,
    fetchAvailabilities,
    createAvailability,
    deleteAvailability,
  } = useAvailabilityStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAvailabilities();
  }, [fetchAvailabilities]);

  const dataSource = useMemo(
    () => (availabilities || []).map((a) => ({ key: a.id, ...a })),
    [availabilities]
  );

  const handleAddAvailability = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const availabilitiesData = values.availabilities || [];

      // Filter out incomplete entries
      const validAvailabilities = availabilitiesData.filter(
        (avail) => avail.day && avail.start_time && avail.end_time
      );

      if (validAvailabilities.length === 0) {
        message.error("Please add at least one complete availability");
        return;
      }

      // Format time to HH:mm format (e.g., "16:00") as requested
      // Display will also show as HH:mm (e.g., "16:00") using formatTime function
      const formattedAvailabilities = validAvailabilities.map((avail) => {
        const startTime = dayjs(avail.start_time);
        const endTime = dayjs(avail.end_time);

        // Validate times
        if (!startTime.isValid() || !endTime.isValid()) {
          throw new Error("Invalid time format. Please select valid times.");
        }

        // Check if end time is after start time
        if (endTime.isBefore(startTime) || endTime.isSame(startTime)) {
          throw new Error("End time must be after start time");
        }

        // Format as HH:mm (e.g., "16:00") - exact format requested by user
        const startTimeStr = startTime.format("HH:mm");
        const endTimeStr = endTime.format("HH:mm");

        // Validate the format matches HH:mm pattern
        const timeFormatRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
        if (
          !timeFormatRegex.test(startTimeStr) ||
          !timeFormatRegex.test(endTimeStr)
        ) {
          throw new Error(
            `Invalid time format. Expected HH:mm format (e.g., 16:00). Got: ${startTimeStr}, ${endTimeStr}`
          );
        }

        return {
          day: avail.day,
          start_time: startTimeStr,
          end_time: endTimeStr,
        };
      });

      // Debug: Log what we're sending
      console.log("Submitting availabilities:", formattedAvailabilities);

      const result = await createAvailability(formattedAvailabilities);
      if (result.success) {
        setIsModalOpen(false);
        form.resetFields();
      } else {
        // Show the error from the store if creation failed
        console.error("Failed to create availability:", result.error);
      }
      // Error is already handled and displayed by the store
    } catch (error) {
      console.error("Form validation failed:", error);
      if (error.message) {
        message.error(error.message);
      } else {
        message.error(
          "Failed to create availability. Please check your inputs."
        );
      }
    }
  };

  const handleDelete = async (id) => {
    await deleteAvailability(id);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    // Handle both HH:mm:ss and HH:mm formats
    const parts = timeString.split(":");
    if (parts.length < 2) return timeString;

    // Extract hours and minutes, ensure proper padding
    const hours = parts[0].padStart(2, "0");
    const minutes = parts[1].padStart(2, "0");

    // Return in HH:mm format (e.g., "16:00")
    return `${hours}:${minutes}`;
  };

  const columns = [
    {
      title: "#",
      key: "order",
      width: 70,
      render: (_text, _record, index) => index + 1,
    },
    {
      title: "Day",
      dataIndex: "day",
      key: "day",
      render: (day) => (
        <div className="flex items-center gap-2">
          <FiCalendar className="text-blue-500" />
          <span className="font-medium">{day}</span>
        </div>
      ),
    },
    {
      title: "Start Time",
      dataIndex: "start_time",
      key: "start_time",
      render: (time) => (
        <div className="flex items-center gap-2">
          <FiClock className="text-green-500" />
          <span>{formatTime(time)}</span>
        </div>
      ),
    },
    {
      title: "End Time",
      dataIndex: "end_time",
      key: "end_time",
      render: (time) => (
        <div className="flex items-center gap-2">
          <FiClock className="text-red-500" />
          <span>{formatTime(time)}</span>
        </div>
      ),
    },
    {
      title: "Duration",
      key: "duration",
      render: (_, record) => {
        if (!record.start_time || !record.end_time) return "-";
        // Parse time - handle both HH:mm:ss and HH:mm formats
        const startTimeStr = formatTime(record.start_time);
        const endTimeStr = formatTime(record.end_time);
        const start = dayjs(startTimeStr, "HH:mm");
        const end = dayjs(endTimeStr, "HH:mm");

        if (!start.isValid() || !end.isValid()) return "-";

        const duration = end.diff(start, "hour", true);
        if (duration < 0) return "-"; // Invalid if end is before start

        const hours = Math.floor(duration);
        const minutes = Math.round((duration - hours) * 60);
        return (
          <div className="flex items-center gap-2">
            <ClockCircleOutlined className="text-purple-500" />
            <span>
              {hours > 0 ? `${hours}h ` : ""}
              {minutes > 0
                ? `${minutes}m`
                : minutes === 0 && hours === 0
                ? "0m"
                : ""}
            </span>
          </div>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="Delete Availability"
          description="Are you sure you want to delete this availability?"
          onConfirm={() => handleDelete(record.id)}
          okText="Yes"
          cancelText="No"
          okButtonProps={{ danger: true }}
        >
          <Button
            type="text"
            danger
            icon={<FiTrash2 />}
            className="flex items-center"
          >
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Title level={2} className="!mb-0">
              Availability Schedule
            </Title>
            <Text type="secondary" className="text-sm">
              Manage your weekly availability schedule
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddAvailability}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0"
            size="large"
          >
            Add Availability
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : dataSource.length === 0 ? (
          <Empty
            description="No availabilities found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddAvailability}
            >
              Add Availability
            </Button>
          </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={dataSource}
            bordered
            pagination={false}
          />
        )}
      </div>

      <Modal
        title="Add Availability"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText="Add"
        cancelText="Cancel"
        okButtonProps={{ loading: loading }}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.List
            name="availabilities"
            initialValue={[
              { day: undefined, start_time: null, end_time: null },
            ]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    size="small"
                    className="mb-4 border-gray-200"
                    extra={
                      fields.length > 1 ? (
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                          size="small"
                        >
                          Remove
                        </Button>
                      ) : null
                    }
                  >
                    <Space
                      direction="vertical"
                      size="middle"
                      className="w-full"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "day"]}
                        label="Day"
                        rules={[
                          { required: true, message: "Please select a day" },
                        ]}
                      >
                        <Select
                          placeholder="Select day"
                          style={{ width: "100%" }}
                          size="large"
                        >
                          {DAYS_OF_WEEK.map((day) => (
                            <Option key={day} value={day}>
                              {day}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                          {...restField}
                          name={[name, "start_time"]}
                          label="Start Time"
                          rules={[
                            {
                              required: true,
                              message: "Please select start time",
                            },
                          ]}
                        >
                          <TimePicker
                            format="HH:mm"
                            style={{ width: "100%" }}
                            size="large"
                            placeholder="Start time"
                            className="w-full"
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "end_time"]}
                          label="End Time"
                          rules={[
                            {
                              required: true,
                              message: "Please select end time",
                            },
                          ]}
                        >
                          <TimePicker
                            format="HH:mm"
                            style={{ width: "100%" }}
                            size="large"
                            placeholder="End time"
                            className="w-full"
                          />
                        </Form.Item>
                      </div>
                    </Space>
                  </Card>
                ))}

                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  className="w-full"
                  size="large"
                >
                  Add Another Availability
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default Availability;
