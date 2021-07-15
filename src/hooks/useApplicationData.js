import { useEffect, useReducer } from "react";
import axios from "axios";
import reducer, {
  SET_DAY,
  SET_APPLICATION_DATA,
  SET_INTERVIEW,
} from "reducers/application";

export default function useApplicationData() {
  const [state, dispatch] = useReducer(reducer, {
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {},
  });

  const setDay = (day) => dispatch({ type: SET_DAY, value: day });

  //use Effect to update state received from server updates or request made to server
  useEffect(() => {
    //Web socket to receive appointment updates form server
    const socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);

    //websocket connection open
    socket.onopen = (event) => {
      socket.send("ping");
    };

    //websocket receive update message from server
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === SET_INTERVIEW) {
        dispatch({ ...msg });
      }
    };

    //Explicit request to server
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

  //Function to send add/ update interview request to server
  function bookInterview(id, interview) {
    return axios.put(`/api/appointments/${id}`, { interview });
  }

  //Function to cancel selected interview
  function cancelInterview(id) {
    return axios.delete(`/api/appointments/${id}`);
  }

  return { state, setDay, bookInterview, cancelInterview };
}
