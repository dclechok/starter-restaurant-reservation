import { useHistory } from "react-router";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../utils/api";

function TablesForm() {
  const TABLES_URL = API_BASE_URL + "/tables";
  const history = useHistory();
  const defaultTableData = {
    table_name: "",
    capacity: 0,
  };

  const [tableData, setTableData] = useState(defaultTableData);
  const [validTable, setValidTable] = useState(false);

  useEffect(() => { //move to dashboard if table entered is valid
    if(validTable){
      history.push({
        pathname: "/dashboard",
      });
    }
  }, [validTable]);

  function handleSubmit(e) {
    e.preventDefault();
    // setValidTable(false);
    const abortController = new AbortController();
    //validateFormData
    //call to API
    tableData.capacity = Number(tableData.capacity);
    async function createNewTable() {
      try {
        const response = await fetch(TABLES_URL, {
          method: "POST",
          body: JSON.stringify({ data: tableData }),
          headers: { "Content-Type": "application/json" },
        });
        const resJson = await response.json();
        if(resJson.data) setValidTable(true);
      } catch (e) {
        setValidTable(false);
        console.log(e);
      }
      return () => {
        abortController.abort();
      };
    }
    createNewTable();
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
            type="text"
            onChange={handleChange}
            value={tableData.capacity}
          />
          <br />
          <div className="center-buttons">
            <button type="submit">Submit</button>
            <button type="button" onClick={() => history.goBack()}>
              Cancel
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

export default TablesForm;
