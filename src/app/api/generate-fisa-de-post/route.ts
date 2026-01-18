import { NextRequest, NextResponse } from 'next/server';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Parse request data
    const data = await request.json();

    console.log('Generating fisa de post for:', data.employee_name);

    // Path to the template file
    const templatePath = path.join(
      process.cwd(),
      'public',
      'templates',
      'Fisa_de_post_curier_WITH_PLACEHOLDERS.docx'
    );

    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      console.error('Template not found at:', templatePath);
      return NextResponse.json(
        {
          error:
            'Template file not found. Please upload Fisa_de_post_curier_WITH_PLACEHOLDERS.docx to public/templates/',
        },
        { status: 500 }
      );
    }

    // Read the template
    const content = fs.readFileSync(templatePath, 'binary');

    // Create PizZip instance
    const zip = new PizZip(content);

    // Initialize docxtemplater
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: '{{',
        end: '}}',
      },
    });

    // Prepare template data with only the 3 required placeholders
    const templateData = {
      // Employee information
      employee_name: data.employee_name || '',

      // Document date
      document_date: data.document_date || '',

      // Company address formatted as required
      sc_cui_address: data.sc_cui_address || '',
    };

    console.log('Template data prepared with placeholders:', templateData);

    // Set the template variables
    doc.setData(templateData);

    // Try to render the document
    try {
      doc.render();
    } catch (error: any) {
      console.error('Template rendering error:', error);

      // Log detailed error information
      if (error.properties && error.properties.errors) {
        error.properties.errors.forEach((err: any) => {
          console.error('Error details:', err);
        });
      }

      return NextResponse.json(
        {
          error: 'Template rendering failed',
          details: error.message || 'Unknown error',
          properties: error.properties,
        },
        { status: 400 }
      );
    }

    // Generate the output
    const buffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    // Create a safe filename
    const safeName = (data.employee_name || 'Fisa_de_Post')
      .replace(/[^a-zA-Z0-9ăâîșțĂÂÎȘȚ ]/g, '')
      .replace(/\s+/g, '_');

    // Return the document
    return new NextResponse(buffer as BodyInit | null | undefined, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Fisa_de_Post_${safeName}.docx"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Error generating fisa de post:', error);

    // Log stack trace for debugging
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }

    return NextResponse.json(
      {
        error: 'Failed to generate fisa de post',
        details: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// GET method to check if template exists
export async function GET() {
  try {
    const templatePath = path.join(
      process.cwd(),
      'public',
      'templates',
      'Fisa_de_post_curier_WITH_PLACEHOLDERS.docx'
    );
    const exists = fs.existsSync(templatePath);

    if (exists) {
      const stats = fs.statSync(templatePath);
      return NextResponse.json({
        status: 'ready',
        templateName: 'Fisa_de_post_curier_WITH_PLACEHOLDERS.docx',
        templateSize: `${(stats.size / 1024).toFixed(2)} KB`,
        lastModified: stats.mtime,
        message: 'Template found and ready for use',
        note: 'All placeholders are optional - unfilled placeholders will be empty',
        placeholders: ['sc_cui_address', 'employee_name', 'document_date'],
        description: 'Fișă de post pentru curier - conține 3 placeholders',
      });
    } else {
      return NextResponse.json({
        status: 'missing_template',
        message:
          'Template file not found. Please upload Fisa_de_post_curier_WITH_PLACEHOLDERS.docx to public/templates/',
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
