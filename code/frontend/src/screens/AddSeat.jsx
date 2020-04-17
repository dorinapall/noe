import React from "react";

import { Context as SeatContext } from "../contexts/seatContext";
import { ROUTE_TIME, ROUTE_SEAT_DETAILS } from "../App";
import { View, Caption, Image, Text, LinkButton, Button } from "../UI";
import { useHistory } from "react-router-dom";

export default function AddSeat() {
  const history = useHistory();
  const { setActiveSeat } = React.useContext(SeatContext);

  function onNewSeatClick() {
    setActiveSeat(null);
    history.push(ROUTE_SEAT_DETAILS);
  }

  return (
    <View>
      <Caption center>Új személy hozzáadása</Caption>
      <Image src="https://via.placeholder.com/150" />
      <Text>
        Lehetősége van további személyeket hozzáadni, akikkel együtt jönne
        tesztelni. Felhívjuk figyelmét, hogy a fertőzésveszély minimalizálása
        érdekében, csak önnel egy háztartásban élőket regisztráljon. Egy
        regisztrációval maximum 5 személy rögzíthető.
      </Text>
      <LinkButton to={ROUTE_TIME} toCenter>
        Tovább
      </LinkButton>
      <Button onClick={onNewSeatClick} toCenter inverse>
        Új személy hozzáadása
      </Button>
    </View>
  );
}
