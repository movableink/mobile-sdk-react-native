import * as React from 'react';
import { StyleSheet, View, Text, Linking, TouchableOpacity } from 'react-native';
import RNMovableInk, { Currency } from '@movable/react-native-sdk';
import Settings from './settings';
import Braze from '@braze/react-native-sdk';


export default function App() {
  const [link, setLink] = React.useState<string | undefined>();
  const [showSettings, setShowSettings] = React.useState(false);

  React.useEffect(() => {
    // If using Deferred Deep Linking, make sure to enable the app install event
    RNMovableInk.setAppInstallEventEnabled(true);

    // Make sure to call RNMovableInk.start when your app starts
    RNMovableInk.start();
    RNMovableInk.setMIU('00000000-00000000-00000000-00000000');


   
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

  if (showSettings) {

    return <Settings onBack={() => setShowSettings(false)} />;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettings(true)}>
        <Text style={styles.settingsButtonText}>⚙️ Settings</Text>
      </TouchableOpacity>
      
      <View style={styles.spacer} />
      
      <Text style={styles.linkText}>Resolved Link: {link}</Text>

      <View style={styles.spacer} />

      <TouchableOpacity style={styles.testButton} onPress={(_event) => {
        RNMovableInk.productSearched({ query: 'Test Event' });
      }}>
        <Text style={styles.testButtonText}>Test Product Searched</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.testButton} onPress={(_event) => {
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
      }}>
        <Text style={styles.testButtonText}>Test Product Added</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.testButton} onPress={(_event) => {
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
      }}>
        <Text style={styles.testButtonText}>Test Order Completed</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.testButton} onPress={(_event) => {
        RNMovableInk.logEvent('test_event', {});
      }}>
        <Text style={styles.testButtonText}>Test Custom Event</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.testButton} onPress={(_event) => {
        RNMovableInk.showInAppMessage(
          'https://www.movable-ink-7158.com/p/rp/bc49c08945403625.html',
          (buttonID) => {
            console.log(buttonID);
          }
        );
      }}>
        <Text style={styles.testButtonText}>Show In App Message</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  linkText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  spacer: {
    height: 15,
  },
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});