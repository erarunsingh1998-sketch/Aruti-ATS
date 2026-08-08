// @/lib/generatePdf.js
import { jsPDF } from "jspdf";

export const downloadResumePdf = (resumeData) => {
  if (!resumeData) return;

  // Create A4 PDF (210mm x 297mm)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12; // 12mm margin
  const contentWidth = pageWidth - margin * 2;
  
  let y = margin; // Vertical tracker cursor

  // Helper to check page bounds & add new page if needed
  const checkPageOverflow = (neededHeight) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Set font
  doc.setFont("helvetica", "bold");

  // 1. HEADER
  if (resumeData.basics) {
    const { name, headline, email, phone, location, linkedin, portfolio } = resumeData.basics;

    // Name
    doc.setFontSize(18);
    doc.setTextColor(17, 24, 39); // gray-900
    doc.text(name ? name.toUpperCase() : "", pageWidth / 2, y, { align: "center" });
    y += 6;

    // Headline
    if (headline) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81); // gray-700
      doc.text(headline, pageWidth / 2, y, { align: "center" });
      y += 5;
    }

    // Contact Line
    const contactParts = [email, phone, location, linkedin, portfolio].filter(Boolean);
    if (contactParts.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99); // gray-600
      doc.text(contactParts.join("  •  "), pageWidth / 2, y, { align: "center" });
      y += 6;
    }

    // Divider Line
    doc.setDrawColor(209, 213, 219); // gray-300
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  }

  // Section Heading Helper
  const renderSectionHeading = (title) => {
    checkPageOverflow(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55); // gray-800
    doc.text(title.toUpperCase(), margin, y);
    y += 2;
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
  };

  // 2. PROFESSIONAL SUMMARY
  if (resumeData.basics?.summary) {
    renderSectionHeading("Professional Summary");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(55, 65, 81);

    const splitText = doc.splitTextToSize(resumeData.basics.summary, contentWidth);
    checkPageOverflow(splitText.length * 4);
    doc.text(splitText, margin, y);
    y += splitText.length * 4 + 4;
  }

  // 3. WORK EXPERIENCE
  if (resumeData.experience?.length > 0) {
    renderSectionHeading("Work Experience");

    resumeData.experience.forEach((exp) => {
      checkPageOverflow(15);

      // Role & Company
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(17, 24, 39);
      doc.text(`${exp.role} | ${exp.company}`, margin, y);

      // Dates
      doc.setFont("helvetica", "normal");
      doc.setTextColor(75, 85, 99);
      const dateStr = `${exp.startDate} – ${exp.endDate}`;
      doc.text(dateStr, pageWidth - margin, y, { align: "right" });
      y += 4.5;

      // Bullets
      if (exp.bullets?.length > 0) {
        exp.bullets.forEach((bullet) => {
          const bulletText = doc.splitTextToSize(`•  ${bullet}`, contentWidth - 4);
          checkPageOverflow(bulletText.length * 4);
          doc.text(bulletText, margin + 2, y);
          y += bulletText.length * 3.8;
        });
      }
      y += 3;
    });
  }

  // 4. KEY PROJECTS
  if (resumeData.projects?.length > 0) {
    renderSectionHeading("Key Projects");

    resumeData.projects.forEach((proj) => {
      checkPageOverflow(15);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(17, 24, 39);
      doc.text(proj.name, margin, y);

      if (proj.link) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(75, 85, 99);
        doc.text(proj.link, pageWidth - margin, y, { align: "right" });
      }
      y += 4.5;

      if (proj.description) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(55, 65, 81);
        const descText = doc.splitTextToSize(proj.description, contentWidth);
        checkPageOverflow(descText.length * 4);
        doc.text(descText, margin, y);
        y += descText.length * 3.8;
      }

      if (proj.bullets?.length > 0) {
        proj.bullets.forEach((bullet) => {
          const bulletText = doc.splitTextToSize(`•  ${bullet}`, contentWidth - 4);
          checkPageOverflow(bulletText.length * 4);
          doc.text(bulletText, margin + 2, y);
          y += bulletText.length * 3.8;
        });
      }
      y += 3;
    });
  }

  // 5. EDUCATION
  if (resumeData.education?.length > 0) {
    renderSectionHeading("Education");

    resumeData.education.forEach((edu) => {
      checkPageOverflow(10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(17, 24, 39);
      doc.text(`${edu.degree} — ${edu.school}`, margin, y);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(75, 85, 99);
      doc.text(`${edu.startDate} – ${edu.endDate}`, pageWidth - margin, y, { align: "right" });
      y += 5;
    });
  }

  // 6. SKILLS
  if (resumeData.skills?.length > 0) {
    renderSectionHeading("Skills");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);

    const skillString = resumeData.skills.join("  •  ");
    const splitSkills = doc.splitTextToSize(skillString, contentWidth);
    checkPageOverflow(splitSkills.length * 4);
    doc.text(splitSkills, margin, y);
    y += splitSkills.length * 4 + 2;
  }

  // Save the generated file
  const fileName = `${resumeData.basics?.name ? resumeData.basics.name.replace(/\s+/g, "_") : "Resume"}_CV.pdf`;
  doc.save(fileName);
};