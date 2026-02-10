import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface CartSummary {
    totalAmount: bigint;
    items: Array<CartItem>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface CartItem {
    quantity: bigint;
    product: Product;
}
export interface Product {
    id: string;
    imageRefs: Array<ExternalBlob>;
    name: string;
    createdAt: bigint;
    description: string;
    updatedAt: bigint;
    isFeatured: boolean;
    price: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBanner(bannerUrl: string): Promise<string>;
    addProduct(name: string, price: bigint, description: string, imageRefs: Array<ExternalBlob>): Promise<Product>;
    addToCart(productId: string, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteBanner(bannerUrl: string): Promise<void>;
    deleteProduct(productId: string): Promise<void>;
    getBanners(): Promise<Array<string>>;
    getCallerUserRole(): Promise<UserRole>;
    getCartSummary(): Promise<CartSummary>;
    getFeaturedProducts(): Promise<Array<Product>>;
    getProduct(productId: string): Promise<Product>;
    getProducts(): Promise<Array<Product>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    removeFromCart(productId: string): Promise<void>;
    setFeaturedProduct(productId: string, isFeatured: boolean): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateProduct(productId: string, name: string, price: bigint, description: string, imageRefs: Array<ExternalBlob>): Promise<Product>;
}
