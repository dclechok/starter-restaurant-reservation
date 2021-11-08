const knex = require('../db/connection');

function list(queryDate){
    return knex
      .from('reservations')
      .select('*')
      .where('reservation_date', 'queryDate');
}

module.exports = {
    list,
};