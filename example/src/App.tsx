import * as React from 'react';

import { StyleSheet, View, Text, Linking, Button } from 'react-native';
import RNMovableInk from 'react-native-movable-ink';

export default function App() {
  const [link, setLink] = React.useState<string | undefined>();

  React.useEffect(() => {
    // Make sure to call RNMovableInk.start when your app start
    RNMovableInk.start();

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
