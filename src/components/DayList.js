import React from "react";
import DayListItem from "./DayListItem";

export default function DayList(props) {
  const dayList =
    props.days &&
    props.days.map((day) => (
      <DayListItem
        key={day.id}
        name={day.name}
        spots={day.spots}
        selected={props.day === day.name}
        setDay={props.setDay}
      />
    ));
  return <ul>{dayList}</ul>;
}
