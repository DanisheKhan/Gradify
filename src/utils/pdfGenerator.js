import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generates a clean 1-page PDF from a DOM element (Result Slip).
 */
export const generateSinglePagePDF = async (element, filename = 'result_slip.pdf') => {
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // higher resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating single-page PDF:', error);
    throw error;
  }
};

/**
 * Generates a multi-page PDF from a parent container.
 * Each child element matching the selector will be captured as a separate page.
 */
export const generateMultiPagePDF = async (containerElement, childSelector = '.page-break-after', filename = 'booklet.pdf') => {
  if (!containerElement) return;

  try {
    // Select all pages in the booklet
    const pages = containerElement.querySelectorAll(childSelector);
    if (pages.length === 0) {
      // Fallback: capture entire container as single page if no selector match
      await generateSinglePagePDF(containerElement, filename);
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 297;

    for (let i = 0; i < pages.length; i++) {
      const pageEl = pages[i];
      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error generating multi-page PDF:', error);
    throw error;
  }
};
export default { generateSinglePagePDF, generateMultiPagePDF };
