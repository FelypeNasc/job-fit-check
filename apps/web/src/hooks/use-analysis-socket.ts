'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? 'http://localhost:3001';

export interface AnalysisProgressState {
  active: boolean;
  total: number;
  completed: number;
  currentJob: { title: string; company: string } | null;
}

export function useAnalysisSocket(onJobDone?: () => void, onAllDone?: () => void) {
  const [progress, setProgress] = useState<AnalysisProgressState>({
    active: false,
    total: 0,
    completed: 0,
    currentJob: null,
  });
  const socketRef = useRef<Socket | null>(null);
  const onJobDoneRef = useRef(onJobDone);
  const onAllDoneRef = useRef(onAllDone);
  onJobDoneRef.current = onJobDone;
  onAllDoneRef.current = onAllDone;

  useEffect(() => {
    const socket = io(`${SOCKET_URL}/analysis`, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('analysis:queued', ({ count }: { count: number }) => {
      setProgress(p => ({ ...p, total: p.total + count, active: true }));
    });

    socket.on('analysis:started', ({ title, company }: { title: string; company: string }) => {
      setProgress(p => ({ ...p, currentJob: { title, company } }));
    });

    const handleDone = () => {
      onJobDoneRef.current?.();
      setProgress(p => {
        const completed = p.completed + 1;
        const done = completed >= p.total;
        if (done) {
          setTimeout(() => {
            onAllDoneRef.current?.();
            setProgress({ active: false, total: 0, completed: 0, currentJob: null });
          }, 2000);
        }
        return { ...p, completed, active: !done };
      });
    };

    socket.on('analysis:completed', handleDone);
    socket.on('analysis:failed', handleDone);

    return () => {
      socket.disconnect();
    };
  }, []);

  return progress;
}
