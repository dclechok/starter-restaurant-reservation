/**
 * List handler for reservation resources
 */
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

//validation middleware
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

function validateRes(req, res, next){
  const { first_name, last_name, mobile_number, reservation_date, reservation_time, people } = req.body.data;
  if(
    first_name &&
    last_name &&
    mobile_number &&
    reservation_date &&
    reservation_time &&
    people
  )
}

async function list(req, res) {
  res.json({
    data: [],
  });
}

async function create(req, res, next){
  // const id = next.Id();
  res.send('hello');
}

module.exports = {
  list,
  create: [bodyHasResultProperty, asyncErrorBoundary(create)],
};
