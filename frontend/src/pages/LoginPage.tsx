import { useNavigate } from 'react-router-dom';
import { GoogleSignIn } from '../components/GoogleSignIn';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: '2rem'
    }}>
      <div className="rounded shadow-medium" style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: '3rem',
        maxWidth: '40rem',
        width: '100%',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className="text-large font-bold text-accent" style={{ marginBottom: '1rem' }}>
            ✨ Teachly Chat
          </h1>
          <p className="text-base text-secondary">
            Welcome back! Sign in to continue chatting.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <GoogleSignIn />
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p className="text-small text-muted">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/theme')}
              className="text-accent-secondary font-medium"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              View Theme Preview
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}; 