import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import loaderVideo from './loader.mp4';

const LoadingContext = createContext(null);

export function LoaderProvider({ children, className }) {
  const [label, setLabel] = useState(null);
  const active = useRef(new Map());
  const register = useCallback((text) => {
    const token = Symbol();
    active.current.set(token, text);
    setLabel(text);
    return () => {
      active.current.delete(token);
      if (active.current.size) {
        setLabel([...active.current.values()].at(-1));
        return;
      }
      setLabel(null);
    };
  }, []);
  return (
    <LoadingContext.Provider value={register}>
      <div style={{ display: 'contents' }} inert={label !== null}>
        {children}
      </div>
      {label !== null && createPortal(
        <div className={`${className}-loader`} role="status" style={{ background: 'white' }}>
          <video className={`${className}-loader-video`} src={loaderVideo} autoPlay loop muted playsInline aria-hidden="true" />
          <span className="sr-only">{label}</span>
        </div>,
        document.body,
      )}
    </LoadingContext.Provider>
  );
}

export default function Loader({ label = 'Loading data' }) {
  const register = useContext(LoadingContext);
  useLayoutEffect(() => register(label), [register, label]);
  return null;
}
