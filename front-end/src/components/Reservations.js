import formatReservationDate from "../utils/format-reservation-date";
import formatReservationTime from "../utils/format-reservation-time";

function Reservations({ reservation }) {
    console.log(reservation, reservation.reservation_id);

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

    if (status !== "finished")
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
        </div>
      ); else return (<p>No reservation exists</p>)
  }

  export default Reservations;