export default function Loader({ label = 'Loading data' }) {
  return <div className="admin-loader" role="status">
    <div className="admin-loader-art" aria-hidden="true">
      <div className="admin-loader-halo"/>
      <svg className="admin-loader-glasses" viewBox="0 0 120 60" fill="none">
        <defs><linearGradient id="admin-loader-lens" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#dbeafe"/><stop offset="1" stopColor="#c4b5fd"/></linearGradient></defs>
        <path d="M10 25 4 20M110 25l6-5M50 28c6-6 14-6 20 0" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
        <rect x="10" y="16" width="40" height="30" rx="12" fill="url(#admin-loader-lens)" stroke="currentColor" strokeWidth="4"/>
        <rect x="70" y="16" width="40" height="30" rx="12" fill="url(#admin-loader-lens)" stroke="currentColor" strokeWidth="4"/>
        <path className="admin-loader-shine" d="m21 34 9-9m51 9 9-9" stroke="white" strokeWidth="4" strokeLinecap="round"/>
      </svg>
      <div className="admin-loader-shadow"/>
    </div>
    <div className="admin-loader-dots" aria-hidden="true"><span/><span/><span/></div>
    <span className="sr-only">{label}</span>
  </div>;
}
