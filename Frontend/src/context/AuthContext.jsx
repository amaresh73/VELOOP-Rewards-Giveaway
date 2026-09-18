import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('veloop-token') || '');
  const [user, setUser] = useState(() => {
    try {
      const savedToken = localStorage.getItem('veloop-token');
      const savedUser = localStorage.getItem('veloop-user');
      if (savedToken && savedUser) {
        return JSON.parse(savedUser);
      }
    } catch {
      // ignore json parse errors
    }
    return null;
  });

  useEffect(() => {
    if (!token) {
      localStorage.removeItem('veloop-user');
      setUser(null);
      return;
    }

    const loadCurrentUser = async () => {
      try {
        const response = await api.get('/auth/me');
        const nextUser = response.data?.user || null;
        if (nextUser) {
          if (nextUser.balances?.VEs !== undefined) nextUser.points = nextUser.balances.VEs;
          setUser(nextUser);
          localStorage.setItem('veloop-user', JSON.stringify(nextUser));
        }
      } catch (error) {
        console.error('Unable to refresh auth session', error);
        localStorage.removeItem('veloop-token');
        localStorage.removeItem('veloop-user');
        setToken('');
        setUser(null);
      }
    };

    loadCurrentUser();
  }, [token]);

  // Mobile OTP Authentication Flow
  const sendOtp = async (phone) => {
    const response = await api.post('/auth/send-otp', { phone });
    return response.data;
  };

  const verifyOtp = async (phone, otp) => {
    const response = await api.post('/auth/verify-otp', { phone, otp });
    const nextToken = response.data.token;
    const nextUser = response.data.user;

    localStorage.setItem('veloop-token', nextToken);
    localStorage.setItem('veloop-user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);

    return response.data;
  };

  const verifyRegistrationOtp = async ({ phone, otp }) => {
    const response = await api.post('/auth/verify-registration-otp', { phone, otp });
    return response.data;
  };

  // Email OTP Authentication & Password Reset Flow
  const sendEmailOtp = async ({ email, purpose = 'registration' }) => {
    const response = await api.post('/auth/send-email-otp', {
      email: email?.trim().toLowerCase(),
      purpose
    });
    return response.data;
  };

  const verifyEmailOtp = async ({ email, otp, purpose = 'registration' }) => {
    const response = await api.post('/auth/verify-email-otp', {
      email: email?.trim().toLowerCase(),
      otp: otp?.trim(),
      purpose
    });
    return response.data;
  };

  const resetPassword = async ({ email, otp, newPassword, confirmNewPassword }) => {
    const response = await api.post('/auth/reset-password', {
      email: email?.trim().toLowerCase(),
      otp: otp?.trim(),
      newPassword,
      confirmNewPassword
    });
    return response.data;
  };

  const register = async ({ name, email, phone, phoneOtp, password, confirmPassword }) => {
    const response = await api.post('/auth/register', {
      name: name?.trim(),
      email: email ? email.trim().toLowerCase() : undefined,
      phone: phone ? phone.trim() : undefined,
      phoneOtp: phoneOtp ? String(phoneOtp).trim() : undefined,
      password,
      confirmPassword
    });
    if (response.data?.token && response.data?.user) {
      const nextToken = response.data.token;
      const nextUser = response.data.user;
      localStorage.setItem('veloop-token', nextToken);
      localStorage.setItem('veloop-user', JSON.stringify(nextUser));
      setToken(nextToken);
      setUser(nextUser);
    }
    return response.data;
  };

  const verifyEmail = async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    if (response.data?.token && response.data?.user) {
      const nextToken = response.data.token;
      const nextUser = response.data.user;
      localStorage.setItem('veloop-token', nextToken);
      localStorage.setItem('veloop-user', JSON.stringify(nextUser));
      setToken(nextToken);
      setUser(nextUser);
    }
    return response.data;
  };

  const resendVerification = async (email) => {
    const response = await api.post('/auth/resend-verification', {
      email: email?.trim().toLowerCase()
    });
    return response.data;
  };

  // Login with email and password
  const login = async (credentials) => {
    const response = await api.post('/auth/login', {
      email: credentials.email?.trim().toLowerCase(),
      password: credentials.password
    });
    const nextToken = response.data.token;
    const nextUser = response.data.user;

    localStorage.setItem('veloop-token', nextToken);
    localStorage.setItem('veloop-user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);

    return response.data;
  };

  const changePassword = async ({ currentPassword, newPassword, confirmNewPassword }) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmNewPassword
    });
    return response.data;
  };

  const deleteAccount = async () => {
    const response = await api.delete('/auth/delete-account');
    // Immediately end session upon successful account deletion
    logout();
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('veloop-token');
    localStorage.removeItem('veloop-user');
    setToken('');
    setUser(null);
  };

  // Google Authentication (Sign up or Login)
  const googleAuth = async ({ credential, email, name, picture, googleId }) => {
    const response = await api.post('/auth/google', {
      credential,
      email: email?.trim().toLowerCase(),
      name: name?.trim(),
      picture,
      googleId
    });
    const nextToken = response.data.token;
    const nextUser = response.data.user;

    localStorage.setItem('veloop-token', nextToken);
    localStorage.setItem('veloop-user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);

    return response.data;
  };

  const isLoggedIn = Boolean(token && user);

  const value = useMemo(
    () => ({
      user,
      setUser,
      token,
      isLoggedIn,
      register,
      verifyEmail,
      resendVerification,
      login,
      logout,
      googleAuth,
      changePassword,
      deleteAccount,
      sendOtp,
      verifyOtp,
      verifyRegistrationOtp,
      sendEmailOtp,
      verifyEmailOtp,
      resetPassword
    }),
    [user, token, isLoggedIn]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
