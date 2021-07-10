import { useEffect, useReducer } from "react";
import axios from "axios";

export default function useApplicationData() {
  const SET_DAY = "SET_DAY";
  const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
  const SET_INTERVIEW = "SET_INTERVIEW";
  const updateRemainingSpots = function (dayName, days, appointments, book) {
    const day = days.find((d) => d.name === dayName);
    let spots = day.appointments.reduce(
      (accumulator, currVal) =>
        !appointments[currVal].interview ? accumulator + 1 : accumulator,
      0
    );
    book ? spots-- : spots++;
    const newDays = days.map((d) =>
      d.name === dayName ? { ...d, spots } : { ...d }
    );
    return newDays;
  };

  function reducer(prev, action) {
    switch (action.type) {
      case SET_DAY: {
        const day = action.value;
        return { ...prev, day };
      }
      case SET_APPLICATION_DATA: {
        const days = [ ...action.days ];
        const appointments = { ...action.appointments };
        const interviewers = { ...action.interviewers };
        return { ...prev, days, appointments, interviewers };
      }

      case SET_INTERVIEW: {
        const appointment = {
          ...prev.appointments[action.id],
          interview: action.interview ? { ...action.interview } : null,
        };
        const appointments = {
          ...prev.appointments,
          [action.id]: appointment,
        };
        if (prev.appointments[action.id].interview && action.interview) {
          return {...prev, appointments};
        }
        const days = updateRemainingSpots(
          prev.day,
          prev.days,
          prev.appointments,
          action.interview? true : false
        );
        return {...prev, appointments, days};
      }
      default:
        throw new Error(
          `Tried to reduce with unsupported action type: ${action.type}`
        );
    }
  }

  const [state, dispatch] = useReducer(reducer, {
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {},
  });

  const setDay = (day) => dispatch({ type: SET_DAY, value: day });

  useEffect(() => {
    Promise.all([
      axios.get("/api/days"),
      axios.get("/api/appointments"),
      axios.get("/api/interviewers"),
    ])
      .then((all) => {
        dispatch({
          type: SET_APPLICATION_DATA,
          days: all[0].data,
          appointments: all[1].data,
          interviewers: all[2].data,
        });
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  }, []);

  function bookInterview(id, interview) {
    return axios.put(`/api/appointments/${id}`, { interview })
    .then((res) => {
      dispatch({ type: SET_INTERVIEW, id, interview });
    });
  }

  //Function to cancel selected interview
  function cancelInterview(id) {
    return axios.delete(`/api/appointments/${id}`).then((res) => {
      dispatch({ type: SET_INTERVIEW, id, interview: null });
    });
  }

  return { state, setDay, bookInterview, cancelInterview };
}
