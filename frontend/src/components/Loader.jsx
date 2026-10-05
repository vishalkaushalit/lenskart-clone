import {createPortal} from 'react-dom';
export default function Loader({ label = 'Loading data' }) {
  return createPortal(<div className="store-loader" role="status">
    <div className="store-loader-scene" aria-hidden="true">
      <div className="store-loader-cube">{['front','back','right','left','top','bottom'].map(face=><span key={face} className={`store-loader-face is-${face}`}/>)}</div>
      <div className="store-loader-shadow"/>
    </div>
    <span className="sr-only">{label}</span>
  </div>,document.body);
}
