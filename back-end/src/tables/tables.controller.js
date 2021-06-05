const service = require("./tables.service");
const resService = require("../reservations/reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function list(req, res) {
  const response = await service.list();
  res.json({ data: response });
}
async function read(req, res, next) {
  res.json({ data: res.locals.table });
}
async function create(req, res, next) {
  const response = await service.create(req.body.data);
  res.status(201).json({ data: response });
}

async function update(req, res, next) {
  const updatedTable = { ...res.locals.table, ...req.body.data };
  const response = await service.update(updatedTable);
  res.status(200).json({ data: response });
}

async function destroy(req, res, next) {
  const resID = res.locals.table.reservation_id;
  await service.destroy(res.locals.table.table_id, resID);
  res.sendStatus(200);
}

async function tableExists(req, res, next) {
  const { table_id } = req.params;
  const table = await service.read(table_id);
  if (!table) {
    return next({
      status: 404,
      message: `table_id: ${table_id} does not exist`,
    });
  }
  res.locals.table = table;
  next();
}

async function isValid(req, res, next) {
  const response = req.body.data;
  if (!response) {
    return next({ status: 400, message: "'body' is required" });
  }
  next();
}

async function isValidReservation(req, res, next) {
  const response = req.body.data.reservation_id;
  if (!response) {
    return next({ status: 400, message: "reservation_id is missing" });
  }
  //
  const reservation = await resService.read(response);
  if (!reservation) {
    return next({
      status: 404,
      message: `reservation_id: ${response} does not exist`,
    });
  }
  if (reservation.status === "seated") {
    return next({ status: 400, message: "reservation is already seated" });
  }
  res.locals.reservation = reservation;
  next();
}

async function validSeats(req, res, next) {
  const { people } = res.locals.reservation;
  const { table_id } = req.params;
  const table = await service.read(table_id);
  if (table.capacity < people) {
    next({ status: 400, message: "reached maximum capacity" });
  }

  res.locals.table = table;
  next();
}
async function isBooked(req, res, next) {
  const { reservation_id } = res.locals.table;
  if (reservation_id) {
    next({ status: 400, message: "table is occupied" });
  }
  next();
}

async function broke(req, res, next) {
  const { reservation_id } = res.locals.table;
  if (!reservation_id) {
    next({ status: 400, message: "table is not occupied" });
  }
  next();
}

async function isValidTable(req, res, next) {
  const response = req.body.data;
  if (!response.table_name) {
    return next({ status: 400, message: "'table_name' is missing" });
  } else {
    if (response.table_name === "") {
      return next({ status: 400, message: "'table_name' cannot be empty" });
    }
    if (response.table_name.length < 2) {
      return next({
        status: 400,
        message: "'table_name' must be at least 2 characters",
      });
    }
    if (!response.capacity) {
      return next({ status: 400, message: "'capacity' is missing" });
    }
    if (response.capacity === "") {
      return next({ status: 400, message: "'capacity' cannot be empty" });
    }
    if (typeof response.capacity !== "number") {
      return next({ status: 400, message: "'capacity' must be a number" });
    }
    if (response.capacity === 0) {
      return next({ status: 400, message: "'capacity' must be at least 1" });
    }
  }
  next();
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    asyncErrorBoundary(isValid),
    asyncErrorBoundary(isValidTable),
    asyncErrorBoundary(create),
  ],
  update: [
    asyncErrorBoundary(isValid),
    asyncErrorBoundary(isValidReservation),
    asyncErrorBoundary(validSeats),
    asyncErrorBoundary(isBooked),
    asyncErrorBoundary(update),
  ],
  destroy: [
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(broke),
    asyncErrorBoundary(destroy),
  ],
};
