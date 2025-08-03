// src/utils/auth.js

export const getToken = () => {
  return localStorage.getItem('token');
};

export const getUserRole = () => {
  return localStorage.getItem('userRole');
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
};
