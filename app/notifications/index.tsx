import { Text, View } from "../../components/Themed";
import React from "react";
import * as Notifications from "expo-notifications";
import { Button } from "react-native";
import { Link } from "expo-router";

const NotificationHomeScreen = () => {
  return (
    <View>
      <Text>NotificationHomeScreen</Text>
      <Button
        title="Press to schedule a notification"
        onPress={async () => {
          await schedulePushNotification();
        }}
      />

      {/* got to newsfeed */}
      {/* <Link href="/newsfeed">Go to newsfeed</Link> */}
    </View>
  );
};
async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: "Here is the notification body",
      data: { data: "goes here", url: "/newsfeed" },
    },
    trigger: { seconds: 2 },
  });
}
export default NotificationHomeScreen;
