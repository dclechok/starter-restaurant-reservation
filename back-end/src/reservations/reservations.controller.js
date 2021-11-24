/**
 * List handler for reservation resources
 */
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');
const knex = require('../db/connection');
// const reservationService = require('./reservations.service');

const DATE_FORMAT = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/; //valid regex formatting for date
const TIME_FORMAT = /^(0?[1-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;  //valid regex formatting for time

// START VALIDATION MIDDLEWARE
function bodyHasResultProperty(req, res, next) {
  const { data } = req.body;
  if(data) return next(); //if body exists - move to validate body
  next({ status: 400, message: "A 'result' property is required." });
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
  if(resDate.getDay() === 1) return next({ //0-6 Sun-Sat in documentation, for some reason we are 0-6 Mon-Sun?
    status: 400, message: 'Sorry, we are closed on Tuesday.',
  });
  next();
}

function validateTime(req, res, next){
  //reservation time is an error if:  // the res time is before 10:30am  // the res time is after 9:30pm
  // only future reservations are allowed (after current time on day even current day)
  const { reservation_time: time } = req.body.data;
  const TOO_EARLY = 1030, TOO_LATE = 2230;
  let attemptedResTime = time.split('').slice(0, 2).join(''); //removing colon :
  attemptedResTime += time.split('').slice(3, 5).join('');
  if(Number(attemptedResTime) < TOO_EARLY || Number(attemptedResTime) > TOO_LATE) return next({ status: 400, message: 'Reservation from future not allowed.' });
  next();
}

async function reservationExists(req, res, next){
  const { reservation_Id } = req.params;
  const query = await knex('reservations').select('*').where('reservation_id', reservation_Id).then(queries => queries[0]);
  if(!query) return next({ status: 404, message: `Reservation ${reservation_Id} does not exist.`});
  res.locals.reservation = query;
  next();
}

function checkStatusForPost(req, res, next){
  const { status } = req.body.data;
  if(status === 'finished' || status === 'seated') return next({ status: 400, message: `Reservation status is ${status} / finished.`});
  next();
}

function checkStatusForPut(req, res, next){
  if(!req.body.data.status || req.body.data.status === 'unknown')
    return next({ status: 400, message: `Reservation status is ${req.body.data.status}.`});
  next();
}

function checkStatusFromLocals(req, res, next){
  if(res.locals.reservation.status === 'finished') return next({ status: 400, message: 'Status cannot be currently finished.' });
  next();
}
/* END VALIDATION MIDDLEWARE */

async function list(req, res) {
  //if there is a mobile_number query then list by mobile_number
  const queryMobileNumber = req.query.mobile_number;
  if(queryMobileNumber){
    const data = await knex('reservations').select('*').where('mobile_number', 'like', `%${queryMobileNumber}%`);
    res.json({ data });
  }
  
  //if there is a date query then list by date
  const queryDate = req.query.date;
  const query = knex
    .from('reservations')
    .select('*') //list all reservations, unless query with a key parameter is provided
    .orderByRaw('reservation_time') //earliest reservation time first
    if(queryDate){ //if query parameter, list reservations that match parameter key
      query.where('reservation_date', queryDate).whereRaw("(status <> 'finished' or status is null)");
    }
    const data = await query;
    res.json({ data });
}

async function create(req, res){
  const result = req.body.data;
  const data = await knex('reservations').insert(result).returning('*').then(results => results[0]); //insert body data into reservations
  res.status(201).json({ data });
}

async function read(req, res){
  const { reservation_Id } = req.params; //get incoming param
  const data = await knex.from('reservations').select('*').where('reservation_id', reservation_Id).then(records => records[0]);
  if(data) res.status(200).json({ data });
  else res.sendStatus(400);
}

async function update(req, res){ // 
  const { reservation_Id } = req.params;
  const { first_name, last_name, mobile_number, reservation_date, reservation_time, people } = req.body.data;
  const data = await knex('reservations').where('reservation_id', reservation_Id)
    .update({ //left is table property, right is value from request body 
      first_name, first_name,
      last_name, last_name,
      mobile_number, mobile_number,
      reservation_date, reservation_date,
      reservation_time, reservation_time, 
      people, people
    }).returning('*').then(reservations => reservations[0]);
  res.status(200).json({ data });
}

async function updateStatus(req, res){
  //update status to cancelled (reservations/:reservation_id/status)
  const { reservation_Id } = req.params;
  const { status } = req.body.data;
  const data = await knex('reservations').where('reservation_id', reservation_Id)
    .update('status', status)
    .returning('*')
    .then(reservations => reservations[0]);
  res.status(200).json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    bodyHasResultProperty, 
    validateReservation, 
    validateDate, 
    validateNoTuesdayReservation,
    validateTime,
    checkStatusForPost,
    asyncErrorBoundary(create)
  ],
  read: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(read)], 
  update: [
    asyncErrorBoundary(reservationExists), 
    validateReservation,
    asyncErrorBoundary(update)
  ],
  updateStatus: [
    asyncErrorBoundary(reservationExists),
    checkStatusForPut,
    checkStatusFromLocals,
    asyncErrorBoundary(updateStatus)]
};
