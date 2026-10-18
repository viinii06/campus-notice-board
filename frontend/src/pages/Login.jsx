import { useState } from 'react';
import { api } from '../api.js';

export default function Login({ onLogin }) {
  const [step, setStep] = useState('phone'); // 'phone' | 'code'
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (step === 'phone') {
        const data = await api('/auth/request-otp', { method: 'POST', body: { phone: phone.trim() } });
        setIsNewUser(data.isNewUser);
        setStep('code');
      } else {
        const data = await api('/auth/verify-otp', { method: 'POST', body: { phone: phone.trim(), code, name } });
        onLogin(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="paper card-form" onSubmit={handleSubmit}>
      <span className="pin" />
      <h2>{step === 'phone' ? 'Log in or sign up' : 'Enter your code'}</h2>

      {step === 'phone' ? (
        <label>
          Phone number
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+919876543210"
            pattern="\+[1-9][0-9]{9,14}"
            title="International format, e.g. +919876543210"
            required
            autoFocus
          />
        </label>
      ) : (
        <>
          <p className="muted">We sent a one-time code to <strong>{phone}</strong>.</p>
          {isNewUser && (
            <label>
              Your name
              <input value={name} onChange={(e) => setName(e.target.value)} minLength={2} maxLength={50} required />
            </label>
          )}
          <label>
            One-time code
            <input
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              pattern="[0-9]{4,8}"
              maxLength={8}
              required
              autoFocus
            />
          </label>
        </>
      )}

      {error && <p className="error">{error}</p>}

      <button className="btn" disabled={loading}>
        {loading ? 'Please wait…' : step === 'phone' ? 'Send OTP' : isNewUser ? 'Register' : 'Log in'}
      </button>
      {step === 'code' && (
        <button type="button" className="link" onClick={() => { setStep('phone'); setCode(''); setError(''); }}>
          Use a different number
        </button>
      )}
    </form>
  );
}
