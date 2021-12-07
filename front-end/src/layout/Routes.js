import React, { useState } from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import ReservationForm from "../components/ReservationForm";
import TablesForm from "../components/TablesForm";
import Search from "../components/Search";
import ReservationSeatForm from "../components/ReservationSeatForm";
import useQuery from "../utils/useQuery";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */

function Routes() {
  const query = useQuery();
  const dateQuery = query.get("date");
  const [useDate, setUseDate] = useState(dateQuery ? dateQuery : today); //raised state to pass between reservations/dashboard
  const [errors, setErrors] = useState("");
  const [toggleReload, setToggleReload] = useState(false); //toggle tables reload

  return (
    <Switch>
      <Route exact path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact path="/search">
        <Search />
      </Route>
      <Route exact path="/reservations/new">
        <ReservationForm setUseDate={setUseDate} setErrors={setErrors} />
      </Route>
      <Route exact path="/reservations/:reservation_id/seat">
        <ReservationSeatForm setUseDate={setUseDate} />
      </Route>
      <Route exact path="/tables/new">
        <TablesForm />
      </Route>
      <Route exact path="/reservations/:reservation_id/edit">
        <ReservationForm />
      </Route>
      <Route path="/dashboard">
        <Dashboard
          date={today()}
          useDate={useDate}
          setUseDate={setUseDate}
          errors={errors}
          setErrors={setErrors}
          setToggleReload={setToggleReload}
          toggleReload={toggleReload}
        />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
