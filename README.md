# CoreSync

CoreSync is a web-based raw material and production output transfer monitoring
prototype developed for BF Industries, Inc. It replaces paper-based recording
with searchable transactions, inventory summaries, transfer verification, and
management reports.

## Demo Access

- Email: `admin@coresync.ph`
- Password: `coresync123`

The credentials are for demonstration only. Selectable roles are available
inside the application to demonstrate permission differences.

## Features

- Responsive operations dashboard
- Per-material inventory balances and low-stock alerts
- Raw material receiving and usage transactions
- Output transfer records with document, series, bag, analysis, and tag numbers
- Create, edit, delete, search, and filter workflows
- Transfer verification and printable transfer forms
- Role demonstrations for administrator, inventory, production, and management
- Audit trail for record changes
- CSV operational reports
- Photo, PDF, scanned-form, receipt, and quality-control attachments
- Built-in sample transactions and scanned transfer forms
- BF Industries-inspired visual design and accessible motion

## Technology

- Next.js 16
- React 19
- TypeScript
- CSS Modules
- Vercel deployment

This prototype stores records and uploaded attachments in browser
`localStorage`, allowing it to run without external services. Production use
should migrate records to PostgreSQL, authentication to Supabase Auth, and
attachments to Supabase Storage.

## Run Locally

Install dependencies:

```powershell
npm.cmd install
```

Start development mode:

```powershell
npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000).

For testing from another device on the same network:

```powershell
npm.cmd run build
npm.cmd run serve
```

Open the computer's local IPv4 address, such as
`http://192.168.1.47:3000`. Do not open `0.0.0.0`; it is only the server's
listening address.

## Verification

```powershell
npm.cmd run lint
npm.cmd run build
```

## Deployment

The project is configured for Vercel's standard Next.js deployment. No
environment variables are needed for the current browser-storage prototype.

## Important Note

CoreSync is an academic prototype. Browser-local data, demo authentication, and
client-side roles are not suitable security controls for real company records.
Before production use, add server-side authentication, database authorization,
backups, and permanent audit storage.
