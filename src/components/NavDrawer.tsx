import React, { useEffect, useState } from "react";
import { head } from "lodash/fp";
import { Interpreter } from "xstate";
import { useActor } from "@xstate/react";
import clsx from "clsx";
import {
  useMediaQuery,
  useTheme,
  makeStyles,
  Drawer,
  List,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Avatar,
  Typography,
  Button,
  Modal,
  Paper,
  Container,
} from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";
import {
  Home as HomeIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Notifications as NotificationsIcon,
  AccountBalance as AccountBalanceIcon,
} from "@material-ui/icons";

import { formatAmount } from "../utils/transactionUtils";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";
import Tailorr from "../tailorr-api";

const drawerWidth = 240;

export const mainListItems = (
  toggleDrawer: ((event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void) | undefined,
  showTemporaryDrawer: Boolean
) => (
  <div>
    <ListItem
      button
      // @ts-ignore
      onClick={() => showTemporaryDrawer && toggleDrawer()}
      component={RouterLink}
      to="/"
      data-test="sidenav-home"
    >
      <ListItemIcon>
        <HomeIcon />
      </ListItemIcon>
      <ListItemText primary="Home" />
    </ListItem>
    <ListItem
      button
      // @ts-ignore
      onClick={() => showTemporaryDrawer && toggleDrawer()}
      component={RouterLink}
      to="/user/settings"
      data-test="sidenav-user-settings"
    >
      <ListItemIcon>
        <PersonIcon />
      </ListItemIcon>
      <ListItemText primary="My Account" />
    </ListItem>
    <ListItem
      button
      // @ts-ignore
      onClick={() => showTemporaryDrawer && toggleDrawer()}
      component={RouterLink}
      to="/bankaccounts"
      data-test="sidenav-bankaccounts"
    >
      <ListItemIcon>
        <AccountBalanceIcon />
      </ListItemIcon>
      <ListItemText primary="Bank Accounts" />
    </ListItem>
    <ListItem
      button
      // @ts-ignore
      onClick={() => showTemporaryDrawer && toggleDrawer()}
      component={RouterLink}
      to="/notifications"
      data-test="sidenav-notifications"
    >
      <ListItemIcon>
        <NotificationsIcon />
      </ListItemIcon>
      <ListItemText primary="Notifications" />
    </ListItem>
  </div>
);

export const mainListItemsNoNotifications = (
  toggleDrawer: ((event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void) | undefined,
  showTemporaryDrawer: Boolean
) => (
  <div>
    <ListItem
      button
      // @ts-ignore
      onClick={() => showTemporaryDrawer && toggleDrawer()}
      component={RouterLink}
      to="/"
      data-test="sidenav-home"
    >
      <ListItemIcon>
        <HomeIcon />
      </ListItemIcon>
      <ListItemText primary="Home" />
    </ListItem>
    <ListItem
      button
      // @ts-ignore
      onClick={() => showTemporaryDrawer && toggleDrawer()}
      component={RouterLink}
      to="/user/settings"
      data-test="sidenav-user-settings"
    >
      <ListItemIcon>
        <PersonIcon />
      </ListItemIcon>
      <ListItemText primary="My Account" />
    </ListItem>
    <ListItem
      button
      // @ts-ignore
      onClick={() => showTemporaryDrawer && toggleDrawer()}
      component={RouterLink}
      to="/bankaccounts"
      data-test="sidenav-bankaccounts"
    >
      <ListItemIcon>
        <AccountBalanceIcon />
      </ListItemIcon>
      <ListItemText primary="Bank Accounts" />
    </ListItem>
  </div>
);

export const secondaryListItems = (signOutPending: Function) => (
  <div>
    <ListItem button onClick={() => signOutPending()} data-test="sidenav-signout">
      <ListItemIcon>
        <LogoutIcon />
      </ListItemIcon>
      <ListItemText primary="Logout" />
    </ListItem>
  </div>
);

const useStyles = makeStyles((theme) => ({
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    marginTop: 50,
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },
  userProfile: {
    padding: theme.spacing(2),
  },
  userProfileHidden: {
    display: "none",
  },
  avatar: {
    marginRight: theme.spacing(2),
  },
  accountBalance: {
    marginLeft: theme.spacing(2),
  },
  amount: {
    fontWeight: "bold",
  },
  accountBalanceHidden: {
    display: "none",
  },
  cypressLogo: {
    width: "40%",
  },
  upgradeButton: {
    marginTop: 30,
    marginLeft: 10,
  },
  paper: {
    paddingLeft: theme.spacing(1),
    top: "30%",
    transform: "translateY(50%)",
  },
  container: {
    minHeight: "77vh",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    [theme.breakpoints.up("sm")]: {
      paddingTop: theme.spacing(4),
      padding: theme.spacing(4),
    },
  },
  newTransactionButton: {
    fontSize: 16,
    backgroundColor: "#00C853",
    paddingTop: 5,
    paddingBottom: 5,
    paddingRight: 20,
    fontWeight: "bold",
    "&:hover": {
      backgroundColor: "#4CAF50",
      borderColor: "#00C853",
      boxShadow: "none",
    },
  },
}));

interface Props {
  closeMobileDrawer: () => void;
  toggleDrawer: () => void;
  drawerOpen: boolean;
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
}

const NavDrawer: React.FC<Props> = ({
  toggleDrawer,
  closeMobileDrawer,
  drawerOpen,
  authService,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const [authState, sendAuth] = useActor(authService);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const showTemporaryDrawer = useMediaQuery(theme.breakpoints.only("xs"));
  const [customerIsInFree, setCustomerIsInFree] = useState(false);
  const currentUser = authState?.context?.user;
  const signOut = () => sendAuth("LOGOUT");

  useEffect(() => {
    const tailorrCanUse = async () => {
      if (authState?.context?.user) {
        let canUse = await Tailorr.canUseFeature("notifications", authState.context.user.username);
        setCustomerIsInFree(!canUse);
      }
    };
    tailorrCanUse();
  }, [authState]);

  const handleUpgrade = () => {
    //show mock billing process
    if (authState?.context?.user) {
      Tailorr.subscribeCustomerToPackage(authState.context.user.username, "pro");
    }
    window.location.reload();
  };

  return (
    <>
      <Drawer
        data-test="sidenav"
        variant={showTemporaryDrawer ? "temporary" : "persistent"}
        classes={{
          paper: clsx(classes.drawerPaper, !drawerOpen && classes.drawerPaperClose),
        }}
        open={drawerOpen}
        ModalProps={{
          onBackdropClick: () => closeMobileDrawer(),
          closeAfterTransition: showTemporaryDrawer,
        }}
      >
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
          className={drawerOpen ? classes.userProfile : classes.userProfileHidden}
        >
          <Grid item>
            {currentUser && (
              <Avatar
                className={classes.avatar}
                alt={`${currentUser.firstName} ${currentUser.lastName}`}
                src={currentUser.avatar}
              />
            )}
          </Grid>
          <Grid item>
            {currentUser && (
              <>
                <Typography
                  variant="subtitle1"
                  color="textPrimary"
                  data-test="sidenav-user-full-name"
                >
                  {currentUser.firstName} {head(currentUser.lastName)}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="inherit"
                  gutterBottom
                  data-test="sidenav-username"
                >
                  @{currentUser.username}
                </Typography>
              </>
            )}
          </Grid>
          <Grid item style={{ width: "30%" }}></Grid>
        </Grid>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
          className={drawerOpen ? classes.userProfile : classes.userProfileHidden}
        >
          <Grid item>
            {currentUser && (
              <>
                <Typography
                  variant="h6"
                  color="textPrimary"
                  className={classes.amount}
                  data-test="sidenav-user-balance"
                >
                  {currentUser.balance ? formatAmount(currentUser.balance) : formatAmount(0)}
                </Typography>
                <Typography variant="subtitle2" color="inherit" gutterBottom>
                  Account Balance
                </Typography>
              </>
            )}
          </Grid>
          <Grid item>
            <Divider />
          </Grid>
          <Grid item>
            <List>
              {customerIsInFree
                ? mainListItemsNoNotifications(toggleDrawer, showTemporaryDrawer)
                : mainListItems(toggleDrawer, showTemporaryDrawer)}
            </List>
          </Grid>
          <Grid item>
            <Divider />
          </Grid>
          <Grid item>
            <List>{secondaryListItems(signOut)}</List>
          </Grid>
          {customerIsInFree ? (
            <Grid item>
              <List>
                <Typography
                  component="h2"
                  variant="h6"
                  color="primary"
                  style={{ fontWeight: 600, marginLeft: 50, marginTop: 30 }}
                  gutterBottom
                >
                  Free Plan
                </Typography>
                <Button
                  className={classes.upgradeButton}
                  variant="contained"
                  color="primary"
                  onClick={() => setUpgradeModal(true)}
                >
                  Upgrade to Pro
                </Button>
              </List>
            </Grid>
          ) : (
            <Grid item>
              <Typography
                component="h2"
                variant="h6"
                color="primary"
                style={{ fontWeight: 600, marginLeft: 50, marginTop: 30 }}
                gutterBottom
              >
                Pro Plan
              </Typography>
            </Grid>
          )}
        </Grid>
      </Drawer>
      <Modal open={upgradeModal} onClose={() => setUpgradeModal(false)}>
        <Container maxWidth="xs" className={classes.container}>
          <Paper className={classes.paper}>
            <Grid
              container
              direction="column"
              justify="center"
              alignItems="center"
              style={{
                paddingTop: 30,
                paddingBottom: 30,
              }}
              spacing={2}
            >
              <Typography
                component="h1"
                variant="h5"
                color="primary"
                style={{ fontWeight: 600 }}
                gutterBottom
              >
                Pro package
              </Typography>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                10$/month
              </Typography>
              <ListItemText primary="Friends transaction history" />
              <ListItemText primary="Get notifications" />
              <ListItemText primary="Comment and react" />
              <ListItemText primary="Add up to 2 bank accounts" />
              <Button
                className={classes.upgradeButton}
                variant="contained"
                color="primary"
                onClick={handleUpgrade}
              >
                Upgrade
              </Button>
            </Grid>
          </Paper>
        </Container>
      </Modal>
    </>
  );
};

export default NavDrawer;
