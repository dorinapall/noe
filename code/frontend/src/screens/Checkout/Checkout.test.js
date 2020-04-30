import React from "react";

import { BrowserRouter as Router } from "react-router-dom";

import { mount } from "enzyme";
import { act } from "react-dom/test-utils";

import CheckoutContent from "./CheckoutContent";

test("Delete user works", () => {
  const mockOnDeleteClick = jest.fn();
  const seats = [{ url: "first-url" }, { url: "last-url" }];

  const wrapper = mount(
    <Router>
      <CheckoutContent
        appointment={{}}
        seats={seats}
        onSeatDeleteClick={mockOnDeleteClick}
      />
    </Router>
  );
  const seatComponents = wrapper.find(".CheckoutSeat");
  const firstSeat = seatComponents.first();
  expect(firstSeat.exists()).toBeTruthy();
  const deleteButton = firstSeat.find("button").last();
  expect(deleteButton.find(".fa-close").exists()).toBeTruthy;

  act(() => {
    deleteButton.simulate("click");
  });

  expect(mockOnDeleteClick).toHaveBeenCalled();
});

test("There is delete button if more seats than 1", () => {
  const wrapper = mount(
    <Router>
      <CheckoutContent seats={[{ url: 1 }, { url: 2 }]} appointment={{}} />
    </Router>
  );
  const deleteButtons = wrapper.find("button i.fa-close");
  expect(deleteButtons.length).toBe(2);
});

test("There is delete button if more seats than 1", () => {
  const wrapper = mount(
    <Router>
      <CheckoutContent seats={[{ url: 1 }]} appointment={{}} />
    </Router>
  );
  const deleteButtons = wrapper.find("button i.fa-close");
  expect(deleteButtons.exists()).toBeFalsy();
});
