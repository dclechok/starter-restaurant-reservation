/**
 * List handler for reservation resources
 */
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

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

function validateRes(req, res, next){
  const { first_name, last_name, mobile_number, reservation_date, reservation_time, people } = req.body.data;
  //validate each separate piece of data
  if(!people || people === 0 || typeof people != 'number') return next({
    status: 400, message: 'Reservation must include a valid number of people',
  });
  if(!first_name) return next({
    status: 400, message: 'Reservation must include a first_name.'
  });
  if(!last_name) return next({
    status: 400, message: 'Reservation must include a last_name.'
  });
  if(!mobile_number) return next({
    status: 400, message: 'Reservation must include a mobile_number.'
  });
  if(reservation_date == 'undefined' || !reservation_date || reservation_date.length === 0 || !DATE_FORMAT.test(reservation_date)) return next({
    status: 400, message: 'Reservation must include a valid reservation_date.'
  });
  if(reservation_time == 'undefined' || !reservation_time || !TIME_FORMAT.test(reservation_time)) return next({
    status: 400, message: 'Reservation must include a valid reservation_time.'
  });

  next();
}

async function list(req, res) {
  res.json({
    data: [],
  });
}

async function create(req, res, next){
  // const id = next.Id();
  res.status(201).json({ data: 'hello' });
}

module.exports = {
  list,
  create: [bodyHasResultProperty, validateRes, asyncErrorBoundary(create)],
};
