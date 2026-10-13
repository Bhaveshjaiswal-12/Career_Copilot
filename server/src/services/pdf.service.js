import { PDFParse } from 'pdf-parse';
import PDFDocument from 'pdfkit';

/**
 * Extract text content from a PDF buffer.
 */
export async function extractTextFromPDF(buffer) {
  try {
    const parser = new PDFParse({ data: buffer });
    await parser.load();
    const result = await parser.getText();
    const text = (typeof result === 'string' ? result : (result?.text || '')).trim();

    if (!text || text.length < 50) {
      throw new Error('Could not extract meaningful text from the PDF. It may be image-based or empty.');
    }

    return text;
  } catch (err) {
    if (err.message?.includes('meaningful text')) throw err;
    throw new Error(`Failed to parse PDF file: ${err.message}`);
  }
}

/**
 * Generate a clean, ATS-compliant PDF buffer from structured resumeData.
 */
export function generateResumePDF(resumeData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const h = resumeData.header || {};

      // Name & Headline
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#111111').text(h.name || 'Candidate', { align: 'center' });
      if (h.headline) {
        doc.fontSize(10.5).font('Helvetica').fillColor('#333333').text(h.headline, { align: 'center' });
      }

      // Contact details
      const contacts = [h.email, h.phone, h.location, h.linkedin, h.github, h.portfolio].filter(Boolean);
      if (contacts.length > 0) {
        doc.moveDown(0.3);
        doc.fontSize(8.5).font('Helvetica').fillColor('#555555').text(contacts.join('   |   '), { align: 'center' });
      }
      doc.moveDown(0.6);

      const sectionTitle = (title) => {
        doc.moveDown(0.5);
        doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#111111').text(title.toUpperCase());
        doc.strokeColor('#cccccc').lineWidth(0.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown(0.3);
      };

      // Summary
      if (resumeData.summary) {
        sectionTitle('Professional Summary');
        doc.fontSize(9).font('Helvetica').fillColor('#333333').text(resumeData.summary, { lineGap: 2 });
      }

      // Skills
      if (resumeData.skills?.length > 0) {
        sectionTitle('Technical Skills & Core Competencies');
        const skillStr = Array.isArray(resumeData.skills) ? resumeData.skills.join('  •  ') : resumeData.skills;
        doc.fontSize(9).font('Helvetica').fillColor('#333333').text(skillStr, { lineGap: 2 });
      }

      // Experience
      if (resumeData.experience?.length > 0) {
        sectionTitle('Work Experience');
        resumeData.experience.forEach((exp) => {
          doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#111111').text(exp.position || '');
          const sub = [exp.company, exp.location, `${exp.startDate || ''} – ${exp.endDate || 'Present'}`].filter(Boolean).join('  |  ');
          doc.fontSize(8.5).font('Helvetica-Oblique').fillColor('#555555').text(sub);
          if (exp.highlights?.length > 0) {
            exp.highlights.forEach((point) => {
              doc.fontSize(8.5).font('Helvetica').fillColor('#333333').text(`•  ${point}`, { indent: 10, lineGap: 1.5 });
            });
          }
          doc.moveDown(0.35);
        });
      }

      // Projects
      if (resumeData.projects?.length > 0) {
        sectionTitle('Key Projects');
        resumeData.projects.forEach((proj) => {
          doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#111111').text(proj.name || '');
          if (proj.technologies?.length > 0) {
            const tech = Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies;
            doc.fontSize(8.5).font('Helvetica-Oblique').fillColor('#555555').text(`Technologies: ${tech}`);
          }
          if (proj.description) {
            doc.fontSize(8.5).font('Helvetica').fillColor('#333333').text(proj.description);
          }
          if (proj.highlights?.length > 0) {
            proj.highlights.forEach((point) => {
              doc.fontSize(8.5).font('Helvetica').fillColor('#333333').text(`•  ${point}`, { indent: 10, lineGap: 1.5 });
            });
          }
          doc.moveDown(0.3);
        });
      }

      // Education
      if (resumeData.education?.length > 0) {
        sectionTitle('Education');
        resumeData.education.forEach((edu) => {
          doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#111111').text(`${edu.degree || ''} in ${edu.field || ''}`);
          const eduSub = [
            edu.institution,
            edu.startDate && edu.endDate ? `${edu.startDate} – ${edu.endDate}` : '',
            edu.gpa ? `GPA: ${edu.gpa}` : ''
          ].filter(Boolean).join('  |  ');
          doc.fontSize(8.5).font('Helvetica').fillColor('#555555').text(eduSub);
          doc.moveDown(0.3);
        });
      }

      // Certifications
      if (resumeData.certifications?.length > 0) {
        sectionTitle('Certifications');
        resumeData.certifications.forEach((cert) => {
          const certSub = [cert.name, cert.issuer, cert.date].filter(Boolean).join(' — ');
          doc.fontSize(8.5).font('Helvetica').fillColor('#333333').text(`•  ${certSub}`);
        });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
