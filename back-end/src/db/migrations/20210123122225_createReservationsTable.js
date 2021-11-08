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
  