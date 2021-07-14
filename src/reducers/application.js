//action type for reducer
export const SET_DAY = "SET_DAY";
export const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
export const SET_INTERVIEW = "SET_INTERVIEW";

//Compute number of spots remaining empty for a given day
const computeDaywithCurrentEmptySpots = function (dayName, days, appointments) {
  const day = days.find((d) => d.name === dayName);
  let spots = day.appointments.reduce(
    (accumulator, currVal) =>
      !appointments[currVal].interview ? accumulator + 1 : accumulator,
    0
  );
  const newDays = days.map((d) =>
    d.name === dayName ? { ...d, spots } : { ...d }
  );
  return newDays;
};

//Find the day for a given appintment ID
const findAppointmentDay = (appointmentId, days) => {
  for (const day of days) {
    if (day.appointments.includes(appointmentId)) {
      return day.name;
    }
  }
  return undefined;
};

//reducer function to manage states
export default function reducer(state, action) {
  switch (action.type) {
    case SET_DAY: {
      const day = action.value;
      return { ...state, day };
    }
    case SET_APPLICATION_DATA: {
      const days = [...action.days];
      const appointments = { ...action.appointments };
      const interviewers = { ...action.interviewers };
      return { ...state, days, appointments, interviewers };
    }

    case SET_INTERVIEW: {
      const appointment = {
        ...state.appointments[action.id],
        interview: action.interview ? { ...action.interview } : null,
      };
      const appointments = {
        ...state.appointments,
        [action.id]: appointment,
      };
      if (state.appointments[action.id].interview && action.interview) {
        return { ...state, appointments };
      }

      const days = computeDaywithCurrentEmptySpots(
        findAppointmentDay(action.id, state.days),
        state.days,
        appointments
      );
      return { ...state, appointments, days };
    }
    default:
      throw new Error(
        `Tried to reduce with unsupported action type: ${action.type}`
      );
  }
}
