import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SystemClass from '../SystemClass'; 

function RouteChangeListener() {
  const location = useLocation();

  useEffect(() => {
    if (SystemClass.DialogComponent && typeof SystemClass.DialogComponent.cancelAllDialogs === 'function') {
      SystemClass.DialogComponent.cancelAllDialogs();
    }
  }, [location.pathname]); 

  return null;
}

export default RouteChangeListener;