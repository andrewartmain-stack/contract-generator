import { NextRequest, NextResponse } from 'next/server';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Parse request data
    const data = await request.json();

    console.log('Generating cerere incetare for:', data.employee_name);

    // Path to the template file
    const templatePath = path.join(
      process.cwd(),
      'public',
      'templates',
      'cerere_incetare_cim_art_55_b_MXA_WITH_PLACEHOLDERS.docx'
    );

    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      console.error('Template not found at:', templatePath);
      return NextResponse.json(
        {
          error:
            'Template file not found. Please upload cerere_incetare_cim_art_55_b_MXA_WITH_PLACEHOLDERS.docx to public/templates/',
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

    // Prepare template data with all placeholders
    const templateData = {
      // Employee information
      employee_name: data.employee_name || '',
      employee_position: data.employee_position || 'CURIER',

      // Company information
      company_name: data.company_name || '',

      // Termination information
      termination_date: data.termination_date || '',

      // Document date
      document_date: data.document_date || '',

      // Optional director name
      director_name: data.director_name || 'Director',
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
    const safeName = (data.employee_name || 'Cerere_Incetare_CIM')
      .replace(/[^a-zA-Z0-9ăâîșțĂÂÎȘȚ ]/g, '')
      .replace(/\s+/g, '_');

    // Return the document
    return new NextResponse(buffer as BodyInit | null | undefined, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Cerere_Incetare_CIM_${safeName}.docx"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Error generating cerere incetare:', error);

    // Log stack trace for debugging
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }

    return NextResponse.json(
      {
        error: 'Failed to generate cerere incetare',
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
      'cerere_incetare_cim_art_55_b_MXA_WITH_PLACEHOLDERS.docx'
    );
    const exists = fs.existsSync(templatePath);

    if (exists) {
      const stats = fs.statSync(templatePath);
      return NextResponse.json({
        status: 'ready',
        templateName: 'cerere_incetare_cim_art_55_b_MXA_WITH_PLACEHOLDERS.docx',
        templateSize: `${(stats.size / 1024).toFixed(2)} KB`,
        lastModified: stats.mtime,
        message: 'Template found and ready for use',
        note: 'All placeholders are optional - unfilled placeholders will be empty',
        requiredPlaceholders: [
          'employee_name',
          'company_name',
          'termination_date',
          'document_date',
        ],
        allPlaceholders: [
          'employee_name',
          'employee_position',
          'company_name',
          'termination_date',
          'document_date',
        ],
        defaultValues: {
          employee_position: 'CURIER',
        },
        legalReference:
          'Articolul 55 litera b din Codul Muncii - Încetarea contractului de muncă',
      });
    } else {
      return NextResponse.json({
        status: 'missing_template',
        message:
          'Template file not found. Please upload cerere_incetare_cim_art_55_b_MXA_WITH_PLACEHOLDERS.docx to public/templates/',
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
