/**
 * Express API error handler.
 */
function errorHandler(error, request, response, next) {
  const { status = 500, message = "Something went wrong!" } = error;
  response.status(status).json({ error: message });
  console.log(message);
}

module.exports = errorHandler;
