# Sales Quotation Generator

A modern, full-stack microsaas application for creating and managing professional sales quotations. Built with Next.js, TypeScript, MongoDB, and Tailwind CSS.

## Features

- **Client Management**: Store and manage client information
- **Product Catalog**: Add multiple products with descriptions, pricing, and quantities
- **Dynamic Pricing**: Automatic calculation of subtotals, taxes, and discounts
- **PDF Generation**: Export professional PDF quotations
- **Status Tracking**: Track quotation status (Draft, Sent, Accepted, Rejected)
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Form Validation**: Comprehensive validation using Zod
- **RESTful API**: Clean API architecture with Next.js API routes

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **PDF Generation**: jsPDF with autoTable

## Project Structure

```
sales-quotation-generator/
├── app/
│   ├── api/
│   │   ├── quotations/          # Quotation CRUD API routes
│   │   │   ├── route.ts         # GET all, POST new
│   │   │   └── [id]/
│   │   │       └── route.ts     # GET, PUT, DELETE by ID
│   │   └── pdf/
│   │       └── [id]/
│   │           └── route.ts     # PDF generation endpoint
│   ├── quotations/
│   │   ├── new/
│   │   │   └── page.tsx         # Create quotation form
│   │   └── [id]/
│   │       └── page.tsx         # View/edit quotation
│   ├── layout.tsx
│   └── page.tsx                 # Dashboard
├── components/
│   ├── forms/
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   └── quotation/
├── lib/
│   ├── db.ts                    # MongoDB connection
│   ├── pdf-generator.ts         # PDF generation logic
│   └── validations.ts           # Zod schemas
├── models/
│   └── Quotation.ts             # Mongoose schema
├── types/
│   └── index.ts                 # TypeScript interfaces
├── public/
├── .env.local                   # Environment variables
├── .env.example
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB installed and running locally OR MongoDB Atlas account
- npm or yarn package manager

### Installation

1. **Clone or navigate to the project directory**

```bash
cd sales-quotation-generator
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and update the MongoDB connection string:

```env
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/sales-quotation-generator

# OR for MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sales-quotation-generator
```

4. **Start MongoDB (if using local)**

```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

5. **Run the development server**

```bash
npm run dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Creating a Quotation

1. Click "Create New Quotation" on the dashboard
2. Fill in client information
3. Add products with descriptions, quantities, and prices
4. Set tax rate and discount (if applicable)
5. Add notes and terms & conditions
6. Click "Create Quotation"

### Managing Quotations

- **View**: Click "View" on any quotation card
- **Download PDF**: Click "Download PDF" to export
- **Update Status**: Mark quotations as Sent, Accepted, or Rejected
- **Delete**: Click "Delete" to remove a quotation

### API Endpoints

- `GET /api/quotations` - Get all quotations
- `POST /api/quotations` - Create a new quotation
- `GET /api/quotations/[id]` - Get quotation by ID
- `PUT /api/quotations/[id]` - Update quotation
- `DELETE /api/quotations/[id]` - Delete quotation
- `GET /api/pdf/[id]` - Generate and download PDF

## Configuration

### MongoDB Connection

The app uses MongoDB for data persistence. You can use either:

- **Local MongoDB**: Default connection string in `.env.local`
- **MongoDB Atlas**: Free cloud MongoDB service

### Customization

- **Company Branding**: Update PDF header in `lib/pdf-generator.ts`
- **Default Terms**: Modify default terms in the quotation form
- **Tax Rates**: Set default tax rates in form defaults
- **Styling**: Customize Tailwind classes in components

## Build for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS
- Digital Ocean

## Features Roadmap

- [ ] User authentication and multi-tenancy
- [ ] Email quotations directly to clients
- [ ] Product catalog with saved items
- [ ] Template customization
- [ ] Analytics dashboard
- [ ] Multiple currency support
- [ ] Invoice conversion
- [ ] Payment integration

## License

MIT License - feel free to use for commercial projects

## Support

For issues and questions, please open an issue on GitHub.

---

Built with Next.js, TypeScript, and MongoDB
