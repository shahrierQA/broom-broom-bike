import axios from 'axios';
import { showAlert } from './alert';

export const createBicycle = async data => {
  try {
    const resAddBicycle = await axios({
      method: 'POST',
      url: '/api/v1/bicycle',
      data,
    });

    if (resAddBicycle.data.status === 'success') {
      showAlert('success', 'Bicycle adding successfully');

      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
