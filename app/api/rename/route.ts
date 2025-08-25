import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pdf, mappings } = body
    
    if (!pdf || !mappings) {
      return NextResponse.json({ 
        error: 'Missing required parameters: pdf and mappings' 
      }, { status: 400 })
    }
    
    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdf, 'base64')
    
    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    
    // Get the form
    const form = pdfDoc.getForm()
    const fields = form.getFields()
    
    // Unfortunately, pdf-lib doesn't support renaming form fields directly
    // We need to create a warning for the user
    
    // Count how many fields would be renamed
    let wouldRenameCount = 0
    fields.forEach(field => {
      const currentName = field.getName()
      if (mappings[currentName]) {
        wouldRenameCount++
      }
    })
    
    // For now, return the original PDF with a warning
    // In production, you would need a server with Python support
    
    return NextResponse.json({
      success: false,
      message: 'Field renaming is not supported on Vercel deployment. Please use the application locally or deploy to a platform that supports Python.',
      would_rename_count: wouldRenameCount,
      pdf: pdf // Return original PDF
    })
    
  } catch (error: any) {
    console.error('Error processing PDF:', error)
    
    return NextResponse.json({ 
      error: 'Failed to process PDF',
      details: error.message 
    }, { status: 500 })
  }
}