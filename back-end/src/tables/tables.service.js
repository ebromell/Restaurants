const knex = require("../db/connection");
const resService = require("../reservations/reservations.service")
async function list() {
  return await knex("tables").select("*").orderBy("table_name", "asc");
}
async function create(table) {
  return await knex("tables")
    .insert(table, "*")
    .then((createdRecords) => createdRecords[0]);
}
async function read(table_id) {
  return await knex("tables").where({ table_id }).first();
}
async function update(updatedTable) {
  return await knex("tables")
    .where({ table_id: updatedTable.table_id })
    .update(updatedTable, "*")
    .then((createdRecords) => createdRecords[0]).then(resService.updatedStatus(updatedTable.reservation_id, "seated"));
}
async function destroy(table_id, resID) {
  return await knex("tables")
    .where({ table_id })
    .update("reservation_id", null).then(resService.updatedStatus(resID, "finished"));;
}

module.exports = {
  list,
  read,
  create,
  update,
  destroy,
};
