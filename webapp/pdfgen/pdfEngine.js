
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

    let xPointH = 40,
      yPointH = 110,
      xPointCol1 = 40,
      yPointCol1 = 125,
      xPointCol2 = 282,
      yPointCol2 = 125;

    //--------------------------------------------------------------
    // 🧱 Common Helpers
    //--------------------------------------------------------------
    const BORDER_BLUE = "#00529B";
    const BORDER_GREEN = "#5AA755";
    const BORDER_RED = "#C4222F";
    const BORDER_ORANGE = "#F4A20B";
    const TEXT_DARK = "#121E28";

    // ────────────────────────────────────────────────────────────────
    // 🧩 Local helpers (non-global)
    // ────────────────────────────────────────────────────────────────
    const drawRect = (doc, color, x, y, w, h = 25, lw = 2) => {
      doc.lineJoin("round").lineWidth(lw).strokeColor(color).rect(x, y, w, h).stroke();
    };

    const drawRoundedRect = (doc, x, y, width, height, radius = 4, color = BORDER_BLUE, bFill) => {
      doc.lineJoin("round").lineWidth(2).strokeColor(color);
      doc.roundedRect(x, y, width, height, radius)

      if (bFill) {
        doc.fillAndStroke(color, color);
      } else {
        doc.stroke();
      }
    };

    const drawText = (doc, text, x, y, opts = {}) => {
      doc.font(opts.bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(opts.size || 10)
        .fillColor(opts.color || TEXT_DARK)
        .text(text, x, y, {
          width: opts.width || 200,
          align: opts.align || "left",
          characterSpacing: -0.2,
          wordSpacing: -0.4,
          link: opts.link
        });
    };

    const drawImage = (doc, img, x, y, w = 282, h = 212, radius = 4, commentText = "No Comments") => {
      if (!img) return;
      doc.save();
      doc.roundedRect(x, y, w, h, radius).clip();
      doc.image(`data:image/jpg;base64,${img}`, x, y, { width: w, height: h });
      doc.restore();
      drawText(doc, commentText, x, y + h + 6, { size: 9, width: w });
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
      doc.lineWidth(2)
        .moveTo(footerLineStart, doc.page.height - 28)
        .lineTo(doc.page.width - footerLineEnd, doc.page.height - 28)
        .stroke()
        .fillColor(BORDER_BLUE)
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
      doc.fillColor(TEXT_DARK);
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
            that.createFirstPageInfo(doc, jsonData, logo, reportName, xPoint, yPoint);

            addPage(doc, page += 1);
            const fullWidth = doc.page.width - 90;
            //--------------------------------------------------------------
            // 📄 Report Summary Header
            //--------------------------------------------------------------
            let rectX = 45;
            let rectY = 45;

            drawRoundedRect(doc, xPointH, rectY - 25, fullWidth, 35, 4, BORDER_BLUE);

            doc.fontSize(18)
              .font("Helvetica-Bold")
              .fillColor(BORDER_BLUE)
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
                drawRoundedRect(doc, xPointH, textY - 20, doc.page.width - 90, 25, 4, color, true);

                doc.fontSize(color === BORDER_BLUE ? 14 : 13)
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

                drawRoundedRect(doc, tableX, rectY - 5, tableWidth, rowHeight, 4, BORDER_BLUE);

                // Vertical divider
                doc.lineJoin("round")
                  .lineWidth(2)
                  .strokeColor(BORDER_BLUE)
                  .rect(tableX + colWidths[0], rectY - 5, 0.5, rowHeight)
                  .stroke();

                // Text
                doc.font("Helvetica")
                  .fontSize(10)
                  .fillColor(TEXT_DARK)
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
              drawHeader(BORDER_BLUE, building.building_name, rectY, "Building: ");

              rectY += 15;
              drawSummaryRow("Building Inspections", `${building.building_inspection_dfct_cnt || "0"} Defects`);
              rectY -= 5;

              //--------------------------------------------------------------
              // 🟧 SECTIONS SUMMARY
              //--------------------------------------------------------------
              (building.sections || []).forEach((section) => {
                rectY += 25;
                drawHeader(BORDER_ORANGE, section.section_name, rectY, "Section: ");
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
            (jsonData.buildings || []).forEach((building) => {

              // ────────────────────────────────────────────────────────────────
              // 📄 PAGE CHECKER
              // ────────────────────────────────────────────────────────────────
              if (addPage(doc, page += 1, 270)) rectY = doc.y; else page -= 1;

              // ────────────────────────────────────────────────────────────────
              // 🏠 BUILDING HEADER
              // ────────────────────────────────────────────────────────────────
              drawRoundedRect(doc, xPointH, (rectY += 27) - 25, doc.page.width - 90, 25, 4, BORDER_BLUE);
              drawText(doc, `Building: ${building.name}`, rectX, rectY - 17, {
                bold: true, size: 14, color: BORDER_BLUE, width: doc.page.width - 120
              });

              // 🔗 Building Aerial Photo Button
              if (building.aerial_photo_url) {
                const [btnWidth, btnHeight, radius] = [180, 15, 6];
                const btnX = doc.page.width - btnWidth - 54, btnY = rectY - 20;
                doc.save();
                doc.roundedRect(btnX, btnY, btnWidth, btnHeight, radius).fill(BORDER_BLUE);
                doc.restore();
                drawText(doc, "Building Aerial View Photo", btnX, btnY + 4, {
                  bold: true, size: 10, color: "white", width: btnWidth, align: "center", link: building.aerial_photo_url
                });
              }

              // ────────────────────────────────────────────────────────────────
              // 🟧 BUILDING COMMENTS
              // ────────────────────────────────────────────────────────────────
              drawRoundedRect(doc, xPointH, (rectY += 25) - 20, doc.page.width - 90, 25, 4, BORDER_ORANGE);
              drawText(doc, "Comments", rectX, rectY - 13, { bold: true, size: 12, color: BORDER_ORANGE });
              drawText(doc, building.comments || "No comments provided.", rectX, rectY + 20, {
                size: 10, width: doc.page.width - 90
              });

              // ────────────────────────────────────────────────────────────────
              // 🏗️ BUILDING PHOTO
              // ────────────────────────────────────────────────────────────────
              const photoHeaderY = doc.y + 10;
              drawRoundedRect(doc, xPointH, photoHeaderY, doc.page.width - 90, 25, 4, BORDER_ORANGE);
              drawText(doc, "Building Photo(s)", rectX, photoHeaderY + 8, { bold: true, size: 12, color: BORDER_ORANGE });
              if (building.photos?.length) {
                const photoWidth = 257;
                const photoHeight = 172;
                const gap = 10;
                const photosPerRow = 2;

                let x = xPointH;
                let y = photoHeaderY + 30;
                let photoCount = 0;

                (building.photos || []).forEach((photo, index) => {
                  // 🧾 Page break if image exceeds bottom margin
                  if (y + photoHeight + 60 > doc.page.height - 45) {
                    addPage(doc, page += 1);
                    y = 45; // reset Y same as initial base
                    x = xPointH;
                  }

                  // 🖼️ Draw the photo (use your helper)
                  drawImage(doc,
                    photo.photo,
                    x,
                    y,
                    photoWidth,
                    photoHeight,
                    8,
                    photo.comments || "No Comments"
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

              const drawHeaderBar = (title, y) => {
                const fullWidth = doc.page.width - 90;
                drawRoundedRect(doc, xPointH, y - 20, fullWidth, 25, 4, BORDER_BLUE);
                doc.font("Helvetica-Bold").fontSize(14).fillColor(BORDER_BLUE)
                  .text(title, rectX, y - 13, {
                    width: fullWidth, align: "left", characterSpacing: -0.2,
                    wordSpacing: -0.4
                  });
              };

              const drawTableHeader = (headers, colWidths, y) => {
                const fullWidth = doc.page.width - 90;
                const tableX = xPointH;

                // Blue background header (filled rounded rect)
                drawRoundedRect(doc, tableX, y, fullWidth, 25, 4, BORDER_BLUE, true);

                let x = rectX;

                (headers || []).forEach((h, i) => {
                  drawText(doc, h, x, y + 6, {
                    bold: true,
                    size: 12,
                    color: "white",
                    width: colWidths[i],
                    align: h === "Rating" ? "center" : "left"
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
                drawRoundedRect(doc, tableX, y, fullWidth, rowHeight, 4, BORDER_BLUE, false);

                // Internal vertical lines
                let x = rectX;
                for (let i = 0; i < colWidths.length - 1; i++) {
                  x += colWidths[i];

                  // vertical line = roundedRect with width=1
                  drawRoundedRect(doc, x, y, 1, rowHeight, 1, BORDER_BLUE, false);
                }

                if (withRating) {
                  const [rating, comp, defect] = values;
                  const ratingColor = rating === "RN" ? BORDER_RED : BORDER_GREEN;
                  const symbol = rating === "RN" ? "RN" : "ND";

                  // Rating “circle” using roundedRect (PDFKit alternative)
                  drawRoundedRect(doc, tableX + colWidths[0] / 2 - 7, y + rowHeight / 2 - 7, 14, 14, 7, ratingColor, true);

                  // Symbol inside circle
                  drawText(doc, symbol, tableX, y + 5, { bold: true, size: 10, color: "white", width: colWidths[0], align: "center" });

                  // Component text
                  drawText(doc, comp || "", tableX + colWidths[0] + 10, y + 5, {
                    size: 10,
                    width: colWidths[1] - 20
                  });

                  // Defect text
                  drawText(doc, defect || "", tableX + colWidths[0] + colWidths[1] + 10, y + 5, {
                    size: 10,
                    width: colWidths[2] - 20
                  });

                } else {
                  let textX = rectX;

                  (values || []).forEach((v, i) => {
                    drawText(doc, v || "", textX, y + 5, {
                      size: 10,
                      width: colWidths[i] - 20
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
                rectY += 30;

                (building.specification_matrix || []).forEach(row => {
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
                rectY += 30;

                (building.inspection_matrix || []).forEach(row => {
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

                // 🔵 Header Rectangle (rounded)
                drawRoundedRect(doc, xPointH, rectY - 25, doc.page.width - 90, 35, 4, BORDER_BLUE, false);

                // 🏷️ Header Text
                drawText(doc, `Building Inspections for ${building.name || ""}`, rectX, rectY - 15, {
                  bold: true, size: 18, color: BORDER_BLUE, width: doc.page.width - 90
                });

                (building.inspections || []).forEach(inspection => {

                  if (addPage(doc, page += 1, 270)) {
                    rectY = doc.y - 40;
                  } else {
                    page -= 1;
                  }

                  rectY += 15;

                  // 🔶 Activity Header Bar
                  drawRoundedRect(doc, xPointH, rectY, doc.page.width - 90, 25, 4, BORDER_ORANGE, false);
                  rectY += 20;

                  // Activity text
                  drawText(
                    doc,
                    `${inspection.activity || ""} : ${inspection.selections?.[0]?.selection || ""}`,
                    rectX,
                    rectY - 12,
                    { bold: true, size: 14, color: BORDER_ORANGE, width: doc.page.width - 90 }
                  );

                  rectY += 10;

                  // 🔶 Comments header bar
                  drawRoundedRect(doc, xPointH, rectY, doc.page.width - 90, 20, 4, BORDER_ORANGE, false);
                  rectY += 20;

                  drawText(doc, `Comments`, rectX, rectY - 15, {
                    bold: true, size: 12, color: BORDER_ORANGE, width: doc.page.width - 90
                  });

                  rectY += 10;

                  // Comments
                  drawText(doc, inspection.comments || "No comments provided.", rectX, rectY, {
                    size: 10, width: doc.page.width - 90
                  });

                  rectY += 15;

                  // 🔶 Photos header bar
                  drawRoundedRect(doc, xPointH, rectY, doc.page.width - 90, 20, 4, BORDER_ORANGE, false);
                  rectY += 20;

                  drawText(doc, `Photo(s)`, rectX, rectY - 15, {
                    bold: true, size: 12, color: BORDER_ORANGE, width: doc.page.width - 90
                  });

                  rectY += 10;

                  // 🖼️ Photos grid
                  if (inspection.photos?.length) {

                    const photoWidth = 257;
                    const photoHeight = 172;
                    const gapX = 10;
                    const gapY = 20;
                    const perRow = 2;

                    let x = xPointH;
                    let y = rectY;
                    let count = 0;

                    (inspection.photos || []).forEach(photo => {

                      // Page break check
                      if (y + photoHeight > doc.page.height) {
                        addPage(doc, page += 1);
                        x = xPointH;
                        y = 45;
                      }

                      // Image
                      drawImage(doc, photo.photo, x, y, photoWidth, photoHeight, 8, photo.comments || "No Comments");

                      count++;

                      if (count % perRow === 0) {
                        x = xPointH;
                        y += photoHeight + gapY;
                      } else {
                        x += photoWidth + gapX;
                      }
                    });

                    const totalRows = Math.ceil(inspection.photos.length / perRow);
                    rectY = rectY + (photoHeight + gapY) * totalRows - gapY + 10;
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
                  drawRoundedRect(doc, xPointH, rectY - 25, doc.page.width - 90, 25, 4, BORDER_BLUE);
                  drawText(doc, `Section: ${section.name}`, rectX, rectY - 17, {
                    bold: true, size: 14, color: BORDER_BLUE, width: doc.page.width - 120
                  });

                  if (section.aerial_photo_url) {
                    const [btnWidth, btnHeight, radius] = [180, 15, 6];
                    const btnX = doc.page.width - btnWidth - 54, btnY = rectY - 20;
                    doc.save(); doc.roundedRect(btnX, btnY, btnWidth, btnHeight, radius).fill(BORDER_BLUE); doc.restore();
                    drawText(doc, "Section Aerial View Photo", btnX, btnY + 4, {
                      bold: true, size: 10, color: "white", width: btnWidth, align: "center", link: section.aerial_photo_url
                    });
                  }

                  // COMMENTS
                  drawRoundedRect(doc, xPointH, (rectY += 25) - 20, doc.page.width - 90, 25, 4, BORDER_ORANGE);
                  drawText(doc, "Comments", rectX, rectY - 13, { bold: true, size: 12, color: BORDER_ORANGE });
                  drawText(doc, section.comments || "No comments provided.", rectX, rectY + 20, {
                    size: 10, width: doc.page.width - 90
                  });

                  // SECTION PHOTO
                  const photoY = doc.y + 10;
                  drawRoundedRect(doc, xPointH, photoY, doc.page.width - 90, 25, 4, BORDER_ORANGE);
                  drawText(doc, "Section Overview Photo", rectX, photoY + 8, { bold: true, size: 12, color: BORDER_ORANGE });
                  if (section.photos?.length) {
                    const photoWidth = 257;
                    const photoHeight = 172;
                    const gap = 10;
                    const photosPerRow = 2;

                    let x = xPointH;
                    let y = photoY + 35;
                    let photoCount = 0;

                    (section.photos || []).forEach((photo, index) => {
                      // 🧾 Page break if image exceeds bottom margin
                      if (y + photoHeight + 60 > doc.page.height - 45) {
                        addPage(doc, page += 1);
                        y = 45; // reset Y same as initial base
                        x = xPointH;
                      }

                      // 🖼️ Draw the photo (use your helper)
                      drawImage(doc,
                        photo.photo,
                        x,
                        y,
                        photoWidth,
                        photoHeight,
                        8,
                        photo.comments || "No Comments"
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
                    rectY += 30;

                    (section.specification_matrix || []).forEach(row => {
                      rectY += drawTableRow([row.component, row.type], specCols, rectY);
                    });
                  }

                  //--------------------------------------------------------------
                  // 🧱 Maintenance Activity Matrix
                  //--------------------------------------------------------------
                  if (section.maint_act_matrix?.length) {
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

                    (section.maint_act_matrix || []).forEach(row => {
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
                    rectY += 30;

                    // Table Rows
                    (section.inspection_matrix || []).forEach(row => {
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

                  //--------------------------------------------------------------
                  // 🏗️ SECTION INSPECTIONS (FINAL + PAGE-SAFE)
                  //--------------------------------------------------------------
                  if (section.inspections?.length) {

                    rectX = 45;
                    rectY = 45;
                    addPage(doc, page += 1);

                    //--------------------------------------------------------------
                    // 🔵 Header: Inspections for Section
                    //--------------------------------------------------------------
                    drawRoundedRect(doc, xPointH, rectY, doc.page.width - 90, 35, 4, BORDER_BLUE);
                    doc.font("Helvetica-Bold").fontSize(18).fillColor(BORDER_BLUE)
                      .text(`Inspections for section: ${section.name}`, rectX, rectY + 9);

                    rectY += 40;

                    //--------------------------------------------------------------
                    // 🔁 LOOP through each INSPECTION
                    //--------------------------------------------------------------
                    (section.inspections || []).forEach((insp) => {

                      //-------------------------------------------------------------------
                      // 📌 1️⃣ Calculate TOTAL HEIGHT required for this entire inspection
                      //-------------------------------------------------------------------
                      const photoRows = insp.photos?.length ? Math.ceil(insp.photos.length / 2) : 0;
                      const photoBlockHeight = photoRows * (172 + 20); // (height + gap)

                      const descriptionHeight = 45;
                      const commentsHeight = insp.comments ? 45 : 0;
                      const headerHeight = 30;
                      const photoHeaderHeight = 35;

                      const totalBlockHeight =
                        headerHeight +
                        descriptionHeight +
                        commentsHeight +
                        photoHeaderHeight +
                        photoBlockHeight +
                        40;

                      //-------------------------------------------------------------------
                      // 📌 2️⃣ PAGE BREAK: Move whole block to next page if it won't fit
                      //-------------------------------------------------------------------
                      if (rectY + totalBlockHeight > doc.page.height - 60) {
                        addPage(doc, page += 1);
                        rectY = 45;
                      }

                      //-------------------------------------------------------------------
                      // 🟢🔴 3️⃣ INSPECTION TITLE BAR
                      //-------------------------------------------------------------------
                      const isRepair = insp.rating === "RN";
                      const color = isRepair ? BORDER_RED : BORDER_GREEN;
                      const symbol = isRepair ? "RN" : "ND";

                      drawRoundedRect(doc, xPointH, rectY, doc.page.width - 90, 25, 4, color);

                      doc.circle(rectX + 9, rectY + 12, 8).fillAndStroke(color, color);
                      doc.font("Helvetica-Bold").fontSize(11).fillColor("white")
                        .text(symbol, rectX + 2, rectY + 7);

                      doc.font("Helvetica-Bold").fontSize(13).fillColor(color)
                        .text(`${insp.activity} : ${insp.selections[0].selection}`,
                          rectX + 22,
                          rectY + 7
                        );

                      rectY += 30;

                      //-------------------------------------------------------------------
                      // 🟠 4️⃣ DESCRIPTION HEADER
                      //-------------------------------------------------------------------
                      drawRoundedRect(doc, xPointH, rectY, doc.page.width - 90, 22, 4, BORDER_ORANGE);
                      doc.font("Helvetica-Bold").fontSize(12).fillColor(BORDER_ORANGE)
                        .text("Description:", rectX, rectY + 6);

                      rectY += 28;

                      doc.font("Helvetica").fontSize(10).fillColor(TEXT_DARK)
                        .text(insp.selections[0].description || "—", rectX, rectY, {
                          width: doc.page.width - 90
                        });

                      rectY = doc.y + 10;

                      //-------------------------------------------------------------------
                      // 🟠 5️⃣ COMMENTS (ONLY IF PRESENT)
                      //-------------------------------------------------------------------
                      if (insp.comments && insp.comments !== "-" && insp.comments !== "—") {

                        drawRoundedRect(doc, xPointH, rectY, doc.page.width - 90, 22, 4, BORDER_ORANGE);
                        doc.font("Helvetica-Bold").fontSize(12).fillColor(BORDER_ORANGE)
                          .text("Comments:", rectX, rectY + 6);

                        rectY += 28;

                        doc.font("Helvetica").fontSize(10).fillColor(TEXT_DARK)
                          .text(insp.comments, rectX, rectY, {
                            width: doc.page.width - 90
                          });

                        rectY = doc.y + 10;
                      }

                      //-------------------------------------------------------------------
                      // 🟠 6️⃣ PHOTO(S) HEADER
                      //-------------------------------------------------------------------
                      drawRoundedRect(doc, xPointH, rectY, doc.page.width - 90, 22, 4, BORDER_ORANGE);
                      doc.font("Helvetica-Bold").fontSize(12).fillColor(BORDER_ORANGE)
                        .text("Photo(s)", rectX, rectY + 6);

                      rectY += 30;

                      //-------------------------------------------------------------------
                      // 🖼️ 7️⃣ PHOTO GRID (2 per row)
                      //-------------------------------------------------------------------
                      if (insp.photos?.length) {

                        const photoWidth = 257;
                        const photoHeight = 172;
                        const gapX = 10;
                        const gapY = 20;

                        let x = xPointH;
                        let y = rectY;
                        let count = 0;

                        (insp.photos || []).forEach((photo) => {

                          // Page break check
                          if (y + photoHeight > doc.page.height) {
                            addPage(doc, page += 1);
                            x = xPointH;
                            y = 45;
                          }

                          drawImage(doc, photo.photo, x, y, photoWidth, photoHeight, 8, photo.comments || "No Comments");
                          count++;
                          if (count % 2 === 0) {
                            x = xPointH;
                            y += photoHeight + gapY;
                          } else {
                            x += photoWidth + gapX;
                          }
                        });

                        // Final rectY based on completed photo rows
                        const photoRowsFinal = Math.ceil(insp.photos.length / 2);
                        rectY = rectY + (photoRowsFinal * (photoHeight + gapY)) - gapY + 10;
                      }

                      rectY += 15; // spacing between inspection blocks
                    });
                  }

                  //--------------------------------------------------------------
                  // 🏗️ Maintenance Activities for Section
                  //--------------------------------------------------------------
                  if (section.maint_acts?.length) {
                    rectX = 45;
                    rectY = 45;
                    addPage(doc, page += 1);

                    // 🔹 Blue Header Bar
                    const headerH = 25;
                    drawRoundedRect(doc, xPointH, rectY, doc.page.width - 90, headerH + 25, 4, BORDER_BLUE);
                    drawText(doc, "Maintenance Activities for section:", rectX, rectY + 10, {
                      size: 14, color: BORDER_BLUE, bold: true, align: "left",
                      width: doc.page.width - 90
                    });
                    drawText(doc, section.name || "", rectX, rectY + 27, {
                      size: 18, color: BORDER_BLUE, bold: true, align: "left",
                      width: doc.page.width - 90
                    });

                    rectY += 55;

                    //------------------------------------------------------------
                    // Render Helper for Each Maintenance Activity Entry
                    //------------------------------------------------------------
                    const renderMaintActivity = (activity, isDefect) => {

                      if (addPage(doc, page += 1, 400)) rectY = doc.y; else page -= 1;
                      // 🟧 Activity Header (outlined, no fill)
                      const barColor = BORDER_ORANGE;
                      const barHeight = 25;

                      // Draw only the border — rounded edges, thin stroke
                      doc.lineJoin("round")
                        .lineWidth(2)
                        .strokeColor(barColor)
                        .roundedRect(xPointH, rectY, doc.page.width - 90, barHeight, 4)
                        .stroke();

                      // Title text inside the bordered box
                      drawText(doc, `${activity.activity || ""} ${activity.selections[0].selection}`, rectX, rectY + 8, {
                        size: 13,
                        color: barColor,   // orange text same as border
                        bold: true,
                        width: doc.page.width - 90
                      });

                      rectY += barHeight + 5;

                      // 🟠 Description Header
                      drawRoundedRect(doc, xPointH, rectY, doc.page.width - 90, 22, 4, BORDER_ORANGE);
                      drawText(doc, "Description:", rectX, rectY + 7, {
                        size: 12, color: BORDER_ORANGE, bold: true
                      });

                      rectY += 30;
                      drawText(doc, activity.selections[0].description || "", rectX, rectY, {
                        size: 10, color: TEXT_DARK, width: doc.page.width - 100
                      });

                      rectY = doc.y + 5;

                      // 🟠 Comments
                      drawRoundedRect(doc, xPointH, rectY, doc.page.width - 90, 22, 4, BORDER_ORANGE);
                      drawText(doc, "Comments:", rectX, rectY + 5, {
                        size: 12, color: BORDER_ORANGE, bold: true
                      });
                      rectY += 22;
                      drawText(doc, activity.comments || "—", rectX, rectY + 5, {
                        size: 10, color: TEXT_DARK, width: doc.page.width - 100
                      });
                      rectY = doc.y + 8;

                      // 🟠 Photo Headers
                      drawRoundedRect(doc, xPointH, rectY, (doc.page.width - 90) / 2 - 10, 22, 4, BORDER_ORANGE);
                      drawText(doc, "Defect Photo(s):", rectX, rectY + 7, {
                        size: 12, color: BORDER_ORANGE, bold: true
                      });
                      drawRoundedRect(doc, xPointH + (doc.page.width - 90) / 2 + 10, rectY, (doc.page.width - 90) / 2 - 10, 22, 4, BORDER_ORANGE);
                      drawText(doc, "Repair Photo(s):", xPointH + (doc.page.width - 90) / 2 + 15, rectY + 7, {
                        size: 12, color: BORDER_ORANGE, bold: true
                      });

                      if (activity.overview_photos) {
                        // 🟠 Photo Headers
                        drawRoundedRect(doc, xPointH, rectY + 232, (doc.page.width - 90) / 2 - 10, 22, 4, BORDER_ORANGE);
                        drawText(doc, "Overview Photo(s):", rectX, rectY + 237, {
                          size: 12, color: BORDER_ORANGE, bold: true
                        });
                      }

                      rectY += 28;

                      // 📸 Photos
                      const photoW = (doc.page.width - 120) / 2;
                      const photoH = 180;
                      const leftX = xPointH;
                      const rightX = xPointH + photoW + 29;

                      // Defect Photos
                      if (activity.defect_photos) {
                        drawImage(doc, activity.defect_photos[0].photo, leftX, rectY, photoW, photoH, 6,
                          activity.comments || "No Comments");
                      }

                      // Repair Photos
                      if (activity.repair_photos) {
                        drawImage(doc, activity.repair_photos[0].photo, rightX, rectY, photoW, photoH, 6,
                          activity.comments || "No Comments");
                      }

                      // Repair Photos
                      if (activity.overview_photos) {
                        rectY += 232;
                        drawImage(doc, activity.overview_photos[0].photo, leftX, rectY, photoW, photoH, 6,
                          activity.comments || "No Comments");
                      }

                      rectY += photoH + 40;
                    };

                    //------------------------------------------------------------
                    // Render Both Defects & No-Defects Activities
                    //------------------------------------------------------------
                    (section.maint_acts || []).forEach(item => renderMaintActivity(item, true));
                  }

                  //--------------------------------------------------------------
                  // RECOMMENDED WORK ITEMS
                  //--------------------------------------------------------------
                  (section.recommended_work || []).forEach((work) => {
                    rectX = 45;
                    rectY = 45;
                    addPage(doc, page += 1);
                    const headerX = rectX, headerWidth = doc.page.width - 90;

                    // Header (Blue)
                    drawRoundedRect(doc, xPointH, (rectY += 25) - 25, headerWidth, 25, 4, BORDER_BLUE);
                    drawText(doc, "Recommended Work for section:", headerX, rectY - 17, {
                      bold: true, size: 14, color: BORDER_BLUE, width: headerWidth - 20
                    });
                    drawText(doc, section.name || "", headerX + 215, rectY - 17, {
                      bold: true, size: 14, color: BORDER_BLUE, width: headerWidth
                    });

                    // Drainage (Yellow)
                    drawRoundedRect(doc, xPointH, (rectY += 30) - 25, headerWidth, 25, 4, BORDER_ORANGE);
                    drawText(doc, `${work.activity || ""}: ${work.selections[0].selection}`, headerX, rectY - 17, {
                      bold: true, size: 13, color: BORDER_ORANGE, width: headerWidth
                    });

                    // Comments (Yellow)
                    drawRoundedRect(doc, xPointH, (rectY += 25) - 20, headerWidth, 25, 4, BORDER_ORANGE);
                    drawText(doc, "Comments:", headerX, rectY - 13, {
                      bold: true, size: 12, color: BORDER_ORANGE
                    });
                    drawText(doc, work.comments || "No comments provided.", headerX, rectY + 20, {
                      size: 10, width: headerWidth
                    });

                    // Photos (Yellow)
                    const photoHeaderY = doc.y + 10;
                    drawRoundedRect(doc, xPointH, photoHeaderY, headerWidth, 25, 4, BORDER_ORANGE);
                    drawText(doc, "Photo(s):", headerX, photoHeaderY + 7, {
                      bold: true, size: 12, color: BORDER_ORANGE
                    });

                    // Photo Grid
                    const photos = work.photos || [];
                    const imgW = 257, imgH = 172, colGap = 25, radius = 4;
                    const photoStartY = photoHeaderY + 32;
                    let col = 0, row = 0;

                    (photos || []).forEach((photo) => {
                      const imgX = headerX + col * (imgW + colGap);
                      const imgY = photoStartY + row * (imgH + 60);
                      drawImage(doc, photo.photo, imgX, imgY, imgW, imgH, radius, photo.comment);
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
            that.createFirstPageInfo(doc, jsonData, logo, reportName, xPoint, yPoint);

            addPage(doc, page += 1);

            //--------------------------------------------------------------
            // 📄 Report Summary Header
            //--------------------------------------------------------------
            let rectX = 45;
            let rectY = 45;

            // Draw "Report Summary" box border only
            doc.lineJoin("round")
              .lineWidth(2)
              .strokeColor(BORDER_BLUE)
              .rect(xPointH, rectY - 25, doc.page.width - 90, 35)
              .stroke();

            doc.fontSize(18)
              .font("Helvetica-Bold")
              .fillColor(BORDER_BLUE)
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
                  .lineWidth(2)
                  .strokeColor(color)
                  .rect(xPointH, textY - 20, doc.page.width - 90, 25)
                  .fillAndStroke(color, color);

                doc.fontSize(color === BORDER_BLUE ? 14 : 13)
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
                  .lineWidth(2)
                  .strokeColor(BORDER_BLUE)
                  .rect(tableX, rectY - 5, tableWidth, rowHeight)
                  .stroke();

                // vertical column separators
                let xPos = tableX;
                for (let i = 0; i < colWidths.length - 1; i++) {
                  xPos += colWidths[i];
                  doc.moveTo(xPos, rectY - 5).lineTo(xPos, rectY - 5 + rowHeight).stroke();
                }

                doc.font("Helvetica").fontSize(10).fillColor(TEXT_DARK)
                  .text(label, tableX + 6, rectY + 2, { width: colWidths[0] - 8, characterSpacing: -0.2, wordSpacing: -0.4 })
                  .text(activity, tableX + colWidths[0] + 6, rectY + 2, { width: colWidths[1] - 8, characterSpacing: -0.2, wordSpacing: -0.4 })
                  .text(selection, tableX + colWidths[0] + colWidths[1] + 6, rectY + 2, { width: colWidths[2] - 8, characterSpacing: -0.2, wordSpacing: -0.4 });

                rectY += rowHeight;
              };

              // 🔵 BUILDING HEADER BAR
              rectY += 35;
              drawHeader(BORDER_BLUE, building.name, rectY, "Building: ");

              //--------------------------------------------------------------
              // 🟧 SECTION LIST
              //--------------------------------------------------------------
              (building.sections || []).forEach((section) => {
                rectY += 30;
                drawHeader(BORDER_ORANGE, section.section_name, rectY, "Section: ");
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
            (jsonData.buildings || []).forEach((building) => {
              // ────────────────────────────────────────────────────────────────
              // 🧩 Local helpers (non-global)
              // ────────────────────────────────────────────────────────────────
              const drawRect = (color, x, y, w, h = 25, lw = 2) => {
                doc.lineJoin("round").lineWidth(lw).strokeColor(color).rect(x, y, w, h).stroke();
              };

              const drawText = (text, x, y, opts = {}) => {
                doc.font(opts.bold ? "Helvetica-Bold" : "Helvetica")
                  .fontSize(opts.size || 10)
                  .fillColor(opts.color || TEXT_DARK)
                  .text(text, x, y, {
                    width: opts.width || 200,
                    align: opts.align || "left",
                    characterSpacing: -0.2,
                    wordSpacing: -0.4,
                    link: opts.link
                  });
              };

              const drawImage = (img, x, y, w = 282, h = 212, radius = 4, commentText = "No Comments") => {
                if (!img) return;
                doc.save();
                doc.roundedRect(x, y, w, h, radius).clip();
                doc.image(`data:image/jpg;base64,${img}`, x, y, { width: w, height: h });
                doc.restore();
                drawText(doc, commentText, x, y + h + 6, { size: 9, width: w });
              };

              // ────────────────────────────────────────────────────────────────
              // 📄 PAGE CHECKER
              // ────────────────────────────────────────────────────────────────
              if (addPage(doc, page += 1, 270)) rectY = doc.y; else page -= 1;

              // ────────────────────────────────────────────────────────────────
              // 🏠 BUILDING HEADER
              // ────────────────────────────────────────────────────────────────
              drawRect(doc, BORDER_BLUE, xPointH, (rectY += 27) - 25, doc.page.width - 90);
              drawText(doc, `Building: ${building.name}`, rectX, rectY - 17, {
                bold: true, size: 14, color: BORDER_BLUE, width: doc.page.width - 120
              });

              // 🔗 Building Aerial Photo Button
              if (building.aerial_photo_url) {
                const [btnWidth, btnHeight, radius] = [180, 15, 6];
                const btnX = doc.page.width - btnWidth - 54, btnY = rectY - 20;
                doc.save();
                doc.roundedRect(btnX, btnY, btnWidth, btnHeight, radius).fill(BORDER_BLUE);
                doc.restore();
                drawText(doc, "Building Aerial View Photo", btnX, btnY + 4, {
                  bold: true, size: 10, color: "white", width: btnWidth, align: "center", link: building.aerial_photo_url
                });
              }

              // ────────────────────────────────────────────────────────────────
              // 🟧 BUILDING COMMENTS
              // ────────────────────────────────────────────────────────────────
              drawRect(doc, BORDER_ORANGE, xPointH, (rectY += 25) - 20, doc.page.width - 90);
              drawText(doc, "Comments", rectX, rectY - 13, { bold: true, size: 14, color: BORDER_ORANGE });
              drawText(doc, building.building_comments || "No comments provided.", rectX, rectY + 20, {
                size: 10, width: doc.page.width - 90
              });

              // ────────────────────────────────────────────────────────────────
              // 🏗️ BUILDING PHOTO
              // ────────────────────────────────────────────────────────────────
              const photoHeaderY = doc.y + 10;
              drawRect(doc, BORDER_ORANGE, xPointH, photoHeaderY, doc.page.width - 90);
              drawText(doc, "Building Photo", rectX, photoHeaderY + 8, { bold: true, size: 14, color: BORDER_ORANGE });
              if (building.photos?.length) {
                const photoWidth = 257;
                const photoHeight = 172;
                const gap = 10;
                const photosPerRow = 2;

                let x = xPointH;
                let y = photoHeaderY + 35;
                let photoCount = 0;

                (building.photos || []).forEach((photo, index) => {
                  // 🧾 Page break if image exceeds bottom margin
                  if (y + photoHeight + 60 > doc.page.height - 45) {
                    addPage(doc, page += 1);
                    y = 45; // reset Y same as initial base
                    x = xPointH;
                  }

                  // 🖼️ Draw the photo (use your helper)
                  drawImage(doc,
                    photo.photo,
                    x,
                    y,
                    photoWidth,
                    photoHeight,
                    8,
                    photo.comments || "No Comments"
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
                drawRect(doc, BORDER_BLUE, xPointH, (rectY += 27) - 25, doc.page.width - 90);
                drawText(doc, `Section: ${section.section_name}`, rectX, rectY - 17, {
                  bold: true, size: 14, color: BORDER_BLUE, width: doc.page.width - 120
                });

                if (section.aerial_photo_url) {
                  const [btnWidth, btnHeight, radius] = [180, 15, 6];
                  const btnX = doc.page.width - btnWidth - 54, btnY = rectY - 20;
                  doc.save(); doc.roundedRect(btnX, btnY, btnWidth, btnHeight, radius).fill(BORDER_BLUE); doc.restore();
                  drawText(doc, "Section Aerial View Photo", btnX, btnY + 4, {
                    bold: true, size: 10, color: "white", width: btnWidth, align: "center", link: section.aerial_photo_url
                  });
                }

                // COMMENTS
                drawRect(doc, BORDER_ORANGE, xPointH, (rectY += 25) - 20, doc.page.width - 90);
                drawText(doc, "Comments", rectX, rectY - 13, { bold: true, size: 14, color: BORDER_ORANGE });
                drawText(doc, section.section_comments || "No comments provided.", rectX, rectY + 20, {
                  size: 10, width: doc.page.width - 90
                });

                // SECTION PHOTO
                const photoY = doc.y + 10;
                drawRect(doc, BORDER_ORANGE, xPointH, photoY, doc.page.width - 90);
                drawText(doc, "Section Overview Photo", rectX, photoY + 8, { bold: true, size: 14, color: BORDER_ORANGE });
                if (section.section_photo) {
                  drawImage(doc, section.section_photo, xPointH, photoY + 35);
                  rectY = photoY + 35 + 212 + 15;
                }

                // DEFECT SUMMARY
                if (section.defects?.length) {
                  rectX = 45; rectY = 45; addPage(doc, page += 1);
                  drawRect(doc, BORDER_BLUE, xPointH, (rectY += 52) - 50, doc.page.width - 90, 50);
                  drawText(doc, "Defect Summary For Section:", rectX, rectY - 42, {
                    bold: true, size: 14, color: BORDER_BLUE, width: doc.page.width - 90
                  });
                  drawText(doc, section.section_name || "", rectX, rectY - 20, {
                    bold: true, size: 14, color: BORDER_BLUE, width: doc.page.width - 90
                  });
                }

                // DEFECTS LOOP
                (section.defects || []).forEach(defect => {
                  rectX = 45;
                  rectY = 45;
                  addPage(doc, page += 1);

                  // DEFECT HEADER
                  drawRect(doc, BORDER_ORANGE, xPointH, (rectY += 52) - 45, doc.page.width - 90);
                  drawText(doc, `Field of roof : ${defect.activity || ""} ${defect.selection || ""}`, rectX, rectY - 38, {
                    bold: true, size: 14, color: BORDER_ORANGE, width: doc.page.width - 100
                  });

                  const leftColX = xPointH, rightColX = xPointH + 270, sectionTopY = rectY - 10;

                  // Overview
                  drawRect(doc, BORDER_ORANGE, leftColX, sectionTopY, 257);
                  drawText(doc, "Overview:", rectX, sectionTopY + 7, { bold: true, size: 12, color: BORDER_ORANGE });
                  drawImage(doc, defect.repair_overview_photo, leftColX, sectionTopY + 35, 257, 172);

                  // Description
                  drawRect(doc, BORDER_ORANGE, rightColX, sectionTopY, doc.page.width - 360);
                  drawText(doc, "Description:", rightColX + 5, sectionTopY + 7, { bold: true, size: 12, color: BORDER_ORANGE });
                  drawText(doc, defect.description || "No description provided.", rightColX, sectionTopY + 35, {
                    size: 10, width: doc.page.width - 380
                  });

                  // Comments
                  const commentY = doc.y + 10;
                  drawRect(doc, BORDER_ORANGE, rightColX, commentY, doc.page.width - 360);
                  drawText(doc, "Comments:", rightColX + 5, commentY + 7, { bold: true, size: 12, color: BORDER_ORANGE });
                  drawText(doc, defect.comments || "No comments provided.", rightColX, commentY + 32, {
                    size: 10, width: doc.page.width - 380
                  });

                  // Defect + Repair Photos
                  const photoRowY = Math.max(doc.y + 25, sectionTopY + 270);
                  drawRect(doc, BORDER_ORANGE, leftColX, photoRowY, 257);
                  drawText(doc, "Defect:", rectX, photoRowY + 7, { bold: true, size: 12, color: BORDER_ORANGE });
                  drawImage(doc, defect.defect_photo, leftColX, photoRowY + 35, 257, 172);

                  drawRect(doc, BORDER_ORANGE, rightColX, photoRowY, doc.page.width - 360);
                  drawText(doc, "Repair:", rightColX + 5, photoRowY + 7, { bold: true, size: 12, color: BORDER_ORANGE });
                  drawImage(doc, defect.repair_photo, rightColX, photoRowY + 35, 257, 172);
                });

                // RECOMMENDED WORK ITEMS
                (section.recommended_work || []).forEach((work) => {
                  rectX = 45;
                  rectY = 45;
                  addPage(doc, page += 1);
                  const headerX = rectX, headerWidth = doc.page.width - 90;

                  // Header
                  drawRect(doc, BORDER_BLUE, xPointH, (rectY += 25) - 25, headerWidth);
                  drawText(doc, "Recommended Work for section:", headerX, rectY - 17, {
                    bold: true, size: 14, color: BORDER_BLUE, width: headerWidth - 20
                  });
                  drawText(doc, section.section_name || "", headerX + 215, rectY - 17, {
                    bold: true, size: 14, color: BORDER_BLUE, width: headerWidth
                  });

                  // Drainage
                  drawRect(doc, BORDER_ORANGE, xPointH, (rectY += 30) - 25, headerWidth);
                  drawText(doc, `${work.selection || ""}`, headerX, rectY - 17, {
                    bold: true, size: 13, color: BORDER_ORANGE, width: headerWidth
                  });

                  // Comments
                  drawRect(doc, BORDER_ORANGE, xPointH, (rectY += 25) - 20, headerWidth);
                  drawText(doc, "Comments:", headerX, rectY - 13, { bold: true, size: 12, color: BORDER_ORANGE });
                  drawText(doc, work.comments || "No comments provided.", headerX, rectY + 20, {
                    size: 10, width: headerWidth
                  });

                  // Photos
                  const photoHeaderY = doc.y + 10;
                  drawRect(doc, BORDER_ORANGE, xPointH, photoHeaderY, headerWidth);
                  drawText(doc, "Photo(s):", headerX, photoHeaderY + 7, { bold: true, size: 12, color: BORDER_ORANGE });

                  // Photo Grid
                  const photos = work.photos || [];
                  const imgW = 282, imgH = 212, colGap = 25, radius = 4;
                  const photoStartY = photoHeaderY + 32;
                  let col = 0, row = 0;

                  (photos || []).forEach((photo) => {
                    const imgX = headerX + col * (imgW + colGap);
                    const imgY = photoStartY + row * (imgH + 60);
                    drawImage(doc, photo.photo, imgX, imgY, imgW, imgH, radius, photo.comment);
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
              const borderColor = BORDER_BLUE, textColor = TEXT_DARK, orange = BORDER_ORANGE;

              //--------------------------------------------------------------
              // 🔧 Helper Functions (no layout change)
              //--------------------------------------------------------------
              const drawRect = (x, y, w, h, color, fill = false) => {
                doc.lineJoin("round").lineWidth(2).strokeColor(color);
                return fill ? doc.rect(x, y, w, h).fillAndStroke(color, color) : doc.rect(x, y, w, h).stroke();
              };

              const drawHeaderText = (txt, x, y, color, size, align = "left", width = fullWidth - 100) => {
                doc.font("Helvetica-Bold").fontSize(size).fillColor(color)
                  .text(txt, x, y, { width, align, characterSpacing: -0.2, wordSpacing: -0.4 });
              };

              const drawTableHeader = (headers, y, fillColor) => {
                const colWidths = [fullWidth * 0.40, fullWidth * 0.20, fullWidth * 0.20, fullWidth * 0.20];
                drawRect(doc, xPointH, y, fullWidth, 22, fillColor, true);
                let colX = xPointH;
                (headers || []).forEach((t, i) => {
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
                (rows || []).forEach(row => {
                  let colX = xPointH;

                  // Draw full row border
                  drawRect(doc, colX, rectY + yOffset, fullWidth, 22, borderColor);

                  // Draw vertical dividers
                  let dividerX = xPointH;
                  for (let j = 0; j < cols.length - 1; j++) {
                    dividerX += cols[j];
                    drawRect(doc, dividerX, rectY + yOffset, 0.5, 22, borderColor);
                  }

                  // Text setup
                  doc.font("Helvetica").fontSize(10).fillColor(textColor);
                  const textY = rectY + (22 - doc.currentLineHeight()) / 2 + (isMaterial ? 7 : 2);

                  // Prepare values for each column
                  const values = isMaterial
                    ? [row.material_description, row.qty, row.unit_price, row.total]
                    : [row.type, row.qty, row.rate, row.total];

                  // Format numeric values for Qty / Unit Price / Rate / Total
                  (values || []).forEach((val, i) => {
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
              drawRect(doc, xPointH, rectY - 15, fullWidth, 30, borderColor);
              drawHeaderText("Labor and Materials", rectX, rectY - 6, borderColor, 18);
              rectY += 25;

              //--------------------------------------------------------------
              // 🟦 Labor Header
              //--------------------------------------------------------------
              drawRect(doc, xPointH, rectY - 6, fullWidth, 25, borderColor, true);
              drawHeaderText("Labor and Fees", rectX, rectY + 2, "white", 13);
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
              drawRect(doc, xPointH, rectY + 6, fullWidth, 22, orange, true);
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
              drawRect(doc, xPointH, rectY, fullWidth, 25, borderColor, true);
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
              drawRect(doc, xPointH, rectY + 12, fullWidth, 22, orange, true);
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
              drawRect(doc, xPointH, rectY, fullWidth, totalsHeight, borderColor, true);
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

              doc.lineWidth(2).strokeColor("white")
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
      createFirstPageInfo: function (doc, jsonData, logo, reportName, xPoint, yPoint) {

        const pd = jsonData;
        const lineW = 2;
        const colWidth = 230;

        // HEADER BOX (replaces .rect)
        const drawHeaderBox = (x, y, title, titleX) => {
          drawRoundedRect(doc, x, y, colWidth, 25, 4, BORDER_BLUE, false);
          drawText(doc, title, titleX, y + 8, {
            bold: true,
            size: 12,
            color: BORDER_BLUE,
            width: doc.page.width - 90
          });
        };

        // ADDRESS BLOCK (replaces doc.text)
        const drawAddressBlock = (data, x, y) => {
          drawText(doc, data.name || "", x, y + 40);
          drawText(doc, data.address || "", x, y + 60);
          drawText(doc,
            (data.city ? `${data.city}, ` : "") + (data.state || "") + " " + (data.zip || ""),
            x, y + 80
          );
          drawText(doc, "Attn: ", x, y + 100);
          drawText(doc, data.contact_name || "", x, y + 120);
          drawText(doc, (data.contact_email || "").toLowerCase(), x, y + 140);
        };

        const drawManagerBlock = (data, x, y, title, titleX) => {
          drawHeaderBox(x, y, title, titleX);

          drawText(doc, data.name || "", xPointCol2 = (xPointH + 292), yPointCol2 = (y + 40));
          drawText(doc, data.address || "", xPointCol2, yPointCol2 += 20);
          drawText(doc,
            (data.city ? `${data.city}, ` : "") + (data.state || "") + " " + (data.zip || ""),
            xPointCol2, yPointCol2 += 20
          );
          drawText(doc, (data.email || "").toLowerCase(), xPointCol2, yPointCol2 += 20);
          drawText(doc, `Phone: ${data.phone || ""}`, xPointCol2, yPointCol2 += 20);
          drawText(doc, `Fax: ${data.fax || ""}`, xPointCol2, yPointCol2 += 20);
        };

        // -----------------------------------------------------------
        // LOGO + REPORT TITLE
        // -----------------------------------------------------------
        doc.image(logo, xPoint + 2, yPoint, { width: 230, align: "left" });

        drawText(doc, reportName, 328, yPoint + 15, {
          bold: true,
          size: 16,
          color: BORDER_BLUE,
          width: doc.pageWidth - 90
        });

        // -----------------------------------------------------------
        // TOP BLUE LINE
        // -----------------------------------------------------------
        drawRoundedRect(doc, xPointH, yPointH, doc.page.width - 90, 1, 0, BORDER_BLUE, false);

        drawText(doc, `Notification: ${pd.notification_number || ""}`,
          xPointCol1, yPointCol1, { size: 12 });

        drawText(doc,
          pd.start_work_date ? `Start Work Date: ${pd.start_work_date}` : "",
          xPointH + 290, yPointCol2, { size: 12 }
        );

        drawText(doc, `PO Number: ${pd.po_number || ""}`,
          xPointCol1, yPointCol1 + 20, { size: 12 });

        drawText(doc,
          pd.completed_work_date ? `Completed Work Date: ${pd.completed_work_date}` : "",
          xPointH + 290, yPointCol2 + 20, { size: 12 }
        );

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
        // SITE CONTACTS LINE
        // -----------------------------------------------------------
        doc.lineWidth(lineW)
          .moveTo(xPointH, yPointH += 187)
          .lineTo(xPointH + doc.page.width - 90, yPointH)
          .stroke();

        // BEFORE CONTACT
        drawText(doc, `Site Contact: ${pd.site_contact_before.contact_name || ""}`,
          xPointCol1, yPointCol1 = (yPointH + 12), { size: 12 });

        drawText(doc, `${pd.site_contact_before.text || ""}`,
          xPointCol1, doc.y, { size: 8, bold: true, width: 245 });

        drawText(doc, `${pd.site_contact_before.url_text}`,
          xPointCol1, doc.y, {
          size: 8,
          color: BORDER_BLUE,
          link: pd.site_contact_before.url,
          underline: true
        });

        const siteContactTextH = doc.y;

        // AFTER CONTACT
        drawText(doc, `Site Contact: ${pd.site_contact_after.contact_name || ""}`,
          xPointH + 290, yPointCol1, { size: 12 });

        drawText(doc, `${pd.site_contact_after.text}`,
          xPointH + 290, doc.y, { size: 8, bold: true, width: 245 });

        yPointCol1 = Math.max(doc.y, siteContactTextH);

        // -----------------------------------------------------------
        // SIGNATURE / BYPASS
        // -----------------------------------------------------------
        const renderSignature = (sig, x, y, reasonText) => {
          if (sig) {
            doc.image(`data:image/png;base64,${sig}`, x, y + 5, { width: 160 });
          } else {
            drawText(doc, reasonText || "", x, y + 20, { size: 12 });
          }
        };

        renderSignature(pd.site_contact_before.signature, xPointH + 50, yPointCol1, pd.site_contact_before.bypass_reason_text);
        renderSignature(pd.site_contact_after.signature, xPointH + 330, yPointCol1, pd.site_contact_after.bypass_reason_text);

        // -----------------------------------------------------------
        // FOOTER LINES + LABELS
        // -----------------------------------------------------------
        drawRoundedRect(doc, xPointH, yPointH += 195, 230, 1, 0, BORDER_BLUE, false);
        drawRoundedRect(doc, xPointH + 292, yPointH, doc.page.width - 90 - 292, 1, 0, BORDER_BLUE, false);

        drawText(doc, "Authorized signatory", xPointH, yPointH + 5, { size: 12 });
        drawText(doc, "Authorized signatory", xPointH + 290, yPointH + 5, { size: 12 });
      },
      createStatusLogScreen: function (doc, jsonData, page, addPage, xPointH) {
        addPage(doc, page += 1, null);

        const borderColor = BORDER_BLUE;
        const textColor = TEXT_DARK;
        const rectX = 45, fullWidth = doc.page.width - 90;
        let rectY = 45;

        //-------------------------------------------------------
        // 🟦 MAIN HEADING (Transparent, Blue Border)
        //-------------------------------------------------------
        const headingHeight = 30;
        doc.lineJoin("round").lineWidth(2).strokeColor(borderColor)
          .rect(xPointH, rectY, fullWidth, headingHeight).stroke();

        doc.font("Helvetica-Bold").fontSize(16).fillColor(borderColor)
          .text(
            `Status Log from Tablet for Notification: ${jsonData.notification_number}`,
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
            doc.lineJoin("round").lineWidth(2).strokeColor(borderColor)
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
          doc.lineJoin("round").lineWidth(2).strokeColor(borderColor)
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
            doc.lineJoin("round").lineWidth(2).strokeColor(borderColor)
              .rect(colX, rectY, col.width, maxHeight).stroke();

            colX += col.width;
          }

          rectY += maxHeight;
        };

        //-------------------------------------------------------
        // ADD ALL ROWS
        //-------------------------------------------------------
        (jsonData.status_log || []).forEach(drawRow);

        //-------------------------------------------------------
        // Final bottom border
        //-------------------------------------------------------
        doc.lineJoin("round").lineWidth(2).strokeColor(borderColor)
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