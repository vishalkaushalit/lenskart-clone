import { useState } from "react";
import NotificationPopup from "./NotificationPopup";

export default function PopupMessage({ message, type = "error", onClose }) {
  const [dismissed, setDismissed] = useState(null);
  if (!message || dismissed === message) return null;
  return <NotificationPopup key={`${type}-${message}`} notification={{ type, message }} onClose={() => { setDismissed(message); onClose?.(); }} />;
}
