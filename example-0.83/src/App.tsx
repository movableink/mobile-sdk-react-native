import * as React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Linking,
  Button,
  useColorScheme,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Pressable,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import RNMovableInk, { Currency } from '@movable/react-native-sdk';
import { Notifications, type Registered } from 'react-native-notifications';

export default function App() {
  const [link, setLink] = React.useState<string | undefined>();
  const [token, setToken] = React.useState<string | undefined>();
  const [isResolving, setIsResolving] = React.useState(false);
  const colorScheme = useColorScheme();

  React.useEffect(() => {
    // If using Deferred Deep Linking, make sure to enable the app install event
    RNMovableInk.setAppInstallEventEnabled(true);

    // Make sure to call RNMovableInk.start when your app starts
    RNMovableInk.start();
    RNMovableInk.setMIU('00000000-00000000-00000000-00000000');

    // Request notification permission on Android 13+
    const requestNotificationPermission = async () => {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Notification permission denied');
          return;
        }
      }

      // Register for remote notifications
      Notifications.registerRemoteNotifications();
    };

    requestNotificationPermission();

    // Handle device token updates
    const registerForNotificationsSubscription =
      Notifications.events().registerRemoteNotificationsRegistered(
        (event: Registered) => {
          console.log(event.deviceToken);
          setToken(event.deviceToken);
        },
      );

    // Handle notifications received in foreground
    const foregroundSubscription =
      Notifications.events().registerNotificationReceivedForeground(
        (_notification, completion) => {
          completion({ alert: true, sound: true, badge: false });
        },
      );

    // Handle notification taps
    const openedSubscription =
      Notifications.events().registerNotificationOpened(
        (notification, completion) => {
          console.log('Notification opened:');
          console.log(JSON.stringify(notification.payload));

          RNMovableInk.handlePushNotificationOpenedWithContent(
            notification.payload,
          );

          completion();
        },
      );

    Notifications.getInitialNotification()
      .then(notification => {
        if (notification) {
          console.log('App opened from notification:');
          console.log(`${JSON.stringify(notification, null, 2)}`);

          // Handle the notification with MovableInk
          RNMovableInk.handlePushNotificationOpenedWithContent(
            notification.payload,
          );
        }
      })
      .catch(err => console.error('getInitialNotification() failed', err));

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
      },
    );

    return () => {
      urlListener.remove();
      registerForNotificationsSubscription.remove();
      foregroundSubscription?.remove();
      openedSubscription?.remove();
    };
  }, []);

  const resolveURL = async (url: string) => {
    setIsResolving(true);
    try {
      const clickthroughLink = await RNMovableInk.resolveURL(url);
      if (clickthroughLink) {
        setLink(clickthroughLink);
      }
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={colorScheme === 'dark' ? styles.textDark : styles.textLight}>
        Resolved Link: {link}
      </Text>
      <Pressable
        onPress={() => {
          if (token) {
            Clipboard.setString(token);
          }
        }}
      >
        <Text
          style={colorScheme === 'dark' ? styles.textDark : styles.textLight}
        >
          Device Token: {'\n'}
          {token}
        </Text>
      </Pressable>

      <Button
        title="Test Product Searched"
        onPress={_event => {
          RNMovableInk.productSearched({ query: 'Test Event' });
        }}
      />

      <Button
        title="Test Product Added"
        onPress={_event => {
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
        onPress={_event => {
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
        onPress={_event => {
          RNMovableInk.logEvent('test_event', {});
        }}
      />

      {isResolving ? (
        <ActivityIndicator
          size="large"
          color={colorScheme === 'dark' ? '#fff' : '#000'}
        />
      ) : (
        <Button
          title="Test Resolve URL"
          onPress={async _event => {
            resolveURL(
              'https://mi-mobile-sandbox.mimobile.xyz/p/cpm/a9a81cd32d8c68bc/c?url=https%3A%2F%2Fmi-mobile-sandbox.mimobile.xyz%2Fp%2Frpm%2Fc2caa7d789cb290d%2Furl&url_sig=50fU6twNJuB6EO',
            );
          }}
        />
      )}

      <Button
        title="Show In App Message"
        onPress={_event => {
          RNMovableInk.showInAppMessage(
            'https://inapp.mi-content.com/p/rp/10fa2e345508890e.html',
            (buttonID: string) => {
              console.log(buttonID);
            },
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
    gap: 16,
    padding: 20,
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  textLight: {
    color: '#000',
  },
  textDark: {
    color: '#fff',
  },
});
