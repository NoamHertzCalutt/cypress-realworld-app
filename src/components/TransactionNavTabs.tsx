import React from "react";
import { Tabs, Tab } from "@material-ui/core";
import { Link, useRouteMatch } from "react-router-dom";

export default function TransactionNavTabs() {
  const match = useRouteMatch();

  // Route Lookup for tabs
  const navUrls: any = {
    "/": 0,
    "/public": 2,
    "/contacts": 1,
    "/personal": 0,
  };

  // Set selected tab based on url
  const [value, setValue] = React.useState(navUrls[match.url]);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Tabs
      value={value}
      onChange={handleChange}
      indicatorColor="secondary"
      centered
      data-test="nav-transaction-tabs"
    >
      {/* <Tab label="Everyone" component={Link} to="/" data-test="nav-public-tab" /> */}
      <Tab label="Mine" component={Link} to="/personal" data-test="nav-personal-tab" />
      <Tab label="Friends" component={Link} to="/contacts" data-test="nav-contacts-tab" />
    </Tabs>
  );
}
