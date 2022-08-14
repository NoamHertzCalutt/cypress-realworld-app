import React from "react";
import { useMachine } from "@xstate/react";
import { Switch, Route } from "react-router";
import { TransactionDateRangePayload, TransactionAmountRangePayload } from "../models";
import TransactionListFilters from "../components/TransactionListFilters";
import TransactionContactsList from "../components/TransactionContactsList";
import { transactionFiltersMachine } from "../machines/transactionFiltersMachine";
import { getDateQueryFields, getAmountQueryFields } from "../utils/transactionUtils";
import TransactionPersonalList from "../components/TransactionPersonalList";
import TransactionPublicList from "../components/TransactionPublicList";
import { authService } from "../machines/authMachine";
import { useActor } from "@xstate/react";
import Tailorr from "../tailorr-api";
import { useEffect, useState } from "react";
import { Typography } from "@material-ui/core";

const TransactionsContainer: React.FC = () => {
  const [currentFilters, sendFilterEvent] = useMachine(transactionFiltersMachine);
  const [authState] = useActor(authService);
  const [canUseFriendsTH, setCanUseFriendsTH] = useState(false);
  const hasDateRangeFilter = currentFilters.matches({ dateRange: "filter" });
  const hasAmountRangeFilter = currentFilters.matches({
    amountRange: "filter",
  });

  useEffect(() => {
    const tailorrCanUse = async () => {
      if (authState?.context?.user) {
        let canUse = await Tailorr.canUseFeature(
          "friends-transaction-history",
          authState.context.user.username
        );
        setCanUseFriendsTH(canUse);
        console.log("Can use friends-transaction-history?", canUse);
      }
    };
    tailorrCanUse();
  }, [authState]);

  const dateRangeFilters = hasDateRangeFilter && getDateQueryFields(currentFilters.context);
  const amountRangeFilters = hasAmountRangeFilter && getAmountQueryFields(currentFilters.context);

  const Filters = (
    <TransactionListFilters
      dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
      amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
      sendFilterEvent={sendFilterEvent}
    />
  );

  return (
    <Switch>
      <Route exact path="/contacts">
        {canUseFriendsTH ? (
          <TransactionContactsList
            filterComponent={Filters}
            dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
            amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
          />
        ) : (
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Friends transaction history is only available in Pro package
          </Typography>
        )}
      </Route>
      <Route exact path="/(personal)?">
        <TransactionPersonalList
          filterComponent={Filters}
          dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
          amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
        />
      </Route>
      <Route exact path="/public">
        <TransactionPublicList
          filterComponent={Filters}
          dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
          amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
        />
      </Route>
    </Switch>
  );
};

export default TransactionsContainer;
