const asyncErrorBoundary = require('../errors/asyncErrorBoundary');
const knex = require('../db/connection');
const { whereNotExists } = require('../db/connection');

/* BEGIN VALIDATION MIDDLEWARE */
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
  const { reservation_id } = req.body.data;
  const { table_id } = req.params;
  const data = await knex('tables').where('table_id', table_id).update('reservation_id', reservation_id).returning('*').then(records => records[0]);
  res.status(200).json({ data });
}

async function deleteTable(req, res, next){
  const { table_id } = req.params;
  const query = await knex('tables').select('*').where('table_id', table_id); //make a query to see if table exists
  if(query.length === 0) return next({ status: 404, message: `Table ${table_id} is non-existant.`}); //table id exist in Tables?
  const { reservation_id } = query[0];
  if(!reservation_id) return next({ status: 400, message: `Table ${table_id} is not occupied.`}); //table is not occupied - no reservation id
  //delete seat aka remove reservation_id
  const data = await knex('tables').where('table_id', table_id).update('reservation_id', null).then(records => records[0]);
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
    asyncErrorBoundary(capacityCheck),
    asyncErrorBoundary(update)
  ],
  delete: asyncErrorBoundary(deleteTable),
};