import { useState, useRef, useEffect } from "react";
import { Typography, Button, Popover } from "antd";

const { Text } = Typography;

const DescriptionText = ({ description, maxLines = 2 }) => {
  const [showReadMore, setShowReadMore] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    // Use a timeout to ensure DOM is rendered
    const timer = setTimeout(() => {
      if (textRef.current) {
        const element = textRef.current;
        // Check if text is actually truncated by comparing scrollHeight to clientHeight
        // Add small tolerance for line height differences
        const isOverflowing = element.scrollHeight > element.clientHeight + 2;
        setShowReadMore(isOverflowing);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [description]);

  if (!description) return null;

  // Always render with clamp styling
  return (
    <div>
      <div
        ref={textRef}
        className="text-gray-500 text-sm"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          wordBreak: "break-word",
          lineHeight: "1.5",
          maxHeight: `${maxLines * 1.5 * 0.875}rem`, // Approximate based on text-sm (0.875rem) and line-height 1.5
        }}
      >
        {description}
      </div>
      {showReadMore && (
        <Popover
          content={
            <div style={{ maxWidth: "400px", padding: "4px 0" }}>
              <Text
                className="text-gray-700 text-sm"
                style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
              >
                {description}
              </Text>
            </div>
          }
          title="Full Description"
          trigger="click"
          placement="top"
        >
          <Button
            type="link"
            size="small"
            className="p-0 h-auto text-xs text-blue-600 hover:text-blue-700"
            style={{
              padding: 0,
              height: "auto",
              marginTop: "4px",
              fontSize: "12px",
            }}
          >
            Read more
          </Button>
        </Popover>
      )}
    </div>
  );
};

export default DescriptionText;
