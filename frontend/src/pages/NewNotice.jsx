import { useState } from 'react';
import { api, CATEGORIES } from '../api.js';

export default function NewNotice({ session, onDone, onAuthError }) {
  const [form, setForm] = useState({ title: '', body: '', category: CATEGORIES[0] });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.title.trim().length < 3) return setError('Title must be at least 3 characters');
    if (form.body.trim().length < 5) return setError('Details must be at least 5 characters');

    setError('');
    setSaving(true);
    try {
      await api('/notices', { method: 'POST', body: form, token: session.token });
      onDone();
    } catch (err) {
      if (err.status === 401) return onAuthError();
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form className="paper card-form" onSubmit={handleSubmit}>
      <span className="pin" />
      <h2>Pin a new notice</h2>

      <label>
        Title
        <input value={form.title} onChange={update('title')} maxLength={100} required autoFocus />
      </label>

      <label>
        Category
        <select value={form.category} onChange={update('category')}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>

      <label>
        Details
        <textarea value={form.body} onChange={update('body')} rows={5} maxLength={1000} required />
        <small className="muted">{form.body.length}/1000</small>
      </label>

      {error && <p className="error">{error}</p>}

      <div className="row">
        <button type="button" className="btn ghost dark" onClick={onDone}>Cancel</button>
        <button className="btn" disabled={saving}>{saving ? 'Pinning…' : 'Pin it'}</button>
      </div>
    </form>
  );
}
