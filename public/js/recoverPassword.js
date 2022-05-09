import axios from "axios";
import { showAlert } from "./alert";

export const forgotPassword = async (email) => {
  try {
    const resForgotPassword = await axios({
      method: "POST",
      url: "/api/v1/users/forgot-password",
      data: {
        email,
      },
    });

    if (resForgotPassword.data.status === "success") {
      showAlert("success", "Check your email for password reset instructions");

      window.setTimeout(() => {
        location.assign("/login");
      }, 1500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const resetPassword = async (password, passwordConfirm, tokenID) => {
  try {
    const resResetPassword = await axios({
      method: "PATCH",
      url: `/api/v1/users/reset-password/${tokenID}`,
      data: {
        password,
        passwordConfirm,
      },
    });

    if (resResetPassword.data.status === "success") {
      showAlert("success", "Password Reset Successfully");

      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
    document.getElementById("reset-btn").innerHTML = "Reset my password";
  }
};
