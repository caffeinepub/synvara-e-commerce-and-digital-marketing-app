import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Stripe "stripe/stripe";
import Order "mo:core/Order";
import OutCall "http-outcalls/outcall";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Include storage, authorization and Stripe modules
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      switch (Text.compare(product1.name, product2.name)) {
        case (#equal) { Nat.compare(product1.price, product2.price) };
        case (order) { order };
      };
    };
  };

  public type Product = {
    id : Text;
    name : Text;
    price : Nat;
    description : Text;
    imageRefs : [Storage.ExternalBlob];
    isFeatured : Bool;
    createdAt : Int;
    updatedAt : Int;
  };

  public type OrderItem = {
    productId : Text;
    quantity : Nat;
    price : Nat;
  };

  public type OrderRecord = {
    orderId : Text;
    userId : Principal;
    items : [OrderItem];
    totalAmount : Nat;
    createdAt : Int;
    paymentStatus : {
      #pending;
      #completed;
      #failed;
    };
    stripeSessionId : ?Text;
  };

  public type ShoppingCartItem = {
    productId : Text;
    quantity : Nat;
  };

  public type CartItem = {
    product : Product;
    quantity : Nat;
  };

  public type CartSummary = {
    items : [CartItem];
    totalAmount : Nat;
  };

  let products = Map.empty<Text, Product>();
  let orders = Map.empty<Text, OrderRecord>();
  let shoppingCarts = Map.empty<Principal, [ShoppingCartItem]>();
  let banners = List.empty<Text>();

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  func generateId(prefix : Text) : Text {
    let timestamp = Time.now();
    prefix # "_" # timestamp.toText();
  };

  // Banners Management
  public shared ({ caller }) func addBanner(bannerUrl : Text) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add banners");
    };
    banners.add(bannerUrl);
    bannerUrl;
  };

  public shared ({ caller }) func deleteBanner(bannerUrl : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete banners");
    };
    let filteredBanners = banners.filter(func(item) { item != bannerUrl });
    banners.clear();
    banners.addAll(filteredBanners.values());
  };

  public query ({ caller }) func getBanners() : async [Text] {
    banners.toArray();
  };

  // Product Management
  public shared ({ caller }) func addProduct(name : Text, price : Nat, description : Text, imageRefs : [Storage.ExternalBlob]) : async Product {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    let productId = generateId("prod");
    let timestamp = Time.now();
    let product : Product = {
      id = productId;
      name;
      price;
      description;
      imageRefs;
      isFeatured = false;
      createdAt = timestamp;
      updatedAt = timestamp;
    };

    products.add(productId, product);
    product;
  };

  public shared ({ caller }) func updateProduct(productId : Text, name : Text, price : Nat, description : Text, imageRefs : [Storage.ExternalBlob]) : async Product {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?existingProduct) {
        let updatedProduct : Product = {
          id = productId;
          name;
          price;
          description;
          imageRefs;
          isFeatured = existingProduct.isFeatured;
          createdAt = existingProduct.createdAt;
          updatedAt = Time.now();
        };
        products.add(productId, updatedProduct);
        updatedProduct;
      };
    };
  };

  public shared ({ caller }) func deleteProduct(productId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    products.remove(productId);
  };

  public shared ({ caller }) func setFeaturedProduct(productId : Text, isFeatured : Bool) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update featured products");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let updatedProduct : Product = {
          id = productId;
          name = product.name;
          price = product.price;
          description = product.description;
          imageRefs = product.imageRefs;
          isFeatured;
          createdAt = product.createdAt;
          updatedAt = Time.now();
        };
        products.add(productId, updatedProduct);
      };
    };
  };

  // Shopping Cart Functions
  func getCart(caller : Principal) : [ShoppingCartItem] {
    switch (shoppingCarts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart };
    };
  };

  public shared ({ caller }) func addToCart(productId : Text, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add items to cart");
    };

    if (quantity == 0) {
      Runtime.trap("Quantity must be greater than zero");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let cart = getCart(caller);
        let updatedCart = cart.concat([{
          productId;
          quantity;
        }]);
        shoppingCarts.add(caller, updatedCart);
      };
    };
  };

  public shared ({ caller }) func removeFromCart(productId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove items from cart");
    };

    let cart = getCart(caller);
    let filteredCart = cart.filter(func(item) { item.productId != productId });
    shoppingCarts.add(caller, filteredCart);
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };

    shoppingCarts.remove(caller);
  };

  // Cart Summary
  public query ({ caller }) func getCartSummary() : async CartSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart summary");
    };

    let cartItems = getCart(caller);
    var totalAmount = 0;
    let cartEntries = cartItems.map(
      func(item) {
        switch (products.get(item.productId)) {
          case (null) { Runtime.trap("Product not found: " # item.productId) };
          case (?product) {
            totalAmount += product.price * item.quantity;
            {
              product;
              quantity = item.quantity;
            };
          };
        };
      }
    );

    {
      items = cartEntries;
      totalAmount;
    };
  };

  // Product Queries
  public query ({ caller }) func getProduct(productId : Text) : async Product {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query ({ caller }) func getProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public query ({ caller }) func getFeaturedProducts() : async [Product] {
    products.values().toArray().filter(func(p) { p.isFeatured }).sort();
  };

  // Stripe Integration
  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set Stripe configuration");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };

    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
