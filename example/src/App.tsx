import * as React from 'react';
import { StyleSheet, View, Text, Linking, Button } from 'react-native';
import RNMovableInk, { Currency } from '@movable/react-native-sdk';
import { Notifications, type Registered } from 'react-native-notifications';

export default function App() {
  const [link, setLink] = React.useState<string | undefined>();

  React.useEffect(() => {
    // If using Deferred Deep Linking, make sure to enable the app install event
    RNMovableInk.setAppInstallEventEnabled(true);

    // Make sure to call RNMovableInk.start when your app starts
    RNMovableInk.start();
    RNMovableInk.setMIU('00000000-00000000-00000000-00000000');

    // Register for remote notifications
    Notifications.registerRemoteNotifications();

    // Handle device token updates
    const registerForNotificationsSubscription =
      Notifications.events().registerRemoteNotificationsRegistered(
        (event: Registered) => {
          console.log(event.deviceToken);
        }
      );

    // Handle notifications received in foreground
    const foregroundSubscription =
      Notifications.events().registerNotificationReceivedForeground(
        (notification, completion) => {
          console.log(
            `Notification received in foreground: ${notification.title} : ${notification.body}`
          );
          completion({ alert: false, sound: false, badge: false });
        }
      );

    // Handle notification taps
    const openedSubscription =
      Notifications.events().registerNotificationOpened(
        (notification, completion) => {
          console.log('Notification opened:');
          console.log(JSON.stringify(notification.payload));

          RNMovableInk.handlePushNotificationOpenedWithContent(
            notification.payload
          );

          completion();
        }
      );

    // Get the deep link used to open the app
    const getInitialURL = async () => {
      const universalLink = await Linking.getInitialURL();

      try {
        // If there was a link, ask RNMovableInk to resolve it.
        // If it's not a MovableInk Link, resolveURL will return null.
        // If MovableInk can handle the link, and resolution fails, it will reject.
        if (universalLink) {
          await resolveURL(universalLink);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getInitialURL();

    const urlListener = Linking.addEventListener(
      'url',
      (event: { url: string }) => {
        (async () => {
          await resolveURL(event.url);
        })();
      }
    );

    return () => {
      urlListener.remove();
      registerForNotificationsSubscription.remove();
      foregroundSubscription?.remove();
      openedSubscription?.remove();
    };
  }, []);

  const resolveURL = async (url: string) => {
    const clickthroughLink = await RNMovableInk.resolveURL(url);

    if (clickthroughLink) {
      setLink(clickthroughLink);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Resolved Link: {link}</Text>

      <Button
        title="Test Product Searched"
        onPress={(_event) => {
          RNMovableInk.productSearched({ query: 'Test Event' });
        }}
      />

      <Button
        title="Test Product Added"
        onPress={(_event) => {
          RNMovableInk.productAdded({
            id: '123',
            title: 'Test Product',
            price: 10.0,
            currency: Currency.XTS,
            meta: {
              test_key: 'test_value',
              test_key_two: true,
              test_key_three: 12345,
            },
          });
        }}
      />

      <Button
        title="Test Order Completed"
        onPress={(_event) => {
          RNMovableInk.orderCompleted({
            id: '123',
            revenue: '10.00',
            currency: Currency.XTS,
            products: [
              {
                id: '123',
                title: 'Test Product',
                price: '10.00',
              },
            ],
          });
        }}
      />

      <Button
        title="Test Custom Event"
        onPress={(_event) => {
          RNMovableInk.logEvent('test_event', {});
        }}
      />

      <Button
        title="Test Resolve URL"
        onPress={async (_event) => {
          resolveURL(
            'https://mi-mobile-sandbox.mimobile.xyz/p/cpm/a9a81cd32d8c68bc/c?url=https%3A%2F%2Fmi-mobile-sandbox.mimobile.xyz%2Fp%2Frpm%2Fc2caa7d789cb290d%2Furl&url_sig=50fU6twNJuB6EO'
          );
        }}
      />

      <Button
        title="Show In App Message"
        onPress={(_event) => {
          RNMovableInk.showInAppMessage(
            'https://www.movable-ink-7158.com/p/rp/bc49c08945403625.html',
            (buttonID) => {
              console.log(buttonID);
            }
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
