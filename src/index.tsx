import { NativeModules } from 'react-native';
const { RNMovableInk } = NativeModules;

interface ProductSearchProperties {
  query: string;
  url?: string;
}

interface ProductProperties {
  id: string
  title?: string
  price?: string | number
  url?: string
  categories?: Array<ProductCategory>
  meta?: Record<string, unknown>
}

interface ProductCategory {
  id: string
  title?: string
  url?: string
}

interface OrderCompletedProperties {
  id?: string
  revenue?: string | number
  products: Array<OrderCompletedProduct>
}

interface OrderCompletedProduct {
  id: string
  title?: string
  url?: string
  price?: string | number
  quantity?: number
}

interface MovableInkInterface {
  start(): void;
  resolveURL(url: string): Promise<string | null>;
  productSearched(properties: ProductSearchProperties): void;
  productViewed(properties: ProductProperties): void;
  productAdded(properties: ProductProperties): void;
  orderCompleted(properties: OrderCompletedProperties): void;
  categoryViewed(properties: ProductCategory): void;
  identifyUser(): void;
}

export default RNMovableInk as MovableInkInterface;