import { ref, onValue, push, set, query, limitToLast } from 'firebase/database';
import { rtdb } from './config';

export const subscribeToThreatFeed = (callback: (threats: any[]) => void) => {
  const threatFeedRef = query(ref(rtdb, 'threatFeed'), limitToLast(20));
  
  return onValue(threatFeedRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const threats = Object.entries(data).map(([id, value]: [string, any]) => ({
        id,
        ...value
      })).reverse();
      callback(threats);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error('Realtime Database Error:', error);
    callback([]); // Fallback to empty list on error
  });
};

export const pushThreatEvent = async (event: any) => {
  const threatFeedRef = ref(rtdb, 'threatFeed');
  const newEventRef = push(threatFeedRef);
  await set(newEventRef, {
    ...event,
    timestamp: Date.now()
  });
};
