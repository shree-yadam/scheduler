import React from 'react';
import "components/DayListItem.scss";
import classNames from 'classnames';

export default function DayListItem(props) {
  const dayListItemClass = classNames("day-list__item", {
    'day-list__item--selected': props.selected,
    'day-list__item--full' : props.spots === 0
  });
  
  const formatSpots = spots =>   ((spots === 0) ? "no" : spots) + " spot" + ((spots !== 1) ? "s" : "") + " remaining";
  
  return (
    <li className={dayListItemClass} onClick={() => props.setDay(props.name)}>
      <h2 className="text--regular">{props.name}</h2>
      <h3 className="text--light">{formatSpots(props.spots)}</h3>
    </li>
  );
}