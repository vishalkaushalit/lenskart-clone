import { useId, useState } from 'react';
import './PasswordInput.css';

export default function PasswordInput({ id, disabled, ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [visible, setVisible] = useState(false);
  return <span className="password-input">
    <input {...props} id={inputId} type={visible ? 'text' : 'password'} disabled={disabled} />
    <button className="password-input-toggle" type="button" disabled={disabled} aria-controls={inputId} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} onClick={() => setVisible(value => !value)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{visible ? <><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A11 11 0 0 1 12 5c7 0 10 7 10 7a16 16 0 0 1-3 4M6.6 6.6C3.5 8.5 2 12 2 12s3 7 10 7a11 11 0 0 0 5.4-1.4" /></> : <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>}</svg></button>
  </span>;
}
