import React, { useEffect, useState } from "react";
import { useActor } from "@xstate/react";
import {
  BaseActionObject,
  Interpreter,
  ResolveTypegenMeta,
  ServiceMap,
  TypegenDisabled,
} from "xstate";
import { Link as RouterLink, useRouteMatch } from "react-router-dom";
import { makeStyles, Grid, Button, Paper, Typography } from "@material-ui/core";

import { AuthMachineContext, AuthMachineEvents, AuthMachineSchema } from "../machines/authMachine";
import { DataContext, DataEvents, DataSchema } from "../machines/dataMachine";
import BankAccountForm from "../components/BankAccountForm";
import BankAccountList from "../components/BankAccountList";
import Tailorr from "../tailorr-api";

export interface Props {
  authService: Interpreter<AuthMachineContext, AuthMachineSchema, AuthMachineEvents, any, any>;
  bankAccountsService: Interpreter<
    DataContext,
    DataSchema,
    DataEvents,
    any,
    ResolveTypegenMeta<TypegenDisabled, DataEvents, BaseActionObject, ServiceMap>
  >;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
}));

const BankAccountsContainer: React.FC<Props> = ({ authService, bankAccountsService }) => {
  const match = useRouteMatch();
  const classes = useStyles();
  const [authState] = useActor(authService);
  const [bankAccountsState, sendBankAccounts] = useActor(bankAccountsService);
  const [reachedMaxBankAccounts, setReachedMaxBankAccounts] = useState(false);

  const currentUser = authState?.context.user;

  //Tailorr Demo
  useEffect(() => {
    const tailorrCanUse = async (featureId) => {
      if (authState?.context?.user && bankAccountsState?.context?.results) {
        let canUse = await Tailorr.canUseFeature(featureId, authState.context.user.username);
        setReachedMaxBankAccounts(!canUse);
      }
    };
    tailorrCanUse("bank-accounts");
  }, [authState, bankAccountsState]);

  const createBankAccount = (payload: any) => {
    // Tailorr.reportUse(payload.featureId, payload.customer, payload.num_accounts+1);
    sendBankAccounts({ type: "CREATE", ...payload });
  };

  const deleteBankAccount = (payload: any) => {
    // Tailorr.reportUse(payload.featureId, payload.customer, payload.num_accounts-1);
    sendBankAccounts({ type: "DELETE", ...payload });
  };
  //Tailorr Demo END

  useEffect(() => {
    sendBankAccounts("FETCH");
  }, [sendBankAccounts]);

  if (match.url === "/bankaccounts/new" && currentUser?.id) {
    return (
      <Paper className={classes.paper}>
        <Typography component="h2" variant="h6" color="primary" gutterBottom>
          Create Bank Account
        </Typography>
        <BankAccountForm userId={currentUser?.id} createBankAccount={createBankAccount} />
      </Paper>
    );
  }

  return (
    <Paper className={classes.paper}>
      <Grid container direction="row" justify="space-between" alignItems="center">
        <Grid item>
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Bank Accounts
          </Typography>
        </Grid>
        <Grid item>
          {/*Tailorr Demo*/}
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={RouterLink}
            to="/bankaccounts/new"
            data-test="bankaccount-new"
            disabled={reachedMaxBankAccounts}
          >
            Create
          </Button>
          {/*Tailorr Demo END*/}
        </Grid>
      </Grid>
      <BankAccountList
        bankAccounts={bankAccountsState?.context.results!}
        deleteBankAccount={deleteBankAccount}
      />
    </Paper>
  );
};
export default BankAccountsContainer;
