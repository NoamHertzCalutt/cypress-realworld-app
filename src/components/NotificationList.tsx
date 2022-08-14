import React from "react";
import { List } from "@material-ui/core";

import NotificationListItem from "./NotificationListItem";
import { NotificationResponseItem } from "../models";
import EmptyList from "./EmptyList";
import RemindersIllustration from "./SvgUndrawReminders697P";

export interface NotificationsListProps {
  notifications: NotificationResponseItem[];
  updateNotification: Function;
  authService: Interpreter<AuthMachineContext, AuthMachineSchema, AuthMachineEvents, any, any>;
}

const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
  updateNotification,
  authService,
}) => {
  return (
    <>
      {notifications?.length > 0 ? (
        <List data-test="notifications-list">
          {notifications.map((notification: NotificationResponseItem) => (
            <NotificationListItem
              key={notification.id}
              notification={notification}
              updateNotification={updateNotification}
              authService={authService}
            />
          ))}
        </List>
      ) : (
        <EmptyList entity="Notifications">
          <RemindersIllustration style={{ height: 200, width: 250, marginBottom: 30 }} />
        </EmptyList>
      )}
    </>
  );
};

export default NotificationsList;
