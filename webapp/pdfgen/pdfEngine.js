
sap.ui.define([],
  function () {
    "use strict";
    const currencyOptions = {
      style: 'currency',
      useGrouping: true,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      currency: 'USD'
    };
    const decimalOptions = {
      style: 'decimal',
      useGrouping: true,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    };

    //--------------------------------------------------------------
    // 🧩 COMMON HELPER — Footer + Layout + Page Setup
    //--------------------------------------------------------------
    function applyFooterAndLayout(doc, {
      margins = { top: 45, bottom: 1, left: 40, right: 40 },
      reportName = '',
      reportNameX = 230,
      page = null,
      footerLineStart = 40,
      footerLineEnd = 45,
      footerX = 40,
      pageXOffset = 85,
      font = 'Helvetica',
      includeSpacing = true
    } = {}) {

      // Draw footer separator line
      doc.lineWidth(1)
        .moveTo(footerLineStart, doc.page.height - 28)
        .lineTo(doc.page.width - footerLineEnd, doc.page.height - 28)
        .stroke()
        .fillColor("#00529B")
        .font(font)
        .fontSize(10);

      // Common text spacing config
      const textOptions = includeSpacing
        ? { underline: false, characterSpacing: -0.2, wordSpacing: -0.4 }
        : { underline: false };

      // Footer left section
      doc.text("CentiMark.com", footerX, doc.page.height - 24, {
        ...textOptions,
        link: "http://centimark.com/"
      });

      // Footer middle section
      if (reportName) {
        doc.text(reportName, reportNameX, doc.page.height - 24, textOptions);
      }

      // Footer right section (Page #)
      if (page) {
        doc.text(`Page ${page}`, doc.page.width - pageXOffset, doc.page.height - 24, textOptions);
      }

      // Reset default fill + cursor position
      doc.fillColor("#121E28");
      doc.x = margins.left + 5;
      doc.y = margins.top;
    }

    //--------------------------------------------------------------
    // 🧾 CREATE DOCUMENT
    //--------------------------------------------------------------
    function niceDocument(logo, options = {}) {
      const {
        paperSize = 'LETTER',
        reportName = 'Untitled Report',
        reportNameX = 230,
        bType = 'window',
        headerFn = () => { },
        enableRoundedImage = false,
        page = 1,
        resolve
      } = options;

      const doc = new PDFDocument({
        size: paperSize,
        margins: { top: 45, bottom: 1, left: 40, right: 40 }
      });

      // Optional helper for rounded images
      if (enableRoundedImage) {
        PDFDocument.prototype.roundedImage = function (imgSrc, x, y, width, height, radius) {
          this.save();
          this.roundedRect(x, y, width, height, radius).clip();
          this.image(imgSrc, x, y, { width, height });
          this.restore();
          return this;
        };
      }

      // 🟦 Apply footer + layout (shared)
      applyFooterAndLayout(doc, {
        reportName,
        reportNameX,
        page
      });

      const stream = doc.pipe(blobStream());

      // Call header renderer if provided
      if (typeof headerFn === "function") headerFn(doc, logo);

      // Finalize the PDF
      doc.end();

      // --- Stream output handler ---
      stream.on('finish', function () {
        const blob = stream.toBlob('application/pdf');
        const url = stream.toBlobURL('application/pdf');

        if (bType === 'binary') {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = function () {
            const base64data = reader.result;
            if (resolve) resolve(atob(base64data.split('base64,')[1]));
          };
        } else if (bType === 'blobURL') {
          if (resolve) resolve(url);
        } else {
          // Default open in new tab
          window.open(url, '_blank');
        }
      });
    }

    //--------------------------------------------------------------
    // ➕ ADD PAGE (uses same helper)
    //--------------------------------------------------------------
    function addPageGeneric(doc, options = {}) {
      const {
        paperSize = 'LETTER',
        margins = { top: 45, bottom: 1, left: 40, right: 40 },
        reportName = '',
        reportNameX = 230,
        page = null,
        checkSpace = null,
      } = options;

      // Check available space
      if ((!checkSpace) || (doc.page.maxY() <= doc.y + checkSpace)) {
        doc.addPage({ size: paperSize, margins });

        // Apply shared footer and layout
        applyFooterAndLayout(doc, {
          reportName,
          reportNameX,
          page,
          margins
        });

        return true;
      }

      return false;
    }

    return {
      pdfPM: function (jsonData, bType = 'download', paperSize = 'LETTER') {
        var that = this;
        return new Promise(function (resolve, reject) {
          // resolve();
          if (!jsonData) {
            reject('Invalid Data');
          }
          var page = 1,
            reportName = 'Preventative Maintenance Report';
          jsonData = JSON.parse(JSON.stringify(jsonData));

          let header = (doc, logo) => {
            let xPoint = doc.page.margins.left;
            let yPoint = doc.page.margins.top;
            var xPointH = 40,
              yPointH = 110,
              xPointCol1 = 40,
              yPointCol1 = 125,
              xPointCol2 = 282,
              yPointCol2 = 125;
            that.createFirstPageInfo(doc, jsonData, logo, reportName, xPoint, yPoint, xPointH, yPointH, xPointCol1, yPointCol1, xPointCol2, yPointCol2);

            addPage(doc, page += 1);

            const borderBlue = "#00529B";
            const borderOrange = "#F4A20B";
            const textDark = "#121E28";
            const fullWidth = doc.page.width - 90;
            //--------------------------------------------------------------
            // 📄 Report Summary Header
            //--------------------------------------------------------------
            let rectX = 45;
            let rectY = 45;

            // Draw "Report Summary" box border only
            doc.lineJoin("round")
              .lineWidth(3)
              .strokeColor("#00529B")
              .rect(xPointH, rectY - 25, fullWidth, 35)
              .stroke();

            doc.fontSize(18)
              .font("Helvetica-Bold")
              .fillColor("#00529B")
              .text("Report Summary", rectX, rectY - 15, {
                width: doc.page.width - 100,
                align: "left",
                characterSpacing: -0.2,
                wordSpacing: -0.4
              });

            //--------------------------------------------------------------
            // 🏗️ BUILDING SECTION SUMMARY 
            //--------------------------------------------------------------
            (jsonData.building_section_summary || []).forEach((building, bIndex) => {

              //--------------------------------------------------------------
              // Helper: Draw header bar (blue/orange)
              //--------------------------------------------------------------
              const drawHeader = (color, title, textY, prefix = "") => {
                doc.lineJoin("round")
                  .lineWidth(3)
                  .strokeColor(color)
                  .rect(xPointH, textY - 20, doc.page.width - 90, 25)
                  .fillAndStroke(color, color);

                doc.fontSize(color === "#00529B" ? 14 : 13)
                  .font("Helvetica-Bold")
                  .fillColor("white")
                  .text(`${prefix}${title}`, rectX, textY - 12, {
                    width: doc.page.width - 100,
                    align: "left",
                    characterSpacing: -0.2,
                    wordSpacing: -0.4
                  });
              };

              //--------------------------------------------------------------
              // Helper: Draw table-style row (label/value pair)
              //--------------------------------------------------------------
              const drawSummaryRow = (label, value) => {
                const tableX = xPointH;
                const tableWidth = doc.page.width - 90;
                const colWidths = [tableWidth * 0.6, tableWidth * 0.4];
                const rowHeight = 22;

                doc.lineJoin("round")
                  .lineWidth(3)
                  .strokeColor("#00529B")
                  .rect(tableX, rectY - 5, tableWidth, rowHeight)
                  .stroke();

                // Vertical divider
                doc.lineJoin("round")
                  .lineWidth(3)
                  .strokeColor("#00529B")
                  .rect(tableX + colWidths[0], rectY - 5, 0.5, rowHeight)
                  .stroke();

                // Text
                doc.font("Helvetica")
                  .fontSize(10)
                  .fillColor("#121E28")
                  .text(label, rectX, rectY + 2, {
                    width: colWidths[0] - 12,
                    align: "left",
                    characterSpacing: -0.2,
                    wordSpacing: -0.4
                  })
                  .text(value || "", tableX + colWidths[0] + 10, rectY + 2, {
                    width: colWidths[1] - 12,
                    align: "center",
                    characterSpacing: -0.2,
                    wordSpacing: -0.4
                  });

                rectY += rowHeight;
              };

              //--------------------------------------------------------------
              // 🔵 BUILDING HEADER BAR
              //--------------------------------------------------------------
              rectY += 35;
              drawHeader("#00529B", building.building_name, rectY, "Building: ");

              rectY += 15;
              drawSummaryRow("Building Inspections", `${building.building_inspection || "0"}`);
              rectY -= 5;

              //--------------------------------------------------------------
              // 🟧 SECTIONS SUMMARY
              //--------------------------------------------------------------
              (building.sections_summary || []).forEach((section) => {
                rectY += 25;
                drawHeader("#F4A20B", section.section_name, rectY, "Section: ");
                rectY += 15;

                drawSummaryRow("Section Inspections", `${section.section_inspection || "0"}`);
                drawSummaryRow("Maintenance Activities", `${section.maintenance_activities || "0"}`);

                // Include recommended work if available
                if (section.recommended_work) {
                  drawSummaryRow("Recommended Work", `${section.recommended_work || "0"}`);
                }

                rectY -= 5;
              });

              rectY += 10; // spacing after building
            });

            //--------------------------------------------------------------
            // 🏗️ INITIAL SETUP
            //--------------------------------------------------------------
            rectX = 45;  // Left margin for all boxes and text
            rectY = 45;  // Starting Y position
            addPage(doc, page += 1); // Create the first page

            //--------------------------------------------------------------
            // 🏢 LOOP THROUGH EACH BUILDING ENTRY
            //--------------------------------------------------------------
            jsonData.building_summary.forEach((building) => {
              // ────────────────────────────────────────────────────────────────
              // 🧩 Local helpers (non-global)
              // ────────────────────────────────────────────────────────────────
              const drawRect = (color, x, y, w, h = 25, lw = 3) => {
                doc.lineJoin("round").lineWidth(lw).strokeColor(color).rect(x, y, w, h).stroke();
              };

              const drawText = (text, x, y, opts = {}) => {
                doc.font(opts.bold ? "Helvetica-Bold" : "Helvetica")
                  .fontSize(opts.size || 10)
                  .fillColor(opts.color || "#121E28")
                  .text(text, x, y, {
                    width: opts.width || 200,
                    align: opts.align || "left",
                    characterSpacing: -0.2,
                    wordSpacing: -0.4,
                    link: opts.link
                  });
              };

              const drawImage = (img, x, y, w = 282, h = 212, radius = 4, commentText = "This is a sample photo comment.") => {
                if (!img) return;
                doc.save();
                doc.roundedRect(x, y, w, h, radius).clip();
                doc.image(`data:image/jpg;base64,${img}`, x, y, { width: w, height: h });
                doc.restore();
                drawText(commentText, x, y + h + 6, { size: 9, width: w });
              };

              // ────────────────────────────────────────────────────────────────
              // 📄 PAGE CHECKER
              // ────────────────────────────────────────────────────────────────
              if (addPage(doc, page += 1, 270)) rectY = doc.y; else page -= 1;

              // ────────────────────────────────────────────────────────────────
              // 🏠 BUILDING HEADER
              // ────────────────────────────────────────────────────────────────
              drawRect("#00529B", xPointH, (rectY += 27) - 25, doc.page.width - 90);
              drawText(`Building: ${building.building_name}`, rectX, rectY - 17, {
                bold: true, size: 14, color: "#00529B", width: doc.page.width - 120
              });

              // 🔗 Building Aerial Photo Button
              if (building.aerial_photo_url) {
                const [btnWidth, btnHeight, radius] = [180, 15, 6];
                const btnX = doc.page.width - btnWidth - 54, btnY = rectY - 20;
                doc.save();
                doc.roundedRect(btnX, btnY, btnWidth, btnHeight, radius).fill("#00529B");
                doc.restore();
                drawText("Building Aerial View Photo", btnX, btnY + 4, {
                  bold: true, size: 10, color: "white", width: btnWidth, align: "center", link: building.aerial_photo_url
                });
              }

              // ────────────────────────────────────────────────────────────────
              // 🟧 BUILDING COMMENTS
              // ────────────────────────────────────────────────────────────────
              drawRect("#F4A20B", xPointH, (rectY += 25) - 20, doc.page.width - 90);
              drawText("Comments", rectX, rectY - 13, { bold: true, size: 14, color: "#F4A20B" });
              drawText(building.building_comments || "No comments provided.", rectX, rectY + 20, {
                size: 10, width: doc.page.width - 90
              });

              // ────────────────────────────────────────────────────────────────
              // 🏗️ BUILDING PHOTO
              // ────────────────────────────────────────────────────────────────
              const photoHeaderY = doc.y + 10;
              drawRect("#F4A20B", xPointH, photoHeaderY, doc.page.width - 90);
              drawText("Building Photo", rectX, photoHeaderY + 8, { bold: true, size: 14, color: "#F4A20B" });
              if (building.building_photo) {
                drawImage(building.building_photo, xPointH, photoHeaderY + 35, 282, 212, 8);
                rectY = photoHeaderY + 35 + 212 + 15;
              }

              rectX = 45;  // Left margin for all boxes and text
              rectY = 45;  // Starting Y position
              addPage(doc, page += 1); // Create the first page

              //--------------------------------------------------------------
              // 🧱 Common Helpers
              //--------------------------------------------------------------
              const BORDER_BLUE = "#00529B";
              const BORDER_GREEN = "#5AA755";
              const BORDER_RED = "#C4222F";
              const TEXT_DARK = "#121E28";

              const drawRoundedRect = (x, y, width, height, radius = 4, color = BORDER_BLUE) => {
                doc.lineJoin("round").lineWidth(3).strokeColor(color);
                doc.roundedRect(x, y, width, height, radius).stroke();
              };

              const drawHeaderBar = (title, y) => {
                const fullWidth = doc.page.width - 90;
                drawRoundedRect(xPointH, y - 20, fullWidth, 25, 3, BORDER_BLUE);
                doc.font("Helvetica-Bold").fontSize(14).fillColor(BORDER_BLUE)
                  .text(title, rectX, y - 13, {
                    width: fullWidth, align: "left", characterSpacing: -0.2,
                    wordSpacing: -0.4
                  });
              };

              const drawTableHeader = (headers, colWidths, y) => {
                const fullWidth = doc.page.width - 90;
                const tableX = xPointH;

                // Blue background header
                doc.lineJoin("round").lineWidth(3).strokeColor(BORDER_BLUE)
                  .rect(tableX, y, fullWidth, 25)
                  .fillAndStroke(BORDER_BLUE, BORDER_BLUE);

                doc.font("Helvetica-Bold").fontSize(12).fillColor("white");

                let x = rectX;
                headers.forEach((h, i) => {
                  doc.text(h, x, y + 6, {
                    width: colWidths[i],
                    align: h === "Rating" ? "center" : "left",
                    characterSpacing: -0.2,
                    wordSpacing: -0.4
                  });
                  x += colWidths[i];
                });
              };

              const drawTableRow = (values, colWidths, y, opts = {}) => {
                const { withRating = false } = opts;
                const fullWidth = doc.page.width - 90;
                const tableX = xPointH;
                const rowHeight = 22;

                // Outline row
                doc.lineWidth(3).strokeColor(BORDER_BLUE).rect(tableX, y, fullWidth, rowHeight).stroke();

                // Internal vertical lines
                let x = rectX;
                for (let i = 0; i < colWidths.length - 1; i++) {
                  x += colWidths[i];
                  doc.moveTo(x, y).lineTo(x, y + rowHeight).stroke();
                }

                doc.font("Helvetica").fontSize(10).fillColor(TEXT_DARK);

                if (withRating) {
                  const [rating, comp, defect] = values;
                  const ratingColor = rating === "RN" ? BORDER_RED : BORDER_GREEN;
                  const symbol = rating === "RN" ? "RN" : "ND";

                  // Rating circle
                  doc.circle(tableX + colWidths[0] / 2, y + rowHeight / 2, 7)
                    .fillAndStroke(ratingColor, ratingColor);
                  doc.font("Helvetica-Bold").fontSize(10).fillColor("white")
                    .text(symbol, tableX, y + 7, {
                      width: colWidths[0], 
                      align: "center", 
                      characterSpacing: -0.2,
                      wordSpacing: -0.4
                    });

                  // Text columns
                  doc.font("Helvetica").fillColor(TEXT_DARK);
                  doc.text(comp || "", tableX + colWidths[0] + 10, y + 7, {
                    width: colWidths[1] - 20, 
                    align: "left",
                    characterSpacing: -0.2,
                    wordSpacing: -0.4
                  });
                  doc.text(defect || "", tableX + colWidths[0] + colWidths[1] + 10, y + 7, {
                    width: colWidths[2] - 20, 
                    align: "left",
                    characterSpacing: -0.2,
                    wordSpacing: -0.4
                  });
                } else {
                  let textX = rectX;
                  values.forEach((v, i) => {
                    doc.text(v || "", textX, y + 7, {
                      width: colWidths[i] - 20,
                      align: "left",
                      characterSpacing: -0.2,
                      wordSpacing: -0.4
                    });
                    textX += colWidths[i] + 5;
                  });
                }

                return rowHeight;
              };

              //--------------------------------------------------------------
              // 🏗️ Building Specification Matrix
              //--------------------------------------------------------------
              if (building.specification_matrix?.length) {
                drawHeaderBar("Building Specification Matrix", rectY);
                rectY += 10;

                const specCols = [
                  (doc.page.width - 90) * 0.5,
                  (doc.page.width - 90) * 0.5
                ];

                drawTableHeader(["Component", "Type"], specCols, rectY);
                rectY += 25;

                building.specification_matrix.forEach(row => {
                  rectY += drawTableRow([row.component, row.type], specCols, rectY);
                });
              }

              //--------------------------------------------------------------
              // 🧱 Building Inspection Matrix
              //--------------------------------------------------------------
              if (building.inspection_matrix?.length) {
                rectY += 45;
                drawHeaderBar("Building Inspection Matrix", rectY);
                rectY += 10;

                const inspCols = [
                  (doc.page.width - 90) * 0.15,
                  (doc.page.width - 90) * 0.45,
                  (doc.page.width - 90) * 0.40
                ];

                drawTableHeader(["Rating", "Component", "Defect"], inspCols, rectY);
                rectY += 25;

                building.inspection_matrix.forEach(row => {
                  rectY += drawTableRow([row.rating, row.component, row.defect], inspCols, rectY, { withRating: true });
                });

                // 🟢🔴 Legend (bottom)
                rectY += 25;
                const legendY = rectY;
                const drawLegend = (x, color, text, symbol) => {
                  doc.circle(x, legendY + 6, 7).fillAndStroke(color, color);
                  doc.font("Helvetica-Bold").fontSize(10).fillColor("white")
                    .text(symbol, x - 4, legendY - 10, {
                      width: 8, align: "center", characterSpacing: -0.2,
                      wordSpacing: -0.4
                    });
                  doc.font("Helvetica").fontSize(10).fillColor(TEXT_DARK)
                    .text(text, x + 12, legendY + 2, {
                      characterSpacing: -0.2,
                      wordSpacing: -0.4
                    });
                };

                drawLegend(120, BORDER_GREEN, "No defects", "ND");
                drawLegend(360, BORDER_RED, "Repair needed", "RN");
                rectY = legendY + 25;
              }

              if (building.building_specifications) {
                addPage(doc, page += 1);
                rectX = doc.x;
                rectY = doc.y;
                doc.rect(rectX, (rectY += 52) - 50, doc.page.width - 90, 50)
                  .fill('#00529B')
                  .fillColor("white")
                  .fontSize(14)
                  .font("Helvetica-Bold");
                doc.y = rectY - 42;
                doc.x = rectX;
                doc.text(`Building Specifications For:`, {
                  width: doc.page.width - 90,
                  align: "center"
                });
                doc.y = rectY - 20;
                doc.text(`${building.building_name || ""}`, {
                  width: doc.page.width - 90,
                  align: "center"
                });
                (building.building_specifications || []).forEach(building_specifications => {
                  if (addPage(doc, page += 1, 270)) {
                    rectY = doc.y;
                  } else {
                    page -= 1;
                  }
                  doc.rect(rectX, (rectY += 27) - 25, doc.page.width - 90, 25)
                    .fill('#F4A20B')
                    .fillColor("white")
                    .fontSize(14)
                    .font("Helvetica-Bold");

                  doc.text(`INSPECTION PHOTO`, rectX + 65, rectY - 17)
                    .text(`DESCRIPTION`, doc.page.width - 220, rectY - 17);
                  rectY += 182;
                  if (building_specifications.inspection_photo) {
                    doc.image(`data:image/jpg;base64,${building_specifications.inspection_photo}`, rectX, rectY - 180, { width: 240, height: 180 });
                  }
                  if (building_specifications.description) {
                    doc.fillColor("#121E28")
                      .fontSize(10)
                      .text(`${building_specifications.description || ""}`, doc.page.width - 285, rectY - 160, { width: 240, height: 180, underline: true });
                  }
                  rectY = doc.y > rectY ? doc.y : rectY;
                  doc.x = rectX;
                  doc.y = rectY;
                });
              }

              if (building.section_details) {
                (building.section_details).forEach(section_details => {
                  if (addPage(doc, page += 1, 270)) {
                    rectY = doc.y;
                  } else {
                    page -= 1;
                    rectY += 20;
                  }
                  doc.rect(rectX, (rectY += 27) - 25, doc.page.width - 90, 25)
                    .fill('#00529B')
                    .fillColor("white")
                    .fontSize(14)
                    .font("Helvetica-Bold");
                  doc.y = rectY - 17;
                  doc.x = rectX;
                  doc.text(`SECTION: ${section_details.name || ""}`, {
                    width: doc.page.width - 90,
                    align: "center"
                  })
                    .rect(rectX, (rectY += 25) - 25, doc.page.width - 90, 25)
                    .fill('#F4A20B')
                    .fillColor("white")
                    .fontSize(14)
                    .font("Helvetica-Bold")
                    .text(`SECTION OVERVIEW PHOTO`, rectX + 60, rectY - 17)
                    .text(`COMMENTS`, rectX + 360, rectY - 17);;
                  if (section_details.section_overview_photo) {
                    doc.image(`data:image/jpg;base64,${section_details.section_overview_photo}`, rectX, (rectY += 182) - 180, { width: 300, height: 180 });
                  }
                  if (section_details.comments) {
                    doc.y = section_details.section_overview_photo ? rectY - 90 : (rectY += 45) - 25;
                    doc.x = rectX + 330;
                    doc.fillColor("#121E28")
                      .fontSize(11)
                      .font("Helvetica")
                      .text(`${section_details.comments}`, {
                        width: doc.page.width - 390,
                        align: "left"
                      });
                    doc.x = rectX;
                    rectY = doc.y > rectY ? doc.y : rectY;
                  }
                  if (section_details.specification_matrix) {
                    doc.x = rectX;
                    doc.y = rectY += 20;
                    if (addPage(doc, page += 1, 270)) {
                      rectY = doc.y;
                    } else {
                      page -= 1;
                    }
                    doc.fontSize(14)
                      .fillColor("#121E28")
                      .font("Helvetica-Bold")
                      .text("SECTION SPECIFICATION MATRIX", {
                        width: doc.page.width - 90,
                        align: "center"
                      });
                    doc.x = rectX;
                    rectY = doc.y;
                    doc.rect(rectX, (rectY += 27) - 25, doc.page.width - 90, 25)
                      .fill('#00529B')
                      .fillColor("white")
                      .fontSize(14)
                      .font("Helvetica-Bold");
                    doc.y = rectY - 17;
                    doc.text(`COMPONENT`, {
                      width: (doc.page.width - 45) / 2,
                      align: "center"
                    });
                    doc.x = doc.page.width / 2;
                    doc.y = rectY - 17;
                    doc.text(`TYPE`, {
                      width: (doc.page.width - 45) / 2,
                      align: "center"
                    });
                    doc.fillColor("#121E28")
                      .font('Helvetica')
                      .fontSize(10);
                    section_details.specification_matrix.forEach(specification_matrix => {
                      if (addPage(doc, page += 1, 65)) {
                        rectY = doc.y;
                      } else {
                        page -= 1;
                      }
                      doc.lineWidth(1)
                        .moveTo(rectX, doc.y)
                        .lineTo(doc.page.width - 45, doc.y)
                        .stroke();
                      rectY = doc.y + 12;
                      doc.text(`${specification_matrix.component || ""}`, rectX + 20, rectY, {
                        width: (doc.page.width - 45) / 2,
                        align: 'left'
                      });
                      doc.text(`${specification_matrix.type || ""}`, (doc.page.width / 2) + 20, rectY, {
                        width: (doc.page.width - 45) / 2,
                        align: 'left'
                      });
                      doc.lineWidth(1)
                        .moveTo(rectX, rectY - 12)
                        .lineTo(rectX, doc.y)
                        .moveTo(doc.page.width / 2, rectY - 12)
                        .lineTo(doc.page.width / 2, doc.y)
                        .moveTo(doc.page.width - 45, rectY - 12)
                        .lineTo(doc.page.width - 45, doc.y)
                        .stroke();
                      doc.lineWidth(1)
                        .moveTo(rectX, doc.y)
                        .lineTo(doc.page.width - 45, doc.y)
                        .stroke();
                      rectY = doc.y;
                    });
                  }
                  if (section_details.maintenance_activity_matrix) {
                    doc.x = rectX;
                    doc.y = rectY += 20;
                    if (addPage(doc, page += 1, 270)) {
                      rectY = doc.y;
                    } else {
                      page -= 1;
                    }
                    doc.fontSize(14)
                      .fillColor("#121E28")
                      .font("Helvetica-Bold")
                      .text("MAINTENANCE ACTIVITY MATRIX", {
                        width: doc.page.width - 90,
                        align: "center"
                      });
                    doc.x = rectX;
                    rectY = doc.y;
                    doc.rect(rectX, (rectY += 27) - 25, doc.page.width - 90, 25)
                      .fill('#00529B')
                      .fillColor("white")
                      .fontSize(14)
                      .font("Helvetica-Bold");

                    doc.y = rectY - 17;
                    doc.text(`RATING`, {
                      width: (doc.page.width) * 1 / 5,
                      align: "center"
                    });

                    doc.x = doc.page.width * 1 / 5;
                    doc.y = rectY - 17;
                    doc.text(`COMPONENT`, {
                      width: (doc.page.width - 45) * 2 / 5,
                      align: "center"
                    });

                    doc.x = (doc.page.width) * 3 / 5;
                    doc.y = rectY - 17;
                    doc.text(`DEFECT`, {
                      width: (doc.page.width - 45) * 2 / 5,
                      align: "center"
                    });
                    doc.fillColor("#121E28")
                      .font('Helvetica')
                      .fontSize(10);
                    section_details.maintenance_activity_matrix.forEach(maintenance_activity_matrix => {
                      if (addPage(doc, page += 1, 90)) {
                        rectY = doc.y;
                      } else {
                        page -= 1;
                      }
                      doc.lineWidth(1)
                        .moveTo(rectX, doc.y)
                        .lineTo(doc.page.width - 65, doc.y)
                        .stroke();
                      rectY = doc.y + 12;
                      doc.text(`${maintenance_activity_matrix.component || ""}`, (doc.page.width * 1 / 5) + 70, rectY, {
                        width: doc.page.width * 2 / 5,
                        align: 'left'
                      });
                      doc.text(`${maintenance_activity_matrix.defect || ""}`, (doc.page.width * 3 / 5) + 20, rectY, {
                        width: doc.page.width * 2 / 5,
                        align: 'left'
                      });
                      doc.lineWidth(doc.y - rectY + 12)
                        .lineCap('butt')
                        .moveTo(rectX, rectY)
                        .lineTo((doc.page.width * 1 / 5) + 40, rectY)
                        .fillAndStroke(`${maintenance_activity_matrix.rating === "RN" ? "#C4222F" : "#5AA755"}`, `${maintenance_activity_matrix.rating === "RN" ? "#C4222F" : "#5AA755"}`)
                        .lineWidth(1)
                        .fillAndStroke("#121E28", "#121E28")
                        .fillColor("white")
                        .font("Helvetica-Bold")
                        .text(`${maintenance_activity_matrix.rating === "RN" ? "X" : "+"}`, rectX, rectY, {
                          width: doc.page.width * 1 / 5,
                          align: 'center'
                        })
                        .font("Helvetica")
                        .fillColor("#121E28");
                      doc.lineWidth(1)
                        .moveTo(rectX, rectY - 12)
                        .lineTo(rectX, doc.y)
                        .moveTo((doc.page.width * 1 / 5) + 40, rectY - 12)
                        .lineTo((doc.page.width * 1 / 5) + 40, doc.y)
                        .moveTo(doc.page.width * 3 / 5, rectY - 12)
                        .lineTo(doc.page.width * 3 / 5, doc.y)
                        .moveTo(doc.page.width - 45, rectY - 12)
                        .lineTo(doc.page.width - 45, doc.y)
                        .stroke();
                      doc.lineWidth(1)
                        .moveTo(rectX, doc.y)
                        .lineTo(doc.page.width - 45, doc.y)
                        .stroke();
                      rectY = doc.y;
                    });
                    rectY += 20
                    doc.lineWidth(20)
                      .lineCap('butt')
                      .moveTo(100, rectY)
                      .lineTo(130, rectY)
                      .fillAndStroke("#5AA755", "#5AA755")
                      .moveTo(340, rectY)
                      .lineTo(370, rectY)
                      .fillAndStroke("#C4222F", "#C4222F")
                      .fillColor("#121E28")
                      .fontSize(14)
                      .font("Helvetica-Bold")
                      .fillColor("white")
                      .text("+", 112, rectY - 5)
                      .fillColor("#121E28")
                      .fontSize(12)
                      .text("    Maintenance - No Defects", 120, rectY - 5)
                      .fillColor("white")
                      .fontSize(14)
                      .text("x", 352, rectY - 5)
                      .fillColor("#121E28")
                      .fontSize(12)
                      .text("    Maintenance - Repair Needed", 360, rectY - 5)
                      .font("Helvetica");
                    doc.x = rectX;
                  }
                  if (section_details.inspection_matrix) {
                    doc.x = rectX;
                    doc.y = rectY += 30;
                    if (addPage(doc, page += 1, 270)) {
                      rectY = doc.y;
                    } else {
                      page -= 1;
                    }
                    doc.fontSize(14)
                      .fillColor("#121E28")
                      .font("Helvetica-Bold")
                      .text("SECTION INSPECTION MATRIX", {
                        width: doc.page.width - 90,
                        align: "center"
                      });
                    doc.x = rectX;
                    rectY = doc.y;
                    doc.rect(rectX, (rectY += 27) - 25, doc.page.width - 90, 25)
                      .fill('#00529B')
                      .fillColor("white")
                      .fontSize(14)
                      .font("Helvetica-Bold");

                    doc.y = rectY - 17;
                    doc.text(`RATING`, {
                      width: (doc.page.width) * 1 / 5,
                      align: "center"
                    });

                    doc.x = doc.page.width * 1 / 5;
                    doc.y = rectY - 17;
                    doc.text(`COMPONENT`, {
                      width: (doc.page.width - 45) * 2 / 5,
                      align: "center"
                    });

                    doc.x = (doc.page.width) * 3 / 5;
                    doc.y = rectY - 17;
                    doc.text(`DEFECT`, {
                      width: (doc.page.width - 45) * 2 / 5,
                      align: "center"
                    });
                    doc.fillColor("#121E28")
                      .font('Helvetica')
                      .fontSize(10);
                    section_details.inspection_matrix.forEach(inspection_matrix => {
                      if (addPage(doc, page += 1, 90)) {
                        rectY = doc.y;
                      } else {
                        page -= 1;
                      }
                      doc.lineWidth(1)
                        .moveTo(rectX, doc.y)
                        .lineTo(doc.page.width - 65, doc.y)
                        .stroke();
                      rectY = doc.y + 12;
                      doc.text(`${inspection_matrix.component || ""}`, (doc.page.width * 1 / 5) + 70, rectY, {
                        width: doc.page.width * 2 / 5,
                        align: 'left'
                      });
                      doc.text(`${inspection_matrix.defect || ""}`, (doc.page.width * 3 / 5) + 20, rectY, {
                        width: doc.page.width * 2 / 5,
                        align: 'left'
                      });
                      doc.lineWidth(doc.y - rectY + 12)
                        .lineCap('butt')
                        .moveTo(rectX, rectY)
                        .lineTo((doc.page.width * 1 / 5) + 40, rectY)
                        .fillAndStroke(`${inspection_matrix.rating === "RN" ? "#C4222F" : "#5AA755"}`, `${inspection_matrix.rating === "RN" ? "#C4222F" : "#5AA755"}`)
                        .lineWidth(1)
                        .fillAndStroke("#121E28", "#121E28")
                        .fillColor('white')
                        .font("Helvetica-Bold")
                        .text(`${inspection_matrix.rating === "RN" ? "X" : "+"}`, rectX, rectY, {
                          width: doc.page.width * 1 / 5,
                          align: 'center'
                        })
                        .font("Helvetica")
                        .fillColor("#121E28");
                      doc.lineWidth(1)
                        .moveTo(rectX, rectY - 12)
                        .lineTo(rectX, doc.y)
                        .moveTo((doc.page.width * 1 / 5) + 40, rectY - 12)
                        .lineTo((doc.page.width * 1 / 5) + 40, doc.y)
                        .moveTo(doc.page.width * 3 / 5, rectY - 12)
                        .lineTo(doc.page.width * 3 / 5, doc.y)
                        .moveTo(doc.page.width - 45, rectY - 12)
                        .lineTo(doc.page.width - 45, doc.y)
                        .stroke();
                      doc.lineWidth(1)
                        .moveTo(rectX, doc.y)
                        .lineTo(doc.page.width - 45, doc.y)
                        .stroke();
                      rectY = doc.y;
                    });
                    rectY += 20
                    doc.lineWidth(20)
                      .lineCap('butt')
                      .moveTo(100, rectY)
                      .lineTo(130, rectY)
                      .fillAndStroke("#5AA755", "#5AA755")
                      .moveTo(340, rectY)
                      .lineTo(370, rectY)
                      .fillAndStroke("#C4222F", "#C4222F")
                      .fillColor("#121E28")
                      .fontSize(14)
                      .font("Helvetica-Bold")
                      .fillColor("white")
                      .text("+", 112, rectY - 5)
                      .fillColor("#121E28")
                      .fontSize(12)
                      .text("    Inspection - No Defects", 120, rectY - 5)
                      .fillColor("white")
                      .fontSize(14)
                      .text("x", 352, rectY - 5)
                      .fillColor("#121E28")
                      .fontSize(12)
                      .text("    Inspection - Repair Needed", 360, rectY - 5)
                      .font("Helvetica");
                    doc.x = rectX;
                  }
                  if (section_details.section_inspections) {
                    if (addPage(doc, page += 1, 570)) {
                      rectY = doc.y;
                    } else {
                      page -= 1;
                    }
                    doc.rect(rectX, (rectY += 52) - 50, doc.page.width - 90, 50)
                      .fill('#00529B')
                      .fillColor("white")
                      .fontSize(14)
                      .font("Helvetica-Bold")
                      .text(`INSPECTIONS FOR SECTION:`, rectX, rectY - 42, {
                        align: "center",
                        width: doc.page.width - 90
                      })
                      .text(`${section_details.name || ""}`, rectX, rectY - 20, {
                        align: "center",
                        width: doc.page.width - 90
                      });
                    (section_details.section_inspections || []).forEach(section_inspections => {
                      if (addPage(doc, page += 1, 270)) {
                        rectY = doc.y;
                      } else {
                        page -= 1;
                      }
                      doc.rect(rectX, (rectY += 25) - 25, doc.page.width - 90, 25)
                        .fill('#F4A20B')
                        .fillColor("white")
                        .fontSize(14)
                        .font("Helvetica-Bold")
                        .text(`INSPECTION PHOTO`, rectX + 65, rectY - 17)
                        .text(`DESCRIPTION`, doc.page.width - 220, rectY - 17)
                        .font("Helvetica");
                      if (section_inspections.inspection_photo) {
                        doc.image(`data:image/jpeg;base64,${section_inspections.inspection_photo}`, rectX, (rectY += 182) - 180, { width: 240, height: 180 });
                      }
                      doc.fillColor("#121E28")
                        .fontSize(10)
                        .font("Helvetica-Bold")
                        .text(`${section_inspections.description || ""}`, doc.page.width - 285, section_inspections.inspection_photo ? rectY - 160 : rectY + 20, { width: 240, height: 180, underline: true })
                        .font("Helvetica")
                        .text(`${section_inspections.description_text || ""}`, doc.page.width - 275, doc.y, { width: 230, height: 180 })
                        .font("Helvetica-Bold")
                        .text(`${section_inspections.comments ? "Comments" : ""}`, doc.page.width - 285, doc.y + 4, { width: 240, height: 180, underline: true })
                        .font("Helvetica")
                        .text(`${section_inspections.comments || ""}`, doc.page.width - 275, doc.y + 4, { width: 230, height: 180 });
                      rectY = doc.y > rectY ? doc.y + 2 : rectY + 2;
                    });
                  }
                  if (section_details.section_maint_act_defects) {
                    if (addPage(doc, page += 1, 570)) {
                      rectY = doc.y;
                    } else {
                      page -= 1;
                    }
                    doc.rect(rectX, (rectY += 52) - 50, doc.page.width - 90, 50)
                      .fill('#00529B')
                      .fillColor("white")
                      .fontSize(14)
                      .font("Helvetica-Bold")
                      .text(`MAINTENANCE ACTIVITIES WITH DEFECTS FOR SECTION:`, rectX, rectY - 42, {
                        align: "center",
                        width: doc.page.width - 90
                      })
                      .text(`${section_details.name}`, rectX, rectY - 20, {
                        align: "center",
                        width: doc.page.width - 90
                      });
                    (section_details.section_maint_act_defects || []).forEach(section_maint_act_defects => {
                      if (addPage(doc, page += 1, 270)) {
                        rectY = doc.y;
                      } else {
                        page -= 1;
                      }
                      doc.rect(rectX, (rectY += 25) - 25, doc.page.width - 90, 25)
                        .fill('#F4A20B')
                        .fillColor("white")
                        .fontSize(14)
                        .font("Helvetica-Bold")
                        .text(`MAINTENANCE PHOTO`, rectX + 65, rectY - 17)
                        .text(`REPAIR PHOTO`, doc.page.width - 220, rectY - 17);
                      if (section_maint_act_defects.maintenance_photo) {
                        doc.image(`data:image/jpeg;base64,${section_maint_act_defects.maintenance_photo}`, rectX, (rectY += 187) - 185, { width: 250, height: 180 });
                      }
                      if (section_maint_act_defects.repair_photo) {
                        doc.image(`data:image/jpeg;base64,${section_maint_act_defects.repair_photo}`, doc.page.width - 295, (rectY) - 185, { width: 250, height: 180 });
                      }
                      doc.fillColor("#121E28")
                        .fontSize(10)
                        .font("Helvetica-Bold")
                        .text(`${section_maint_act_defects.description || ""}`, rectX, rectY += 5, { width: doc.page.width - 90, underline: true })
                        .font("Helvetica")
                        .text(`${section_maint_act_defects.description_text || ""}`, rectX + 10, doc.y, { width: doc.page.width - 100 })
                        .font("Helvetica-Bold")
                        .text(`${section_maint_act_defects.comments ? "Comments" : ""}`, rectX, doc.y + 4, { width: doc.page.width - 90, underline: true })
                        .font("Helvetica")
                        .text(`${section_maint_act_defects.comments || ""}`, rectX + 10, doc.y + 4, { width: doc.page.width - 100 });
                      rectY = doc.y > rectY ? doc.y + 2 : rectY + 2;
                      doc.x = rectX;
                    });
                  }
                  if (section_details.section_maint_act_no_defects) {
                    if (addPage(doc, page += 1, 570)) {
                      rectY = doc.y;
                    } else {
                      page -= 1;
                    }
                    doc.rect(rectX, (rectY += 52) - 50, doc.page.width - 90, 50)
                      .fill('#00529B')
                      .fillColor("white")
                      .fontSize(14)
                      .font("Helvetica-Bold")
                      .text(`MAINTENANCE ACTIVITIES WITH NO DEFECTS FOR SECTION:`, rectX, rectY - 42, {
                        align: "center",
                        width: doc.page.width - 90
                      })
                      .text(`${section_details.name}`, rectX, rectY - 20, {
                        align: "center",
                        width: doc.page.width - 90
                      });
                    (section_details.section_maint_act_no_defects || []).forEach(section_maint_act_no_defects => {
                      if (addPage(doc, page += 1, 270)) {
                        rectY = doc.y;
                      } else {
                        page -= 1;
                      }
                      doc.rect(rectX, (rectY += 25) - 25, doc.page.width - 90, 25)
                        .fill('#F4A20B')
                        .fillColor("white")
                        .fontSize(14)
                        .font("Helvetica-Bold")
                        .text(`MAINTENANCE PHOTO`, rectX + 65, rectY - 17)
                        .text(`DESCRIPTION`, doc.page.width - 220, rectY - 17);
                      if (section_maint_act_no_defects.maintenance_photo) {
                        doc.image(`data:image/jpeg;base64,${section_maint_act_no_defects.maintenance_photo}`, rectX, (rectY += 182) - 180, { width: 240, height: 180 });
                      }
                      doc.fillColor("#121E28")
                        .fontSize(10)
                        .font("Helvetica-Bold")
                        .text(`${section_maint_act_no_defects.description || ""}`, doc.page.width - 285, (section_maint_act_no_defects.maintenance_photo ? rectY - 160 : rectY + 20), { width: 240, underline: true })
                        .font("Helvetica")
                        .text(`${section_maint_act_no_defects.description_text || ""}`, doc.page.width - 275, doc.y, { width: 230, height: 180 })
                        .font("Helvetica-Bold")
                        .text(`${section_maint_act_no_defects.comments ? "Comments" : ""}`, doc.page.width - 285, doc.y + 4, { width: 240, underline: true })
                        .font("Helvetica")
                        .text(`${section_maint_act_no_defects.comments || ""}`, doc.page.width - 275, doc.y + 4, { width: 230 });
                      rectY = doc.y > rectY ? doc.y + 2 : rectY + 2;
                      doc.x = rectX;
                    });
                  }
                });
              }

            });
            //--------------------------------------------------------------
            // 📋 STATUS LOG FROM TABLET
            //--------------------------------------------------------------
            if (jsonData.status_log && jsonData.status_log.length) {
              that.createStatusLogScreen(doc, jsonData, page, addPage, xPointH);
            }
          }
          const addPage = (doc, page = null, checkSpace = null) => {
            return addPageGeneric(doc, {
              paperSize,
              reportName,
              page,
              checkSpace,
              footerX: 45,
              footerLineStart: 45,
              footerLineEnd: 45,
              reportNameX: 190,
              pageXOffset: 100,
              includeSpacing: false // PM version didn’t use character/word spacing
            });
          };

          that.toDataURL("pdfgen/CMLogotaglineHigh.png", function (logo) {
            niceDocument(logo, {
              reportName: reportName,
              reportNameX: 210,
              downloadName: 'PM_Report',
              bType: bType,
              headerFn: header,
              page: 1
            });
          });
        });

      },
      pdfTM: function (jsonData, bType = 'download', paperSize = 'LETTER') {
        var that = this;
        return new Promise(function (resolve, reject) {
          // resolve();
          if (!jsonData) {
            reject('Invalid Data');
          }
          var page = 1,
            reportName = 'Work Authorization and Service Summary';
          jsonData = JSON.parse(JSON.stringify(jsonData));

          let header = (doc, logo) => {

            let xPoint = doc.page.margins.left;
            let yPoint = doc.page.margins.top;
            var xPointH = 40,
              yPointH = 110,
              xPointCol1 = 40,
              yPointCol1 = 125,
              xPointCol2 = 282,
              yPointCol2 = 125;
            that.createFirstPageInfo(doc, jsonData, logo, reportName, xPoint, yPoint, xPointH, yPointH, xPointCol1, yPointCol1, xPointCol2, yPointCol2);

            addPage(doc, page += 1);

            //--------------------------------------------------------------
            // 📄 Report Summary Header
            //--------------------------------------------------------------
            let rectX = 45;
            let rectY = 45;

            // Draw "Report Summary" box border only
            doc.lineJoin("round")
              .lineWidth(3)
              .strokeColor("#00529B")
              .rect(xPointH, rectY - 25, doc.page.width - 90, 35)
              .stroke();

            doc.fontSize(18)
              .font("Helvetica-Bold")
              .fillColor("#00529B")
              .text("Report Summary", rectX, rectY - 15, {
                width: doc.page.width - 100,
                align: "left",
                characterSpacing: -0.2,
                wordSpacing: -0.4
              });

            //--------------------------------------------------------------
            // 🏢 BUILDING SECTIONS
            //--------------------------------------------------------------
            (jsonData.building_section_summary || []).forEach((building, bIndex) => {

              const drawHeader = (color, title, textY, prefix = "") => {
                doc.lineJoin("round")
                  .lineWidth(3)
                  .strokeColor(color)
                  .rect(xPointH, textY - 20, doc.page.width - 90, 25)
                  .fillAndStroke(color, color);

                doc.fontSize(color === "#00529B" ? 14 : 13)
                  .font("Helvetica-Bold")
                  .fillColor("white")
                  .text(`${prefix}${title}`, rectX, textY - 12, {
                    width: doc.page.width - 100,
                    align: "left",
                    characterSpacing: -0.2,
                    wordSpacing: -0.4
                  });
              };

              const drawTableRow = (label, activity, selection) => {
                const tableX = xPointH;
                const tableWidth = doc.page.width - 90;
                const colWidths = [tableWidth * 0.25, tableWidth * 0.35, tableWidth * 0.4];
                const rowHeight = 22;

                doc.lineJoin("round")
                  .lineWidth(3)
                  .strokeColor("#00529B")
                  .rect(tableX, rectY - 5, tableWidth, rowHeight)
                  .stroke();

                // vertical column separators
                let xPos = tableX;
                for (let i = 0; i < colWidths.length - 1; i++) {
                  xPos += colWidths[i];
                  doc.moveTo(xPos, rectY - 5).lineTo(xPos, rectY - 5 + rowHeight).stroke();
                }

                doc.font("Helvetica").fontSize(10).fillColor("#121E28")
                  .text(label, tableX + 6, rectY + 2, { width: colWidths[0] - 8, characterSpacing: -0.2, wordSpacing: -0.4 })
                  .text(activity, tableX + colWidths[0] + 6, rectY + 2, { width: colWidths[1] - 8, characterSpacing: -0.2, wordSpacing: -0.4 })
                  .text(selection, tableX + colWidths[0] + colWidths[1] + 6, rectY + 2, { width: colWidths[2] - 8, characterSpacing: -0.2, wordSpacing: -0.4 });

                rectY += rowHeight;
              };

              // 🔵 BUILDING HEADER BAR
              rectY += 35;
              drawHeader("#00529B", building.building_name, rectY, "Building: ");

              //--------------------------------------------------------------
              // 🟧 SECTION LIST
              //--------------------------------------------------------------
              (building.sections || []).forEach((section) => {
                rectY += 30;
                drawHeader("#F4A20B", section.section_name, rectY, "Section: ");
                rectY += 15; // small space before the table

                // 📋 DEFECT + RECOMMENDED WORK TABLE
                const renderRows = (items, labelPrefix) => {
                  (items || []).forEach((item, i) => {
                    if (addPage(doc, page += 1, 100)) rectY = doc.y;
                    drawTableRow(`${labelPrefix}: ${i + 1}`, item.activity || "", item.selection || "");
                  });
                };

                renderRows(section.defects, "Defect");
                renderRows(section.recommended_work, "Recommended Work");

                rectY -= 10; // spacing after section
              });

              rectY += 10; // spacing after building
            });

            //--------------------------------------------------------------
            // 🏗️ INITIAL SETUP
            //--------------------------------------------------------------
            rectX = 45;  // Left margin for all boxes and text
            rectY = 45;  // Starting Y position
            addPage(doc, page += 1); // Create the first page

            //--------------------------------------------------------------
            // 🏢 LOOP THROUGH EACH BUILDING ENTRY
            //--------------------------------------------------------------
            jsonData.buildings.forEach((building) => {
              // ────────────────────────────────────────────────────────────────
              // 🧩 Local helpers (non-global)
              // ────────────────────────────────────────────────────────────────
              const drawRect = (color, x, y, w, h = 25, lw = 3) => {
                doc.lineJoin("round").lineWidth(lw).strokeColor(color).rect(x, y, w, h).stroke();
              };

              const drawText = (text, x, y, opts = {}) => {
                doc.font(opts.bold ? "Helvetica-Bold" : "Helvetica")
                  .fontSize(opts.size || 10)
                  .fillColor(opts.color || "#121E28")
                  .text(text, x, y, {
                    width: opts.width || 200,
                    align: opts.align || "left",
                    characterSpacing: -0.2,
                    wordSpacing: -0.4,
                    link: opts.link
                  });
              };

              const drawImage = (img, x, y, w = 282, h = 212, radius = 4, commentText = "This is a sample photo comment.") => {
                if (!img) return;
                doc.save();
                doc.roundedRect(x, y, w, h, radius).clip();
                doc.image(`data:image/jpg;base64,${img}`, x, y, { width: w, height: h });
                doc.restore();
                drawText(commentText, x, y + h + 6, { size: 9, width: w });
              };

              // ────────────────────────────────────────────────────────────────
              // 📄 PAGE CHECKER
              // ────────────────────────────────────────────────────────────────
              if (addPage(doc, page += 1, 270)) rectY = doc.y; else page -= 1;

              // ────────────────────────────────────────────────────────────────
              // 🏠 BUILDING HEADER
              // ────────────────────────────────────────────────────────────────
              drawRect("#00529B", xPointH, (rectY += 27) - 25, doc.page.width - 90);
              drawText(`Building: ${building.building_name}`, rectX, rectY - 17, {
                bold: true, size: 14, color: "#00529B", width: doc.page.width - 120
              });

              // 🔗 Building Aerial Photo Button
              if (building.aerial_photo_url) {
                const [btnWidth, btnHeight, radius] = [180, 15, 6];
                const btnX = doc.page.width - btnWidth - 54, btnY = rectY - 20;
                doc.save();
                doc.roundedRect(btnX, btnY, btnWidth, btnHeight, radius).fill("#00529B");
                doc.restore();
                drawText("Building Aerial View Photo", btnX, btnY + 4, {
                  bold: true, size: 10, color: "white", width: btnWidth, align: "center", link: building.aerial_photo_url
                });
              }

              // ────────────────────────────────────────────────────────────────
              // 🟧 BUILDING COMMENTS
              // ────────────────────────────────────────────────────────────────
              drawRect("#F4A20B", xPointH, (rectY += 25) - 20, doc.page.width - 90);
              drawText("Comments", rectX, rectY - 13, { bold: true, size: 14, color: "#F4A20B" });
              drawText(building.building_comments || "No comments provided.", rectX, rectY + 20, {
                size: 10, width: doc.page.width - 90
              });

              // ────────────────────────────────────────────────────────────────
              // 🏗️ BUILDING PHOTO
              // ────────────────────────────────────────────────────────────────
              const photoHeaderY = doc.y + 10;
              drawRect("#F4A20B", xPointH, photoHeaderY, doc.page.width - 90);
              drawText("Building Photo", rectX, photoHeaderY + 8, { bold: true, size: 14, color: "#F4A20B" });
              if (building.building_photo) {
                drawImage(building.building_photo, xPointH, photoHeaderY + 35, 282, 212, 8);
                rectY = photoHeaderY + 35 + 212 + 15;
              }

              // ────────────────────────────────────────────────────────────────
              // 🏢 SECTIONS LOOP
              // ────────────────────────────────────────────────────────────────
              (building.sections || []).forEach((section) => {
                rectX = 45; rectY = 45; addPage(doc, page += 1);

                // SECTION HEADER
                drawRect("#00529B", xPointH, (rectY += 27) - 25, doc.page.width - 90);
                drawText(`Section: ${section.section_name}`, rectX, rectY - 17, {
                  bold: true, size: 14, color: "#00529B", width: doc.page.width - 120
                });

                if (section.aerial_photo_url === 'X') {
                  const [btnWidth, btnHeight, radius] = [180, 15, 6];
                  const btnX = doc.page.width - btnWidth - 54, btnY = rectY - 20;
                  doc.save(); doc.roundedRect(btnX, btnY, btnWidth, btnHeight, radius).fill("#00529B"); doc.restore();
                  drawText("Section Aerial View Photo", btnX, btnY + 4, {
                    bold: true, size: 10, color: "white", width: btnWidth, align: "center", link: section.aerial_photo_url
                  });
                }

                // COMMENTS
                drawRect("#F4A20B", xPointH, (rectY += 25) - 20, doc.page.width - 90);
                drawText("Comments", rectX, rectY - 13, { bold: true, size: 14, color: "#F4A20B" });
                drawText(section.section_comments || "No comments provided.", rectX, rectY + 20, {
                  size: 10, width: doc.page.width - 90
                });

                // SECTION PHOTO
                const photoY = doc.y + 10;
                drawRect("#F4A20B", xPointH, photoY, doc.page.width - 90);
                drawText("Section Overview Photo", rectX, photoY + 8, { bold: true, size: 14, color: "#F4A20B" });
                if (section.section_photo) {
                  drawImage(section.section_photo, xPointH, photoY + 35);
                  rectY = photoY + 35 + 212 + 15;
                }

                // DEFECT SUMMARY
                if (section.defects?.length) {
                  rectX = 45; rectY = 45; addPage(doc, page += 1);
                  drawRect("#00529B", xPointH, (rectY += 52) - 50, doc.page.width - 90, 50);
                  drawText("Defect Summary For Section:", rectX, rectY - 42, {
                    bold: true, size: 14, color: "#00529B", width: doc.page.width - 90
                  });
                  drawText(section.section_name || "", rectX, rectY - 20, {
                    bold: true, size: 14, color: "#00529B", width: doc.page.width - 90
                  });
                }

                // DEFECTS LOOP
                (section.defects || []).forEach(defect => {
                  if (addPage(doc, page += 1, 270)) rectY = doc.y; else page -= 1;

                  // DEFECT HEADER
                  drawRect("#F4A20B", xPointH, (rectY += 52) - 45, doc.page.width - 90);
                  drawText(`Field of roof : ${defect.activity || ""} ${defect.selection || ""}`, rectX, rectY - 38, {
                    bold: true, size: 14, color: "#F4A20B", width: doc.page.width - 100
                  });

                  const leftColX = xPointH, rightColX = xPointH + 270, sectionTopY = rectY - 10;

                  // Overview
                  drawRect("#F4A20B", leftColX, sectionTopY, 252);
                  drawText("Overview:", rectX, sectionTopY + 7, { bold: true, size: 12, color: "#F4A20B" });
                  drawImage(defect.repair_overview_photo, leftColX, sectionTopY + 35, 252, 172);

                  // Description
                  drawRect("#F4A20B", rightColX, sectionTopY, doc.page.width - 360);
                  drawText("Description:", rightColX + 5, sectionTopY + 7, { bold: true, size: 12, color: "#F4A20B" });
                  drawText(defect.description || "No description provided.", rightColX, sectionTopY + 35, {
                    size: 10, width: doc.page.width - 380
                  });

                  // Comments
                  const commentY = doc.y + 10;
                  drawRect("#F4A20B", rightColX, commentY, doc.page.width - 360);
                  drawText("Comments:", rightColX + 5, commentY + 7, { bold: true, size: 12, color: "#F4A20B" });
                  drawText(defect.comments || "No comments provided.", rightColX, commentY + 32, {
                    size: 10, width: doc.page.width - 380
                  });

                  // Defect + Repair Photos
                  const photoRowY = Math.max(doc.y + 25, sectionTopY + 270);
                  drawRect("#F4A20B", leftColX, photoRowY, 252);
                  drawText("Defect:", rectX, photoRowY + 7, { bold: true, size: 12, color: "#F4A20B" });
                  drawImage(defect.defect_photo, leftColX, photoRowY + 35, 252, 172);

                  drawRect("#F4A20B", rightColX, photoRowY, doc.page.width - 360);
                  drawText("Repair:", rightColX + 5, photoRowY + 7, { bold: true, size: 12, color: "#F4A20B" });
                  drawImage(defect.repair_photo, rightColX, photoRowY + 35, 252, 172);
                });

                // RECOMMENDED WORK ITEMS
                (section.recommended_work || []).forEach((work) => {
                  if (addPage(doc, page += 1, 270)) rectY = doc.y; else page -= 1;
                  const headerX = rectX, headerWidth = doc.page.width - 90;

                  // Header
                  drawRect("#00529B", xPointH, (rectY += 25) - 25, headerWidth);
                  drawText("Recommended Work for section:", headerX, rectY - 17, {
                    bold: true, size: 14, color: "#00529B", width: headerWidth - 20
                  });
                  drawText(section.section_name || "", headerX + 215, rectY - 17, {
                    bold: true, size: 14, color: "#00529B", width: headerWidth
                  });

                  // Drainage
                  drawRect("#F4A20B", xPointH, (rectY += 30) - 25, headerWidth);
                  drawText(`${work.selection || ""}`, headerX, rectY - 17, {
                    bold: true, size: 13, color: "#F4A20B", width: headerWidth
                  });

                  // Comments
                  drawRect("#F4A20B", xPointH, (rectY += 25) - 20, headerWidth);
                  drawText("Comments:", headerX, rectY - 13, { bold: true, size: 12, color: "#F4A20B" });
                  drawText(work.comments || "No comments provided.", headerX, rectY + 20, {
                    size: 10, width: headerWidth
                  });

                  // Photos
                  const photoHeaderY = doc.y + 10;
                  drawRect("#F4A20B", xPointH, photoHeaderY, headerWidth);
                  drawText("Photo(s):", headerX, photoHeaderY + 7, { bold: true, size: 12, color: "#F4A20B" });

                  // Photo Grid
                  const photos = work.photos || [];
                  const imgW = 282, imgH = 212, colGap = 25, radius = 4;
                  const photoStartY = photoHeaderY + 32;
                  let col = 0, row = 0;

                  photos.forEach((photo) => {
                    const imgX = headerX + col * (imgW + colGap);
                    const imgY = photoStartY + row * (imgH + 60);
                    drawImage(photo.photo, imgX, imgY, imgW, imgH, radius, photo.comment);
                    if (++col >= 2) { col = 0; row++; }
                  });

                  rectY = photoStartY + Math.ceil(photos.length / 2) * (imgH + 60) + 10;
                });
              });
            });

            //--------------------------------------------------------------
            // 💼 Labor and Materials Section (Perfect Alignment)
            //--------------------------------------------------------------
            if (jsonData.labor_materials_summary) {
              addPage(doc, page += 1);
              let rectX = 45, rectY = 45;
              const fullWidth = doc.page.width - 90;
              const borderColor = "#00529B", textColor = "#121E28", orange = "#F4A20B";

              //--------------------------------------------------------------
              // 🔧 Helper Functions (no layout change)
              //--------------------------------------------------------------
              const drawRect = (x, y, w, h, color, fill = false) => {
                doc.lineJoin("round").lineWidth(3).strokeColor(color);
                return fill ? doc.rect(x, y, w, h).fillAndStroke(color, color) : doc.rect(x, y, w, h).stroke();
              };

              const drawHeaderText = (txt, x, y, color, size, align = "left", width = fullWidth - 100) => {
                doc.font("Helvetica-Bold").fontSize(size).fillColor(color)
                  .text(txt, x, y, { width, align, characterSpacing: -0.2, wordSpacing: -0.4 });
              };

              const drawTableHeader = (headers, y, fillColor) => {
                const colWidths = [fullWidth * 0.40, fullWidth * 0.20, fullWidth * 0.20, fullWidth * 0.20];
                drawRect(xPointH, y, fullWidth, 22, fillColor, true);
                let colX = xPointH;
                headers.forEach((t, i) => {
                  doc.fillColor("white").font("Helvetica-Bold").fontSize(11)
                    .text(t, colX + 5, y + 6, {
                      width: colWidths[i] - 10,
                      align: i === 0 ? "left" : "right",
                      characterSpacing: -0.2, wordSpacing: -0.4
                    });
                  colX += colWidths[i];
                });
                return colWidths;
              };

              const drawDataRows = (rows, cols, yOffset, isMaterial = false) => {
                rows.forEach(row => {
                  let colX = xPointH;

                  // Draw full row border
                  drawRect(colX, rectY + yOffset, fullWidth, 22, borderColor);

                  // Draw vertical dividers
                  let dividerX = xPointH;
                  for (let j = 0; j < cols.length - 1; j++) {
                    dividerX += cols[j];
                    drawRect(dividerX, rectY + yOffset, 0.5, 22, borderColor);
                  }

                  // Text setup
                  doc.font("Helvetica").fontSize(10).fillColor(textColor);
                  const textY = rectY + (22 - doc.currentLineHeight()) / 2 + (isMaterial ? 7 : 2);

                  // Prepare values for each column
                  const values = isMaterial
                    ? [row.material_description, row.qty, row.unit_price, row.total]
                    : [row.type, row.qty, row.rate, row.total];

                  // Format numeric values for Qty / Unit Price / Rate / Total
                  values.forEach((val, i) => {
                    let displayVal = val;

                    // Apply numeric formatting only for numeric cells (except first column)
                    if (i > 0 && !isNaN(val) && val !== null && val !== "") {
                      displayVal = parseFloat(val).toLocaleString('en-US', { ...decimalOptions });
                    }

                    // Draw cell text
                    doc.text(displayVal || "", colX + (i === 0 ? 5 : 0), textY, {
                      width: cols[i] - (i === 0 ? 10 : 5),
                      align: i === 0 ? "left" : "right",
                      characterSpacing: -0.2,
                      wordSpacing: -0.4
                    });

                    colX += cols[i];
                  });

                  rectY += 22; // Move to next row
                });
              };


              //--------------------------------------------------------------
              // 📘 MAIN TITLE
              //--------------------------------------------------------------
              drawRect(xPointH, rectY - 15, fullWidth, 30, borderColor);
              drawHeaderText("Labor and Materials", rectX, rectY - 6, borderColor, 18);
              rectY += 25;

              //--------------------------------------------------------------
              // 🟦 Labor Header
              //--------------------------------------------------------------
              drawRect(xPointH, rectY - 6, fullWidth, 25, borderColor, true);
              drawHeaderText("Labor and Fees", rectX, rectY + 3, "white", 13);
              rectY += 25;

              //--------------------------------------------------------------
              // 🟧 Labor Table Header + Rows
              //--------------------------------------------------------------
              const colWidths = drawTableHeader(["Type", "Hrs/Qty", "Rate", "Total"], rectY - 2, orange);
              rectY += 22;
              drawDataRows(jsonData.labor_materials_summary.labor_and_fees || [], colWidths, 2);

              //--------------------------------------------------------------
              // 🟧 Labor Total
              //--------------------------------------------------------------
              drawRect(xPointH, rectY + 6, fullWidth, 22, orange, true);
              drawHeaderText("Labor and Fees Total:", rectX, rectY + 12, "white", 11);
              drawHeaderText(
                `${parseFloat(jsonData.labor_materials_summary.labor_and_fees_total || 0)
                  .toLocaleString('en-US', currencyOptions)}`,
                xPointH + fullWidth - 95, rectY + 12, "white", 11, "right", 90
              );
              rectY += 43;

              //--------------------------------------------------------------
              // 🟦 Materials Header
              //--------------------------------------------------------------
              drawRect(xPointH, rectY, fullWidth, 25, borderColor, true);
              drawHeaderText("Materials", rectX, rectY + 7, "white", 13);
              rectY += 25;

              //--------------------------------------------------------------
              // 🟧 Material Table Header + Rows
              //--------------------------------------------------------------
              const matWidths = drawTableHeader(["Description", "Qty", "Unit Price", "Total"], rectY + 4, orange);
              rectY += 22;
              drawDataRows(jsonData.labor_materials_summary.materials || [], matWidths, 8, true);

              //--------------------------------------------------------------
              // 🟧 Material Total
              //--------------------------------------------------------------
              drawRect(xPointH, rectY + 12, fullWidth, 22, orange, true);
              drawHeaderText("Materials Total:", rectX, rectY + 18, "white", 11);
              drawHeaderText(
                `${parseFloat(jsonData.labor_materials_summary.material_total || 0)
                  .toLocaleString('en-US', currencyOptions)}`,
                xPointH + fullWidth - 95, rectY + 18, "white", 11, "right", 90
              );
              rectY += 38;

              //--------------------------------------------------------------
              // 🔵 Totals Summary Box
              //--------------------------------------------------------------
              const totalsHeight = 70;
              drawRect(xPointH, rectY, fullWidth, totalsHeight, borderColor, true);
              doc.fillColor("white").font("Helvetica").fontSize(11);
              doc.text("Subtotal:", xPointH + fullWidth - 250, rectY + 11);
              doc.text(`${parseFloat(jsonData.labor_materials_summary.subtotal || 0)
                .toLocaleString('en-US', currencyOptions)}`, xPointH + fullWidth - 95, rectY + 11,
                { width: 90, align: "right", characterSpacing: -0.2, wordSpacing: -0.4 });

              doc.text(`Tax Amount (Rate ${parseFloat(jsonData.labor_materials_summary.taxes?.tax_rate || 0)
                .toFixed(2)}%):`, xPointH + fullWidth - 250, rectY + 26);
              doc.text(`${parseFloat(jsonData.labor_materials_summary.taxes?.total || 0)
                .toLocaleString('en-US', currencyOptions)}`, xPointH + fullWidth - 95, rectY + 26,
                { width: 90, align: "right" });

              doc.lineWidth(1).strokeColor("white")
                .moveTo(xPointH + fullWidth - 250, rectY + 43)
                .lineTo(xPointH + fullWidth - 5, rectY + 43).stroke();

              doc.font("Helvetica-Bold").fontSize(12);
              doc.text("Grand Total:", xPointH + fullWidth - 250, rectY + 51);
              doc.text(`${parseFloat(jsonData.labor_materials_summary.grand_total || 0)
                .toLocaleString('en-US', currencyOptions)}`, xPointH + fullWidth - 95, rectY + 51,
                { width: 90, align: "right" });
            }
            //--------------------------------------------------------------
            // 📋 STATUS LOG FROM TABLET
            //--------------------------------------------------------------
            if (jsonData.status_log && jsonData.status_log.length) {
              that.createStatusLogScreen(doc, jsonData, page, addPage, xPointH);
            }
          }
          const addPage = (doc, page = null, checkSpace = null) => {
            return addPageGeneric(doc, {
              paperSize,
              reportName,
              page,
              checkSpace,
              footerX: 40,
              footerLineStart: 40,
              footerLineEnd: 45,
              reportNameX: 230,
              pageXOffset: 85,
              includeSpacing: true // TM version used character/word spacing
            });
          };
          that.toDataURL("pdfgen/CMLogotaglineHigh.png", function (logo) {
            niceDocument(logo, {
              reportName: reportName,
              reportNameX: 230,
              downloadName: 'ServiceRepairSummaryForSvcMgr',
              bType: bType,
              headerFn: header,  // existing header(doc, logo)
              page: 1
            });
          });
        });
      },
      createFirstPageInfo: function (doc, jsonData, logo, reportName, xPoint, yPoint, xPointH, yPointH, xPointCol1, yPointCol1, xPointCol2, yPointCol2) {

        const pd = jsonData.project_details;
        const blue = "#00529B";
        const textColor = "#121E28";
        const lineW = 3;
        const colWidth = 230;

        const drawHeaderBox = (x, y, title, titleX) => {
          doc.lineJoin("round")
            .lineWidth(lineW)
            .strokeColor(blue)
            .rect(x, y, colWidth, 25)
            .stroke()
            .fillColor(blue).font("Helvetica-Bold").fontSize(12)
            .text(title, titleX, y + 8, { width: doc.page.width - 90, characterSpacing: -0.2, wordSpacing: -0.4 })
            .fillColor(textColor)
            .font("Helvetica")
            .fontSize(11);
        };

        const drawAddressBlock = (data, x, y) => {
          doc.text(data.name || "", x, y + 40, { characterSpacing: -0.2, wordSpacing: -0.4 })
            .text(data.address || "", x, y + 60, { characterSpacing: -0.2, wordSpacing: -0.4 })
            .text(
              (data.city ? `${data.city}, ` : "") + (data.state || "") + " " + (data.zip || ""),
              x, y + 80, { characterSpacing: -0.2, wordSpacing: -0.4 }
            )
            .text("Attn: ", x, y + 100, { characterSpacing: -0.2, wordSpacing: -0.4 })
            .text(data.contact_name || "", x, y + 120, { characterSpacing: -0.2, wordSpacing: -0.4 })
            .text((data.contact_email || "").toLowerCase(), x, y + 140, { characterSpacing: -0.2, wordSpacing: -0.4 });
        };

        const drawManagerBlock = (data, x, y, title, titleX) => {
          drawHeaderBox(x, y, title, titleX);
          doc.text(data.name || "", xPointCol2 = (xPointH + 292), yPointCol2 = (y + 40), { characterSpacing: -0.2, wordSpacing: -0.4 })
            .text(data.address || "", xPointCol2, yPointCol2 += 20, { characterSpacing: -0.2, wordSpacing: -0.4 })
            .text(
              (data.city ? `${data.city}, ` : "") + (data.state || "") + " " + (data.zip || ""),
              xPointCol2, yPointCol2 += 20, { characterSpacing: -0.2, wordSpacing: -0.4 }
            )
            .text((data.email || "").toLowerCase(), xPointCol2, yPointCol2 += 20, { characterSpacing: -0.2, wordSpacing: -0.4 })
            .text(`Phone: ${data.phone || ""}`, xPointCol2, yPointCol2 += 20, { characterSpacing: -0.2, wordSpacing: -0.4 })
            .text(`Fax: ${data.fax || ""}`, xPointCol2, yPointCol2 += 20, { characterSpacing: -0.2, wordSpacing: -0.4 });
        };

        // -----------------------------------------------------------
        // LOGO + REPORT TITLE
        // -----------------------------------------------------------
        doc.image(logo, xPoint + 3, yPoint, { width: 230, align: "left" });
        doc.fontSize(16)
          .fillColor(blue)
          .font("Helvetica-Bold")
          .text(reportName, 328, yPoint + 15, {
            width: 280, characterSpacing: -0.2, wordSpacing: -0.4
          });

        // -----------------------------------------------------------
        // TOP BLUE LINE + HEADER INFO
        // -----------------------------------------------------------
        doc.lineJoin("round")
          .lineWidth(lineW)
          .strokeColor(blue)
          .rect(xPointH, yPointH, doc.page.width - 90, 1)
          .stroke();

        doc.fillColor(textColor)
          .font("Helvetica").fontSize(12)
          .text(`Notification: ${pd.notification_number || ""}`, xPointCol1, yPointCol1, { characterSpacing: -0.2, wordSpacing: -0.4 })
          .text(pd.start_work_date ? `Start Work Date: ${pd.start_work_date}` : "", xPointCol2, yPointCol2, { characterSpacing: -0.2, wordSpacing: -0.4 })
          .text(`PO Number: ${pd.po_number || ""}`, xPointCol1, yPointCol1 + 20, { characterSpacing: -0.2, wordSpacing: -0.4 })
          .text(pd.completed_work_date ? `Completed Work Date: ${pd.completed_work_date}` : "", xPointCol2, yPointCol2 + 20, { characterSpacing: -0.2, wordSpacing: -0.4 });

        // -----------------------------------------------------------
        // CUSTOMER + SERVICE MANAGER
        // -----------------------------------------------------------
        yPointH += 55;
        drawHeaderBox(xPointH, yPointH, "Customer", 45);
        drawAddressBlock(pd.customer, xPointCol1, yPointH);

        drawManagerBlock(pd.service_manager, xPointH + 290, yPointH, "Service Manager", 335);

        // -----------------------------------------------------------
        // LOCATION + SALES REP
        // -----------------------------------------------------------
        yPointH += 160;
        drawHeaderBox(xPointH, yPointH, "Location", 45);
        drawAddressBlock(pd.location, xPointCol1, yPointH);

        drawManagerBlock(pd.sales_rep, xPointH + 290, yPointH, "Sales Representative", xPointH + 295);

        // -----------------------------------------------------------
        // SITE CONTACTS
        // -----------------------------------------------------------
        yPointH += 187;
        doc.lineJoin("round")
          .moveTo(xPointH, yPointH)
          .lineTo(xPointH + doc.page.width - 90, yPointH)
          .stroke();

        doc.text(`Site Contact: ${pd.site_contact_before.contact_name || ""}`, xPointCol1, yPointCol1 = (yPointH + 12))
          .fontSize(8).font('Helvetica-Bold')
          .text(`${pd.site_contact_before.text || ""}`, { width: 245, align: 'left', characterSpacing: -0.2, wordSpacing: -0.4 })
          .fillColor(blue)
          .text(`${pd.site_contact_before.url_text}`, {
            link: pd.site_contact_before.url, underline: true,
            characterSpacing: -0.2, wordSpacing: -0.4
          })
          .fillColor(textColor);

        const siteContactTextH = doc.y;

        doc.font("Helvetica").fontSize(12)
          .text(`Site Contact: ${pd.site_contact_after.contact_name || ""}`, xPointH + 290, yPointCol1, { characterSpacing: -0.2, wordSpacing: -0.4 })
          .fontSize(8).font('Helvetica-Bold')
          .text(`${pd.site_contact_after.text}`, { width: 245, align: 'left', characterSpacing: -0.2, wordSpacing: -0.4 });

        yPointCol1 = Math.max(doc.y, siteContactTextH);

        // -----------------------------------------------------------
        // SIGNATURE / BYPASS TEXT
        // -----------------------------------------------------------
        const renderSignature = (sig, x, y, reasonText) => {
          if (sig) {
            doc.image(`data:image/png;base64, ${sig}`, x, y + 5, { width: 160 });
          } else {
            doc.x = x; doc.y = y;
            doc.font("Helvetica").fontSize(12)
              .text(`\n\n${reasonText || ""}`, { characterSpacing: -0.2, wordSpacing: -0.4 });
          }
        };

        renderSignature(pd.site_contact_before.signature, xPointH + 50, yPointCol1, pd.site_contact_before.bypass_reason_text);
        renderSignature(pd.site_contact_after.signature, xPointH + 330, yPointCol1, pd.site_contact_after.bypass_reason_text);

        // -----------------------------------------------------------
        // FOOTER LINES + LABELS
        // -----------------------------------------------------------
        doc.lineWidth(lineW)
          .moveTo(xPointH, yPointH += 195)
          .lineTo(xPointH + 230, yPointH)
          .stroke()
          .moveTo(xPointH + 292, yPointH)
          .lineTo(xPointH + doc.page.width - 90, yPointH)
          .stroke();

        doc.font("Helvetica").fontSize(12)
          .text("Authorized signatory", xPointH, yPointH + 5, { characterSpacing: -0.2, wordSpacing: -0.4 })
          .text("Authorized signatory", xPointH + 290, yPointH + 5, { characterSpacing: -0.2, wordSpacing: -0.4 });
      },
      createStatusLogScreen: function (doc, jsonData, page, addPage, xPointH) {
        addPage(doc, page += 1, null);

        const borderColor = "#00529B";
        const textColor = "#121E28";
        const rectX = 45, fullWidth = doc.page.width - 90;
        let rectY = 45;

        //-------------------------------------------------------
        // 🟦 MAIN HEADING (Transparent, Blue Border)
        //-------------------------------------------------------
        const headingHeight = 30;
        doc.lineJoin("round").lineWidth(3).strokeColor(borderColor)
          .rect(xPointH, rectY, fullWidth, headingHeight).stroke();

        doc.font("Helvetica-Bold").fontSize(16).fillColor(borderColor)
          .text(
            `Status Log from Tablet for Notification: ${jsonData.project_details.notification_number}`,
            rectX, rectY + 9,
            { width: fullWidth - 20, align: "left", characterSpacing: -0.2, wordSpacing: -0.4 }
          );

        rectY += headingHeight + 5;

        //-------------------------------------------------------
        // TABLE CONFIGURATION
        //-------------------------------------------------------
        const columns = [
          { title: "Foreman", width: fullWidth * 0.25, align: "left", prop: "foreman_name" },
          { title: "Date", width: fullWidth * 0.18, align: "center", prop: "date" },
          { title: "Time (EST)", width: fullWidth * 0.15, align: "center", prop: "time" },
          { title: "Status", width: fullWidth * 0.25, align: "center", prop: "status" },
          { title: "Elapsed Time (Hrs)", width: fullWidth * 0.17, align: "center", prop: "elapsed_time" }
        ];

        //-------------------------------------------------------
        // 🟦 DRAW TABLE HEADER
        //-------------------------------------------------------
        const drawHeader = () => {
          let colX = xPointH;
          const headerHeight = Math.max(
            ...columns.map(col => doc.heightOfString(col.title, { width: col.width - 10 }))
          );

          for (const col of columns) {
            doc.lineJoin("round").lineWidth(3).strokeColor(borderColor)
              .rect(colX, rectY, col.width, headerHeight)
              .fillAndStroke(borderColor, borderColor);

            doc.fillColor("white").font("Helvetica-Bold").fontSize(14)
              .text(col.title, colX + 5, rectY + (headerHeight - doc.heightOfString(col.title, { width: col.width - 10 })) / 2, {
                width: col.width - 10, align: col.align, characterSpacing: -0.2, wordSpacing: -0.4
              });

            colX += col.width;
          }

          rectY += headerHeight;
          return headerHeight;
        };

        const headerHeight = drawHeader();

        //-------------------------------------------------------
        // 🧾 DRAW SINGLE ROW (Dynamic Height)
        //-------------------------------------------------------
        const drawRow = (row) => {
          doc.font("Helvetica").fontSize(10).fillColor(textColor);

          // Calculate tallest cell height for this row
          const maxHeight = Math.max(
            ...columns.map(col =>
              doc.heightOfString(row[col.prop] || "", { width: col.width - 10 }) + 10
            )
          );

          // Page break handling
          if (rectY + maxHeight + 40 > doc.page.height - 45) {
            addPage(doc, page += 1, null);
            rectY = 45;
            drawHeader(); // Redraw header on new page
          }

          // Outer row border
          doc.lineJoin("round").lineWidth(3).strokeColor(borderColor)
            .rect(xPointH, rectY, fullWidth, maxHeight).stroke();

          // Draw cells
          let colX = xPointH;
          for (const col of columns) {
            const text = row[col.prop] || "";
            doc.text(text, colX + 5, rectY + 6, {
              width: col.width - 10, align: col.align,
              characterSpacing: -0.2, wordSpacing: -0.4
            });

            // Cell border
            doc.lineJoin("round").lineWidth(3).strokeColor(borderColor)
              .rect(colX, rectY, col.width, maxHeight).stroke();

            colX += col.width;
          }

          rectY += maxHeight;
        };

        //-------------------------------------------------------
        // ADD ALL ROWS
        //-------------------------------------------------------
        jsonData.status_log.forEach(drawRow);

        //-------------------------------------------------------
        // Final bottom border
        //-------------------------------------------------------
        doc.lineJoin("round").lineWidth(3).strokeColor(borderColor)
          .rect(xPointH, rectY, fullWidth, 0.5).stroke();
      },

      toDataURL: function (src, callback) {
        var image = new Image();
        image.crossOrigin = 'Anonymous';
        image.onload = function () {
          var canvas = document.createElement('canvas');
          var context = canvas.getContext('2d');
          canvas.height = this.naturalHeight;
          canvas.width = this.naturalWidth;
          context.drawImage(this, 0, 0);

          let sNewPath = `image/${src.split(".")[1] ? src.split(".")[1] : 'jpeg'}`;
          var dataURL = canvas.toDataURL(sNewPath, 0.6);
          return callback(dataURL);
        };
        image.src = src;
      }
    };
  });