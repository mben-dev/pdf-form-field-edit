# PDF Form Field Editor

A web application to bulk rename PDF form fields easily. Built with Next.js and Python (using Vercel Serverless Functions).

## Features

- 📄 Upload PDF files with form fields
- 🔍 Automatically detect and list all form fields
- ✏️ Rename fields individually with inline editing
- 💾 Download the modified PDF with renamed fields
- 🚀 Deployed on Vercel with Python serverless functions

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Python serverless functions (Vercel)
- **PDF Processing**: pdfrw library

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deployment on Vercel

1. Push this code to a GitHub repository
2. Import the project on Vercel
3. Deploy (Vercel will automatically detect the Python functions)

## How it Works

1. Upload a PDF file with form fields
2. The app analyzes the PDF and displays all fields
3. Click the edit icon to rename any field
4. Once you've renamed the fields, download the modified PDF
5. The downloaded PDF preserves all other properties and only changes the field names

## API Endpoints

- `/api/analyze` - Analyzes a PDF and returns all form fields
- `/api/rename` - Renames specified fields and returns the modified PDF

## Notes

- The app preserves Adobe Acrobat form structure
- All processing is done server-side using Python
- No data is stored - everything is processed in memory