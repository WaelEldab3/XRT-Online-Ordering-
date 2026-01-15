# XRT Online Ordering System

Enterprise-grade online ordering platform with comprehensive business management, customer relationship management, and role-based access control.

## 🏗️ Project Architecture

This monorepo contains two main applications:

### 📊 Admin Dashboard (`/admin`)

- **Technology**: Next.js 13+, TypeScript, TailwindCSS
- **Port**: 3002
- **Purpose**: Administrative interface for business management
- **Features**: User management, business oversight, analytics, role-based UI

### 🚀 Backend Server (`/customize_server`)

- **Technology**: Node.js, Express, MongoDB, JWT Authentication
- **Port**: 3001
- **Purpose**: RESTful API with comprehensive business logic
- **Features**: Authentication, user management, business management, location management, customer management

## ✨ Key Features

### 🔐 Authentication & Security

- JWT-based authentication with access/refresh tokens
- Role-based access control (RBAC)
- Permission-based endpoint protection
- Password hashing with bcrypt
- Account approval workflows
- User banning/unbanning capabilities

### 👥 User Management

- Multi-role user system (super_admin, admin, manager, client, user)
- Custom role creation with granular permissions
- User profile management
- Permission assignment and management

### 🏢 Business Management

- Business registration and verification
- Owner assignment and transfer
- Business activation/deactivation
- **Unified Business Settings**: Manage operating hours, delivery fees, and tax settings
- **Dynamic Fee Structure**: Support for service fees and customizable tips (fixed or percentage-based)
- **Hero Slider Management**: Manage homepage hero slides with background images and call-to-action buttons
- **Dedicated Social Settings**: Manage social media profiles in a unified, dedicated section
- Contact information management
- Business metadata and branding
- **Printer Settings Integration**: Ready-to-use printer configuration placeholders for future hardware support

### 📍 Location Management

- Multi-location support per business
- Geolocation with coordinates
- Operating hours management
- Contact information per location
- Online ordering configuration (pickup/delivery)

### 👤 Customer Management

- Customer profiles with preferences
- Rewards and loyalty system
- Address management
- Order history tracking
- CSV import/export functionality
- Customer segmentation by business/location

### 📦 Category Management

- Full CRUD operations for categories
- Image and icon upload via Cloudinary
- Business-scoped categories
- Kitchen section integration
- Multi-language support
- Sort order management

### 🍕 Item Management

- Complete item lifecycle management
- Image upload support
- **Separate ItemSize collection** - Item sizes are now managed independently:
  - Create, update, delete sizes via `/items/:itemId/sizes` endpoints
  - Each size has: name, code (unique per item), price, display_order, is_active
  - Code mapping: Size codes (S, M, L, XL, XXL) used in modifier pricing map to ItemSize.code
- Business rules:
  - If `is_sizeable = false`: Uses `base_price`, `default_size_id` must be null
  - If `is_sizeable = true`: Must have at least one ItemSize, `base_price` is ignored, `default_size_id` references a size
- Modifier group assignment
- Item-level sides configuration
- Category-based organization
- Active/inactive status management
- Signature item marking
- Customizable per-order limits
- **Migration**: Run `npx ts-node customize_server/scripts/migrateItemSizes.ts` to migrate existing embedded sizes

### 🎛️ Modifier Group & Modifier Management

- **Modifier Groups** - Single source of truth for modifier configuration:
  - Selection rules (RADIO/CHECKBOX, min/max selection, applies per quantity)
  - Group-level quantity levels (Light, Normal, Extra) with default settings
  - Size-based pricing (price deltas for S, M, L, XL, XXL)
  - Business-scoped groups
- **Modifiers** - Lightweight modifier items within groups:
  - Name, display order, default selection
  - Maximum quantity per modifier
  - Automatic inheritance of group-level settings
  - No individual pricing or quantity level configuration
- **Item Integration** - Assign modifier groups to items with:
  - Custom display order per item
  - Item-level sides configuration (enabled/disabled, allowed sides count)
  - **Per-Modifier Overrides** (NEW) - Customize each modifier individually:
    - Override max_quantity per modifier for the item
    - Override is_default flag per modifier for the item
    - Item-level pricing by size per modifier
    - Item-level quantity levels per modifier
    - **All overrides apply ONLY to the item** (never affect global settings)
- **Configuration Resolution Order**:
  1. Modifier Group defaults (base configuration)
  2. Modifier-level defaults (if any - future enhancement)
  3. Item-level modifier overrides (item-specific customization)
  4. Item-only behavior (sides_config)
- **Validation** - Prevents deletion of groups used by items
- **Soft Delete** - Safe deletion with data preservation
- **Backward Compatible** - Existing items without overrides continue to work

### 📥 Import System (Super Admin Only)

- **Professional CSV/ZIP Import** - Import Items, ItemSizes, ModifierGroups, Modifiers, and Item Modifier Overrides
- **Strict Validation** - Comprehensive validation with blocking errors and warnings
- **Review Before Save** - Parse and validate without writing to database
- **Draft Sessions** - Save import sessions and continue later (7-day TTL)
- **Transactional Save** - All-or-nothing database writes with rollback protection
- **Error Export** - Download validation errors as CSV
- **Audit Logging** - Complete audit trail for all import operations
- **Business Key Based** - Use business keys (item_key, group_key, modifier_key) instead of database IDs
- **Safety First** - No incomplete data ever reaches the database

**Import Flow:**
1. Upload CSV or ZIP file → Parse and validate
2. Review parsed data → Edit inline if needed
3. Fix validation errors → Re-validate
4. Save draft (optional) → Continue later
5. Final save → Transactional write to database

### 💳 Financial Management

- Withdrawal management system
- Transaction tracking
- Business revenue analytics

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 5.0+
- npm or yarn

### 1. Clone the Repository

```bash
git clone <[repository-url](https://github.com/thomasibrahim10/XRT-Online-Ordering-.git)>
cd XRT-Online-Ordering-
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd customize_server

# Install dependencies
npm install

# Set up environment variables
node setup-env.js

# Start development server
npm run dev
```

The backend will be available at `http://localhost:3001`

### 3. Frontend Setup

```bash
# Navigate to admin dashboard (new terminal)
cd admin

# Install dependencies
npm install

# Start development server
npm run dev
```

The admin dashboard will be available at `http://localhost:3002`

## 🔧 Environment Configuration

### Backend Environment Variables (.env)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/xrt-online-ordering

# JWT Secrets
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_minimum_32_characters

# Token Expiration
ACCESS_TOKEN_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d
JWT_EXPIRE=30d

# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3002

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@xrt.com
EMAIL_FROM_NAME=XRT System

# Cloudinary (Required for Image Uploads)
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend Environment Variables (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_NAME=XRT Online Ordering
```

## 📚 API Documentation

### Interactive Documentation

- **Swagger UI**: `http://localhost:3001/api-docs`
- **API Info**: `http://localhost:3001/api/v1/`
- **OpenAPI Spec**: `http://localhost:3001/api-docs.json`

**Swagger Documentation Features:**
- ✅ Complete API endpoint documentation
- ✅ Detailed request/response schemas with proper data types
- ✅ Interactive API testing interface
- ✅ No empty data objects - all responses properly typed
- ✅ Authentication examples
- ✅ Error response documentation

### API Endpoints Overview

#### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh-token` - Token refresh
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset confirmation
- `GET /auth/me` - Get current user profile
- `PATCH /auth/update-password` - Update password
- `POST /auth/logout` - User logout

#### User Management (Admin)

- `GET /auth/users` - List all users
- `POST /auth/users` - Create user
- `GET /auth/users/:id` - Get user details
- `PATCH /auth/users/:id` - Update user
- `DELETE /auth/users/:id` - Delete user
- `PATCH /auth/users/:id/approve` - Approve user account
- `PATCH /auth/users/:id/ban` - Ban/unban user
- `PATCH /auth/users/:id/permissions` - Update user permissions
- `GET /auth/users/:id/permissions` - Get user permissions
- `GET /auth/permissions` - List all permissions

#### Role Management

- `GET /roles` - List all roles
- `POST /roles` - Create role
- `GET /roles/:id` - Get role details
- `PATCH /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role
- `PATCH /roles/users/:id/assign` - Assign role to user
- `PATCH /roles/users/:id/remove` - Remove role from user
- `GET /roles/users/:roleId` - Get users with role

#### Business Management

- `GET /businesses` - List all businesses
- `POST /businesses` - Create business
- `GET /businesses/:id` - Get business details
- `PUT /businesses/:id` - Update business
- `DELETE /businesses/:id` - Delete business
- `PATCH /businesses/:id/activate` - Activate business

#### Business Management

- `GET /businesses` - List all businesses
- `POST /businesses` - Create business
- `GET /businesses/:id` - Get business details
- `PUT /businesses/:id` - Update business
- `DELETE /businesses/:id` - Delete business
- `PATCH /businesses/:id/activate` - Activate business
- `PATCH /businesses/:id/deactivate` - Deactivate business
- `PATCH /businesses/:id/owner` - Update business owner
- `GET /businesses/owner/:ownerId` - Get businesses by owner
- `GET /business-settings` - Get business settings
- `PATCH /business-settings` - Update business settings

#### Location Management

- `GET /locations` - List all locations
- `POST /locations` - Create location
- `GET /locations/:id` - Get location details
- `PUT /locations/:id` - Update location
- `DELETE /locations/:id` - Delete location
- `PATCH /locations/:id/activate` - Activate location
- `PATCH /locations/:id/deactivate` - Deactivate location
- `GET /locations/nearby` - Get nearby locations
- `GET /locations/business/:businessId` - Get locations by business

#### Customer Management

- `GET /customers` - List all customers
- `POST /customers` - Create customer
- `GET /customers/:id` - Get customer details
- `PATCH /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer
- `GET /customers/top-rewards` - Get top customers by rewards
- `GET /customers/business/:businessId` - Get customers by business
- `GET /customers/location/:locationId` - Get customers by location
- `PATCH /customers/:id/rewards/add` - Add rewards to customer
- `PATCH /customers/:id/rewards/redeem` - Redeem customer rewards
- `POST /customers/import` - Import customers from CSV
- `POST /customers/export` - Export customers to CSV

#### Category Management

- `GET /categories` - List all categories
- `GET /categories/:id` - Get single category details
- `POST /categories` - Create category (Multipart: image, icon)
- `PUT /categories/:id` - Update category (Multipart: image, icon)
- `DELETE /categories/:id` - Delete category

#### Item Management

- `GET /items` - List all items (with pagination)
- `GET /items/:id` - Get single item details
- `POST /items` - Create item (Multipart: image, modifier_groups, default_size_id)
- `PUT /items/:id` - Update item (Multipart: image, modifier_groups, default_size_id)
- `DELETE /items/:id` - Delete item (also deletes all associated ItemSize records)

#### Item Size Management

**⚠️ Important:** Item sizes are now managed separately from items. Use these endpoints to manage sizes for sizable items.

- `GET /items/:itemId/sizes` - Get all sizes for an item
- `GET /items/:itemId/sizes/:id` - Get single item size
- `POST /items/:itemId/sizes` - Create item size
  - Required: `name`, `code`, `price`
  - Optional: `display_order`, `is_active`
  - Code must be unique per item
- `PUT /items/:itemId/sizes/:id` - Update item size
- `DELETE /items/:itemId/sizes/:id` - Delete item size
  - Cannot delete if it's the default size (update item's default_size_id first)
  - Cannot delete if it's the last size for a sizable item

#### Import System (Super Admin Only)

**Import Flow:**
1. `POST /import/parse` - Upload CSV/ZIP file, parse and validate
2. `GET /import/sessions/:id` - Review parsed data and validation results
3. `PUT /import/sessions/:id` - Update data and save draft (optional)
4. `POST /import/sessions/:id/save` - Final save to database (transactional)
5. `GET /import/sessions/:id/errors` - Download errors as CSV (optional)
6. `DELETE /import/sessions/:id` - Discard import session (optional)

**CSV File Format Examples:**

**Items.csv:**
```csv
item_key,business_id,name,description,base_price,category_name,is_sizeable,is_customizable
ITEM001,biz123,Margherita Pizza,Classic pizza,12.99,Pizza,true,true
ITEM002,biz123,Caesar Salad,Fresh salad,8.99,Salads,false,false
```

**ItemSizes.csv:**
```csv
item_key,size_code,name,price,display_order,is_default
ITEM001,S,Small,10.99,1,false
ITEM001,M,Medium,12.99,2,true
ITEM001,L,Large,15.99,3,false
```

**ModifierGroups.csv:**
```csv
group_key,business_id,name,display_type,min_select,max_select
GROUP001,biz123,Pizza Toppings,CHECKBOX,0,5
GROUP002,biz123,Salad Dressing,RADIO,1,1
```

**Modifiers.csv:**
```csv
group_key,modifier_key,name,is_default,max_quantity,display_order
GROUP001,MOD001,Pepperoni,false,3,1
GROUP001,MOD002,Mushrooms,false,2,2
GROUP002,MOD003,Caesar Dressing,true,1,1
```

**ItemModifierOverrides.csv:**
```csv
item_key,group_key,modifier_key,max_quantity,is_default
ITEM001,GROUP001,MOD001,5,true
```

**Validation:**
- All validation errors block saving (must be fixed)
- Warnings are non-blocking but should be reviewed
- Re-validation occurs on every update
- Final save re-validates before writing to database

**Item Modifier Groups with Per-Modifier Overrides:**

When creating or updating items, you can customize each modifier individually using `modifier_overrides`:

```json
{
  "modifier_groups": [
    {
      "modifier_group_id": "507f1f77bcf86cd799439011",
      "display_order": 1,
      "sides_config": {
        "enabled": true,
        "allowed_sides": 2
      },
      "modifier_overrides": [
        {
          "modifier_id": "507f1f77bcf86cd799439012",
          "max_quantity": 5,
          "is_default": true,
          "prices_by_size": [
            {"sizeCode": "M", "priceDelta": 1.50},
            {"sizeCode": "L", "priceDelta": 2.50},
            {"sizeCode": "XL", "priceDelta": 3.00}
          ],
          "quantity_levels": [
            {"quantity": 2, "name": "Extra", "price": 1.00, "is_default": true}
          ]
        }
      ]
    }
  ]
}
```

**Modifier Override Fields:**
- `modifier_id` (required): ID of the modifier to override
- `max_quantity` (optional): Override max_quantity for this modifier (item-level only)
- `is_default` (optional): Override default selection flag (item-level only)
- `prices_by_size` (optional): Item-level pricing per size, overrides group defaults
- `quantity_levels` (optional): Item-level quantity levels, overrides group defaults

**⚠️ Important:** All modifier overrides apply ONLY to the specific item and never affect:
- The modifier globally
- The modifier group globally
- Other items using the same modifier

#### Modifier Group Management

- `GET /modifier-groups` - List all modifier groups
- `GET /modifier-groups/:id` - Get single modifier group with modifiers
- `POST /modifier-groups` - Create modifier group (with selection rules, pricing, quantity levels)
- `PUT /modifier-groups/:id` - Update modifier group
- `DELETE /modifier-groups/:id` - Delete modifier group (soft delete, prevents if used by items)

#### Modifier Management

- `GET /modifier-groups/:groupId/modifiers` - List all modifiers in a group
- `POST /modifier-groups/:groupId/modifiers` - Create modifier in a group
- `PUT /modifier-groups/:groupId/modifiers/:id` - Update modifier
- `DELETE /modifier-groups/:groupId/modifiers/:id` - Delete modifier (soft delete)

#### Withdraw Management

- `GET /withdraws` - List all withdrawal requests

## 🎭 Role-Based Access Control

### Built-in Roles

- **super_admin**: Full system access
- **admin**: Administrative access
- **manager**: Management access
- **client**: Standard business user access
- **user**: Limited access

### Available Permissions

- **users:read** - View user information
- **users:create** - Create new users
- **users:update** - Update user data
- **users:delete** - Delete users
- **users:approve** - Approve user accounts
- **users:ban** - Ban/unban users
- **categories:read** - View categories
- **categories:create** - Create categories
- **categories:update** - Update categories
- **categories:delete** - Delete categories
- **roles:read** - View roles
- **roles:create** - Create roles
- **roles:update** - Update roles
- **roles:delete** - Delete roles
- **businesses:read** - View businesses
- **businesses:create** - Create businesses
- **businesses:update** - Update businesses
- **businesses:delete** - Delete businesses
- **locations:read** - View locations
- **locations:create** - Create locations
- **locations:update** - Update locations
- **locations:delete** - Delete locations
- **customers:read** - View customers
- **customers:create** - Create customers
- **customers:update** - Update customers
- **customers:delete** - Delete customers
- **withdraws:read** - View withdrawal requests
- **system:read** - View system information
- **system:update** - Update system settings

## 🛠️ Development

### Project Structure

```
XRT-Online-Ordering-/
├── admin/                          # Next.js Admin Dashboard
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── settings/           # Settings-related forms
│   │   │   │   ├── social/         # Dedicated Social Media form [NEW]
│   │   │   │   └── shop/           # Shop settings with Dynamic Tip logic
│   │   ├── pages/                 # Next.js pages
│   │   │   ├── settings/
│   │   │   │   └── social.tsx      # Social Settings page [NEW]
│   │   ├── contexts/              # React contexts
│   │   ├── hooks/                 # Custom hooks
│   │   ├── utils/                 # Utility functions
│   │   └── types/                 # TypeScript definitions
│   ├── public/                    # Static assets
│   ├── package.json
│   └── tailwind.config.js
├── customize_server/               # Express.js Backend API
│   ├── controllers/               # Route controllers
│   ├── models/                   # Database models
│   ├── routes/                   # API routes
│   ├── middleware/               # Express middleware
│   ├── config/                   # Configuration files
│   ├── utils/                    # Utility functions
│   ├── scripts/                  # Database seeding scripts
│   ├── utils/                    # Utility functions
│   ├── scripts/                  # Database seeding scripts
│   ├── postman/                  # Postman collections
│   └── package.json
└── README.md                     # This file
```

### Available Scripts

#### Backend (customize_server)

```bash
npm run dev          # Start development server
npm start           # Start production server
npm run dev          # Start development server
npm start           # Start production server
npm run lint        # Run ESLint
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
```

#### Frontend (admin)

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Database Seeding

```bash
# Seed super admin user
node scripts/seedSuperAdmin.js

# Seed sample businesses
node scripts/seedBusinesses.js

# Seed sample customers
node scripts/seedCustomers.js
```

## 📱 Postman Collection

Import the provided Postman collection for easy API testing:

1. Open Postman
2. Click "Import"
3. Select `customize_server/postman/XRT-Customized-System.postman_collection.json`
4. Update environment variables:
   - `baseUrl`: http://localhost:3001
   - `accessToken`: Get from login response
   - `refreshToken`: Get from login response
   - `adminAccessToken`: Get from admin login response

## 🔒 Security Features

- **JWT Authentication** with access and refresh tokens
- **Password Hashing** using bcrypt
- **Rate Limiting** on sensitive endpoints
- **CORS Protection** with configurable origins
- **Input Validation** on all endpoints
- **Permission-Based Access Control**
- **Account Status Management** (active/inactive/banned)
- **Secure Password Reset** flow
- **HTTP-Only Cookies** for token storage

## 🌐 Production Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Use strong JWT secrets (minimum 32 characters)
3. Configure MongoDB with authentication
4. Set up reverse proxy (nginx/Apache)
5. Enable HTTPS with SSL certificates
6. Configure email service for production

### Docker Deployment

Backend Dockerfile:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

Frontend Dockerfile:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["npm", "start"]
```

## 📊 Monitoring & Logging

### Development Mode

- Detailed error messages
- Request/response logging
- Database query logging

### Production Mode

- Error tracking only
- Performance monitoring
- Security event logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:

- Email: support@xrttech.com
- Documentation: http://localhost:3001/api-docs
- API Info: http://localhost:3001/api/v1/

---

🎉 **Built with enterprise-grade security and scalability in mind**
