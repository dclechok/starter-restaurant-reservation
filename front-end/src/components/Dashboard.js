import formatReservationDate from "../utils/format-reservation-date";
import formatReservationTime from "../utils/format-reservation-time";
import "./Dashboard.css";
import React, { useState, useEffect } from "react";
import ErrorAlert from "../layout/ErrorAlert";

function Dashboard({ date, useDate, setUseDate, errors, setErrors }) {
  const RESERVATIONS_URL = "http://localhost:5000/reservations";
  const TABLES_URL = "http://localhost:5000/tables";
  const [reservations, setReservations] = useState([]);
  const [toggleButton, setToggleButton] = useState("none"); //toggle buttons
  const [toggleReload, setToggleReload] = useState(false); //toggle tables reload
  const [tables, setTables] = useState([]);

  useEffect(() => {
    //fetch reservations based on useDate
    const abortController = new AbortController();
    async function getReservationByDate() {
      try {
        const response = await fetch(RESERVATIONS_URL + `?date=${useDate}`, {
          method: "GET",
        });
        const newRes = await response.json();
        setReservations(newRes.data || []);
      } catch (e) {
        setErrors(e);
      }
    }
    getReservationByDate();
    setToggleButton("none");
    return () => {
      abortController.abort();
    }; //cleanup, cancels any incoming api calls
  }, [useDate]);

  useEffect(() => {
    const abortController = new AbortController();
    async function getTablesList() {
      try {
        const response = await fetch(TABLES_URL, { method: "GET" });
        const newTablesList = await response.json();
        setTables(newTablesList.data || []);
      } catch (e) {
        setErrors(e);
      }
    }
    getTablesList();
    return () => {
      abortController.abort();
    }; //cleanup, cancels any incoming api calls
  }, [toggleReload]);

  function handleFinish(e) {
    const table_id = e.currentTarget.id;
    console.log(table_id);
    const result = window.confirm(
      "Is this table ready to seat new guests? This cannot be undone."
    );
    async function deleteSeat() {
      try {
        const response = await fetch(TABLES_URL + `/${table_id}` + "/seat", {
          method: "DELETE",
        });
        const resJson = await response.json();
        console.log(resJson);
        setToggleReload(true);
      } catch (e) {
        console.log(e);
      }
    }
    if(result) deleteSeat();
  }

  function tableItemBuilder(table) {
    let { table_id, table_name, capacity, reservation_id } = table;
    let status = "Occupied";
    if (!reservation_id) {
      reservation_id = "N/A";
      status = "Free";
    }
    return (
      <div className="render-res">
        <span>Table ID: {table_id}</span>
        <br />
        <span>Table Name: {table_name}</span>
        <br />
        <span>Reservation ID: {reservation_id}</span>
        <br />
        <span>Capacity: {capacity}</span>
        <br />
        <span data-table-id-status={table.table_id}>Status: {status}</span>
        {status === "Occupied" && (
          <React.Fragment>
            <br />
            <button
              data-table-id-finish={table.table_id}
              type="button"
              id={table.table_id}
              className="finish-button"
              onClick={handleFinish}
            >
              Finish
            </button>
          </React.Fragment>
        )}
      </div>
    );
  }

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
      <div className="render-res">
        <span>Reservation ID: {reservation_id}</span>
        <br />
        <span>First Name: {first_name}</span>
        <br />
        <span>Last Name: {last_name}</span>
        <br />
        <span>Date of Reservation: {reservation_date}</span>
        <br />
        <span>Time of Reservation: {reservation_time}</span>
        <br />
        <span>Mobile Number: {mobile_number}</span>
        <br />
        <span>Amount of People: {people}</span>
        <br />
        <a href={`/reservations/${reservation_id}/seat`}>
          <button className="seat-button" type="button">
            Seat
          </button>
        </a>
      </div>
    );
  }

  useEffect(() => {
    const abortController = new AbortController();
    function buildNewDate(newDateObjectToStringify) {
      return setUseDate(
        newDateObjectToStringify.getFullYear() +
          "-" +
          (newDateObjectToStringify.getMonth() + 1) +
          "-" +
          newDateObjectToStringify.getDate()
      );
    }

    if (toggleButton === "today") setUseDate(date);

    //build a new date object to stringify
    //change format from 2021-12-12 to 2021/12/12 or else it is a day behind? bug?
    const newDateObjectToStringify = new Date(useDate.replace(/-/g, "/"));

    if (toggleButton === "next") {
      newDateObjectToStringify.setDate(newDateObjectToStringify.getDate() + 1);
      buildNewDate(newDateObjectToStringify);
    }
    if (toggleButton === "previous") {
      newDateObjectToStringify.setDate(newDateObjectToStringify.getDate() - 1);
      buildNewDate(newDateObjectToStringify);
    }
    return () => {
      abortController.abort();
    }; //cleanup, cancels any incoming api calls
  }, [toggleButton]);

  // if (reservations.data) {
  return (
    <div className="main-div-width">
      <div className="flex-container">
        <div className="left-div">
          <h2>Reservations for {useDate}</h2>
          {/*if no query date, go with today's date*/}
          <hr />
          {/*list all reservations for whatever date we have*/}
          {errors && <ErrorAlert error={errors} />}
          {reservations.length === 0 && (
            <p>No reservations for this date found...</p>
          )}
          <ul className="reservation-list">
            {reservations.map((reservation, index) => (
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
        <div className="right-div">
          <h2>Tables</h2>
          <hr />
          {tables.length === 0 && <p>No tables exist...</p>}
          <ul className="reservation-list">
            {tables.map((table, index) => (
              <li className="li-container" key={index}>
                {tableItemBuilder(table)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
  // } else return <p>"Loading reservations..." {useDate}</p>;
}

export default Dashboard;
