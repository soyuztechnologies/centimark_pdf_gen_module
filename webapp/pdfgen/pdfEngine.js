
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
            (jsonData.report_summary || []).forEach((building, bIndex) => {

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
              drawSummaryRow("Building Inspections", `${building.building_inspection_dfct_cnt || "0"} Defects`);
              rectY -= 5;

              //--------------------------------------------------------------
              // 🟧 SECTIONS SUMMARY
              //--------------------------------------------------------------
              (building.sections || []).forEach((section) => {
                rectY += 25;
                drawHeader("#F4A20B", section.section_name, rectY, "Section: ");
                rectY += 15;

                drawSummaryRow("Section Inspections", `${section.section_inspection_dfct_cnt || "0"} Defects`);
                drawSummaryRow("Maintenance Activities", `${section.maint_activities_dfct_cnt || "0"} Defects`);

                // Include recommended work if available
                if (section.recommended_work_cnt) {
                  drawSummaryRow("Recommended Work", `${section.recommended_work_cnt || "0"} Defects`);
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
              drawText(`Building: ${building.name}`, rectX, rectY - 17, {
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
              drawText("Building Photo(s)", rectX, photoHeaderY + 8, { bold: true, size: 14, color: "#F4A20B" });
              if (building.photos?.length) {
                const photoWidth = 257;
                const photoHeight = 172;
                const gap = 10;
                const photosPerRow = 2;

                let x = xPointH;
                let y = photoHeaderY + 35;
                let photoCount = 0;

                building.photos.forEach((photo, index) => {
                  // 🧾 Page break if image exceeds bottom margin
                  if (y + photoHeight + 60 > doc.page.height - 45) {
                    addPage(doc, page += 1);
                    y = 45; // reset Y same as initial base
                    x = xPointH;
                  }

                  // 🖼️ Draw the photo (use your helper)
                  drawImage(
                    photo.photo,
                    x,
                    y,
                    photoWidth,
                    photoHeight,
                    8,
                    photo.comment || "This is a sample photo comment."
                  );

                  photoCount++;
                  if (photoCount % photosPerRow === 0) {
                    // move to next row
                    x = xPointH;
                    y += photoHeight + 35;
                  } else {
                    // move to next column
                    x += photoWidth + gap;
                  }
                });

                rectY = y + photoHeight + 15; // keep rectY consistent
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
              const BORDER_ORANGE = "#F4A20B";
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

              //--------------------------------------------------------------
              // 🧱 Building Inspections
              //--------------------------------------------------------------
              if (building.inspections) {
                addPage(doc, page += 1);
                rectX = 45;
                rectY = 45;

                // 🔵 Header Rectangle
                drawRect("#00529B", xPointH, rectY - 25, doc.page.width - 90, 35, 3, true);

                // 🏷️ Header Text
                drawText(`Building Inspections for ${building.name || ""}`, rectX, rectY - 15, {
                  bold: true, size: 18, color: "#00529B", width: doc.page.width - 90
                });

                building.inspections.forEach(inspection => {
                  if (addPage(doc, page += 1, 270)) {
                    rectY = doc.y - 40;
                  } else {
                    page -= 1;
                  }

                  rectY += 15;
                  // 🔵 Header Rectangle
                  drawRect("#F4A20B", xPointH, rectY, doc.page.width - 90, 25, 3, true);

                  rectY += 20;
                  // 🏷️ inspection desctiption Text
                  drawText(`${inspection.activity || ""}`, rectX, rectY - 12, {
                    bold: true, size: 14, color: "#F4A20B", width: doc.page.width - 90
                  });

                  rectY += 10;
                  // 🔵 Header Rectangle
                  drawRect("#F4A20B", xPointH, rectY, doc.page.width - 90, 20, 3, true);
                  rectY += 20;
                  // 🏷️ inspection desctiption Text
                  drawText(`Comments`, rectX, rectY - 15, {
                    bold: true, size: 12, color: "#F4A20B", width: doc.page.width - 90
                  });
                  rectY += 10;
                  drawText(inspection.comments || "No comments provided.", rectX, rectY, {
                    size: 10, width: doc.page.width - 90
                  });
                  rectY += 15;
                  // 🔵 Header Rectangle
                  drawRect("#F4A20B", xPointH, rectY, doc.page.width - 90, 20, 3, true);
                  rectY += 20;
                  // 🏷️ inspection desctiption Text
                  drawText(`Photo(s)`, rectX, rectY - 15, {
                    bold: true, size: 12, color: "#F4A20B", width: doc.page.width - 90
                  });
                  rectY += 10
                  if (inspection.inspection_photo) {
                    drawImage(inspection.inspection_photo, xPointH, rectY, 282, 212, 8);
                    rectY = rectY + 30 + 212 + 20;
                  }
                });
              }

              //--------------------------------------------------------------
              // 🧱 Building Sections
              //--------------------------------------------------------------
              if (building.sections) {
                // ────────────────────────────────────────────────────────────────
                // 🏢 SECTIONS LOOP
                // ────────────────────────────────────────────────────────────────
                (building.sections || []).forEach((section) => {
                  rectX = 45; rectY = 45; addPage(doc, page += 1);

                  // SECTION HEADER
                  drawRect("#00529B", xPointH, rectY - 25, doc.page.width - 90);
                  drawText(`Section: ${section.name}`, rectX, rectY - 17, {
                    bold: true, size: 14, color: "#00529B", width: doc.page.width - 120
                  });

                  if (section.aerial_photo_url) {
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
                  drawText(section.comments || "No comments provided.", rectX, rectY + 20, {
                    size: 10, width: doc.page.width - 90
                  });

                  // SECTION PHOTO
                  const photoY = doc.y + 10;
                  drawRect("#F4A20B", xPointH, photoY, doc.page.width - 90);
                  drawText("Section Overview Photo", rectX, photoY + 8, { bold: true, size: 14, color: "#F4A20B" });
                  if (section.section_overview_photo) {
                    drawImage(section.section_overview_photo, xPointH, photoY + 35);
                    rectY = photoY + 35 + 212 + 15;
                  }

                  //--------------------------------------------------------------
                  // 🏗️ Section Specification Matrix (Pixel-Perfect Refined)
                  //--------------------------------------------------------------
                  rectX = 45;
                  rectY = 45;
                  addPage(doc, page += 1);

                  //--------------------------------------------------------------
                  // 🏗️ Roof Specification Matrix
                  //--------------------------------------------------------------
                  if (section.specification_matrix?.length) {
                    drawHeaderBar("Roof Specification Matrix", rectY);
                    rectY += 10;

                    const specCols = [
                      (doc.page.width - 90) * 0.5,
                      (doc.page.width - 90) * 0.5
                    ];

                    drawTableHeader(["Component", "Type"], specCols, rectY);
                    rectY += 25;

                    section.specification_matrix.forEach(row => {
                      rectY += drawTableRow([row.component, row.type], specCols, rectY);
                    });
                  }

                  //--------------------------------------------------------------
                  // 🧱 Maintenance Activity Matrix
                  //--------------------------------------------------------------
                  if (section.maintenance_activity_matrix?.length) {
                    rectY += 45;
                    drawHeaderBar("Maintenance Activity Matrix", rectY);
                    rectY += 10;

                    const maintCols = [
                      (doc.page.width - 90) * 0.15,
                      (doc.page.width - 90) * 0.45,
                      (doc.page.width - 90) * 0.40
                    ];

                    drawTableHeader(["Rating", "Component", "Defect"], maintCols, rectY);
                    rectY += 25;

                    section.maintenance_activity_matrix.forEach(row => {
                      rectY += drawTableRow([row.rating, row.component, row.defect], maintCols, rectY, { withRating: true });
                    });

                    // 🟢🔴 Legend
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

                  //--------------------------------------------------------------
                  // 🏗️ Section Inspection Matrix (Pixel-Perfect)
                  //--------------------------------------------------------------
                  rectX = 45;
                  rectY = 45;
                  addPage(doc, page += 1);
                  if (section.inspection_matrix?.length) {
                    if (addPage(doc, page += 1, 270)) rectY = doc.y; else page -= 1;

                    // Header bar
                    drawHeaderBar("Section Inspection Matrix", rectY);
                    rectY += 10;

                    // Column structure
                    const inspCols = [
                      (doc.page.width - 90) * 0.15, // Rating
                      (doc.page.width - 90) * 0.45, // Component
                      (doc.page.width - 90) * 0.40  // Defect
                    ];

                    // Table Header
                    drawTableHeader(["Rating", "Component", "Defect"], inspCols, rectY);
                    rectY += 25;

                    // Table Rows
                    section.inspection_matrix.forEach(row => {
                      rectY += drawTableRow(
                        [row.rating, row.component, row.defect],
                        inspCols,
                        rectY,
                        { withRating: true }
                      );
                    });

                    // 🟢🔴 Legend
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

                    drawLegend(120, BORDER_GREEN, "Inspection - No Defects", "ND");
                    drawLegend(360, BORDER_RED, "Inspection - Repair Needed", "RN");

                    rectY = legendY + 25;
                  }

                  // --------------------------------------------------------------
                  // 🏗️ Section Inspections
                  // --------------------------------------------------------------
                  if (section.section_inspections?.length) {
                    rectX = 45;
                    rectY = 45;
                    addPage(doc, page += 1);

                    // 🔹 Header: Inspections for Section
                    drawRoundedRect(xPointH, rectY, doc.page.width - 90, 35, 3, BORDER_BLUE);
                    doc.font("Helvetica-Bold").fontSize(18).fillColor(BORDER_BLUE)
                      .text(`Inspections for section: ${section.name}` || "", rectX, rectY + 9);
                    rectY += 40;

                    // 🔍 Loop through each inspection item
                    section.section_inspections.forEach((insp, idx) => {
                      if (addPage(doc, page += 1, 400)) rectY = doc.y; else page -= 1;

                      const isRepair = insp.rating === "RN";
                      const color = isRepair ? BORDER_RED : BORDER_GREEN;
                      const symbol = isRepair ? "RN" : "ND";

                      // 🟢🔴 Inspection Title
                      drawRoundedRect(xPointH, rectY, doc.page.width - 90, 25, 3, color);
                      doc.circle(rectX + 7, rectY + 12, 8).fillAndStroke(color, color);
                      doc.font("Helvetica-Bold").fontSize(11).fillColor("white")
                        .text(symbol, rectX, rectY + 7);
                      doc.font("Helvetica-Bold").fontSize(13).fillColor(color)
                        .text(`${insp.component || ""} : ${insp.defect || (isRepair ? "Repair Needed" : "No Defects")}`,
                          rectX + 17, rectY + 7);
                      rectY += 30;

                      // 🟠 Description
                      drawRoundedRect(xPointH, rectY, doc.page.width - 90, 22, 3, BORDER_ORANGE);
                      doc.font("Helvetica-Bold").fontSize(12).fillColor(BORDER_ORANGE)
                        .text("Description:", rectX, rectY + 7);
                      rectY += 30;

                      doc.font("Helvetica").fontSize(10).fillColor(TEXT_DARK)
                        .text(insp.description || "—", rectX, rectY, {
                          width: doc.page.width - 90,
                          align: "left",
                          characterSpacing: -0.2,
                          wordSpacing: -0.4
                        });
                      rectY = doc.y + 5;

                      // 🟠 Comments (if present)
                      if (insp.comments = "X") {
                        drawRoundedRect(xPointH, rectY, doc.page.width - 90, 22, 3, BORDER_ORANGE);
                        doc.font("Helvetica-Bold").fontSize(12).fillColor(BORDER_ORANGE)
                          .text("Comments:", rectX, rectY + 7);
                        rectY += 30;
                        doc.font("Helvetica").fontSize(10).fillColor(TEXT_DARK)
                          .text(insp.comments, rectX, rectY, {
                            width: doc.page.width - 90,
                            align: "left",
                            characterSpacing: -0.2,
                            wordSpacing: -0.4
                          });
                        rectY = doc.y + 5;
                      }

                      // 🟠 Photo(s)
                      if (insp.inspection_photo) {
                        drawRoundedRect(xPointH, rectY, doc.page.width - 90, 22, 3, BORDER_ORANGE);
                        doc.font("Helvetica-Bold").fontSize(12).fillColor(BORDER_ORANGE)
                          .text("Photo(s):", rectX, rectY + 7);
                        rectY += 30;

                        doc.save();
                        const imgWidth = 240;
                        const imgHeight = 180;
                        doc.roundedRect(rectX, rectY, imgWidth, imgHeight, 5).clip();
                        doc.image(`data:image/jpeg;base64,${insp.inspection_photo}`, rectX, rectY, {
                          width: imgWidth,
                          height: imgHeight
                        });
                        doc.restore();
                        rectY += imgHeight + 10;

                        doc.font("Helvetica").fontSize(9).fillColor(TEXT_DARK)
                          .text(insp.photo_comment || "This is a sample photo comment.",
                            rectX, rectY, { width: imgWidth });
                        rectY = doc.y + 10;
                      }

                      // Add space before next inspection block
                      rectY += 10;
                    });
                  }

                  //--------------------------------------------------------------
                  // 🏗️ Maintenance Activities for Section
                  //--------------------------------------------------------------
                  if (section.section_maint_act_defects?.length || section.section_maint_act_no_defects?.length) {
                    rectX = 45;
                    rectY = 45;
                    addPage(doc, page += 1);

                    // 🔹 Blue Header Bar
                    const headerH = 25;
                    drawRoundedRect(xPointH, rectY, doc.page.width - 90, headerH + 25, 4, "#00529B");
                    drawText("Maintenance Activities for section:", rectX, rectY + 10, {
                      size: 14, color: "#00529B", bold: true, align: "left",
                      width: doc.page.width - 90
                    });
                    drawText(section.name || "", rectX, rectY + 27, {
                      size: 18, color: "#00529B", bold: true, align: "left",
                      width: doc.page.width - 90
                    });

                    rectY += 55;

                    //------------------------------------------------------------
                    // Render Helper for Each Maintenance Activity Entry
                    //------------------------------------------------------------
                    const renderMaintActivity = (activity, isDefect) => {

                      if (addPage(doc, page += 1, 400)) rectY = doc.y; else page -= 1;
                      // 🟧 Activity Header (outlined, no fill)
                      const barColor = "#F4A20B";
                      const barHeight = 25;

                      // Draw only the border — rounded edges, thin stroke
                      doc.lineJoin("round")
                        .lineWidth(3)
                        .strokeColor(barColor)
                        .roundedRect(xPointH, rectY, doc.page.width - 90, barHeight, 4)
                        .stroke();

                      // Title text inside the bordered box
                      drawText(`${activity.title || ""}`, xPointH + 12, rectY + 6, {
                        size: 13,
                        color: barColor,   // orange text same as border
                        bold: true
                      });

                      rectY += barHeight + 5;

                      // 🟠 Description Header
                      drawRect("#F4A20B", xPointH, rectY, doc.page.width - 90, 22);
                      drawText("Description:", rectX, rectY + 7, {
                        size: 12, color: "#F4A20B", bold: true
                      });

                      rectY += 30;
                      drawText(activity.description_text || "", rectX, rectY, {
                        size: 10, color: "#121E28", width: doc.page.width - 100
                      });

                      rectY = doc.y + 5;

                      // 🟠 Comments
                      drawRect("#F4A20B", xPointH, rectY, doc.page.width - 90, 22);
                      drawText("Comments:", rectX, rectY + 5, {
                        size: 12, color: "#F4A20B", bold: true
                      });
                      rectY += 22;
                      drawText(activity.comments || "—", rectX, rectY + 5, {
                        size: 10, color: "#121E28", width: doc.page.width - 100
                      });
                      rectY = doc.y + 8;

                      // 🟠 Photo Headers
                      drawRect("#F4A20B", xPointH, rectY, (doc.page.width - 90) / 2 - 10, 22);
                      drawText("Defect Photo(s):", rectX, rectY + 7, {
                        size: 12, color: "#F4A20B", bold: true
                      });
                      drawRect("#F4A20B", xPointH + (doc.page.width - 90) / 2 + 10, rectY,
                        (doc.page.width - 90) / 2 - 10, 22);
                      drawText("Repair Photo(s):", xPointH + (doc.page.width - 90) / 2 + 15, rectY + 7, {
                        size: 12, color: "#F4A20B", bold: true
                      });

                      rectY += 28;

                      // 📸 Photos
                      const photoW = (doc.page.width - 120) / 2;
                      const photoH = 180;
                      const leftX = xPointH;
                      const rightX = xPointH + photoW + 29;

                      // Defect Photos
                      if (activity.maintenance_photo) {
                        drawImage(activity.maintenance_photo, leftX, rectY, photoW, photoH, 6,
                          activity.maintenance_comment || "This is a sample photo comment.");
                      }

                      // Repair Photos
                      if (activity.repair_photo) {
                        drawImage(activity.repair_photo, rightX, rectY, photoW, photoH, 6,
                          activity.repair_comment || "This is a sample photo comment.");
                      }

                      rectY += photoH + 40;
                    };

                    //------------------------------------------------------------
                    // Render Both Defects & No-Defects Activities
                    //------------------------------------------------------------
                    (section.section_maint_act_defects || []).forEach(item => renderMaintActivity(item, true));
                    (section.section_maint_act_no_defects || []).forEach(item => renderMaintActivity(item, false));
                  }

                  //--------------------------------------------------------------
                  // RECOMMENDED WORK ITEMS
                  //--------------------------------------------------------------
                  (section.recommended_work || []).forEach((work) => {
                    rectX = 45;
                    rectY = 45;
                    addPage(doc, page += 1);
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
              footerX: 40,
              footerLineStart: 40,
              footerLineEnd: 45,
              reportNameX: 230,
              pageXOffset: 85,
              includeSpacing: true // PM version used character/word spacing
            });
          };

          that.toDataURL("pdfgen/CMLogotaglineHigh.png", function (logo) {
            niceDocument(logo, {
              reportName: reportName,
              reportNameX: 230,
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
              drawHeader("#00529B", building.name, rectY, "Building: ");

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
              drawText(`Building: ${building.name}`, rectX, rectY - 17, {
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
              if (building.photos?.length) {
                const photoWidth = 257;
                const photoHeight = 172;
                const gap = 10;
                const photosPerRow = 2;

                let x = xPointH;
                let y = photoHeaderY + 35;
                let photoCount = 0;

                building.photos.forEach((photo, index) => {
                  // 🧾 Page break if image exceeds bottom margin
                  if (y + photoHeight + 60 > doc.page.height - 45) {
                    addPage(doc, page += 1);
                    y = 45; // reset Y same as initial base
                    x = xPointH;
                  }

                  // 🖼️ Draw the photo (use your helper)
                  drawImage(
                    photo.photo,
                    x,
                    y,
                    photoWidth,
                    photoHeight,
                    8,
                    photo.comment || "This is a sample photo comment."
                  );

                  photoCount++;
                  if (photoCount % photosPerRow === 0) {
                    // move to next row
                    x = xPointH;
                    y += photoHeight + 35;
                  } else {
                    // move to next column
                    x += photoWidth + gap;
                  }
                });

                rectY = y + photoHeight + 15; // keep rectY consistent
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

                if (section.aerial_photo_url) {
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
                  rectX = 45;
                  rectY = 45;
                  addPage(doc, page += 1);

                  // DEFECT HEADER
                  drawRect("#F4A20B", xPointH, (rectY += 52) - 45, doc.page.width - 90);
                  drawText(`Field of roof : ${defect.activity || ""} ${defect.selection || ""}`, rectX, rectY - 38, {
                    bold: true, size: 14, color: "#F4A20B", width: doc.page.width - 100
                  });

                  const leftColX = xPointH, rightColX = xPointH + 270, sectionTopY = rectY - 10;

                  // Overview
                  drawRect("#F4A20B", leftColX, sectionTopY, 257);
                  drawText("Overview:", rectX, sectionTopY + 7, { bold: true, size: 12, color: "#F4A20B" });
                  drawImage(defect.repair_overview_photo, leftColX, sectionTopY + 35, 257, 172);

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
                  drawRect("#F4A20B", leftColX, photoRowY, 257);
                  drawText("Defect:", rectX, photoRowY + 7, { bold: true, size: 12, color: "#F4A20B" });
                  drawImage(defect.defect_photo, leftColX, photoRowY + 35, 257, 172);

                  drawRect("#F4A20B", rightColX, photoRowY, doc.page.width - 360);
                  drawText("Repair:", rightColX + 5, photoRowY + 7, { bold: true, size: 12, color: "#F4A20B" });
                  drawImage(defect.repair_photo, rightColX, photoRowY + 35, 257, 172);
                });

                // RECOMMENDED WORK ITEMS
                (section.recommended_work || []).forEach((work) => {
                  rectX = 45;
                  rectY = 45;
                  addPage(doc, page += 1);
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

        const pd = jsonData;
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
          .text(pd.start_work_date ? `Start Work Date: ${pd.start_work_date}` : "", xPointH + 290, yPointCol2, { characterSpacing: -0.2, wordSpacing: -0.4 })
          .text(`PO Number: ${pd.po_number || ""}`, xPointCol1, yPointCol1 + 20, { characterSpacing: -0.2, wordSpacing: -0.4 })
          .text(pd.completed_work_date ? `Completed Work Date: ${pd.completed_work_date}` : "", xPointH + 290, yPointCol2 + 20, { characterSpacing: -0.2, wordSpacing: -0.4 });

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