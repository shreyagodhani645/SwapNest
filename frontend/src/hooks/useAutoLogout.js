import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const IDLE_TIMEOUT = 900000; // 15 minutes
const EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

const useAutoLogout = () => {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return undefined;

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', {
        state: { message: 'You were logged out due to inactivity.' },
        replace: true,
      });
    };

    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(logout, IDLE_TIMEOUT);
    };

    EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer);
    });

    resetTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer);
      });
    };
  }, [navigate]);
};

export default useAutoLogout;
