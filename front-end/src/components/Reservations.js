import formatReservationDate from "../utils/format-reservation-date";
import formatReservationTime from "../utils/format-reservation-time";
import "./Reservations.css";
import { API_BASE_URL } from "../utils/api";

function Reservations({ reservation, setToggleReload, toggleReload }) {
  const RESERVATIONS_URL = API_BASE_URL + "/reservations";

  let {
    reservation_id,
    first_name,
    last_name,
    mobile_number,
    reservation_time,
    reservation_date,
    people,
    status,
  } = reservation;
  if (!status) status = "booked";

  formatReservationDate(reservation);
  formatReservationTime(reservation);

  function handleCancel(e) {
    const abortController = new AbortController();

    if (
      window.confirm(
        "Do you want to cancel this reservation? This cannot be undone."
      )
    ) {
      async function cancelReservation() {
        try {
          //PUT request to reservation status
          await fetch(RESERVATIONS_URL + `/${reservation_id}/status`, {
            method: "PUT",
            body: JSON.stringify({ data: { status: "cancelled" } }),
            headers: { "Content-Type": "application/json" },
          });
          setToggleReload(!toggleReload);
        } catch (e) {
          console.log(e);
        }
      }
      cancelReservation();
    }

    return () => abortController.abort();
  }

  if (status !== "finished" || status !== "cancelled")
    return (
      <div className="render-res">
        <span>Reservation ID: {reservation_id}</span>
        <br />
        <span>First Name: {first_name}</span>
        <br />
        <span>Last Name: {last_name}</span>
        <br />
        <span>Date of Reservation: {reservation_date}</span>
        <br />
        <span>Time of Reservation: {reservation_time}</span>
        <br />
        <span>Mobile Number: {mobile_number}</span>
        <br />
        <span>Amount of People: {people}</span>
        <br />
        <span data-reservation-id-status={reservation.reservation_id}>
          Status: {status}
        </span>
        <br />
        {status === "booked" && (
          <a href={`/reservations/${reservation_id}/seat`}>
            <button className="seat-button" type="button">
              Seat
            </button>
          </a>
        )}
        <a href={`/reservations/${reservation_id}/edit`}>
          <button type="button">Edit</button>
        </a>
        <button
          type="button"
          data-reservation-id-cancel={reservation.reservation_id}
          onClick={handleCancel}
          name="cancel"
          id={reservation_id}
        >
          Cancel
        </button>
      </div>
    );
  else return <p>Loading...</p>;
}

export default Reservations;
