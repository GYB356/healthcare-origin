import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface NotificationProps {
  message: string;
  type: "info" | "success" | "error" | "warning";
  duration?: number;
  onClose?: () => void;
}

const typeToClassName = {
  info: "bg-blue-100 border-blue-500 text-blue-800",
  success: "bg-green-100 border-green-500 text-green-800",
  error: "bg-red-100 border-red-500 text-red-800",
  warning: "bg-yellow-100 border-yellow-500 text-yellow-800",
};

export const showNotification = (props: NotificationProps) => {
  const { message, type, duration = 3000, onClose } = props;

  switch (type) {
    case "info":
      toast.info(message, { autoClose: duration, onClose });
      break;
    case "success":
      toast.success(message, { autoClose: duration, onClose });
      break;
    case "error":
      toast.error(message, { autoClose: duration, onClose });
      break;
    case "warning":
      toast.warning(message, { autoClose: duration, onClose });
      break;
  }
};

export const InlineNotification = (props: NotificationProps) => {
  const { message, type, duration, onClose } = props;
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div className={`${typeToClassName[type]} border-l-4 p-4 mb-4 rounded shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="font-medium">{message}</span>
        </div>
        <button
          onClick={() => {
            setVisible(false);
            onClose?.();
          }}
          className="text-gray-500 hover:text-gray-800"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default InlineNotification;
