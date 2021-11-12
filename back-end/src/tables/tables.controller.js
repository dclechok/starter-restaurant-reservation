const asyncErrorBoundary = require('../errors/asyncErrorBoundary');
const knex = require('../db/connection');

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

async function create(req, res){
  const result = req.body.data;
  await knex('tables').insert(result); //insert body data into reservations
  res.status(201).json({ data: result });
}

async function list(req, res){
  const data = await knex.from('tables').select('*').orderBy('table_name');
  console.log(data);
  res.json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),  
  create: [
    bodyHasResultProperty,
    validateTableData,
    asyncErrorBoundary(create),
  ]
};