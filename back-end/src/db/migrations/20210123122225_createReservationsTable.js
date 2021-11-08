exports.up = function (knex) {
  return knex.schema.createTable("reservations", (table) => {
    table.increments("reservation_id").primary();
    table.timestamps(true, true);
    table.string('first_name');
    table.string('last_name');
    table.string('mobile_number');
    table.date('reservation_date');
    table.integer('people');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("reservations");
};

/*
    "first_name": "Rick",
    "last_name": "Sanchez",
    "mobile_number": "202-555-0164",
    "reservation_date": "2020-12-31",
    "reservation_time": "20:00:00",
    "people": 6,
    "created_at": "2020-12-10T08:30:32.326Z",
    "updated_at": "2020-12-10T08:30:32.326Z"
*/