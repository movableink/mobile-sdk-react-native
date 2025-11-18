import * as React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Alert,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNMovableInk from '@movable/react-native-sdk';
import MspManager, { type MspId } from './mspManager';

// Types
interface MspOption {
  id: MspId;
  name: string;
  description: string;
}

interface SettingsProps {
  onBack: () => void;
}

const MSP_OPTIONS: MspOption[] = [
  { id: 'braze', name: 'Braze', description: 'Test Braze push, In-app etc' },
  { id: 'moengage', name: 'MoEngage', description: 'Test push, In-app' },
  { id: 'airship', name: 'Airship', description: 'Test airship ??-fail' },
  { id: 'xtremepush', name: 'Xtremepush', description: 'Xtreme-Push' },
  { id: 'sfmc', name: 'SFMC', description: 'Salesforce Marketing Cloud ---pending' },
];

const MSP_STORAGE_KEY = '@movable_ink_msp';

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [userId, setUserId] = React.useState<string>('');
  const [selectedMsp, setSelectedMsp] = React.useState<MspId | null>(null); // Changed to null
  const [currentMsp, setCurrentMsp] = React.useState<MspId | null>(null); // Changed to null
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isSavingMsp, setIsSavingMsp] = React.useState<boolean>(false);
  const [isSavingMiu, setIsSavingMiu] = React.useState<boolean>(false);

  React.useEffect(() => {
    loadSavedMsp();
  }, []);

  const loadSavedMsp = async (): Promise<void> => {
    try {
      setIsLoading(true);
     
      const savedMsp = await AsyncStorage.getItem(MSP_STORAGE_KEY);
      
      const managerMsp = MspManager.getCurrentMsp();
      
      if (savedMsp !== null && isValidMspId(savedMsp)) {
        setCurrentMsp(savedMsp as MspId);
        setSelectedMsp(savedMsp as MspId); // Pre-select saved MSP
        console.log('Loaded saved MSP:', savedMsp);
        
        if (managerMsp !== savedMsp) {
         
          await MspManager.initialize();
        }
      }
    } catch (error) {
      console.error('Error loading saved MSP:', error);
      Alert.alert('Error', 'Failed to load saved MSP');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to validate MSP ID
  const isValidMspId = (mspId: string): mspId is MspId => {
    return ['braze', 'moengage', 'airship', 'xtremepush', 'sfmc'].includes(mspId);
  };

  const handleSaveUserId = async (): Promise<void> => {
    if (!userId.trim()) {
      Alert.alert('Error', 'Please enter a valid MIU');
      return;
    }

    try {
      setIsSavingMiu(true);
      
      RNMovableInk.setMIU(userId);
      
      if (currentMsp) {
        await MspManager.setUserIdForCurrentMsp(userId);
      }
      
      Alert.alert('Success', 'MIU saved ');
     
      setUserId('');
    } catch (error) {
      console.error('Error saving MIU:', error);
      Alert.alert('Error', 'Failed to save MIU');
    } finally {
      setIsSavingMiu(false);
    }
  };

  const handleMspSelect = (mspId: MspId): void => {
    setSelectedMsp(mspId);
  };

  const handleSaveMsp = async (): Promise<void> => {
    if (!selectedMsp) {
      Alert.alert('Error', 'Please select an MSP');
      return;
    }

    if (selectedMsp === currentMsp) {
      Alert.alert('Info', 'This MSP is already active');
      return;
    }

    try {
      setIsSavingMsp(true);
      
      if (currentMsp) {
        Alert.alert(
          'Switch MSP',
          `Are you sure you want to switch from ${MSP_OPTIONS.find(m => m.id === currentMsp)?.name} to ${MSP_OPTIONS.find(m => m.id === selectedMsp)?.name}?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setIsSavingMsp(false)
            },
            {
              text: 'Switch',
              onPress: async () => {
                await performMspSwitch();
              }
            }
          ]
        );
      } else {
        await performMspSwitch();
      }
    } catch (error) {
      console.error('Error in handleSaveMsp:', error);
      Alert.alert('Error', 'Failed to save MSP selection');
      setIsSavingMsp(false);
    }
  };

  const performMspSwitch = async (): Promise<void> => {
    try {
      if (selectedMsp) {
        await AsyncStorage.setItem(MSP_STORAGE_KEY, selectedMsp);
        
        await MspManager.switchMsp(selectedMsp);
        
        setCurrentMsp(selectedMsp);
        
        const mspName = MSP_OPTIONS.find(m => m.id === selectedMsp)?.name;
        Alert.alert(
          'Success', 
          `MSP switched to ${mspName}. The ${mspName} SDK has been initialized.`
        );
        
        console.log('MSP saved and initialized:', selectedMsp);
      }
    } catch (error) {
      console.error('Error switching MSP:', error);
      Alert.alert('Error', 'Failed to initialize MSP. Please try again.');
    } finally {
      setIsSavingMsp(false);
    }
  };

  const handleClearMsp = async (): Promise<void> => {
    Alert.alert(
      'Clear MSP',
      'Are you sure you want to clear the current MSP selection? This will disable all MSP features.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              
              // Clear from AsyncStorage
              await AsyncStorage.removeItem(MSP_STORAGE_KEY);
              
              // Clean up the current MSP through MspManager
              if (currentMsp) {
                await MspManager.cleanupMsp(currentMsp);
              }
              
              setCurrentMsp(null);
              setSelectedMsp(null);
              
              Alert.alert('Success', 'MSP selection cleared and SDK disabled');
            } catch (error) {
              console.error('Error clearing MSP:', error);
              Alert.alert('Error', 'Failed to clear MSP selection');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleTestMsp = async (): Promise<void> => {
    if (!currentMsp) {
      Alert.alert('No MSP', 'Please select and save an MSP first');
      return;
    }

    try {
      // Test the current MSP integration
      const isReady = MspManager.isReady();
      const activeMsp = MspManager.getCurrentMsp();
      
      Alert.alert(
        'MSP Status',
        `Active MSP: ${activeMsp ? MSP_OPTIONS.find(m => m.id === activeMsp)?.name : 'None'}\n` +
        `Status: ${isReady ? 'Initialized ✓' : 'Not initialized ✗'}\n` +
        `Ready for push: ${isReady ? 'Yes' : 'No'}`
      );
    } catch (error) {
      console.error('Error testing MSP:', error);
      Alert.alert('Error', 'Failed to test MSP status');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settings</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Loading settings...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity style={styles.testButton} onPress={handleTestMsp}>
            <Text style={styles.testButtonText}>Test</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* MIU Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>User Identification</Text>
              <View style={styles.sectionContent}>
                <Text style={styles.label}>MIU (MovableInk User ID)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter New MIU"
                  value={userId}
                  onChangeText={setUserId}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity 
                  style={[
                    styles.saveButton, 
                    (!userId || isSavingMiu) && styles.saveButtonDisabled
                  ]} 
                  onPress={handleSaveUserId}
                  disabled={!userId || isSavingMiu}
                >
                  {isSavingMiu ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save MIU</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* MSP Selection Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Marketing Service Provider</Text>
              <View style={styles.sectionContent}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Select MSP</Text>
                  {currentMsp && (
                    <TouchableOpacity onPress={handleClearMsp}>
                      <Text style={styles.clearButton}>Clear</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.sublabel}>
                  Choose your preferred engagement platform. Only the selected MSP will be initialized.
                </Text>
                
                {currentMsp && (
                  <View style={styles.currentMspBanner}>
                    <Text style={styles.currentMspText}>
                      Current: {MSP_OPTIONS.find(m => m.id === currentMsp)?.name}
                    </Text>
                    <Text style={styles.currentMspSubtext}>
                      SDK Status: {MspManager.isReady() ? '✓ Active' : '○ Inactive'}
                    </Text>
                  </View>
                )}
                
                <View style={styles.mspContainer}>
                  {MSP_OPTIONS.map((msp) => (
                    <TouchableOpacity
                      key={msp.id}
                      style={[
                        styles.mspOption,
                        selectedMsp === msp.id && styles.mspOptionSelected,
                        currentMsp === msp.id && styles.mspOptionCurrent
                      ]}
                      onPress={() => handleMspSelect(msp.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.radioContainer}>
                        <View style={[
                          styles.radioOuter,
                          selectedMsp === msp.id && styles.radioOuterSelected
                        ]}>
                          {selectedMsp === msp.id && <View style={styles.radioInner} />}
                        </View>
                        <View style={styles.mspTextContainer}>
                          <View style={styles.mspNameRow}>
                            <Text style={[
                              styles.mspName,
                              selectedMsp === msp.id && styles.mspNameSelected
                            ]}>
                              {msp.name}
                            </Text>
                            {currentMsp === msp.id && (
                              <View style={styles.currentBadge}>
                                <Text style={styles.currentBadgeText}>ACTIVE</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.mspDescription}>{msp.description}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity 
                  style={[
                    styles.saveButton, 
                    styles.mspSaveButton,
                    (!selectedMsp || selectedMsp === currentMsp || isSavingMsp) && styles.saveButtonDisabled
                  ]} 
                  onPress={handleSaveMsp}
                  disabled={!selectedMsp || selectedMsp === currentMsp || isSavingMsp}
                >
                  {isSavingMsp ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {currentMsp && selectedMsp !== currentMsp ? 'Switch MSP' : 'Set MSP'}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* MSP Status Info */}
                {currentMsp && (
                  <View style={styles.statusInfo}>
                    <Text style={styles.statusInfoTitle}>MSP Integration Status</Text>
                    <Text style={styles.statusInfoText}>
                      • SDK Initialized: {MspManager.isReady() ? 'Yes ✓' : 'No ✗'}
                    </Text>
                    <Text style={styles.statusInfoText}>
                      • Push Notifications: {MspManager.isReady() ? 'Enabled' : 'Disabled'}
                    </Text>
                    <Text style={styles.statusInfoText}>
                      • In-App Messaging: {MspManager.isReady() ? 'Ready' : 'Not Ready'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  } as ViewStyle,
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  } as ViewStyle,
  backButton: {
    padding: 8,
    minWidth: 60,
  } as ViewStyle,
  backButtonText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
  } as TextStyle,
  testButton: {
    padding: 8,
    minWidth: 60,
    alignItems: 'flex-end' as const,
  } as ViewStyle,
  testButtonText: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
  } as TextStyle,
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  } as TextStyle,
  placeholder: {
    width: 60,
  } as ViewStyle,
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  } as TextStyle,
  scrollContent: {
    flex: 1,
  } as ViewStyle,
  content: {
    padding: 20,
    paddingTop: 30,
  } as ViewStyle,
  section: {
    marginBottom: 20,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
  } as TextStyle,
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 20,
  } as ViewStyle,
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  } as TextStyle,
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  } as ViewStyle,
  clearButton: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  } as TextStyle,
  sublabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  } as TextStyle,
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 15,
  } as TextStyle,
  currentMspBanner: {
    backgroundColor: '#f0f9ff',
    borderColor: '#0ea5e9',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  } as ViewStyle,
  currentMspText: {
    fontSize: 14,
    color: '#0369a1',
    fontWeight: '600',
  } as TextStyle,
  currentMspSubtext: {
    fontSize: 12,
    color: '#0369a1',
    marginTop: 4,
  } as TextStyle,
  mspContainer: {
    gap: 12,
    marginBottom: 20,
  } as ViewStyle,
  mspOption: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
  } as ViewStyle,
  mspOptionSelected: {
    borderColor: '#6366f1',
    borderWidth: 2,
    backgroundColor: '#f0f1ff',
  } as ViewStyle,
  mspOptionCurrent: {
    borderColor: '#10b981',
    borderStyle: 'dashed',
  } as ViewStyle,
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  } as ViewStyle,
  radioOuterSelected: {
    borderColor: '#6366f1',
  } as ViewStyle,
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366f1',
  } as ViewStyle,
  mspTextContainer: {
    flex: 1,
  } as ViewStyle,
  mspNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  } as ViewStyle,
  mspName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  } as TextStyle,
  mspNameSelected: {
    color: '#6366f1',
  } as TextStyle,
  mspDescription: {
    fontSize: 13,
    color: '#666',
  } as TextStyle,
  currentBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  } as ViewStyle,
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  } as TextStyle,
  saveButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    minHeight: 50,
    justifyContent: 'center',
  } as ViewStyle,
  mspSaveButton: {
    backgroundColor: '#6366f1',
  } as ViewStyle,
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0.1,
  } as ViewStyle,
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  statusInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  } as ViewStyle,
  statusInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  } as TextStyle,
  statusInfoText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  } as TextStyle,
});

export default Settings;