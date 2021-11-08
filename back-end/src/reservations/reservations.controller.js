/**
 * List handler for reservation resources
 */
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

//validation middleware
function bodyHasResultProperty(req, res, next) {
  const result = { data: req.body};
  console.log(result);
  if (result) { //if body exists - move to validate body
    return next();
  }
  next({
    status: 400,
    message: "A 'result' property is required.",
  });
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
