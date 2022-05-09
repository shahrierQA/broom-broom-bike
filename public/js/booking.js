import { showAlert } from './alert';
import axios from 'axios';

export const bookingDetails = async (
  pickUpLocation,
  bicycleId,
  quantity,
  bookedForHours
) => {
  try {
    const resBookingDetails = await axios({
      method: 'POST',
      url: `/api/v1/bicycle/${bicycleId}/booking-details`,
      data: {
        pickUpLocation,
        quantity,
        bookedForHours,
      },
    });

    if (resBookingDetails.data.status === 'success') {
      window.setTimeout(() => {
        window.location.assign(`/bicycle/${bicycleId}/booking-details`);
      }, 500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const resetBookingDetails = async (bicycleSlug, bicycleId) => {
  try {
    const resResetDetails = await axios({
      method: 'DELETE',
      url: `/api/v1/bicycle/${bicycleId}/booking-details/reset-details`,
    });

    if (resResetDetails.statusText === 'No Content') {
      showAlert('success', 'Reset your booking process');

      window.setTimeout(() => {
        window.location.assign(`/bicycle/${bicycleSlug}`);
      }, 500);
    }
  } catch (err) {
    showAlert('error', err.response.data);
  }
};
