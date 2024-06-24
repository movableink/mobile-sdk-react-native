import * as React from 'react';
import { StyleSheet, View, Text, Linking, Button } from 'react-native';
import RNMovableInk from '@movable/react-native-sdk';

export default function App() {
  const [link, setLink] = React.useState<string | undefined>();

  React.useEffect(() => {
    // If using Deferred Deep Linking, make sure to enable the app install event
    RNMovableInk.setAppInstallEventEnabled(true);

    // Make sure to call RNMovableInk.start when your app starts
    RNMovableInk.start();
    RNMovableInk.setMIU("00000000-00000000-00000000-00000000");

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
        title="Test Custom Event"
        onPress={(_event) => {
          RNMovableInk.logEvent('test_event', { });
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
