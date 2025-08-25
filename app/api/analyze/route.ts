import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup, PDFButton } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pdf } = body
    
    if (!pdf) {
      return NextResponse.json({ 
        error: 'No PDF data provided' 
      }, { status: 400 })
    }
    
    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdf, 'base64')
    
    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    
    // Get the form
    const form = pdfDoc.getForm()
    const fields = form.getFields()
    
    // Extract field information
    const fieldInfo = fields.map(field => {
      let fieldType = 'Unknown'
      
      if (field instanceof PDFTextField) {
        fieldType = 'Text'
      } else if (field instanceof PDFCheckBox) {
        fieldType = 'Checkbox'
      } else if (field instanceof PDFDropdown) {
        fieldType = 'Dropdown'
      } else if (field instanceof PDFRadioGroup) {
        fieldType = 'Radio'
      } else if (field instanceof PDFButton) {
        fieldType = 'Button'
      }
      
      return {
        name: field.getName(),
        type: fieldType,
        original_name: field.getName()
      }
    })
    
    return NextResponse.json({ fields: fieldInfo })
    
  } catch (error: any) {
    console.error('Error analyzing PDF:', error)
    
    return NextResponse.json({ 
      error: 'Failed to analyze PDF. The PDF might not contain form fields or might be corrupted.',
      details: error.message 
    }, { status: 500 })
  }
}