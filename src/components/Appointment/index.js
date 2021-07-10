import React, {useEffect} from 'react';
import "components/Appointment/styles.scss";
import Header from './Header';
import Show from './Show';
import Empty from './Empty';
import useVisualMode from 'hooks/useVisualMode';
import Form from './Form';
import Status from './Status';
import Confirm from './Confirm';
import Error from './Error';

const EMPTY = "EMPTY";
const SHOW = "SHOW";
const CREATE = "CREATE";
const SAVING = "SAVING";
const DELETING = "DELETING";
const CONFIRM = "CONFIRM";
const EDIT = "EDIT";
const ERROR_SAVE = "ERROR_SAVE";
const ERROR_DELETE = "ERROR_DELETE";

export default function Appointment(props) {
  const {mode, transition, back} = useVisualMode(
    props.interview ? SHOW : EMPTY
  );
  
  useEffect(() => {
    if(mode === EMPTY && props.interview){
      transition(SHOW);
    }
    if(mode === SHOW && !props.interview){
      transition(EMPTY);
    }
  }, [props.interview, transition, mode]);

  function save(name, interviewer) {
    const interview = {
      student: name,
      interviewer
    };
    transition(SAVING);
    props.bookInterview(props.id, interview)
    .then (res => transition(SHOW))
    .catch(error => transition(ERROR_SAVE,true));
  }

  function deleteInterview() {
    transition(DELETING, true);
    props.cancelInterview(props.id)
    .then (res => {
      transition(EMPTY)
    })
    .catch(error => transition(ERROR_DELETE, true));;
  }
  return (
    <article className="appointment">
      <Header time={props.time} />
      {mode === EMPTY && <Empty onAdd={() => {
        transition(CREATE);
      }} />}
      {mode === SHOW && props.interview && (
        <Show 
          student={props.interview.student} 
          interviewer={props.interview.interviewer}
          onDelete={() => {
            transition(CONFIRM);
          }}
          onEdit={() => {
            transition(EDIT);
          }}
        />
      )}
      {mode === CREATE && (
        <Form 
        interviewers={props.interviewers} 
        onSave={(name, interviewer) => save(name,interviewer)} 
        onCancel={() => back()} />
      )}
      {mode === SAVING && (
        <Status message="Saving" />
      )}
      {mode === DELETING && (
        <Status message="Deleting" />
      )}
      {mode === CONFIRM && (
        <Confirm message="Are you sure you would like to delete?" onConfirm={deleteInterview} onCancel={back}/>
      )}
      {mode === EDIT && (
        <Form
        name={props.interview.student}
        interviewers={props.interviewers}
        interviewer={props.interview.interviewer.id}
        onSave={(name, interviewer) => save(name,interviewer)}
        onCancel={() => back()}
        />
      )}
      {(mode === ERROR_SAVE || mode === ERROR_DELETE) && (
        <Error 
        message={mode === ERROR_SAVE ? "Server Error: could not save appointment" : "Server Error: could not delete appointment" }
        onClose={back} />
      )}
    </article>
  );
}