import { useState, useEffect } from 'react';
import { TimetableSDK } from '@timetable/sdk';
import { ElectronAdapter, WebAdapter } from '@timetable/sdk/adapter';
import AuthScreen from './components/AuthScreen';
import TimetableApp from './components/TimetableApp';

function App() {
  const [sdk, setSdk] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const isElectron = window.electronAPI !== undefined;
    const adapter = isElectron ? new ElectronAdapter() : new WebAdapter();
    const timetableSDK = new TimetableSDK(adapter);
    setSdk(timetableSDK);

    checkAuth(timetableSDK);
  }, []);

  const checkAuth = async (sdkInstance) => {
    try {
      const credentials = await sdkInstance.getStoredCredentials();
      if (credentials && credentials.token) {
        setIsAuthenticated(true);
        setUser({ token: credentials.token });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const result = await sdk.authenticate(credentials);
      setIsAuthenticated(true);
      setUser(result.user);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    }
  };

  const handleLogout = async () => {
    try {
      await sdk.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return <TimetableApp sdk={sdk} user={user} onLogout={handleLogout} />;
}

export default App;
