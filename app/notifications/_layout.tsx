import { Platform } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { Slot, router } from "expo-router";
import { Text, View } from "../../components/Themed";

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
const AppWithNotificationLayout = () => {
  const [expoPushToken, setExpoPushToken] = useState<string>();
  const [notification, setNotification] =
    useState<Notifications.Notification>();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // fetch expoPushToken
    let isMounted = true;

    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response, "response");
      });

    // Notifications.getLastNotificationResponseAsync().then((response) => {
    //   if (!isMounted || !response?.notification) {
    //     return;
    //   }
    //   redirect(response?.notification);
    // });
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }

      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }

      // isMounted = false;
    };
  }, []);

  console.log(expoPushToken, "expoPushToken for ", Platform.OS);
  function redirect(notification: Notifications.Notification) {
    const url = notification.request.content.data?.url;
    if (url) {
      router.push(url);
    }
  }

  console.log(notification, expoPushToken, "notification");
  return (
    <>
      <Slot />
      {notification && (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <Text>Your expo push token: {expoPushToken}</Text>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Text>
              Title: {notification && notification.request.content.title}{" "}
            </Text>
            <Text>
              Body: {notification && notification.request.content.body}
            </Text>
            <Text>
              Data:{" "}
              {notification &&
                JSON.stringify(notification.request.content.data)}
            </Text>
          </View>
        </View>
      )}
    </>
  );
};

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    if (!Constants?.expoConfig?.extra?.eas?.projectId) {
      alert("Must set your projectId in app.json");
      return;
    }
    token = (
      await Notifications.getExpoPushTokenAsync({
        // projectId: "00ff1fa3-1481-4692-b9bd-983caa980c55",
        projectId: Constants.expoConfig.extra.eas.projectId,
      })
    ).data;
    console.log(token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}
export default AppWithNotificationLayout;
