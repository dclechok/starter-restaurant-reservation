import React, { useEffect, useState } from "react";
import "./ReservationForm.css";
import { useHistory } from "react-router";

function ReservationForm() {

  let history = useHistory(); //get history of page

  function handleClick(){ history.goBack(); } 

  function handleSubmit(e){ 
      e.preventDefault(); //stop from reloading on submit
      console.log('hello');
    }

  function handleChange(){

  }

  return (
    <div className="form-width">
      <form>
        <fieldset>
          <legend>Create a New Reservation:</legend>
          <hr />
          <label>
            First Name:
            <input type="text" name="first_name" id="first_name" onChange={handleChange} />
          </label>
          <label>
            Last Name:
            <input type="text" name="last_name" id="last_name" onChange={handleChange} />
          </label>
          <label>
            Mobile Number:
            <input name="mobile_number" id="mobile_number" onChange={handleChange} />
          </label>
          <label>
            Reservation Date:
            <input name="reservation_date" id="reservation_date" onChange={handleChange} />
          </label>
          <label>
            Reservation Time:
            <input name="reservation_time" id="reservation_time" onChange={handleChange} />
          </label>
          <label>
            People:
            <input name="people" id="people" onChange={handleChange} /> {/*must be at least 1 person*/}
          </label>
          <br />
          <div className="center-buttons">
            <button type="submit" onClick={handleSubmit}>Submit</button>
            <button type="button" onClick={handleClick}>Cancel</button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

export default ReservationForm;
