import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const userStr = params.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        // Force page reload so AuthProvider picks up new user
        window.location.href = '/dashboard';
      } catch {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [params, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Signing you in…</p>
    </div>
  );
}
