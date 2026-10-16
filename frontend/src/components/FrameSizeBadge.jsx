import { frameSizing } from '../utils/frameSizing';
import './FrameSizeBadge.css';
export default function FrameSizeBadge({ size }) {
  if (!size) return null;
  const range = frameSizing(size).label;
  return <span className="frame-size-badge"><b>{size}</b>{range && <span>{range}</span>}</span>;
}
