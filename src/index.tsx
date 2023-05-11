import { NativeModules } from 'react-native';
const { RNMovableInk } = NativeModules;

interface MovableInkInterface {
  start(): void;
  resolveURL(url: string): Promise<string | null>;
}

export default RNMovableInk as MovableInkInterface;