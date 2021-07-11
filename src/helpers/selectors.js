//retrieve appointments for given day
export function getAppointmentsForDay(state, day) {
  const selectedDay = state.days.find((d) => d.name === day);
  if (state.days.length === 0 || !selectedDay) {
    return [];
  }
  const appointments = selectedDay.appointments.map(
    (appointmentId) => state.appointments[appointmentId]
  );

  return appointments;
}

//retrieve interviewer information from list of interviewers 
export function getInterview(state, interview) {
  if (interview === null) {
    return null;
  }
  const updatedInterview = { ...interview };
  updatedInterview.interviewer = {
    ...state.interviewers[interview.interviewer],
  };
  return updatedInterview;
}

//get list of interviewers for a given day
export function getInterviewersForDay(state, day) {
  const selectedDay = state.days.find((d) => d.name === day);
  if (state.days.length === 0 || !selectedDay) {
    return [];
  }
  const interviewers = selectedDay.interviewers.map(
    (interviewerID) => state.interviewers[interviewerID]
  );

  return interviewers;
}
