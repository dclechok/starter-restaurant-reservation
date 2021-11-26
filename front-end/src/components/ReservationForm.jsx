import React, { useState } from "react"; //useEffect
import "./ReservationForm.css";
import { useHistory } from "react-router";

function ReservationForm() {
  const RESERVATIONS_URL = "http://localhost:5000/reservations";
  let history = useHistory(); //get history of page
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

  function handleClick() {
    history.goBack();
  } //cancel form takes us back a page

  function handleSubmit(e) {
    //validate fields and make call to API
    e.preventDefault(); //stop from reloading on submit
    //useEffect
    async function saveReservation() {
      try {
        await fetch(
          RESERVATIONS_URL,
          {
            method: "POST",
            body: JSON.stringify({ data: reservationData }),
            headers: {"Content-Type": "application/json"}
          },
        );
      } catch (e) {
        console.error(e, "Failed to fetch post request."); // use ErrorAlert? 
      }
      console.log(JSON.stringify(reservationData));
    }
    saveReservation();

    setReservationData(defaultReservationData);
  }

  function handleChange(e) {
    e.preventDefault(); //stop from reloading on change
    let changeObject = { ...reservationData };
    changeObject[e.target.id] = e.target.value;
    setReservationData(changeObject);
  }

  return (
    <div className="form-width">
      <form>
        <fieldset>
          <legend>Create a New Reservation:</legend>
          <hr />
          <label htmlFor="first_name">
            First Name:
            <input
              type="text"
              name="first_name"
              value={reservationData.first_name}
              id="first_name"
              onChange={handleChange}
            />
          </label>
          <label htmlFor="last_name">
            Last Name:
            <input
              type="text"
              name="last_name"
              value={reservationData.last_name}
              id="last_name"
              onChange={handleChange}
            />
          </label>
          <label htmlFor="mobile_number">
            Mobile Number:
            <input
              name="mobile_number"
              value={reservationData.mobile_number}
              id="mobile_number"
              onChange={handleChange}
            />
          </label>
          <label htmlFor="reservation_date">
            Reservation Date:
            <input
              name="reservation_date"
              value={reservationData.reservation_date}
              id="reservation_date"
              onChange={handleChange}
            />
          </label>
          <label htmlFor="reservation_time">
            Reservation Time:
            <input
              name="reservation_time"
              value={reservationData.reservation_time}
              id="reservation_time"
              onChange={handleChange}
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
            <button type="submit" onClick={handleSubmit}>
              Submit
            </button>
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
