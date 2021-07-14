import React from "react";
import axios from "axios";

import {
  getByText,
  getAllByTestId,
  getByAltText,
  getByPlaceholderText,
  queryByText,
  queryByAltText,
  getByTestId,
} from "@testing-library/react";

import {
  render,
  cleanup,
  waitForElement,
  fireEvent,
  waitForElementToBeRemoved,
} from "@testing-library/react";

import Application from "components/Application";

//Mock websocket
const socketObj = { onopen: () => {}, onmessage: () => {} };
global.WebSocket = jest.fn(() => {
  return socketObj;
});

afterEach(cleanup);

describe("Application", () => {
  it("defaults to Monday and changes the schedule when a new day is selected", async () => {
    const { getByText } = render(<Application />);
    await waitForElement(() => getByText("Monday"));

    fireEvent.click(getByText("Tuesday"));
    expect(getByText("Leopold Silvers")).toBeInTheDocument();
  });

  it("loads data, books an interview and reduces the spots remaining for the first day by 1", async () => {
    const { container } = render(<Application />);

    await waitForElement(() => getByText(container, "Archie Cohen"));

    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments[0];

    fireEvent.click(getByAltText(appointment, "Add"));

    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" },
    });
    fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));

    fireEvent.click(getByText(appointment, "Save"));
    expect(getByText(appointment, "Saving")).toBeInTheDocument();
    socketObj.onmessage({
      data: JSON.stringify({
        type: "SET_INTERVIEW",
        id: 1,
        interview: { student: "Lydia Miller-Jones", interviewer: 1 },
      }),
    });
    //Test may not work after this as updation of status depends on webSocket
    await waitForElement(() => getByText(appointment, "Lydia Miller-Jones"));
    expect(getByAltText(appointment, "Edit")).toBeInTheDocument();
    expect(getByAltText(appointment, "Delete")).toBeInTheDocument();
    const day = getAllByTestId(container, "day").find((day) =>
      queryByText(day, "Monday")
    );
    expect(getByText(day, "no spots remaining")).toBeInTheDocument();
  });

  it("loads data, cancels an interview and increases the spots remaining for Monday by 1", async () => {
    const { container } = render(<Application />);
    await waitForElement(() => getByText(container, "Archie Cohen"));

    const appointment = getAllByTestId(container, "appointment").find(
      (appointment) => queryByText(appointment, "Archie Cohen")
    );

    fireEvent.click(getByAltText(appointment, "Delete"));
    expect(
      getByText(appointment, "Are you sure you would like to delete?")
    ).toBeInTheDocument();

    fireEvent.click(queryByText(appointment, "Confirm"));

    expect(getByText(appointment, "Deleting")).toBeInTheDocument();

    socketObj.onmessage({
      data: JSON.stringify({
        type: "SET_INTERVIEW",
        id: 2,
        interview: null,
      }),
    });
    //Test may not work after this as updation of status depends on webSocket
    await waitForElement(() => getByAltText(appointment, "Add"));

    const day = getAllByTestId(container, "day").find((day) =>
      queryByText(day, "Monday")
    );
    expect(getByText(day, "2 spots remaining")).toBeInTheDocument();
  });

  it("loads data, edits an interview and keeps the spots remaining for Monday the same", async () => {
    const { container } = render(<Application />);

    await waitForElement(() => getByText(container, "Archie Cohen"));

    let appointment = getAllByTestId(container, "appointment").find(
      (appointment) => queryByText(appointment, "Archie Cohen")
    );

    fireEvent.click(getByAltText(appointment, "Edit"));

    expect(getByTestId(appointment, "student-name-input")).toHaveValue(
      "Archie Cohen"
    );
    expect(getByText(appointment, "Tori Malcolm")).toBeInTheDocument();

    fireEvent.change(getByPlaceholderText(appointment, "Enter Student Name"), {
      target: { value: "Lydia Miller-Jones" },
    });
    fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));

    fireEvent.click(queryByText(appointment, "Save"));
    expect(getByText(appointment, "Saving")).toBeInTheDocument();

    socketObj.onmessage({
      data: JSON.stringify({
        type: "SET_INTERVIEW",
        id: 2,
        interview: { student: "Lydia Miller-Jones", interviewer: 1 },
      }),
    });
    //Test may not work after this as updation of status depends on webSocket
    await waitForElement(() => getByText(container, "Lydia Miller-Jones"));

    appointment = getAllByTestId(container, "appointment").find((appointment) =>
      queryByText(appointment, "Lydia Miller-Jones")
    );

    expect(queryByText(appointment, "Sylvia Palmer")).toBeInTheDocument();

    const day = getAllByTestId(container, "day").find((day) =>
      queryByText(day, "Monday")
    );
    expect(getByText(day, "1 spot remaining")).toBeInTheDocument();
  });

  it("shows the save error when failing to save an appointment", async () => {
    axios.put.mockRejectedValueOnce();

    const { container } = render(<Application />);

    await waitForElement(() => getByText(container, "Archie Cohen"));

    const appointment = getAllByTestId(container, "appointment").find(
      (appointment) => queryByAltText(appointment, "Add")
    );

    fireEvent.click(getByAltText(appointment, "Add"));

    fireEvent.change(getByPlaceholderText(appointment, "Enter Student Name"), {
      target: { value: "Lydia Miller-Jones" },
    });
    fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));

    fireEvent.click(queryByText(appointment, "Save"));
    await waitForElementToBeRemoved(() => queryByText(appointment, "Saving"));

    expect(
      getByText(appointment, "Server Error: could not save appointment")
    ).toBeInTheDocument();

    //Test Close Button
    fireEvent.click(getByAltText(appointment, "Close"));
    expect(getByTestId(appointment, "student-name-input")).toBeInTheDocument();
  });

  it("shows the delete error when failing to delete an existing appointment", async () => {
    axios.delete.mockRejectedValueOnce();

    const { container } = render(<Application />);

    await waitForElement(() => getByText(container, "Archie Cohen"));

    const appointment = getAllByTestId(container, "appointment").find(
      (appointment) => queryByText(appointment, "Archie Cohen")
    );

    fireEvent.click(getByAltText(appointment, "Delete"));

    fireEvent.click(queryByText(appointment, "Confirm"));

    await waitForElementToBeRemoved(() => queryByText(appointment, "Deleting"));

    expect(
      getByText(appointment, "Server Error: could not delete appointment")
    ).toBeInTheDocument();

    //Test Close Button
    fireEvent.click(getByAltText(appointment, "Close"));
    expect(getByText(appointment, "Archie Cohen")).toBeInTheDocument();
  });
});
