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
  const [placeholder, setPlaceholder] = useState({});
  const [isEditPage, setIsEditPage] = useState(false);

  const defaultReservationData = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 1, //1 is minimum
  };

  const [reservationData, setReservationData] = useState(
    defaultReservationData
  );
  console.log(reservationData.reservation_time);
  function handleClick() {
    history.goBack();
  } //cancel form takes us back a page

  function handleCreateSubmit(e) {
    //validate fields and make call to API
    setErrors(""); //reset errors
    e.preventDefault(); //stop from reloading on submit
    reservationData.people = Number(reservationData.people); //people must not be a string

    let formattedDate = reservationData.reservation_date; //format date from 01012035 to 2035-01-01 which our backend accepts
    formattedDate =
      formattedDate.substring(4, 8) +
      "-" +
      formattedDate.substring(2, 4) +
      "-" +
      formattedDate.substring(0, 2);
    reservationData.reservation_date = formattedDate;

    //format time -- throw a ':' in there so the backend can process
    let time = reservationData.reservation_time; // 1330
    const formattedTime = time.split("");
    formattedTime.splice(2, 0, ":");
    reservationData.reservation_time = formattedTime.join("");

    async function saveReservation() {
      try {
        const response = await fetch(RESERVATIONS_URL, {
          method: "POST",
          body: JSON.stringify({ data: reservationData }),
          headers: { "Content-Type": "application/json" },
        });
        const responseInfo = await response.json();
        if (responseInfo.error) setErrors(responseInfo.error);
        setUseDate(reservationData.reservation_date); //set date state variable, to rerender dashboard
        setReservationData(defaultReservationData);
        //move to Dashboard with reservation
        history.push({
          pathname: "/reservations",
          search: `?date=${reservationData.reservation_date}`,
        });
      } catch (e) {
        console.error(e, "Failed to fetch post request."); // use ErrorAlert?
      }
    }
    saveReservation();
  }

  useEffect(() => {
    async function loadRes() {
      try {
        const response = await fetch(RESERVATIONS_URL + `/${reservation_id}`, {
          method: "GET",
        });
        const resJson = await response.json();
        if (resJson) setPlaceholder({ ...resJson.data });
      } catch (e) {
        console.log(e);
      }
    }
    if (currentUrl === `/reservations/${reservation_id}/edit`) {
      loadRes();
      setIsEditPage(true); // the page is an edit page, not create page
      setReservationData(placeholder);
    }
  }, []);

  const handleChange = ({ target }) => {
    setReservationData({
      ...reservationData,
      [target.name]: target.value,
    });
    if(reservation_id){
      console.log(target.name, target.value);
      setPlaceholder({
        ...reservationData,
        [target.name]: target.value,
      })
    }
  };

  const handleEditSubmit = (e) => {
    //edit submit if edit page
    e.preventDefault();
    const abortController = new AbortController();

    reservationData.people = Number(reservationData.people); //people must not be a string

    let formattedDate = reservationData.reservation_date; //format date from 01012035 to 2035-01-01 which our backend accepts
    formattedDate =
      formattedDate.substring(4, 8) +
      "-" +
      formattedDate.substring(2, 4) +
      "-" +
      formattedDate.substring(0, 2);
    reservationData.reservation_date = formattedDate;

    //format time -- throw a ':' in there so the backend can process
    let time = reservationData.reservation_time; // 1330
    const formattedTime = time.split("");
    formattedTime.splice(2, 0, ":");
    reservationData.reservation_time = formattedTime.join("");


    async function updateReservation() {
      
      try {
        const response = await fetch(RESERVATIONS_URL + `/${reservation_id}`, {
          method: "PUT",
          body: JSON.stringify({ data: reservationData }),
          headers: { "Content-Type": "application/json" },
        });
        const resJson = await response.json();
        setReservationData(defaultReservationData);
        if(resJson.data) history.goBack(); //if request data is successful, go back to previous page
      } catch (e) {
        console.log(e);
      }
    }
    updateReservation();
    return () => abortController.abort();
  };

  return (
    <div className="form-width">
      <form onSubmit={isEditPage ? handleEditSubmit : handleCreateSubmit}>
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
              value={placeholder.first_name}
              id="first_name"
              onChange={handleChange}
              placeholder={
                placeholder.first_name
                  ? `${placeholder.first_name}`
                  : `First Name`
              }
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
              placeholder={
                placeholder.last_name ? `${placeholder.last_name}` : "Last Name"
              }
            />
          </label>
          <label htmlFor="mobile_number">
            Mobile Number:
            <input
              name="mobile_number"
              value={placeholder.mobile_number}
              id="mobile_number"
              onChange={handleChange}
              placeholder={
                placeholder.mobile_number
                  ? `${placeholder.mobile_number}`
                  : "Mobile Number"
              }
            />
          </label>
          <label htmlFor="reservation_date">
            Reservation Date:
            <input
              name="reservation_date"
              value={placeholder.reservation_date}
              id="reservation_date"
              onChange={handleChange}
              placeholder={
                placeholder.reservation_date
                  ? `${formatReservationDate(placeholder).reservation_date}`
                  : "Reservation Date"
              }
            />
          </label>
          <label htmlFor="reservation_time">
            Reservation Time:
            <input
              name="reservation_time"
              value={placeholder.reservation_time}
              id="reservation_time"
              onChange={handleChange}
              placeholder={
                placeholder.reservation_time
                  ? `${formatReservationTime(placeholder).reservation_time}`
                  : "Reservation Time"
              }
            />
          </label>
          <label htmlFor="people">
            People:
            <input
              name="people"
              id="people"
              value={reservationData.people}
              onChange={handleChange}
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
