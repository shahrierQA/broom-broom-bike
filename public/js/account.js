import axios from 'axios';
import { showAlert } from './alert';

// create a new account
export const signup = async (
  name,
  email,
  password,
  passwordConfirm,
  phoneNumber
) => {
  try {
    const resSignup = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
        phoneNumber,
      },
    });

    if (resSignup.data.status === 'success') {
      showAlert('success', 'Account successfully created');

      location.assign('/');
      // window.setTimeout(() => {
      //   location.assign('/');
      // }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// Log in to user account
export const login = async (email, password) => {
  try {
    const resLogin = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (resLogin.data.status === 'success') {
      showAlert('success', 'You are successfully logged in');

      location.assign('/');

      // window.setTimeout(() => {
      //   location.assign('/');
      // }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// logging out from the account
export const logout = async () => {
  try {
    const resLogout = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (resLogout.data.status === 'success') {
      location.assign('/login');
    }
  } catch (err) {
    showAlert('error', 'Error logout! Please try again.');
  }
};
