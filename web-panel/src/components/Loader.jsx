export default function Loader({ label = 'Loading data' }) {
  return <div className="admin-loader" role="status">
    <div className="admin-loader-scene" aria-hidden="true">
      <div className="admin-loader-cube">{['front','back','right','left','top','bottom'].map(face=><span key={face} className={`admin-loader-face is-${face}`}/>)}</div>
      <div className="admin-loader-shadow"/>
    </div>
    <span className="sr-only">{label}</span>
  </div>;
}
