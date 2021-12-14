import "./Dashboard.css";
import React, { useState, useEffect } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import Reservations from "./Reservations";
import useQuery from "../utils/useQuery";
import { API_BASE_URL } from "../utils/api";

function Dashboard({
  date,
  useDate,
  setUseDate,
  errors,
  setErrors,
  setToggleReload,
  toggleReload,
}) {
  const RESERVATIONS_URL = API_BASE_URL + "/reservations";
  const TABLES_URL = API_BASE_URL + "/tables";
  const [reservations, setReservations] = useState([]);
  const [toggleButton, setToggleButton] = useState("none"); //toggle buttons
  const [tables, setTables] = useState([]);
  const query = useQuery();
  const dateQuery = query.get("date");

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
  }, [useDate, toggleReload]);

  useEffect(() => {
    //load tables
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
    setToggleReload(false);
    const abortController = new AbortController();
    const table_id = e.currentTarget.id;
    async function deleteSeat() {
      let response = await fetch(TABLES_URL + `/${table_id}/seat`, {
        method: "DELETE",
      });
      const body = await response.json();
      const status = response.status;

      response = await fetch(TABLES_URL, { method: "GET" }); //fetch the new tables list
      const newTablesList = await response.json();

      setTables(newTablesList.data || []);
      setToggleReload(
        newTablesList.data[1].reservation_id +
          "-" +
          table_id +
          "-" +
          status +
          JSON.stringify(body)
      ); //reloads the tables in dashboard
    }
    if (
      window.confirm(
        "Is this table ready to seat new guests? This cannot be undone."
      )
    )
      deleteSeat();

    return () => abortController.abort();
  }

  function tableItemBuilder(table) {
    let { table_id, table_name, capacity, reservation_id } = table;
    let status = "occupied";
    if (!reservation_id) {
      reservation_id = "N/A";
      status = "free";
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
        {status === "occupied" && (
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

  useEffect(() => {
    if (dateQuery) setUseDate(dateQuery);
  }, [dateQuery]);

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
          {/* {reservations.length === 0 && (
            <p>No reservations for this date found...</p>
          )} */}
          <ul className="reservation-list">
            {reservations.map(
              (reservation, index) =>
                reservation.status !== "cancelled" && (
                  <li className="li-container" key={index}>
                    <Reservations
                      reservation={reservation}
                      setToggleReload={setToggleReload}
                      toggleReload={toggleReload}
                    />
                  </li>
                )
            )}
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
