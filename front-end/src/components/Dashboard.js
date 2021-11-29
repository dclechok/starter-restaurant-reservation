import useQuery from "../utils/useQuery";
import formatReservationDate from "../utils/format-reservation-date";
import formatReservationTime from "../utils/format-reservation-time";
// import buildDateString from "../utils/build-date-string";
// import ErrorAlert from "../layout/ErrorAlert";
import "./Dashboard.css";
import { useState, useEffect } from "react";

function Dashboard({ date }) {
  //is there a date query?
  const dateQuery = useQuery();
  const getQueryDate = dateQuery.get("date");
  const RESERVATIONS_URL = "http://localhost:5000/reservations";
  const [reservations, setReservations] = useState([]);
  const [useDate, setUseDate] = useState(getQueryDate ? getQueryDate : date); //today's date, or specific query date
  const [toggleButton, setToggleButton] = useState("none"); //toggle buttons

  useEffect(() => {
    const abortController = new AbortController();
    async function getReservationByDate() {
      try {
        const response = await fetch(RESERVATIONS_URL + `?date=${useDate}`, {
          method: "GET",
        });
        setReservations(await response.json());
      } catch (e) {
        console.error(e, "Failed to fetch get request."); // use ErrorAlert?
      }
    }
    getReservationByDate();
    setToggleButton("none");
    return () => {
      abortController.abort();
    }; //cleanup, cancels any incoming api calls
  }, [useDate]);

  function reservationListItemBuilder(listItem) {
    const {
      reservation_id,
      first_name,
      last_name,
      mobile_number,
      reservation_time,
      reservation_date,
      people,
    } = listItem;

    formatReservationDate(listItem);
    formatReservationTime(listItem);

    return (
      <div>
        <span>Reservation ID: {reservation_id}</span>
        <br />
        <span>Name: {first_name + " " + last_name}</span>
        <br />
        <span>Date of Reservation: {reservation_date}</span>
        <br />
        <span>Time of Reservation: {reservation_time}</span>
        <br />
        <span>Mobile Number: {mobile_number}</span>
        <br />
        <span>Amount of People: {people}</span>
      </div>
    );
  }

  useEffect(() => {
    function buildNewDate(newDateObjectToStringify) {
      return setUseDate(
        newDateObjectToStringify.getFullYear() +
          "-" +
          (newDateObjectToStringify.getMonth() + 1) +
          "-" +
          newDateObjectToStringify.getDate()
      );
    }

    if (toggleButton === "today") {
      setUseDate(date);
    }
    const newDateObjectToStringify = new Date(useDate.replace(/-/g, "/"));
    if (toggleButton === "next") {
      //build a new date object to stringify
      //change format from 2021-12-12 to 2021/12/12 or else it is a day behind? bug?
      newDateObjectToStringify.setDate(newDateObjectToStringify.getDate() + 1);
      buildNewDate(newDateObjectToStringify);
    }
    if (toggleButton === "previous") {
      //build a new date object to stringify
      //change format from 2021-12-12 to 2021/12/12 or else it is a day behind? bug?
      newDateObjectToStringify.setDate(newDateObjectToStringify.getDate() - 1);
      buildNewDate(newDateObjectToStringify);
    }
  }, [toggleButton]);

  if (reservations.data) {
    return (
      <div className="div-width">
        <h2>Reservations for {useDate}</h2>
        {/*if no query date, go with today's date*/}
        <hr />
        {/*list all reservations for whatever date we have*/}
        {reservations.data.length === 0 && (
          <p>No reservations for this date found...</p>
        )}
        <ul className="reservation-list">
          {reservations.data.map((reservation, index) => (
            <li className="li-container" key={index}>
              {reservationListItemBuilder(reservation)}
            </li>
          ))}
        </ul>
        <div className="center-buttons">
          <button
            type="button"
            id="previous"
            onClick={() => setToggleButton("previous")}
          >
            Previous
          </button>
          <button
            type="button"
            id="today"
            onClick={() => setToggleButton("today")}
          >
            Today
          </button>
          <button
            type="button"
            id="next"
            onClick={() => setToggleButton("next")}
          >
            Next
          </button>
        </div>
      </div>
    );
  } else return <p>"Loading reservations..."</p>; //ErrorAlert?
}

export default Dashboard;
