import './App.css'
import React, { useReducer, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import daygridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { v4 as uuid } from "uuid";
import EventItem from "./EventItem";
import { Formik, Field, Form } from "formik";

const initialState = {
  events: [],
};

const actionTypes = {
  ADD_EVENT: "ADD_EVENT",
  DELETE_EVENT: "DELETE_EVENT",
};

function eventsReducer(state, action) {
  switch (action.type) {
    case actionTypes.ADD_EVENT:
      return {
        events: [
          ...state.events,
          {
            start: action.payload.start,
            end: action.payload.end,
            title: action.payload.title,
            id: uuid(),
          },
        ],
      };
    case actionTypes.DELETE_EVENT:
      return {
        events: state.events.filter((event) => event.id !== action.payload.eventId),
      };
    default:
      return state;
  }
}

function generateTimeSlots() {
  const startTime = 8; // 
  const endTime = 20; //
  const timeSlots = [];

  for (let i = startTime; i <= endTime; i++) {
    timeSlots.push(`${i}:00`);
    timeSlots.push(`${i}:30`);
  }

  return timeSlots;
}

function isDateInPast(date) {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Set time to midnight
  return date < currentDate;
}


const customTheme = {
  "dayGridMonth-button": {
    "width": "50px",
    "font-size":"10px",
  },
  "dayGridWeek-button": {
    "width": "50px",
    "font-size":"10px",
  },
  "dayGridDay-button": {
    "width": "50px",
    "font-size":"10px",
  },
};

function App() {
  const [state, dispatch] = useReducer(eventsReducer, initialState);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedEndTime, setSelectedEndTime] = useState("");
  const [conflictMessage, setConflictMessage] = useState("");

  const handleEventDelete = (eventId) => {
    dispatch({
      type: actionTypes.DELETE_EVENT,
      payload: {
        eventId,
      },
    });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleStartTimeChange = (time) => {
    setSelectedStartTime(time);
  };

  const handleEndTimeChange = (time) => {
    setSelectedEndTime(time);
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <Formik
          initialValues={{
            title: "",
          }}
          onSubmit={(values, { resetForm }) => {
            const { title } = values;
            const selectedDateTime = new Date(
              `${selectedDate}T${selectedStartTime}`
            );

            if (
              !isDateInPast(selectedDateTime) &&
              selectedStartTime &&
              selectedEndTime &&
              title.trim() !== ""
            ) {
              const start = `${selectedDate}T${selectedStartTime}`;
              const end = `${selectedDate}T${selectedEndTime}`;

              // Check for conflicts with existing events
              const hasConflict = state.events.some((event) => {
                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end);

                return (
                  (start >= eventStart && start < eventEnd) ||
                  (end > eventStart && end <= eventEnd)
                );
              });

              if (!hasConflict) {
                dispatch({
                  type: actionTypes.ADD_EVENT,
                  payload: {
                    start: start,
                    end: end,
                    title: title,
                  },
                });
                resetForm();
                setConflictMessage("");
              } else {
                setConflictMessage("Event conflicts with an existing event.");
              }
            } else {
              setConflictMessage("Please fill in all fields and select a future date.");
            }
          }}
        >
          <Form>
            <div className="form-group">
              <label htmlFor="title">Event Title:</label>
              <Field type="text" id="title" name="title" />
            </div>
            <div className="form-group">
              <label htmlFor="date">Date:</label>
              <input
                type="date"
                id="date"
                name="date"
                onChange={(e) => handleDateChange(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="startTime">Start Time:</label>
              <select
                id="startTime"
                name="startTime"
                onChange={(e) => handleStartTimeChange(e.target.value)}
              >
                <option value="">Select a time</option>
                {generateTimeSlots().map((timeSlot) => (
                  <option key={timeSlot} value={timeSlot}>
                    {timeSlot}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="endTime">End Time:</label>
              <select
                id="endTime"
                name="endTime"
                onChange={(e) => handleEndTimeChange(e.target.value)}
              >
                <option value="">Select a time</option>
                {generateTimeSlots().map((timeSlot) => (
                  <option key={timeSlot} value={timeSlot}>
                    {timeSlot}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <button type="submit">Add Event</button>
            </div>
            {conflictMessage && (
              <div className="conflict-message">{conflictMessage}</div>
            )}
          </Form>
        </Formik>
      </div>
      <div 
        className="calendar">
        <FullCalendar
          editable
          selectable
          events={state.events}
          eventContent={(info) => (
            <EventItem info={info} onDelete={handleEventDelete} />
          )}
          plugins={[daygridPlugin, interactionPlugin]}
          headerToolbar={{
            start: "today prev next",
            end: "dayGridMonth dayGridWeek dayGridDay",
          }}
          themeSystem="custom" // Apply the custom theme
          customButtons={customTheme} // Define custom styles for buttons
          buttonText={{
            today: "Today",
            prev: "<",
            next: ">",
          }}
          views={["dayGridMonth", "dayGridWeek", "dayGridDay"]}
        />
      </div>
    </div>
  );
}

export default App;
