import React from "react";
import "./EventItem.css"; 

const EventItem = ({ info, onDelete }) => {
  const { event } = info;

  const handleDeleteClick = () => {
    onDelete(event.id);
  };

  const formattedStartTime = new Date(event.start).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedEndTime = new Date(event.end).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="event-item">
      <p>
        <strong>{event.title}</strong>
        <br />
        ({formattedStartTime}-{formattedEndTime})
      </p>
      <button onClick={handleDeleteClick}>Delete</button>
    </div>
  );
};

export default EventItem;
