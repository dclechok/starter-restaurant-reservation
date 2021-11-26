import useQuery from "../utils/useQuery";
import "./Dashboard.css";

function Dashboard({ date }) {
  //is there a date query?
  const dateQuery = useQuery();
  const getQueryDate = dateQuery.get("date");

  return (
    <div className="div-width">
      <h2>Reservations for {getQueryDate ? getQueryDate : date}</h2>{" "}
      {/*if no query date, go with today's date*/}
      <hr />
      {/*list all reservations for whatever date we have*/}
      
      <div className="center-buttons">
        <button type="button">Previous</button>
        <button type="button">Today</button>
        <button type="button">Next</button>
      </div>
    </div>
  );
}

export default Dashboard;
