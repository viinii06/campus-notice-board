import { useState } from 'react';
import Board from './pages/Board.jsx';
import Login from './pages/Login.jsx';
import NewNotice from './pages/NewNotice.jsx';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Campus Notice Board';
const SESSION_KEY = 'cnb_session';

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export default function App() {
  const [session, setSession] = useState(loadSession); // { token, user }
  const [page, setPage] = useState('board'); // 'board' | 'login' | 'new'

  function handleLogin(newSession) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
    setPage('new');
  }

  function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setPage('board');
  }

  return (
    <>
      <header className="topbar">
        <button className="brand" onClick={() => setPage('board')}>📌 {APP_NAME}</button>
        <nav>
          {session ? (
            <>
              <span className="hello">Hi, {session.user.name}</span>
              <button className="btn ghost" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            page !== 'login' && <button className="btn ghost" onClick={() => setPage('login')}>Log in</button>
          )}
        </nav>
      </header>

      <main>
        {page === 'board' && (
          <Board session={session} onNew={() => setPage(session ? 'new' : 'login')} onAuthError={handleLogout} />
        )}
        {page === 'login' && <Login onLogin={handleLogin} />}
        {page === 'new' && session && (
          <NewNotice session={session} onDone={() => setPage('board')} onAuthError={handleLogout} />
        )}
      </main>
    </>
  );
}
