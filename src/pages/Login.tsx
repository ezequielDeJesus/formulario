import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, FormInput, Chrome } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, loginWithEmail, signUp, loginWithGoogle } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Erro ao autenticar. Verifique suas credenciais.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError('Erro ao entrar com Google. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black p-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 border dark:border-gray-800">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-blue-600 rounded-2xl text-white mb-4">
            <FormInput size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Acesse sua conta</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Painel administrativo Formulary AI</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm bg-red-50 text-red-600 rounded-lg border border-red-200 animate-pulse">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="admin@formulary.ai"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="admin123"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full py-3 shadow-md"
            icon={<Lock size={18} />}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processando...' : (isSignUp ? 'Criar Conta' : 'Entrar no Painel')}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Ou continue com</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full py-3 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
            icon={<Chrome size={18} className="text-red-500" />}
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
          >
            Entrar com Google
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {isSignUp ? 'Já tem uma conta? Entre agora' : 'Não tem uma conta? Cadastre-se'}
          </button>
        </div>

        {!isSignUp && (
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
            <p className="text-center text-xs text-blue-600 dark:text-blue-400 font-medium">
              <strong>Acesso Demo:</strong><br />
              admin@formulary.ai / admin123
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
