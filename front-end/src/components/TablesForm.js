import { useHistory } from "react-router";
import { useState } from "react";

function TablesForm() {
  const TABLES_URL = "http://localhost:5000/tables";
  const history = useHistory();
  const defaultTableData = {
    table_name: "",
    capacity: 1,
  };

  const [tableData, setTableData] = useState(defaultTableData);
  function handleSubmit(e) {
    e.preventDefault();
    const abortController = new AbortController();
    //validateFormData
    //call to API
    tableData.capacity = Number(tableData.capacity);
    async function createNewTable() {
      try {
        await fetch(TABLES_URL, {
          method: "POST",
          body: JSON.stringify({ data: tableData }),
          headers: { "Content-Type": "application/json" },
        });
      } catch (e) {
        console.log(e);
      }
      //   console.log(await response.json());
      return () => {
        abortController.abort();
      };
    }
    createNewTable();
    //take us back to the dashboard
    history.push({
      pathname: "/dashboard",
    });
  }

  function handleClick() {
    history.goBack();
  }

  function handleChange({ target }) {
    setTableData({
      ...tableData,
      [target.name]: target.value,
    });
  }

  return (
    <div>
      <form className="form-width" onSubmit={handleSubmit}>
        <fieldset>
          <legend>Create a New Table</legend>
          <hr />
          <label htmlFor="table_name">Table Name:</label>
          <input
            name="table_name"
            id="table_name"
            type="text"
            onChange={handleChange}
            value={tableData.table_name}
          />
          <br />
          <label htmlFor="capacity">Capacity:</label>
          <input
            name="capacity"
            id="table_name"
            type="number"
            onChange={handleChange}
          />
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

export default TablesForm;
