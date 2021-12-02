import "./ReservationSeatForm.css";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";

function ReservationSeatForm() {
  const TABLES_URL = "http://localhost:5000/tables";
  const history = useHistory();
  const [tables, setTables] = useState();
  const { reservation_id } = useParams();

  useEffect(() => {
    async function loadTables() {
      try {
        const response = await fetch(TABLES_URL, { method: "GET" });
        const resJson = await response.json();
        setTables(resJson.data);
      } catch (e) {
        console.log(e);
      }
    }
    loadTables(); //populate select list of available tables
  }, []);

  function handleSubmit(e) {
    //seat table
    e.preventDefault();
    const table_id = e.target.table_id.value; //selected value from form
    async function saveTableAssignment() {
      try {
        const response = await fetch(TABLES_URL + `/${table_id}` + "/seat", {
          method: "PUT",
          body: JSON.stringify({ data: { reservation_id: reservation_id } }),
          headers: { "Content-Type": "application/json" },
        });
        const resJson = await response.json();
        if (resJson.data) { //if request response is valid, push us back to dashboard
          history.push({
            pathname: "/dashboard",
          });
        }
      } catch (e) {
        console.log(e); //implement better error handling
      }
    }
    saveTableAssignment();
  }

  return (
    <div className="form-width">
      <form id="seatForm" onSubmit={handleSubmit}>
        <fieldset>
          <legend>Seat a Table</legend>
          <hr />
          <label htmlFor="table_id">Tables:</label>
          <select name="table_id" id="table_id">
            <option value="null"> - Select Table - </option>
            {tables &&
              tables.map((table, index) => {
                return (
                  <option name={table.id} key={index} value={table.table_id}>
                    {table.table_name} - {table.capacity}
                  </option>
                );
              })}
          </select>
          <br />
          <div className="center-buttons">
            <button type="submit" form="seatForm">
              Submit
            </button>
            <button type="button" onClick={() => history.goBack()}>
              Cancel
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

export default ReservationSeatForm;
