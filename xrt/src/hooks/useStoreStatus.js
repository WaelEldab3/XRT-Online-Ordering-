import { useMemo } from 'react';
import { useSiteSettingsQuery } from '../api';

/**
 * Converts a 24-hour time string "HH:MM" to a 12-hour readable string.
 * e.g. "13:30" → "1:30 PM"
 */
export function to12Hour(timeStr) {
  if (!timeStr) return '';
  const [hourStr, minute] = timeStr.split(':');
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${minute} ${ampm}`;
}

/**
 * Returns store open/closed status and the full weekly schedule.
 * @returns {{ isOpen: boolean, schedule: Array, todaySlot: object|null }}
 */
export function useStoreStatus() {
  const { data: settings } = useSiteSettingsQuery();
  const schedule = settings?.operating_hours?.schedule ?? [];

  const { isOpen, todaySlot } = useMemo(() => {
    if (!schedule.length) return { isOpen: false, todaySlot: null };

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    const currentDayName = days[now.getDay()];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const todaySlot = schedule.find((s) => s.day === currentDayName) ?? null;

    const isOpen =
      !!todaySlot &&
      !todaySlot.is_closed &&
      currentTime >= todaySlot.open_time &&
      currentTime <= todaySlot.close_time;

    return { isOpen, todaySlot };
  }, [schedule]);

  return { isOpen, todaySlot, schedule };
}
