import React from "react";
import { View } from "../../UI";
import { useHistory } from "react-router-dom";

import { Context as AppointmentContext } from "../../contexts/appointmentContext";
import { Context as SeatContext } from "../../contexts/seatContext";
import { Context as surveyContext } from "../../contexts/surveyContext";
import * as contextUtils from "../../contexts/utils";
import { ROUTE_APPOINTMENT_SUCCESS } from "../../App";

export default function PaymentStatus() {
  const { history } = useHistory();
  const { setState: setAppointmentState, fetchPaymentStatus } = React.useContext(AppointmentContext);
  const { setState: setSeatState } = React.useContext(SeatContext);
  const { setState: setSurveyState } = React.useContext(AppointmentContext);
  let pollId = null;

  React.useEffect(() => {
    pollId = setInterval(() => {
      doPoll();
    }, 3000);
    const setters = {
      setAppointmentState,
      setSeatState,
      setSurveyState,
    };
    contextUtils.loadStateFromLocalStorage(setters);
    return () => {
      clearInterval(pollId);
    };
  });

  async function doPoll() {
    const response = await fetchPaymentStatus();

    if (response.error) {
      history.push("/payment-failed");
      return;
    }

    clearInterval(pollId);
    const { payment_status: paymentStatus } = response.data;
    if (paymentStatus === "SUCCESS") {
      history.push(ROUTE_APPOINTMENT_SUCCESS);
    } else if (paymentStatus === "PENDING") {
      return; // continue polling
    } else {
      history.push("/payment-failed");
    }
  }

  return <View>Payment Status Page</View>;
}
