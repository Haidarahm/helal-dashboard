import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
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
  message,
  Progress,
  Popconfirm,
} from "antd";
import { FiPlay } from "react-icons/fi";

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
  const params = useParams();
  const effectiveId = id ?? params?.id;
  const {
    videos,
    pagination,
    loading,
    fetchCourseVideos,
    createVideo,
    updateVideo,
    deleteVideo,
  } = useVideosStore();
  const uploadProgress = useVideosStore((s) => s.uploadProgress);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [lang] = useState("en");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [playItem, setPlayItem] = useState(null);

  // Watch mutually exclusive fields
  const watchedYoutube = Form.useWatch("youtube_path", form);
  const watchedFile = Form.useWatch("path", form);

  const getYouTubeEmbedUrl = (val) => {
    if (!val) return "";
    try {
      // If it's already an ID (no protocol and short), assume ID
      if (!/^https?:\/\//i.test(val)) {
        return `https://www.youtube.com/embed/${val}`;
      }
      const u = new URL(val);
      if (u.hostname.includes("youtu.be")) {
        const id = u.pathname.split("/").filter(Boolean)[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      if (u.hostname.includes("youtube.com")) {
        const id = u.searchParams.get("v");
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      return val; // fallback
    } catch {
      return `https://www.youtube.com/embed/${val}`;
    }
  };

  useEffect(() => {
    if (effectiveId)
      fetchCourseVideos(effectiveId, { lang, page, per_page: perPage });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveId, page, perPage, lang]);

  useEffect(() => {
    // Initialize form course_id whenever opening
    if (isModalOpen) {
      form.setFieldsValue({ course_id: effectiveId });
    }
  }, [isModalOpen, effectiveId, form]);

  const list = useMemo(() => videos || [], [videos]);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ ...initialForm, course_id: effectiveId });
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

  const beforeUploadVideo = (file) => {
    const isMp4 = file.type === "video/mp4" || /\.mp4$/i.test(file.name);
    if (!isMp4) {
      message.error("Only MP4 files are allowed");
      return Upload.LIST_IGNORE;
    }
    return false; // prevent auto upload
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    const isEditing = !!editing;
    const payload = {
      ...values,
      path: values.path || null,
      cover: values.cover || null,
    };
    const hasFile = !!payload.path;
    const hasYoutube = !!(
      payload.youtube_path && String(payload.youtube_path).trim()
    );
    if (!isEditing) {
      if ((hasFile && hasYoutube) || (!hasFile && !hasYoutube)) {
        message.error(
          "Provide either a YouTube link or an MP4 file (not both)"
        );
        return;
      }
    }
    // Ensure mutually exclusive send
    if (hasFile) {
      payload.youtube_path = undefined;
    } else if (hasYoutube) {
      payload.path = null;
    }
    try {
      if (isEditing) {
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
        <Button type="primary" onClick={openAdd} disabled={!effectiveId}>
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
                <Button key="play" type="link" onClick={() => setPlayItem(v)}>
                  <FiPlay style={{ marginRight: 6 }} /> Play
                </Button>,
                <Button key="edit" type="link" onClick={() => openEdit(v)}>
                  Edit
                </Button>,
                <Popconfirm
                  key="delete"
                  title="Delete Video"
                  description="Are you sure you want to delete this video?"
                  okText="Yes"
                  cancelText="No"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => handleDelete(v.id)}
                >
                  <Button type="link" danger>
                    Delete
                  </Button>
                </Popconfirm>,
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
        {loading && uploadProgress > 0 && (
          <div style={{ marginBottom: 12 }}>
            <Progress
              percent={uploadProgress}
              status={uploadProgress < 100 ? "active" : "normal"}
            />
          </div>
        )}
        <Form
          form={form}
          layout="vertical"
          initialValues={{ ...initialForm, course_id: effectiveId }}
        >
          <Form.Item
            label="Course ID"
            name="course_id"
            rules={editing ? [] : [{ required: true, message: "Required" }]}
          >
            <Input disabled value={effectiveId} />
          </Form.Item>

          <Form.Item label="YouTube Path" name="youtube_path">
            <Input placeholder="youtube url or id" disabled={!!watchedFile} />
          </Form.Item>

          <Form.Item
            label="Title (EN)"
            name="title_en"
            rules={editing ? [] : [{ required: true, message: "Required" }]}
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
            label="Video File (MP4)"
            name="path"
            valuePropName="file"
            getValueFromEvent={extractFile}
            rules={[]}
          >
            <Upload
              beforeUpload={beforeUploadVideo}
              accept="video/mp4"
              maxCount={1}
              onRemove={onRemoveFile}
              disabled={!!watchedYoutube}
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

      <Modal
        title={
          playItem
            ? playItem.title || playItem.title_en || "Preview"
            : "Preview"
        }
        open={!!playItem}
        onCancel={() => setPlayItem(null)}
        footer={null}
        width={800}
      >
        {playItem &&
          (playItem.youtube_path ? (
            <div style={{ position: "relative", paddingTop: "56.25%" }}>
              <iframe
                title="youtube-player"
                src={getYouTubeEmbedUrl(playItem.youtube_path)}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: 0,
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <video
              key={playItem.id}
              src={resolveUrl(playItem.path)}
              style={{ width: "100%" }}
              controls
              autoPlay
            />
          ))}
      </Modal>
    </div>
  );
}
