import React, { useEffect, useMemo, useState } from "react";
import useVideosStore from "../store/videosStore";
import {
  Modal,
  Form,
  Input,
  Upload,
  Button,
  Row,
  Col,
  Card,
  Pagination,
} from "antd";

const resolveUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const base = import.meta.env.VITE_BASE_URL || "";
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
};

const initialForm = {
  course_id: "",
  youtube_path: "",
  title_en: "",
  title_ar: "",
  subTitle_en: "",
  subTitle_ar: "",
  description_en: "",
  description_ar: "",
  path: null,
  cover: null,
};

export default function CourseVideos({ id }) {
  const {
    videos,
    pagination,
    loading,
    fetchCourseVideos,
    createVideo,
    updateVideo,
    deleteVideo,
  } = useVideosStore();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [lang] = useState("en");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (id) fetchCourseVideos(id, { lang, page, per_page: perPage });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, page, perPage, lang]);

  useEffect(() => {
    // Initialize form course_id whenever opening
    if (isModalOpen) {
      form.setFieldsValue({ course_id: id });
    }
  }, [isModalOpen, id, form]);

  const list = useMemo(() => videos || [], [videos]);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ ...initialForm, course_id: id });
    setIsModalOpen(true);
  };

  const openEdit = (video) => {
    setEditing(video);
    form.resetFields();
    form.setFieldsValue({
      course_id: video.course_id,
      youtube_path: video.youtube_path || "",
      title_en: video.title_en || "",
      title_ar: video.title_ar || "",
      subTitle_en: video.subTitle_en || "",
      subTitle_ar: video.subTitle_ar || "",
      description_en: video.description_en || "",
      description_ar: video.description_ar || "",
    });
    setIsModalOpen(true);
  };

  const onRemoveFile = () => false;

  const extractFile = (e) => {
    if (Array.isArray(e)) return e;
    return e && e.fileList && e.fileList[0]?.originFileObj;
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      path: values.path || null,
      cover: values.cover || null,
    };
    try {
      if (editing) {
        await updateVideo(editing.id, payload);
      } else {
        await createVideo(payload);
      }
      setIsModalOpen(false);
    } catch (e) {
      // errors are toasted in store
    }
  };

  const handleDelete = async (idToDelete) => {
    await deleteVideo(idToDelete);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h3 style={{ margin: 0 }}>Course Videos</h3>
        <Button type="primary" onClick={openAdd} disabled={!id}>
          Add Video
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {list.map((v) => (
          <Col xs={24} sm={12} md={8} lg={6} key={v.id}>
            <Card
              cover={
                v.cover ? (
                  <img
                    alt={v.title || v.title_en || "video"}
                    src={resolveUrl(v.cover)}
                    style={{ height: 160, objectFit: "cover" }}
                  />
                ) : null
              }
              actions={[
                <Button key="edit" type="link" onClick={() => openEdit(v)}>
                  Edit
                </Button>,
                <Button
                  key="delete"
                  type="link"
                  danger
                  onClick={() => handleDelete(v.id)}
                >
                  Delete
                </Button>,
              ]}
              loading={loading}
            >
              <Card.Meta
                title={v.title || v.title_en || "Untitled"}
                description={
                  <div style={{ fontSize: 12 }}>
                    {v.subTitle || v.subTitle_en}
                    <div
                      style={{
                        color: "#777",
                        marginTop: 6,
                        maxHeight: 40,
                        overflow: "hidden",
                      }}
                    >
                      {v.description || v.description_en}
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <div
        style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}
      >
        <Pagination
          current={pagination.current_page}
          total={pagination.total}
          pageSize={pagination.per_page}
          onChange={(p, ps) => {
            setPage(p);
            setPerPage(ps);
          }}
          showSizeChanger
        />
      </div>

      <Modal
        title={editing ? "Update Video" : "Add Video"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        okButtonProps={{ loading }}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ ...initialForm, course_id: id }}
        >
          <Form.Item
            label="Course ID"
            name="course_id"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input disabled value={id} />
          </Form.Item>

          <Form.Item label="YouTube Path" name="youtube_path">
            <Input placeholder="youtube url or id" />
          </Form.Item>

          <Form.Item
            label="Title (EN)"
            name="title_en"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Title (AR)" name="title_ar">
            <Input />
          </Form.Item>

          <Form.Item label="Subtitle (EN)" name="subTitle_en">
            <Input />
          </Form.Item>
          <Form.Item label="Subtitle (AR)" name="subTitle_ar">
            <Input />
          </Form.Item>

          <Form.Item label="Description (EN)" name="description_en">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Description (AR)" name="description_ar">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Video File"
            name="path"
            valuePropName="file"
            getValueFromEvent={extractFile}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              onRemove={onRemoveFile}
            >
              <Button>Select Video</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="Cover Image"
            name="cover"
            valuePropName="file"
            getValueFromEvent={extractFile}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              onRemove={onRemoveFile}
            >
              <Button>Select Cover</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
