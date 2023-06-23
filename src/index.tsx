import { NativeModules } from 'react-native';
const { RNMovableInk } = NativeModules;

export interface ProductSearchProperties {
  query: string;
  url?: string;
}

export interface ProductProperties {
  id: string;
  title?: string;
  price?: number;
  url?: string;
  categories?: Array<ProductCategory>;
  meta?: Record<string, unknown>;
}

export interface ProductCategory {
  id: string;
  title?: string;
  url?: string;
}

export interface OrderCompletedProperties {
  id?: string;
  revenue?: number;
  products: Array<OrderCompletedProduct>;
}

export interface OrderCompletedProduct {
  id: string;
  title?: string;
  url?: string;
  price?: number;
  quantity?: number;
}

export interface MovableInkInterface {
  start(): void;
  resolveURL(url: string): Promise<string | null>;
  productSearched(properties: ProductSearchProperties): void;
  productViewed(properties: ProductProperties): void;
  productAdded(properties: ProductProperties): void;
  orderCompleted(properties: OrderCompletedProperties): void;
  categoryViewed(properties: ProductCategory): void;
  logEvent(name: string, properties: Record<string, unknown>): void;
  identifyUser(): void;
  setMIU(value: string): void;
}

export default RNMovableInk as MovableInkInterface;
