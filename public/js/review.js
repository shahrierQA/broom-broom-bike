import { showAlert } from "./alert";
import axios from "axios";

export const postReview = async (review, rating, bicycleId) => {
  console.log("dfsfdfs", review, rating, bicycleId);
  try {
    const resPostReview = await axios({
      method: "POST",
      url: `/api/v1/bicycle/${bicycleId}/review`,
      data: {
        review,
        rating,
      },
    });

    if (resPostReview.data.status === "success") {
      showAlert("success", "Posted a review successfully");

      window.location.reload();
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const editReview = async (review, rating, bicycleId, reviewId) => {
  try {
    const resEditReview = await axios({
      method: "PATCH",
      url: `/api/v1/bicycle/${bicycleId}/review/edit/${reviewId}`,
      data: {
        review,
        rating,
      },
    });

    if (resEditReview.data.status === "success") {
      showAlert("success", "updated review successfully");

      window.location.reload();
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
