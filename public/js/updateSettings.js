/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alert";

export const updateSettings = async (data, type) => {
  try {
    const url =
      type === "password"
        ? "/api/v1/users/update-password"
        : "/api/v1/users/update-me";

    const resUpdate = await axios({
      method: "PATCH",
      url,
      data,
    });

    if (resUpdate.data.status === "success") {
      showAlert("success", `${type.toUpperCase()} Updated Successfully`);
      location.assign("/me");
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
