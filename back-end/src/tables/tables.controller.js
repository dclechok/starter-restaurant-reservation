const asyncErrorBoundary = require('../errors/asyncErrorBoundary');
const knex = require('../db/connection');
const { whereNotExists } = require('../db/connection');

/* BEGIN VALIDATION MIDDLEWARE */
function bodyHasResultProperty(req, res, next) {
  const { data } = req.body; 
  if (data) return next();
  next({ status: 400, message: "A 'result' property is required." });
}

function validateTableData(req, res, next){
  const { table_name, capacity } = req.body.data;
  if(!table_name || table_name.length < 2) return next({
    status: 400, message: 'Table must have valid table_name.'
  });
  if(!capacity || typeof capacity != 'number') return next({
    status: 400, message: 'Table must have a valid capacity.'
  });
  next(); //move to next middleware
}

function reservationExists(req, res, next){
  //check to see if reservation exists
  const { reservation_id } = req.body.data;
  if(!reservation_id) return next({ status: 400, message: 'Reservation with this reservation_id does not exist.'});
  next();
}

async function reservationInReservations(req, res, next){
  //does reservation exist in tables' table?
  const { reservation_id } = req.body.data;
  const reservation = await knex.from('reservations').where('reservation_id', reservation_id).then(res => res[0]);
  res.locals.reservation = reservation;
  if(!reservation) return next({ status: 404, message: `Reservation with the ID of ${reservation_id} does not exist.`}); //the reservation with id doees not exist
  next();
}

async function capacityCheck(req, res, next){
  //check to see if table has sufficient capacity
  const { table_id } = req.params; // the id of the table to check capacity
  const { people } = res.locals.reservation; //this will have the amount of people per the reservation
  const { capacity, reservation_id } = await knex.from('tables').where('table_id', table_id).then(table => table[0]); //fetch specific table's capacity
  // compare number of people vs number of capacity - if people are below the total capacity, then proceed to allow update, otherwise table is occupied
  if(reservation_id) return next({ status: 400, message: "Table is occupied."});
  if(capacity && (Number(people) <= Number(capacity))) next();
  else return next({ status: 400, message: 'Table does not have enough capacity.'});
}

async function tableOccupied(req, res, next){
  const { table_id } = req.params;
  const { reservation_id } = await knex.from('tables').where('table_id', table_id).then(table => table[0]); //fetch specific table's capacity
  const query = await knex('reservations').where('reservation_id', reservation_id).select('status').then(res => res[0]);
  res.locals.theResId = reservation_id;
  if(query && query.status == 'seated') return next();
  else return next({ status: 400, message: "Table is not occupied."});
}

async function checkAlreadySeated(req, res, next){
  const { reservation_id } = req.body.data;
  const data = await knex('reservations')
  .where('reservation_id', reservation_id)
  .returning('*').then(records => records[0]);
  if(data.status === 'seated') return next({ status: 400, message: 'Table status is already seated or occupied.' });
  next(); 
}

async function tableExists(req, res, next){
  const { table_id } = req.params;
  const query = await knex('tables').select('*').where('table_id', table_id); //make a query to see if table exists
  if(query.length === 0) return next({ status: 404, message: `Table ${table_id} is non-existant.`}); //table id exist in Tables?
  next();
}

/* END VALIDATION MIDDLEWARE */

async function create(req, res){
  const result = req.body.data;
  await knex('tables').insert(result); //insert body data into reservations
  res.status(201).json({ data: result });
}

async function list(req, res){
  //list all tables
  const data = await knex.from('tables').select('*').orderBy('table_name');
  res.json({ data });
}

async function update(req, res){
  //update reservation status to seated if passes all validations
  const { reservation_id } = req.body.data;
  const { table_id } = req.params;
  const data = await knex('reservations')
  .where('reservations.reservation_id', '=', reservation_id)
  .update('status', 'seated')
  .returning('*')
  .then(records => records[0]);
  await knex('tables').where('table_id', table_id).update('reservation_id', reservation_id); //also up reservation_id in tables
  res.status(200).json({ data });
}

async function deleteTable(req, res, next){
  //set status of reservations to finished
  const reservation_id = res.locals.theResId;
  const data = await knex('reservations')
    .where('reservations.reservation_id', reservation_id)
    .update('status', 'finished')
    .returning('*')
    .then(records => records[0]);
  res.status(200).json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),  
  create: [
    bodyHasResultProperty,
    validateTableData,
    asyncErrorBoundary(create),
  ],
  update: [
    bodyHasResultProperty,
    reservationExists,
    reservationInReservations,
    checkAlreadySeated,
    asyncErrorBoundary(capacityCheck),
    asyncErrorBoundary(update)
  ],
  delete: [
    tableExists, 
    tableOccupied,
    asyncErrorBoundary(deleteTable)
  ]
};