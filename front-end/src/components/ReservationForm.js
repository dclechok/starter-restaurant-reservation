import React, { useEffect, useState } from "react"; //useEffect
import "./ReservationForm.css";
import { useHistory, useParams } from "react-router";
import { useLocation } from "react-router-dom";
import formatReservationDate from "../utils/format-reservation-date";
import formatReservationTime from "../utils/format-reservation-time";

function ReservationForm({ setUseDate, setErrors }) {
  const RESERVATIONS_URL = "http://localhost:5000/reservations";
  const { pathname: currentUrl } = useLocation();
  const history = useHistory(); //get history of page
  const { reservation_id } = useParams();
  const [isEditPage, setIsEditPage] = useState(false);

  const defaultReservationData = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 1, //1 is minimum
  };

  const [placeholder, setPlaceholder] = useState(defaultReservationData);

  function handleClick() {
    history.goBack();
  } //cancel form takes us back a page

  useEffect(() => {
    //if we're on edit page, toggle edit page form data
    if (currentUrl === `/reservations/${reservation_id}/edit`) {
      setIsEditPage(true); // the page is an edit page, not create page
    }
  }, []);

  function handleSubmit(e) {
    //validate fields and make call to API
    e.preventDefault(); //stop from reloading on submit
    const abortController = new AbortController();
    placeholder.people = Number(placeholder.people); //people must not be a string

    async function saveReservation() {
      try {
        placeholder.reservation_date = placeholder.reservation_date.substr(4, 4) + '-' + placeholder.reservation_date.substr(2, 2) + '-' + placeholder.reservation_date.substr(0, 2);
        console.log(placeholder.reservation_time, 'weher');
        if(placeholder.reservation_time.includes('PM')) {
          placeholder.reservation_time = Number(placeholder.reservation_time.substr(0, 2) + placeholder.reservation_time.substr(2, 2)) + 1200;
          placeholder.reservation_time = String(placeholder.reservation_time);
          placeholder.reservation_time = placeholder.reservation_time.substr(0, 2) + ':' + placeholder.reservation_time.substr(2, 2);
          
        }else{
          placeholder.reservation_time = placeholder.reservation_time.substr(0, 2) + ':' + placeholder.reservation_time.substr(2, 2);
        }

        const response = await fetch(RESERVATIONS_URL, {
          method: "POST",
          body: JSON.stringify({ data: placeholder }),
          headers: { "Content-Type": "application/json" },
        });
        const responseInfo = await response.json();
        if (responseInfo.error) setErrors(responseInfo.error);

        setPlaceholder(defaultReservationData);
        // move to Dashboard with reservation
        history.push({
          pathname: "/dashboard",
          search: `?date=${placeholder.reservation_date}`,
        });
      } catch (e) {
        console.error(e, "Failed to fetch post request."); // use ErrorAlert?
      }
    }

    async function updateReservation() {
      try {
        const response = await fetch(RESERVATIONS_URL + `/${reservation_id}`, {
          method: "PUT",
          body: JSON.stringify({ data: placeholder }),
          headers: { "Content-Type": "application/json" },
        });
        const resJson = await response.json();
        if (resJson.data) {
          setPlaceholder({});
          history.push({
            pathname: "/dashboard",
            search: `?date=${placeholder.reservation_date}`,
          });
        } //if request data is successful, go back to previous page
      } catch (e) {
        console.log(e);
      }
    }

    isEditPage ? updateReservation() : saveReservation();// if we're on edit page, then just update existing reservation if not save new reservation
    setPlaceholder(defaultReservationData);
    return () => abortController.abort();
  }

  useEffect(() => {
    //edit page form data
    const abortController = new AbortController();
    async function loadRes() {
      try {
        const response = await fetch(RESERVATIONS_URL + `/${reservation_id}`, {
          method: "GET",
        });
        const resJson = await response.json();
        if (resJson.data) {
          formatReservationDate(resJson.data);
          formatReservationTime(resJson.data);
          setPlaceholder({ ...resJson.data });
        }
      } catch (e) {
        console.log(e);
      }
    }
    if (currentUrl === `/reservations/${reservation_id}/edit`) {
      loadRes();
    }
    return () => abortController.abort();
  }, []);

  const handleChange = ({ target }) => {
    setPlaceholder({
      ...placeholder,
      [target.name]: target.value,
    });
  };

  return (
    <div className="form-width">
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>
            {currentUrl === "/reservations/new" ? "Create" : "Edit"} Reservation
          </legend>
          <hr />
          <label htmlFor="first_name">
            First Name:
            <input
              type="text"
              name="first_name"
              value={placeholder.first_name
              }
              id="first_name"
              onChange={handleChange}
              placeholder={`First Name`}
            />
          </label>
          <label htmlFor="last_name">
            Last Name:
            <input
              type="text"
              name="last_name"
              value={placeholder.last_name}
              id="last_name"
              onChange={handleChange}
              placeholder={"Last Name"}
            />
          </label>
          <label htmlFor="mobile_number">
            Mobile Number:
            <input
              name="mobile_number"
              value={placeholder.mobile_number}
              id="mobile_number"
              onChange={handleChange}
              placeholder={"Mobile Number"}
            />
          </label>
          <label htmlFor="reservation_date">
            Reservation Date:
            <input
              name="reservation_date"
              value={placeholder.reservation_date}
              id="reservation_date"
              onChange={handleChange}
              // pattern="\d{4}-\d{2}-\d{2}"
              placeholder={"Reservation Date"}
            />
          </label>
          <label htmlFor="reservation_time">
            Reservation Time:
            <input
              name="reservation_time"
              value={placeholder.reservation_time}
              id="reservation_time"
              onChange={handleChange}
              // pattern="[0-9]{2}:[0-9]{2}"
              placeholder={"Reservation Time"}
            />
          </label>
          <label htmlFor="people">
            People:
            <input
              name="people"
              id="people"
              value={placeholder.people}
              onChange={handleChange}
              placeholder="Number of People"
            />
            {/*must be at least 1 person*/}
          </label>
          <br />
          <div className="center-buttons">
            <button type="submit">Submit</button>
            <button type="button" onClick={handleClick}>
              Cancel
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

export default ReservationForm;
