/**
 * List handler for reservation resources
 */
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');
const knex = require('../db/connection');
// const reservationService = require('./reservations.service');

const DATE_FORMAT = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/; //valid regex formatting for date
const TIME_FORMAT = /^(0?[1-9]|1[0-2]):[0-5][0-9]$/;  //valid regex formatting for time
//validation middleware
function bodyHasResultProperty(req, res, next) {
  const { data } = req.body;
  if (data) { //if body exists - move to validate body
    return next();
  }
  next({
    status: 400,
    message: "A 'result' property is required.",
  });
}

function validateReservation(req, res, next){
  const { first_name, last_name, mobile_number, reservation_date, reservation_time, people } = req.body.data;
  //validate each separate piece of body data
  if(!people || people === 0 || typeof people != 'number') return next({
    status: 400, message: 'Reservation must include a valid number of people',
  });
  else if(!first_name) return next({
    status: 400, message: 'Reservation must include a first_name.'
  });
  else if(!last_name) return next({
    status: 400, message: 'Reservation must include a last_name.'
  });
  else if(!mobile_number) return next({
    status: 400, message: 'Reservation must include a mobile_number.'
  });
  else if(reservation_date == 'undefined' || !reservation_date || reservation_date.length === 0 || !DATE_FORMAT.test(reservation_date)) return next({
    status: 400, message: 'Reservation must include a valid reservation_date.'
  });
  else if(reservation_time == 'undefined' || !reservation_time || !TIME_FORMAT.test(reservation_time)) return next({
    status: 400, message: 'Reservation must include a valid reservation_time.'
  });

  next(); //validated onto next middleware
}

async function list(req, res) {
  const queryDate = req.query.date;
  console.log(queryDate);
  const query = knex
    .from('reservations')
    .select('*') //list all reservations, unless query with a key parameter is provided
    .orderByRaw('reservation_time') //earliest reservation time first
    if(queryDate){ //if query parameter, list reservations that match parameter key
      query.where('reservation_date', queryDate);
    }
    const data = await query;
    res.json({ data });
}

async function create(req, res){
  const result = req.body.data;
  res.status(201).json({ data: 'hello' });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [bodyHasResultProperty, validateReservation, asyncErrorBoundary(create)],
};
