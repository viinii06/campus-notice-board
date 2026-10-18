import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Board({ session, onNew, onAuthError }) {
  const [notices, setNotices] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/notices')
      .then(setNotices)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    if (!confirm('Take this notice down?')) return;
    try {
      await api(`/notices/${id}`, { method: 'DELETE', token: session.token });
      setNotices((list) => list.filter((n) => n.id !== id));
    } catch (err) {
      if (err.status === 401) return onAuthError();
      setError(err.message);
    }
  }

  return (
    <>
      <div className="board-head">
        <h2>What's happening on campus</h2>
        <button className="btn" onClick={onNew}>+ Pin a notice</button>
      </div>

      {error && <p className="error banner">{error}</p>}
      {loading && <p className="empty">Loading notices…</p>}
      {!loading && !error && notices.length === 0 && <p className="empty">The board is empty. Be the first to pin something!</p>}

      <section className="grid">
        {notices.map((n) => (
          <article key={n.id} className={`paper note ${n.category.toLowerCase()}`}>
            <span className="pin" />
            <span className="tag">{n.category}</span>
            <h3>{n.title}</h3>
            <p>{n.body}</p>
            <footer>
              <span>— {n.author}, {new Date(n.created_at + 'Z').toLocaleDateString()}</span>
              {session?.user.id === n.user_id && (
                <button className="link" onClick={() => handleDelete(n.id)}>Remove</button>
              )}
            </footer>
          </article>
        ))}
      </section>
    </>
  );
}
