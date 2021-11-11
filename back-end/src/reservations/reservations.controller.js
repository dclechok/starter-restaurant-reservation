/**
 * List handler for reservation resources
 */
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');
const knex = require('../db/connection');
// const reservationService = require('./reservations.service');

const DATE_FORMAT = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/; //valid regex formatting for date
const TIME_FORMAT = /^(0?[1-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;  //valid regex formatting for time
//VALIDATION MIDDLEWARE
function bodyHasResultProperty(req, res, next) {
  const { data } = req.body;
  console.log(data);
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
  //validate each separate piece of the requests body data

  if(!first_name) return next({
    status: 400, message: 'Reservation must include a first_name.'
  });
  if(!last_name) return next({
    status: 400, message: 'Reservation must include a last_name.'
  });
  if(!mobile_number) return next({
    status: 400, message: 'Reservation must include a mobile_number.'
  });
  if(!reservation_date || !DATE_FORMAT.test(reservation_date)) return next({
    status: 400, message: 'Reservation must include a valid reservation_date.'
  });
  if(!reservation_time || !TIME_FORMAT.test(reservation_time)) return next({
    status: 400, message: 'Reservation must include a valid reservation_time.'
  });
  if(!people || typeof people !== 'number') return next({
    status: 400, message: 'Reservation must include a valid number of people',
  });
  next(); //validated onto next middleware
}

function validateDate(req, res, next){
  const { reservation_date } = req.body.data;
  //construct todays date as a string
  const dateToday = new Date();
  let buildDate = dateToday.getFullYear() + '-' + (dateToday.getMonth() + 1) + '-' + dateToday.getDate();
  //compare incoming reservation date to the current date
  const incomingDate = new Date(reservation_date);
  const currentDate = new Date(buildDate);
  if(incomingDate < currentDate) return next({
      status: 400, message: 'Reservations cannot be placed from the future.',
    });
  res.locals.resDate = incomingDate; //store reservation date to be used in next validation
  next();
}

function validateNoTuesdayReservation(req, res, next){
  //we are closed on Tuesday's
  const resDate = res.locals.resDate;
  console.log(resDate, resDate.getDay());
  if(resDate.getDay() === 1) return next({ //0-6 Sun-Sat in documentation, for some reason we are 0-6 Mon-Sun?
    status: 400, message: 'Sorry, we are closed on Tuesday.',
  });
  next();
}

async function list(req, res) {
  const queryDate = req.query.date;
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
  await knex('reservations').insert(result); //insert body data into reservations
  res.status(201).json({ data: result });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    bodyHasResultProperty, 
    validateReservation, 
    validateDate, 
    validateNoTuesdayReservation, 
    asyncErrorBoundary(create)
  ],
};
