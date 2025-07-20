import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import AdminPage from './pages/AdminPage';


function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(localStorage.getItem('role'));
  const [currentPage, setCurrentPage] = useState('chat'); // 'chat' or 'admin'

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const roleFromUrl = urlParams.get('role');

    if (tokenFromUrl && roleFromUrl) {
      // If a token is found in the URL, save it and update state
      localStorage.setItem('token', tokenFromUrl);
      localStorage.setItem('role', roleFromUrl);
      setToken(tokenFromUrl);
      setUserRole(roleFromUrl);
      
      // Clean the URL
      window.history.pushState({}, document.title, "/");
    }
  }, []);

  const handleLogin = (newToken, role) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', role);
    setToken(newToken);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setUserRole(null);
  };

  const renderPage = () => {
    if (!token) {
      return <LoginPage onLogin={handleLogin} />;
    }
    
    // Simple navigation component
    const Nav = () => (
      <nav className="bg-gray-800 p-2 text-center">
        <button onClick={() => setCurrentPage('chat')} className={`px-3 py-1 mx-2 rounded ${currentPage === 'chat' ? 'bg-blue-600' : ''}`}>Chat</button>
        {userRole === 'admin' && (
          <button onClick={() => setCurrentPage('admin')} className={`px-3 py-1 mx-2 rounded ${currentPage === 'admin' ? 'bg-blue-600' : ''}`}>Admin</button>
        )}
      </nav>
    );

    return (
      <>
        <Nav />
        {currentPage === 'chat' ? <ChatPage onLogout={handleLogout} /> : <AdminPage />}
      </>
    );
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {renderPage()}
    </div>
  );
}

export default App;