import axios from "axios";
import { showAlert } from "./alert";

const stripe = Stripe(
  "pk_test_51Iw4EZGFvcRRhQxDKYklOK5h0XBXkZGqoEYyN6eC2OXrEAIBKa8RiaeIqSRMnaI178u6lvJvlmYjRbbMnxx76A9U00LtpVpMO5"
);
// 1. get checkout session from API /checkout-session/:bicycleId

// 2. use stripe object to automatically create checkout form + charge credit cards

export const bookBicycle = async (bicycleId) => {
  try {
    const bookingSession = await axios(
      `/api/v1/booking/checkout-session/${bicycleId}`
    );

    await stripe.redirectToCheckout({
      sessionId: bookingSession.data.bookingCheckoutSession.id,
    });
  } catch (err) {
    showAlert("error", err);
  }
};
