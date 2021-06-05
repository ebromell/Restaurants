import React, { useState } from "react";
import NewRes from "../dashboard/Reservations/NewRes";
import SeatReservation from "../dashboard/Reservations/SeatReservation";
import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import useQuery from "../utils/useQuery";
import NewTable from "../dashboard/tables/NewTable";
import Search from "../dashboard/Reservations/Search";
import EditReservation from "../dashboard/Reservations/EditReservation";
/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */

function Routes() {
  // useQuery is a custom hook that makes use of the useLocation and the URL class to parse the query parameters.
  const query = useQuery();
  const date = query.get("date") ? query.get("date") : today();
  const [reRender, setReRender] = useState(true);

  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact path="/tables/new">
        <NewTable date={date} reRender={reRender} setReRender={setReRender} />
      </Route>
      <Route exact path="/reservations/:reservation_id/edit">
        <EditReservation reRender={reRender} setReRender={setReRender} />
      </Route>
      <Route exact path="/reservations/:reservation_id/seat">
        <SeatReservation />
      </Route>
      <Route exact={true} path="/reservations/new">
        <NewRes />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route path="/search">
        <Search reRender={reRender} setReRender={setReRender} />
      </Route>
      <Route path="/dashboard">
        <Dashboard date={date} reRender={reRender} setReRender={setReRender} />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
