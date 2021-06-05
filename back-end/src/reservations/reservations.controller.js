//list
const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");


async function list(req, res) {
  if (req.query.mobile_number) {
    res.json({ data: await service.listByNumber(req.query.mobile_number) });
  } else {
    res.json({ data: await service.listByDate(req.query.date) });
  }
}

async function create(req, res, next) {
  const response = await service.create(req.body.data);
  res.status(201).json({ data: response });
}

async function isValid(req, res, next) {
  if (!req.body.data) {
    return next({ status: 400, message: "no data body" });
  }
  const requiredFields = [
    "first_name",
    "last_name",
    "mobile_number",
    "reservation_date",
    "reservation_time",
    "people",
  ];

  for (let field of requiredFields) {
    if (!req.body.data.hasOwnProperty(field) || req.body.data[field] === "") {
      return next({ status: 400, message: `WRONG prop: ${field}` });
    }
  }

  if (
    Number.isNaN(
      Date.parse(
        `${req.body.data.reservation_date} ${req.body.data.reservation_time}`
      )
    )
  ) {
    return next({
      status: 400,
      message: "reservation_date or reservation_time are not the correct value",
    });
  }
  const reservationUTC = new Date(
    `${req.body.data.reservation_date}T${req.body.data.reservation_time}:00`
  );

  if (reservationUTC.getTime() < new Date().getTime()) {
    return next({ status: 400, message: "place reservation in the future" });
  }
  if (reservationUTC.getDay() === 2) {
    return next({ status: 400, message: "closed on tuesdays" });
  }

  if (typeof req.body.data.people !== "number") {
    return next({ status: 400, message: "people ARE NOT NUMBERS" });
  }

  if (req.body.data.people === 0) {
    return next({ status: 400, message: "people ARE NUMBERS" });
  }

  res.locals.reservation = req.body.data;
  next();
}

async function closedTimes(req, res, next) {
  const a = req.body.data.reservation_time;
  if (a.localeCompare("10:30") === -1 || a.localeCompare("21:30") === 1) {
    return next({ status: 400, message: "Closed" });
  }
  next();
}


async function isNewSeat(req, res, next) {
  reservation = res.locals.reservation;
  if (reservation.status === "seated") {
    return next({
      status: 400,
      message: `Currently seated ${reservation.status}`,
    });
  }
  if (reservation.status === "finished") {
    return next({ status: 400, message: "Table is finished" });
  }
  next();
}

async function read(req, res, next) {
  res.json({ data: res.locals.reservation });
}

async function update(req, res, next) {
  res.json({
    data: await service.updateReservation(
      res.locals.reservation.reservation_id,
      res.locals.reservation
    ),
  });
}

async function updateRes(req, res) {
  const { reservation_id } = req.params;
  const status = req.body.data;
  const data = await service.updateReservation(reservation_id, status);

  res.status(200).json({ data: { status: data.status } });
}

async function hasID(req, res, next) {
  const { reservation_id: id } = req.params;
  const reservation = await service.read(id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  } else {
    return next({ status: 404, message: `Reservation ID: ${id} is missing.` });
  }
}

async function isValidReservation(req, res, next) {
  const reservation_id = req.params.reservation_id;
  const reservation = req.body.data;
  const currentRes = res.locals.reservation;
  if (currentRes.status === "finished") {
    return next({
      status: 400,
      message: "a finished reservation cannot be updated",
    });
  }
  if (
    !(
      reservation.status === "booked" ||
      reservation.status === "seated" ||
      reservation.status === "finished" ||
      reservation.status === "cancelled"
    )
  ) {
    return next({
      status: 400,
      message: `status ${reservation.status} is invalid`,
    });
  }
  res.locals.reservation_id = reservation_id;
  res.locals.reservation = reservation;
  next();
}



module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    asyncErrorBoundary(isValid),
    asyncErrorBoundary(isNewSeat),
    asyncErrorBoundary(closedTimes),
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(hasID), asyncErrorBoundary(read)],
  update: [
    asyncErrorBoundary(hasID),
    asyncErrorBoundary(isValid),
    asyncErrorBoundary(isNewSeat),
    asyncErrorBoundary(closedTimes),
    asyncErrorBoundary(update),
  ],
  updateRes: [
    asyncErrorBoundary(hasID),
    asyncErrorBoundary(isValidReservation),
    asyncErrorBoundary(updateRes),
  ],
  // updateReservations: [asyncErrorBoundary(updateRes), asyncErrorBoundary(update)]
};
