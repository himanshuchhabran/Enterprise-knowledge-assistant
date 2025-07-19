import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {token ? <ChatPage onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />}
    </div>
  );
}

export default App;