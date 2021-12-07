import { useState } from "react";
import "./Search.css";
import Reservations from "./Reservations";

function Search() {
  const RESERVATIONS_URL = "http://localhost:5000/reservations/?mobile_number=";
  const [phoneNumber, setPhoneNumber] = useState("");
  const [reservations, setReservations] = useState([]);

  function handleSubmit(e) {
    e.preventDefault();
    const abortController = new AbortController();
    async function searchReservations() {
      try {
        const response = await fetch(RESERVATIONS_URL + `${phoneNumber}`);
        const resJson = await response.json();
        if (resJson.data) setReservations(resJson.data);
      } catch (e) {
        console.log(e);
      }
    }
    searchReservations();
    setPhoneNumber("");
    setReservations([]);
    return () => abortController.abort();
  }

  function handleChange(e) {
    setPhoneNumber(e.target.value);
  }
  
  if (reservations) {
    return (
      <div>
        <form className="form-width" onSubmit={handleSubmit}>
          <fieldset>
            <legend>Search</legend>
            <hr />
            <div className="center-input">
              <input
                type="text"
                name="mobile_number"
                placeholder="Enter a customer's phone number"
                value={phoneNumber}
                onChange={handleChange}
              ></input>
            </div>
            <br />
            <div className="center-buttons">
              <button type="submit">Find</button>
            </div>
          </fieldset>
        </form>

          <ul className="reservation-list">
            {reservations.length !== 0 ? (
              reservations.map((reservation, index) => (
                <li className="li-container" key={index}>
                  <Reservations reservation={reservation} />
                </li>
            ))) : (<p>No reservations found</p>)  
            }
          </ul>

      </div>
    )
  } else return <p>No reservations found</p>;
}

export default Search;
