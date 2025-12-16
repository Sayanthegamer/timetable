import { useState, useEffect } from 'react';
import { useSDK } from './useSDK';
import type { Schedule } from 'timetable-sdk';
import { db } from '../services/db';
import { getMockSchedule } from '../services/mock-backend';

const USE_MOCK = import.meta.env.DEV && !import.meta.env.VITE_API_URL;

export function useSchedule() {
  const sdk = useSDK();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        if (USE_MOCK) {
          const data = getMockSchedule();
          setSchedule(data);
          await db.saveSchedule(data);
          setError(null);
          setLoading(false);
          return;
        }

        const data = await sdk.api.getSchedule();
        setSchedule(data);
        await db.saveSchedule(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load schedule:', err);
        const cached = await db.getSchedule();
        if (cached) {
          setSchedule(cached);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load schedule');
        }
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();

    sdk.socket.on('schedule:updated', (data) => {
      setSchedule(data);
      db.saveSchedule(data);
    });

    sdk.socket.on('schedule:sync', (data) => {
      setSchedule(data);
      db.saveSchedule(data);
    });

    return () => {
      sdk.socket.off('schedule:updated', () => {});
      sdk.socket.off('schedule:sync', () => {});
    };
  }, [sdk]);

  return { schedule, loading, error };
}
