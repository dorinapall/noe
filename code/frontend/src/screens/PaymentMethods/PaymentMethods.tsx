import React from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";

import * as consts from "../../contexts/consts";
import * as contextUtils from "../../contexts/utils";
import * as paymentUtils from "./utils";
import * as utils from "../../utils";
import ProgressBarSVG from "../../assets/progressbar_5.svg";
import { ROUTE_APPOINTMENT_SUCCESS } from "../../App";
import { Context as AppointmentContext } from "../../contexts/appointmentContext";
import { Context as SeatContext } from "../../contexts/seatContext";
import { Context as LocationContext } from "../../contexts/locationContext";
import { Context as SurveyContext } from "../../contexts/surveyContext";
import { Context as TimeSlotContext } from "../../contexts/timeSlotContext";
import {
  View,
  Caption,
  Text,
  Button,
  HighlightText,
  Image,
  NextButton,
  Form,
  Field,
  InputGroup,
  Toggle,
} from "../../UI";
import BillingDetailsForm from "./BillingDetailsForm";
import { useFeatureSimplePay } from "../../featureFlags";
import { products } from "./products";

export const CREDIT_CARD_ON_SITE = "CREDIT_CARD_ON_SITE";
export const CREDIT_CARD_ONLINE = "CREDIT_CARD_ONLINE";
export const paymentMethodOptions = [
  { text: "Online Fizetés", value: CREDIT_CARD_ONLINE },
  { text: "Fizetés a helyszínen bankkártyával", value: CREDIT_CARD_ON_SITE },
];

const productOptions = products.map((p) => ({
  value: p.id,
  text: `${p.text} (${p.price} Ft/db)`,
}));

export default function PaymentMethods() {
  const history = useHistory();
  const { state: locationState } = React.useContext(LocationContext);
  const { state: surveyState } = React.useContext(SurveyContext);
  const { state: timeSlotState } = React.useContext(TimeSlotContext);
  const { state: appointmentState, updateAppointment, fetchPrice, setProduct } = React.useContext(AppointmentContext);
  const { appointment, productId: selectedproductId } = appointmentState;
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState(CREDIT_CARD_ONLINE);
  const { state: seatState } = React.useContext(SeatContext);
  const firstSeat = seatState.seats[0] || null;
  const defaultValues = {
    product_type: selectedproductId || products[0].id,
    payment_method: CREDIT_CARD_ONLINE,
  };
  const { register } = useForm({
    defaultValues,
  });

  React.useEffect(() => {
    if (selectedproductId === null) {
      setProduct(products[0].id);
    }

    fetchPrice({
      appointment: appointment.url,
      product_type: selectedproductId || products[0].id,
    });
  }, []);

  async function onNextClick(billingDetailsValues, setError) {
    if (!appointment.url) {
      alert("No appointment to update");
      return;
    }

    if (!useFeatureSimplePay || selectedPaymentMethod === CREDIT_CARD_ON_SITE) {
      handleOnSitePayment(billingDetailsValues, setError);
    } else if (selectedPaymentMethod === CREDIT_CARD_ONLINE) {
      handleOnlinePayment(billingDetailsValues, setError);
    }
  }

  async function handleOnSitePayment(billingDetailsValues, setError) {
    const url = consts.PAY_APPOINTMENT_URL;
    const requestData = paymentUtils.makePaymentUpdateRequest(
      appointment,
      selectedproductId,
      billingDetailsValues,
      selectedPaymentMethod
    );
    try {
      await axios.post(url, requestData);
    } catch (error) {
      if (!error.response) {
        alert("Váratlan hiba történt.");
        return;
      }
      utils.setErrors(setError, error.response.data);
      alert("A regisztrációt nem sikerült véglegesíteni.");
      return;
    }

    history.push(ROUTE_APPOINTMENT_SUCCESS);
  }

  async function handleOnlinePayment(billingDetailsValues, setError) {
    contextUtils.addStateToLocalStorage({
      surveyState,
      appointmentState,
      seatState,
    });

    const url = consts.PAY_APPOINTMENT_URL;
    const requestData = paymentUtils.makePaymentUpdateRequest(
      appointment,
      selectedproductId,
      billingDetailsValues,
      selectedPaymentMethod
    );
    const response = await axios.post(url, requestData);

    const simplePayFormURL = response.data.form_url;
    const form = document.createElement("form");
    form.setAttribute("action", simplePayFormURL);
    form.setAttribute("method", "POST");
    document.body.appendChild(form);
    form.submit();
  }

  function onProductSelect(productId) {
    setProduct(productId);
    fetchPrice({ appointment: appointment.url, product_type: productId });
  }

  function onPaymentMethodChange(newPaymentMethod) {
    setSelectedPaymentMethod(newPaymentMethod);
  }

  return (
    <View>
      <Image src={ProgressBarSVG} />
      <Caption>Fizetési mód választás</Caption>
      <HighlightText toCenter>Fizetendő összeg: {paymentUtils.getTotalPriceDisplay(appointment)}</HighlightText>
      <Text>Válassza ki a kívánt fizetési módot.</Text>
      <Field
        type="select"
        options={productOptions}
        onChange={(newValue) => onProductSelect(newValue)}
        register={register}
        name="product_type"
      />
      {useFeatureSimplePay && (
        <InputGroup>
          <Toggle
            className="Light"
            options={paymentMethodOptions}
            onChange={(newValue) => onPaymentMethodChange(newValue)}
            register={register}
            name="payment_method"
            defaultValue={CREDIT_CARD_ONLINE}
          />
        </InputGroup>
      )}
      <BillingDetailsForm onSubmit={onNextClick} seat={firstSeat} />
    </View>
  );
}
