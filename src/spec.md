# Synvara - E-commerce and Digital Marketing App

## Overview
Synvara is an e-commerce platform that allows users to browse and purchase products online, with integrated digital marketing features and administrative capabilities.

## Authentication
- Users authenticate using Internet Identity for secure login
- Authentication required for shopping cart, checkout, and admin functions

## Product Management
- Products are stored in the backend with the following information:
  - Product name
  - Price
  - Description
  - Product images (stored using blob storage)
- Admin users can add, edit, and delete products through an admin dashboard
- Product images are managed through blob storage system

## User Features
### Product Browsing
- Homepage displays featured products and marketing banners
- Product listings show product images, names, prices, and descriptions
- Users can view detailed product information

### Shopping Cart
- Authenticated users can add products to their shopping cart
- Users can remove products from their cart
- Cart persists across sessions for logged-in users

### Checkout Process
- Order summary displays selected products and total price
- Payment processing integrated with Stripe
- Order completion creates a record in the backend

## Admin Dashboard
- Admin interface for product management
- Ability to add new products with images
- Edit existing product information and images
- Delete products from the catalog
- Manage featured products for homepage display

## Data Storage
### Backend Storage
- Product catalog (names, prices, descriptions, image references)
- User orders and order history
- Product images via blob storage
- Featured product selections for homepage

### Frontend Storage
- Shopping cart state (for better user experience)
- User session information
