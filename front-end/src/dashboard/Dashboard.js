import React, { useEffect, useState } from "react";
import { listReservations, listTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { previous, today, next } from "../utils/date-time";
import { useHistory } from "react-router-dom";
import ResRow from "./Reservations/ResRow";
import TableRow from "../dashboard/tables/TableRow";
import useQuery from "../utils/useQuery";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tableError, setTableError] = useState(null);
  const query = useQuery();
  const theDate = query.get("date");
  const history = useHistory();
  const [reRender, setReRender] = useState(true);

  useEffect(loadDashboard, [date, history, theDate, reRender]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    setTableError(null);
    listReservations({ date }, abortController.signal).then(setReservations).catch(setReservationsError);

    listTables(abortController.signal).then(setTables).catch(setTableError);
    return () => abortController.abort();
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <button
        type="button"
        onClick={() => history.push(`/dashboard?date=${previous(date)}`)}
      >
        Previous
        </button>
      <button
        type="button"
        onClick={() => history.push(`/dashboard?date=${today()}`)}
      >
        Today
        </button>
      <button
        type="button"
        onClick={() => history.push(`/dashboard?date=${next(date)}`)}
      >
        Next
        </button>

      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for {date} </h4>
        </div>
        <ResRow reservations={reservations} reRender={reRender} setReRender={setReRender} />
        <ErrorAlert error={reservationsError} />
        <TableRow tables={tables} reRender={reRender} setReRender={setReRender} />
        <ErrorAlert error={tableError} />
    </main>
  );
}

export default Dashboard;