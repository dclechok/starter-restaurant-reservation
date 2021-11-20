exports.up = function (knex) {
    return knex.schema.createTable("tables", (table) => {
      table.increments("table_id").primary();
      table.integer('reservation_id').unsigned(); //not negative
      table.foreign('reservation_id')
        .references('reservation_id')
        .inTable('reservations')
        .onDelete('cascade');
      table.string('table_name');
      table.integer('capacity');
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable("tables");
  };
  