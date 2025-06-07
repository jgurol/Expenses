
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

type AuthMode = 'signin' | 'signup' | 'magiclink' | 'reset' | 'update-password';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signInWithPassword, signUpWithPassword, signInWithMagicLink, resetPassword } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && mode !== 'update-password') {
      navigate('/');
    }
  }, [user, navigate, mode]);

  useEffect(() => {
    // Check for error parameters from URL hash or search params
    const urlHash = window.location.hash;
    const errorFromHash = new URLSearchParams(urlHash.replace('#', '?'));
    
    const errorCode = errorFromHash.get('error_code') || searchParams.get('error_code');
    const errorDescription = errorFromHash.get('error_description') || searchParams.get('error_description');
    const errorType = errorFromHash.get('error') || searchParams.get('error');
    const type = searchParams.get('type');
    const token = searchParams.get('token');
    const tokenHash = searchParams.get('token_hash');
    
    console.log('URL params check:', { errorCode, errorDescription, errorType, type, urlHash, token: !!token, tokenHash: !!tokenHash });
    
    if (errorCode === 'otp_expired' || errorType === 'access_denied') {
      setError('The reset link has expired or is invalid. Please request a new password reset link.');
      setMode('reset');
      // Clear the URL hash to prevent the error from persisting
      window.history.replaceState(null, '', window.location.pathname);
      return;
    } else if (errorDescription) {
      setError(decodeURIComponent(errorDescription));
      return;
    }

    // Check if this is a password reset callback - look for recovery type or specific tokens
    if (type === 'recovery' || (token && tokenHash)) {
      console.log('Password reset callback detected');
      setMode('update-password');
      setMessage('Please enter your new password below.');
      return;
    }

    // Check if this is a successful magic link callback
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (accessToken && refreshToken && type !== 'recovery') {
      setMessage('Magic link verified! Signing you in...');
      // The useAuth hook will handle the session automatically
      setTimeout(() => {
        if (!user) {
          setError('Authentication successful but there was an issue loading your profile. Please try refreshing the page.');
        }
      }, 2000);
    }
  }, [searchParams, user]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      const { error } = await signInWithPassword(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        setMessage('Signed in successfully!');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }
    
    try {
      const { error } = await signUpWithPassword(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        setMessage('Account created successfully! Check your email to verify your account.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      const { error } = await signInWithMagicLink(email);
      
      if (error) {
        setError(error.message);
      } else {
        setMessage('Magic link sent! Check your email and click the link to sign in.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending magic link');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        setError(error.message);
      } else {
        setMessage('Password reset email sent! Check your email for instructions.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        setError(error.message);
      } else {
        setMessage('Password updated successfully! You are now signed in.');
        // Redirect to main page after successful password update
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating password');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setError('');
    setMessage('');
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
    // Clear URL parameters when switching modes
    window.history.replaceState(null, '', window.location.pathname);
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Sign In';
      case 'signup': return 'Create Account';
      case 'magiclink': return 'Sign In with Magic Link';
      case 'reset': return 'Reset Password';
      case 'update-password': return 'Update Password';
      default: return 'Sign In';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'signin': return 'Enter your credentials to access your account';
      case 'signup': return 'Create a new account to get started';
      case 'magiclink': return 'Enter your email address and we\'ll send you a magic link to sign in';
      case 'reset': return 'Enter your email address and we\'ll send you a password reset link';
      case 'update-password': return 'Enter your new password below';
      default: return 'Enter your credentials to access your account';
    }
  };

  const getIcon = () => {
    switch (mode) {
      case 'signin': return <Lock className="h-5 w-5" />;
      case 'signup': return <User className="h-5 w-5" />;
      case 'magiclink': return <Mail className="h-5 w-5" />;
      case 'reset': return <ArrowLeft className="h-5 w-5" />;
      case 'update-password': return <Lock className="h-5 w-5" />;
      default: return <Lock className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Expense Manager</h1>
          <p className="text-slate-600 mt-2">Access your business expense management portal</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getIcon()}
              {getTitle()}
            </CardTitle>
            <CardDescription>
              {getDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {message && (
              <Alert className="mb-4">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {mode === 'update-password' && (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Lock className="mr-2 h-4 w-4" />
                  Update Password
                </Button>
              </form>
            )}

            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Lock className="mr-2 h-4 w-4" />
                  Sign In
                </Button>

                <div className="space-y-2 text-center">
                  <button
                    type="button"
                    onClick={() => switchMode('reset')}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Forgot your password?
                  </button>
                  <div className="text-sm text-slate-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="text-blue-600 hover:underline"
                    >
                      Sign up
                    </button>
                  </div>
                  <div className="text-sm text-slate-600">
                    Or{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('magiclink')}
                      className="text-blue-600 hover:underline"
                    >
                      use magic link
                    </button>
                  </div>
                </div>
              </form>
            )}

            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <User className="mr-2 h-4 w-4" />
                  Create Account
                </Button>

                <div className="text-center text-sm text-slate-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="text-blue-600 hover:underline"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            )}

            {mode === 'magiclink' && (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Mail className="mr-2 h-4 w-4" />
                  Send Magic Link
                </Button>

                <div className="text-center text-sm text-slate-600">
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="text-blue-600 hover:underline"
                  >
                    Back to sign in
                  </button>
                </div>
              </form>
            )}

            {mode === 'reset' && (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset Link
                </Button>

                <div className="text-center text-sm text-slate-600">
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="text-blue-600 hover:underline"
                  >
                    Back to sign in
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
