import "./ReservationSeatForm.css";
import { useEffect, useState } from "react";
import { useHistory } from "react-router";

function ReservationSeatForm() {
  const TABLES_URL = "http://localhost:5000/tables";
  const history = useHistory();
  const [tables, setTables] = useState();

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
    loadTables();
  }, []);

  console.log(tables);
  return (
    <div className="form-width">
      <form>
        <fieldset>
          <legend>Seat a Table</legend>
          <hr />
          <label htmlFor="table_id">Tables:</label>
          <select name="table_id" id="table_id">
          {tables && tables.map((table, index) => {
            // <option value={index}>({table.table_name - table.capacity})</option>
            <option>Hello</option>
          })}
          </select>
          <br />
          <div className="center-buttons">
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
