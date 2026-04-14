import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  onSnapshot,
  Timestamp,
  addDoc,
  orderBy,
  limit,
  getDocFromServer,
  increment,
  getCountFromServer
} from 'firebase/firestore';
import { db, auth } from './config';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: any[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Global Stats
export const subscribeToGlobalStats = (callback: (stats: any) => void) => {
  const path = 'global/stats';
  return onSnapshot(doc(db, path), (snapshot) => {
    callback(snapshot.data() || { threatsBlocked: 0 });
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
};

export const incrementGlobalThreats = async () => {
  const path = 'global/stats';
  try {
    const docRef = doc(db, path);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await setDoc(docRef, { threatsBlocked: 1 });
    } else {
      await updateDoc(docRef, { threatsBlocked: increment(1) });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// User Profile
export const getUserProfile = async (uid: string) => {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, path);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const createUserProfile = async (uid: string, data: any) => {
  const path = `users/${uid}`;
  try {
    await setDoc(doc(db, path), {
      ...data,
      createdAt: Timestamp.now(),
      riskScore: 0,
      alertsEnabled: true
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

// Scam Reports
export const submitScamReport = async (data: any) => {
  const path = 'scamReports';
  try {
    await addDoc(collection(db, path), {
      ...data,
      timestamp: Timestamp.now(),
      status: 'pending'
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

// Alerts
export const subscribeToAlerts = (uid: string, callback: (alerts: any[]) => void) => {
  const path = `alerts/${uid}/userAlerts`;
  const q = query(collection(db, path), orderBy('timestamp', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const alerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(alerts);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const markAlertAsRead = async (uid: string, alertId: string) => {
  const path = `alerts/${uid}/userAlerts/${alertId}`;
  try {
    await updateDoc(doc(db, path), { read: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// Scans
export const saveScanResult = async (uid: string, data: any) => {
  const path = `scans/${uid}/results`;
  try {
    await addDoc(collection(db, path), {
      ...data,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const saveIntelligenceScan = async (uid: string, data: any) => {
  const path = `intelligenceScans/${uid}/history`;
  try {
    await addDoc(collection(db, path), {
      ...data,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const subscribeToIntelligenceHistory = (uid: string, callback: (history: any[]) => void) => {
  const path = `intelligenceScans/${uid}/history`;
  const q = query(collection(db, path), orderBy('timestamp', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(history);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const testConnection = async () => {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
};
