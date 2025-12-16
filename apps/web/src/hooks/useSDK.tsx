import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { TimetableSDK } from 'timetable-sdk';

const SDKContext = createContext<TimetableSDK | null>(null);

export function SDKProvider({ children }: { children: ReactNode }) {
  const [sdk] = useState(() => new TimetableSDK({
    apiUrl: '/api',
    socketUrl: '/'
  }));

  useEffect(() => {
    sdk.initialize().catch(console.error);
  }, [sdk]);

  return <SDKContext.Provider value={sdk}>{children}</SDKContext.Provider>;
}

export function useSDK(): TimetableSDK {
  const sdk = useContext(SDKContext);
  if (!sdk) {
    throw new Error('useSDK must be used within SDKProvider');
  }
  return sdk;
}
