
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
    // 🧱 Common Helpers colors
    //--------------------------------------------------------------
    const BORDER_BLUE = "#00529B";
    const BORDER_GREEN = "#5AA755";
    const BORDER_RED = "#C4222F";
    const BORDER_ORANGE = "#F4A20B";
    const TEXT_DARK = "#121E28";
    const LABEL_TEXT = "#546B81"

    // ────────────────────────────────────────────────────────────────
    // 🧩 Local helpers (non-global)
    // ────────────────────────────────────────────────────────────────
    const drawRoundedRect = (doc, x, y, width, height, radius = 4, color = BORDER_BLUE, bFill) => {
      doc.lineJoin("round").lineWidth(1).strokeColor(color);
      doc.roundedRect(x, y, width, height, radius)

      if (bFill) {
        doc.fillAndStroke(color, color === BORDER_ORANGE ? BORDER_BLUE : color);
      } else {
        doc.stroke();
      }
    };
    const drawText = (doc, text, x, y, opts = {}) => {
      doc.font(opts.bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(opts.size || 11)
        .fillColor(opts.color || TEXT_DARK)
        .text(text, x, y, {
          width: opts.width || 200,
          align: opts.align || "left",
          characterSpacing: -0.2,
          wordSpacing: -0.4,
          link: opts.link
        });
    };
    const drawImage = (doc, img, x, y, w = 257, h = 172, radius = 4, commentText = "") => {
      if (!img) return;
      doc.save();
      doc.roundedRect(x, y, w, h, radius).clip();
      doc.image(`data:image/jpg;base64,${img}`, x, y, { width: w, height: h });
      doc.restore();
      drawText(doc, commentText, x + 5, y + h + 6, { size: 9, width: w });
    };

    // -------------------------------------------------------------------
    // Helper: Print page-break header (building + section name)
    // -------------------------------------------------------------------
    const reportSummaryBreakHeader = (doc, buildingName, sectionName = null,) => {
      let text = `Building: ${buildingName}`;
      if (sectionName) text += `  , Section: ${sectionName}`;

      let sLabel = `Report Summary: ${text} (continued)`
      drawText(doc, sLabel, xPointH, 40, { size: 16, bold: true, color: BORDER_BLUE, width: doc.page.width - 100, align: "left", characterSpacing: -0.2, wordSpacing: -0.4 });
    };
    const printPageBreakHeader = (doc, value = null) => {

      let text = `${value}`;
      text += `   (continued)`;

      drawText(doc, text, xPointH, 45, { bold: true, size: 16, color: BORDER_BLUE, width: doc.page.width - 100 });
    };
    const printPageBreakSubHeader = (doc, value, sColor, symbol, icons, sScreen) => {

      let y = doc.y;
      let x = xPointH;
      if (symbol) {
        doc.image(symbol === 'RN' ? icons[1] : icons[0], x, y, { width: 20, align: "left" });

        x = xPointH + 23;
      }
      let text = `${value} (continued)`;

      drawText(doc, text, x, y + 5, { bold: true, size: 14, color: sColor ? sColor : BORDER_BLUE, width: doc.page.width - 90 });

      if (sScreen?.includes("maintAct") || sScreen?.includes("defect")) {
        y += 25;
        //-------------------------------------------------------------------
        // COLUMN HEADERS
        //-------------------------------------------------------------------
        drawText(doc, "Defect Photo(s) (continued)", x, y + 6, {
          size: 12, bold: true, color: BORDER_ORANGE, width: doc.page.width - 90
        });

        drawText(doc, "Repair Photo(s) (continued)", x + 257 + 10, y + 6, {
          size: 12, bold: true, color: BORDER_ORANGE, width: doc.page.width - 90
        });
      }
    }

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
        .fillAndStroke(BORDER_BLUE, BORDER_BLUE)
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
      return new Promise((promiseResolve, promiseReject) => { // ✅ Renamed to avoid conflict
        try {
          const {
            paperSize = 'LETTER',
            reportName = 'Untitled Report',
            reportNameX = 230,
            downloadName = 'report', // ✅ Added for unique filenames
            bType = 'window',
            headerFn = () => { },
            enableRoundedImage = false,
            page = 1,
            icons = [],
            purpose = "CUSTOMER"
          } = options;

          // ✅ Create new document instance
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
          if (typeof headerFn === "function") {
            headerFn(doc, logo, icons, purpose); // ✅ Pass purpose to header
          }

          // ✅ CRITICAL: Add watermark to the FINAL/LAST page
          if (purpose === "CONFIDENTIAL") {
            addWatermark(doc, "CONFIDENTIAL", {
              opacity: 0.4,
              fontSize: 90,
              angle: -45,
              color: "red"
            });
          }
          // Finalize the PDF
          doc.end();

          // --- Stream output handler ---
          stream.on('finish', function () {
            try {
              const blob = stream.toBlob('application/pdf');
              const url = stream.toBlobURL('application/pdf');

              if (bType === 'binary') {
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = function () {
                  try {
                    const base64data = reader.result;
                    const binaryData = atob(base64data.split('base64,')[1]);
                    promiseResolve(binaryData); // ✅ Always resolve
                  } catch (error) {
                    promiseReject(error);
                  }
                };
                reader.onerror = function (error) {
                  promiseReject(error);
                };
              } else if (bType === 'blobURL') {
                promiseResolve(url); // ✅ Always resolve
              }
              // else if (bType === 'download') {
              //   // ✅ Handle download case
              //   const link = document.createElement('a');
              //   link.href = url;
              //   link.download = `${downloadName}_${purpose}.pdf`; // ✅ Unique filename
              //   link.click();
              //   promiseResolve(blob); // ✅ Resolve with blob
              // } 
              else {
                // Default: open in new tab
                window.open(url, '_blank');
                promiseResolve(url); // ✅ Always resolve
              }
            } catch (error) {
              promiseReject(error);
            }
          });

          // ✅ Handle stream errors
          stream.on('error', function (error) {
            console.error('Stream error:', error);
            promiseReject(error);
          });

          // ✅ Handle document errors
          doc.on('error', function (error) {
            console.error('Document error:', error);
            promiseReject(error);
          });

        } catch (error) {
          console.error('niceDocument error:', error);
          promiseReject(error);
        }
      });
    }

    function addWatermark(doc, text, options = {}) {
      const {
        opacity = 0.2,
        fontSize = 90,
        angle = -45,
        color = 'red',
      } = options;

      const pageWidth = doc.page.width - 90;
      const pageHeight = doc.page.height - 80;

      doc.save();

      // Center point
      doc.fillColor(color)
        .opacity(opacity)
        .fontSize(fontSize)
        .rotate(angle, { origin: [pageWidth / 2, pageHeight / 2] })
        .text(text, pageWidth / 2 - 50, pageHeight / 2 - 90, { align: 'center', width: fontSize, characterSpacing: -0.2, wordSpacing: -0.4 });

      doc.restore();
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
        return new Promise(async function (resolve, reject) {
          // resolve();
          if (!jsonData) {
            reject('Invalid Data');
          }
          var page = 1,
            reportName = 'Preventative Maintenance Report';
          jsonData = JSON.parse(JSON.stringify(jsonData));

          let header = (doc, logo, icons, purpose) => {

            let xPoint = doc.page.margins.left;
            let yPoint = doc.page.margins.top;
            that.createFirstPageInfo(doc, jsonData, logo, reportName, xPoint, yPoint);
            addPage(doc, page += 1, null, purpose);
            const fullWidth = doc.page.width - 90;
            //--------------------------------------------------------------
            // 📄 Report Summary Header
            //--------------------------------------------------------------
            let rectX = 45;
            let rectY = 40;
            rectY += 25;

            drawRoundedRect(doc, xPointH, rectY - 25, fullWidth, 35, 4, BORDER_BLUE);
            drawText(doc, "Report Summary", rectX, rectY - 15, { size: 18, bold: true, color: BORDER_BLUE, width: doc.page.width - 100, align: "left", characterSpacing: -0.2, wordSpacing: -0.4 });
            //-------------------------------------------------------------
            // 🏗️ BUILDING SECTION SUMMARY 
            //--------------------------------------------------------------
            (jsonData.report_summary || []).forEach((building, bIndex) => {

              //--------------------------------------------------------------
              // Helper: Draw header bar (blue/orange)
              //--------------------------------------------------------------
              const drawHeader = (color, title, textY, prefix = "") => {

                // PAGE BREAK FIX
                if (textY > doc.page.height - 40) {
                  addPage(doc, page += 1, null, purpose);
                  rectY = 65;
                  textY = rectY + 20;
                }

                drawRoundedRect(doc, xPointH, textY - 20, fullWidth, 25, 0, color, true);
                drawText(doc, `${prefix}${title}`, rectX, textY - 12, { bold: true, size: color === BORDER_BLUE ? 14 : 13, color: "white", width: doc.page.width - 100, align: "left", characterSpacing: -0.2, wordSpacing: -0.4 });
              };

              //--------------------------------------------------------------
              // Helper: Draw table-style row (label/value pair)
              //--------------------------------------------------------------
              const drawSummaryRow = (label, value, sectionName) => {
                const tableX = xPointH;
                const tableWidth = fullWidth;
                const colWidths = [tableWidth * 0.6, tableWidth * 0.4];
                const rowHeight = 22;

                // PAGE BREAK FIX
                if (rectY + rowHeight > doc.page.height - 40) {
                  addPage(doc, page += 1, null, purpose);
                  reportSummaryBreakHeader(doc, building.building_name, sectionName);
                  rectY = doc.y + 10;
                }

                drawRoundedRect(doc, tableX, rectY - 5, tableWidth, rowHeight, 0, BORDER_BLUE);

                // Vertical divider
                doc.lineJoin("round")
                  .lineWidth(1)
                  .strokeColor(BORDER_BLUE)
                  .rect(tableX + colWidths[0], rectY - 5, 0.5, rowHeight)
                  .stroke();

                // Left label
                drawText(doc, label, rectX, rectY + 2, { size: 10, color: TEXT_DARK, width: colWidths[0] - 12, align: "left", characterSpacing: -0.2, wordSpacing: -0.4 });
                // Right value
                drawText(doc, value || "", tableX + colWidths[0] + 10, rectY + 2, { size: 10, color: TEXT_DARK, width: colWidths[1] - 12, align: "center", characterSpacing: -0.2, wordSpacing: -0.4 });
                rectY += rowHeight;
              };

              //--------------------------------------------------------------
              // 🔵 BUILDING HEADER BAR
              //--------------------------------------------------------------
              rectY += 35;
              // PAGE BREAK FIX
              if (rectY > doc.page.height - 40) {
                addPage(doc, page += 1, null, purpose);
                rectY = 65;
              }
              drawHeader(BORDER_BLUE, building.building_name, rectY, "Building: ");

              rectY += 10;
              drawSummaryRow("Building Inspections", `${building.building_inspection_dfct_cnt || "0"} Defects`);
              rectY -= 5;

              //--------------------------------------------------------------
              // 🟧 SECTIONS SUMMARY
              //--------------------------------------------------------------
              (building.sections || []).forEach((section) => {
                rectY += 20;
                // PAGE BREAK FIX
                if (rectY + (4 * 22) > doc.page.height - 40) { // 4 * 22 means there will four rows including the section header
                  addPage(doc, page += 1, null, purpose);
                  reportSummaryBreakHeader(doc, building.building_name);
                  rectY = 85;
                }
                drawHeader(BORDER_ORANGE, section.section_name, rectY, "Section: ");
                rectY += 10;

                drawSummaryRow("Section Inspections", `${section.section_inspection_dfct_cnt || "0"} Defects`, section.section_name);
                drawSummaryRow("Maintenance Activities", `${section.maint_activities_dfct_cnt || "0"} Defects`, section.section_name);

                // Include recommended work if available
                if (section.recommended_work_cnt) {
                  drawSummaryRow("Recommended Work", `${section.recommended_work_cnt || "0"} Defects`, section.section_name);
                }

                rectY -= 5;
              });

              rectY += 10; // spacing after building
            });
            //--------------------------------------------------------------
            // 🏗️ INITIAL SETUP
            //--------------------------------------------------------------
            rectX = 45;  // Left margin for all boxes and text
            rectY = 40;  // Starting Y position
            addPage(doc, page += 1, null, purpose); // Create the first page
            //--------------------------------------------------------------
            // 🏢 LOOP THROUGH EACH BUILDING ENTRY
            //--------------------------------------------------------------
            (jsonData.buildings || []).forEach((building) => {
              // ────────────────────────────────────────────────────────────────
              // 📄 PAGE CHECKER
              // ────────────────────────────────────────────────────────────────
              if (addPage(doc, page += 1, 270)) rectY = doc.y; else page -= 1;
              // ───────────────────────────────────────────────────────────────
              // 🏠 BUILDING HEADER  (Compact One-Line Style)
              // ────────────────────────────────────────────────────────────────
              // Outer box
              drawRoundedRect(doc, xPointH, (rectY += 27) - 25, fullWidth, 50, 4, BORDER_BLUE);
              // “Building:” label
              let sBuildPage = "Building:";
              drawText(doc, sBuildPage, rectX, rectY - 18, { bold: true, size: 14, color: BORDER_BLUE, width: fullWidth });
              // Building name
              drawText(doc, building.name || "", rectX, rectY + 2, { bold: true, size: 18, color: BORDER_BLUE, width: fullWidth });
              // Right-side button (BLUE FILLED ROUNDED RECTANGLE)
              if (building.aerial_photo_url) {
                const btnW = 220, btnH = 15;
                const btnX = (xPointH + fullWidth) - btnW - 10;
                const btnY = (rectY - 25) + (50 - btnH) / 2;
                // ⬇️ Using drawRoundedRect with fill
                drawRoundedRect(doc, btnX, btnY, btnW, btnH, 4, BORDER_BLUE, true);
                // Button text
                drawText(doc, "Building Aerial View Photo", btnX, btnY + 4, {
                  bold: true, size: 11, color: "white", width: btnW, align: "center",
                  link: building.aerial_photo_url
                });
              }
              rectY += 25;
              // ────────────────────────────────────────────────────────────────
              // 🟧 BUILDING COMMENTS
              // ────────────────────────────────────────────────────────────────
              drawRoundedRect(doc, xPointH, (rectY += 25) - 20, fullWidth, 25, 4, BORDER_ORANGE);
              drawText(doc, "Comments", rectX, rectY - 13, { bold: true, size: 14, color: BORDER_ORANGE });
              drawText(doc, building.comments || "No comments provided.", rectX, rectY + 20, {
                size: 10, width: fullWidth
              });
              // ────────────────────────────────────────────────────────────────
              // 🏗️ BUILDING PHOTO
              // ────────────────────────────────────────────────────────────────
              const photoHeaderY = doc.y + 10;
              drawRoundedRect(doc, xPointH, photoHeaderY, fullWidth, 25, 4, BORDER_ORANGE);
              drawText(doc, "Building Photo(s)", rectX, photoHeaderY + 8, { bold: true, size: 14, color: BORDER_ORANGE });
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
                  if (y + photoHeight > doc.page.height - 40) {
                    addPage(doc, page += 1, null, purpose);

                    let sValue = `${sBuildPage} ${building.name}`
                    printPageBreakHeader(doc, sValue);
                    y = doc.y + 10; // reset Y same as initial base
                    x = xPointH;
                  }

                  // 🖼️ Draw the photo (use your helper)
                  drawImage(doc, photo.photo, x, y, photoWidth, photoHeight, 4, photo.comments);

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
              rectY = 40;  // Starting Y position
              addPage(doc, page += 1, null, purpose); // Create the first page

              const drawHeaderBar = (title, y) => {
                drawRoundedRect(doc, xPointH, y - 20, fullWidth, 25, 4, BORDER_BLUE);
                doc.font("Helvetica-Bold").fontSize(14).fillColor(BORDER_BLUE)
                  .text(title, rectX, y - 13, {
                    width: fullWidth, align: "left", characterSpacing: -0.2,
                    wordSpacing: -0.4
                  });
              };
              const drawTableHeader = (headers, colWidths, y) => {
                const tableX = xPointH;

                // Blue background header (filled rounded rect)
                drawRoundedRect(doc, tableX, y, fullWidth, 25, 0, BORDER_BLUE, true);
                let x = rectX;
                (headers || []).forEach((h, i) => {
                  drawText(doc, h, x, y + 6, { bold: true, size: 14, color: "white", width: colWidths[i], align: h === "Rating" ? "center" : "left" });
                  x += colWidths[i];
                });
              };
              const drawTableRow = (values, colWidths, y, opts = {}) => {
                const { withRating = false } = opts;
                const tableX = xPointH;
                const rowHeight = 22;

                // Outline row
                drawRoundedRect(doc, tableX, y, fullWidth, rowHeight, 0, BORDER_BLUE, false);

                // Internal vertical lines
                let x = xPointH;
                for (let i = 0; i < colWidths.length - 1; i++) {
                  x += colWidths[i];
                  // vertical line = roundedRect with width=1
                  drawRoundedRect(doc, x, y, 0.5, rowHeight, 0, BORDER_BLUE, false);
                }

                if (withRating) {
                  const [rating, comp, defect] = values;
                  // Rating icon
                  doc.image(rating === 'RN' ? icons[1] : icons[0], tableX + colWidths[0] / 2 - 7, y + rowHeight / 2 - 10, { width: 20, align: "left" });
                  // Component text
                  drawText(doc, comp || "", tableX + colWidths[0] + 5, y + 5, { size: 10, width: colWidths[1] - 20 });
                  // Defect text
                  drawText(doc, defect || "", tableX + colWidths[0] + colWidths[1] + 5, y + 5, { size: 10, width: colWidths[2] - 20 });

                } else {
                  let textX = rectX;

                  (values || []).forEach((v, i) => {
                    drawText(doc, v || "", textX, y + 5, { size: 10, width: colWidths[i] - 20 });
                    textX += colWidths[i];
                  });
                }

                return rowHeight;
              };
              //--------------------------------------------------------------
              // 🏗️ Building Specification Table
              //--------------------------------------------------------------
              if (building.specification_matrix?.length) {

                rectY += 25;
                drawHeaderBar("Building Specification Table", rectY);
                rectY += 10;

                const specCols = [
                  (fullWidth) * 0.5,
                  (fullWidth) * 0.5
                ];

                drawTableHeader(["Component", "Type"], specCols, rectY);
                rectY += 25;

                (building.specification_matrix || []).forEach(row => {
                  rectY += drawTableRow([row.component, row.type], specCols, rectY);
                });
              }
              //--------------------------------------------------------------
              // 🧱 Building Inspection Table
              //--------------------------------------------------------------
              if (building.inspection_matrix?.length) {
                rectY += 45;
                drawHeaderBar("Building Inspection Table", rectY);
                rectY += 10;

                const inspCols = [
                  (fullWidth) * 0.15,
                  (fullWidth) * 0.45,
                  (fullWidth) * 0.40
                ];

                drawTableHeader(["Rating", "Component", "Defect"], inspCols, rectY);
                rectY += 25;

                (building.inspection_matrix || []).forEach(row => {
                  rectY += drawTableRow([row.rating, row.component, row.defect], inspCols, rectY, { withRating: true });
                });

                // 🟢🔴 Legend (bottom)
                rectY += 25;
                const legendY = rectY;
                const drawLegend = async (x, text, symbol) => {
                  doc.image(symbol === 'RN' ? icons[1] : icons[0], x - 8, legendY - 5, { width: 20, align: "left" });
                  doc.font("Helvetica").fontSize(10).fillColor(TEXT_DARK)
                    .text(text, x + 12, legendY + 2, {
                      characterSpacing: -0.2,
                      wordSpacing: -0.4
                    });
                };
                drawLegend(120, "No defects", "ND");
                drawLegend(360, "Repair needed", "RN");
                rectY = legendY + 25;
              }
              //--------------------------------------------------------------
              // 🧱 Building Inspections
              //--------------------------------------------------------------
              if (building.inspections) {

                addPage(doc, page += 1, null, purpose);
                rectX = 45;
                rectY = 40;

                let iBuildCount = 0;

                // ────────────────────────────────────────────────────────────────
                // 🧱 BUILDING INSPECTIONS HEADER (Compact One-Line Style)
                // ────────────────────────────────────────────────────────────────
                // Outer box — same layout as building header
                drawRoundedRect(doc, xPointH, (rectY += 27) - 25, fullWidth, 50, 4, BORDER_BLUE, false);
                // First line label
                let sBuildInspPage = "Inspections";
                drawText(doc, `Building: ${building.name || ""}`, rectX, rectY - 18, { bold: true, size: 14, color: BORDER_BLUE, width: fullWidth });
                // Second line dynamic building name
                drawText(doc, sBuildInspPage, rectX, rectY + 2, { bold: true, size: 18, color: BORDER_BLUE, width: fullWidth });

                (building.inspections || []).forEach(inspection => {

                  const photoRows = inspection.photos?.length ? Math.ceil(inspection.photos.length / 2) : 0;
                  const photoBlockHeight = photoRows * (172 + 20);
                  const descriptionHeight = 45;
                  const commentsHeight = inspection.comments ? 45 : 0;
                  const headerHeight = 30;
                  const photoHeaderHeight = 35;

                  const totalBlockHeight = headerHeight + descriptionHeight + commentsHeight + photoHeaderHeight + photoBlockHeight + 40;

                  if ((rectY + totalBlockHeight > doc.page.height - 60) && iBuildCount !== 0) {
                    addPage(doc, page += 1, null, purpose);
                    let sValue = `${sBuildPage} ${building.name}, ${sBuildInspPage}`
                    printPageBreakHeader(doc, sValue);
                    rectY = doc.y + 10;
                  } else {
                    rectY += 30;
                  }

                  iBuildCount++;
                  // 🔶 Activity Header Bar
                  drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE, false);
                  rectY += 20;

                  // Activity text
                  let sBuildInspActivity = `${inspection.activity || ""} : ${inspection.selections?.[0]?.selection || ""}`;
                  drawText(
                    doc,
                    sBuildInspActivity,
                    rectX,
                    rectY - 12,
                    { bold: true, size: 14, color: BORDER_ORANGE, width: fullWidth }
                  );

                  rectY += 10;

                  // 🔶 Comments header bar
                  drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE, false);
                  rectY += 20;

                  drawText(doc, `Comments`, rectX, rectY - 12, {
                    bold: true, size: 14, color: BORDER_ORANGE, width: fullWidth
                  });

                  rectY += 15;

                  // Comments
                  drawText(doc, inspection.comments || "No comments provided.", rectX, rectY, {
                    size: 10, width: fullWidth
                  });

                  rectY = doc.y + 10;

                  // 🔶 Photos header bar
                  drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE, false);
                  rectY += 20;

                  drawText(doc, `Photo(s)`, rectX, rectY - 12, {
                    bold: true, size: 14, color: BORDER_ORANGE, width: fullWidth
                  });

                  rectY += 10;

                  // 🖼️ Photos grid
                  if (inspection.photos?.length) {

                    const photoWidth = 257;
                    const photoHeight = 172;
                    const gapX = 10;
                    const gapY = 30;
                    const perRow = 2;

                    let x = xPointH;
                    let y = rectY;
                    let count = 0;

                    (inspection.photos || []).forEach(photo => {

                      // Page break check
                      if (y + photoHeight > doc.page.height - 40) {
                        addPage(doc, page += 1, null, purpose);

                        let sValue = `${sBuildPage} ${building.name}, ${sBuildInspPage}`
                        printPageBreakHeader(doc, sValue);
                        printPageBreakSubHeader(doc, sBuildInspActivity, BORDER_ORANGE, null, icons);
                        x = xPointH;
                        y = doc.y + 10;
                      }

                      // Image
                      drawImage(doc, photo.photo, x, y, photoWidth, photoHeight, 4, photo.comments);
                      count++;

                      if (count % perRow === 0) {
                        x = xPointH;
                        if (photo.comments) {
                          y += photoHeight + gapY;
                        } else {
                          y += photoHeight + 5;
                        }
                      } else {
                        x += photoWidth + gapX;
                      }
                    });

                    const photoRowsFinal = Math.ceil(inspection.photos.length / 2);
                    rectY = rectY + (photoRowsFinal * (photoHeight + gapY)) - gapY + 10;
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
                  rectX = 45; rectY = 40; addPage(doc, page += 1, null, purpose);
                  // ────────────────────────────────────────────────────────────────
                  // 📘 SECTION HEADER (Compact Two-Line Style)
                  // ────────────────────────────────────────────────────────────────
                  drawRoundedRect(doc, xPointH, (rectY += 27) - 25, fullWidth, 50, 4, BORDER_BLUE);
                  // First line: label
                  let sSectPage = "Section:";
                  drawText(doc, `Building: ${building.name}, ${sSectPage}`, rectX, rectY - 18, { bold: true, size: 14, color: BORDER_BLUE, width: fullWidth });
                  // Second line: section name
                  drawText(doc, section.name || "", rectX, rectY + 2, { bold: true, size: 18, color: BORDER_BLUE, width: fullWidth });

                  // Right-side button (BLUE FILLED ROUNDED RECTANGLE)
                  if (section.aerial_photo_url) {
                    const btnW = 220, btnH = 15;
                    const btnX = (xPointH + fullWidth) - btnW - 10;
                    const btnY = (rectY - 25) + (50 - btnH) / 2;

                    // ⬇️ Using drawRoundedRect with fill
                    drawRoundedRect(doc, btnX, btnY, btnW, btnH, 4, BORDER_BLUE, true);

                    // Button text
                    drawText(doc, "Section Aerial View Photo", btnX, btnY + 4, {
                      bold: true, size: 11, color: "white", width: btnW, align: "center",
                      link: section.aerial_photo_url
                    });
                  }

                  rectY += 25;
                  // COMMENTS
                  drawRoundedRect(doc, xPointH, (rectY += 25) - 20, fullWidth, 25, 4, BORDER_ORANGE);
                  drawText(doc, "Comments", rectX, rectY - 13, { bold: true, size: 14, color: BORDER_ORANGE });
                  drawText(doc, section.comments || "No comments provided.", rectX, rectY + 20, {
                    size: 10, width: fullWidth
                  });
                  // SECTION PHOTO
                  const photoY = doc.y + 10;
                  drawRoundedRect(doc, xPointH, photoY, fullWidth, 25, 4, BORDER_ORANGE);
                  drawText(doc, "Section Overview Photo", rectX, photoY + 8, { bold: true, size: 14, color: BORDER_ORANGE });
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
                      if (y + photoHeight > doc.page.height - 40) {
                        addPage(doc, page += 1, null, purpose);

                        let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name}`
                        printPageBreakHeader(doc, sValue);
                        y = doc.y + 10; // reset Y same as initial base
                        x = xPointH;
                      }

                      // 🖼️ Draw the photo (use your helper)
                      drawImage(doc, photo.photo, x, y, photoWidth, photoHeight, 4, photo.comments);

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
                  // 🏗️ Section Specification Table (Pixel-Perfect Refined)
                  //--------------------------------------------------------------
                  rectX = 45;
                  rectY = 40;
                  addPage(doc, page += 1, null, purpose);
                  //--------------------------------------------------------------
                  // 🏗️ Roof Specification Table
                  //--------------------------------------------------------------
                  if (section.specification_matrix?.length) {
                    rectY += 25;
                    drawHeaderBar("Roof Specification Table", rectY);
                    rectY += 10;

                    const specCols = [
                      (fullWidth) * 0.5,
                      (fullWidth) * 0.5
                    ];

                    drawTableHeader(["Component", "Type"], specCols, rectY);
                    rectY += 25;

                    (section.specification_matrix || []).forEach(row => {
                      rectY += drawTableRow([row.component, row.type], specCols, rectY);
                    });
                  }
                  //--------------------------------------------------------------
                  // 🧱 Maintenance Activity Table
                  //--------------------------------------------------------------
                  if (section.maint_act_matrix?.length) {
                    rectY += 45;
                    drawHeaderBar("Maintenance Activity Table", rectY);
                    rectY += 10;

                    const maintCols = [
                      (fullWidth) * 0.15,
                      (fullWidth) * 0.45,
                      (fullWidth) * 0.40
                    ];

                    drawTableHeader(["Rating", "Component", "Defect"], maintCols, rectY);
                    rectY += 25;

                    (section.maint_act_matrix || []).forEach(row => {
                      rectY += drawTableRow([row.rating, row.component, row.defect], maintCols, rectY, { withRating: true });
                    });

                    // 🟢🔴 Legend
                    rectY += 25;
                    const legendY = rectY;
                    const drawLegend = (x, text, symbol) => {
                      doc.image(symbol === 'RN' ? icons[1] : icons[0], x - 8, legendY - 5, { width: 20, align: "left" });
                      doc.font("Helvetica").fontSize(10).fillColor(TEXT_DARK)
                        .text(text, x + 12, legendY + 2, {
                          characterSpacing: -0.2,
                          wordSpacing: -0.4
                        });
                    };

                    drawLegend(120, "No defects", "ND");
                    drawLegend(360, "Repair needed", "RN");
                    rectY = legendY + 25;
                  }
                  //--------------------------------------------------------------
                  // 🏗️ Section Inspection Table (Pixel-Perfect)
                  //--------------------------------------------------------------
                  rectX = 45;
                  rectY = 40;
                  addPage(doc, page += 1, null, purpose);
                  if (section.inspection_matrix?.length) {
                    if (addPage(doc, page += 1, 270)) rectY = doc.y; else page -= 1;

                    rectY += 25;
                    // Header bar
                    drawHeaderBar("Section Inspection Table", rectY);
                    rectY += 10;

                    // Column structure
                    const inspCols = [
                      (fullWidth) * 0.15, // Rating
                      (fullWidth) * 0.45, // Component
                      (fullWidth) * 0.40  // Defect
                    ];

                    // Table Header
                    drawTableHeader(["Rating", "Component", "Defect"], inspCols, rectY);
                    rectY += 25;

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

                    const drawLegend = (x, text, symbol) => {
                      doc.image(symbol === 'RN' ? icons[1] : icons[0], x - 8, legendY - 5, { width: 20, align: "left" });
                      doc.font("Helvetica").fontSize(10).fillColor(TEXT_DARK)
                        .text(text, x + 12, legendY + 2, {
                          characterSpacing: -0.2,
                          wordSpacing: -0.4
                        });
                    };

                    drawLegend(120, "Inspection - No Defects", "ND");
                    drawLegend(360, "Inspection - Repair Needed", "RN");

                    rectY = legendY + 25;
                  }
                  //--------------------------------------------------------------
                  // 🏗️ SECTION INSPECTIONS (FINAL + PAGE-SAFE)
                  //--------------------------------------------------------------
                  if (section.inspections?.length) {

                    rectX = 45;
                    rectY = 40;
                    addPage(doc, page += 1, null, purpose);

                    // ────────────────────────────────────────────────────────────────
                    // 🔵 INSPECTIONS FOR SECTION HEADER
                    // ────────────────────────────────────────────────────────────────
                    drawRoundedRect(doc, xPointH, (rectY += 27) - 25, fullWidth, 50, 4, BORDER_BLUE);
                    // First line
                    let sSecInspPage = "Inspections";
                    drawText(doc, `Building: ${building.name}, Section: ${section.name || ""}`, rectX, rectY - 18, { bold: true, size: 14, color: BORDER_BLUE, width: fullWidth });
                    // Second line = section name
                    drawText(doc, sSecInspPage, rectX, rectY + 2, { bold: true, size: 18, color: BORDER_BLUE, width: fullWidth });
                    rectY += 30;

                    let iSectInspCount = 0;

                    //--------------------------------------------------------------
                    // 🔁 LOOP through each INSPECTION
                    //--------------------------------------------------------------
                    (section.inspections || []).forEach((insp) => {

                      const photoRows = insp.photos?.length ? Math.ceil(insp.photos.length / 2) : 0;
                      const photoBlockHeight = photoRows * (172 + 20);
                      const descriptionHeight = 45;
                      const commentsHeight = insp.comments ? 45 : 0;
                      const headerHeight = 30;
                      const photoHeaderHeight = 35;

                      const totalBlockHeight = headerHeight + descriptionHeight + commentsHeight + photoHeaderHeight + photoBlockHeight + 40;

                      if ((rectY + totalBlockHeight > doc.page.height - 60) && iSectInspCount !== 0) {
                        addPage(doc, page += 1, null, purpose);
                        let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name}, ${sSecInspPage}`;
                        printPageBreakHeader(doc, sValue);
                        rectY = doc.y + 10;
                      }

                      iSectInspCount++;
                      const isRepair = insp.rating === "RN";
                      const color = isRepair ? BORDER_RED : BORDER_GREEN;
                      const symbol = isRepair ? "RN" : "ND";

                      drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, color);
                      doc.image(insp.rating === 'RN' ? icons[1] : icons[0], rectX, rectY + 2, { width: 20, align: "left" });
                      let sSectInspActivity = `${insp.activity} : ${insp.selections[0].selection}`;
                      drawText(doc, sSectInspActivity, rectX + 22, rectY + 7, { bold: true, size: 14, color: color, width: doc.page.width - 100 });
                      rectY += 30;
                      drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                      drawText(doc, "Description", rectX, rectY + 6, { bold: true, size: 14, color: BORDER_ORANGE, width: doc.page.width - 100 });
                      rectY += 32;
                      drawText(doc, insp.selections[0].description || "—", rectX, rectY, { size: 10, color: TEXT_DARK, width: fullWidth });
                      rectY = doc.y + 10;

                      if (insp.comments && insp.comments !== "-" && insp.comments !== "—") {
                        drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                        drawText(doc, "Comments", rectX, rectY + 6, { bold: true, size: 14, color: BORDER_ORANGE, width: fullWidth });
                        rectY += 32;
                        drawText(doc, insp.comments, rectX, rectY, { size: 10, color: TEXT_DARK, width: fullWidth });
                        rectY = doc.y + 10;
                      }

                      drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                      drawText(doc, "Photo(s)", rectX, rectY + 6, { bold: true, size: 14, color: BORDER_ORANGE, width: fullWidth });
                      rectY += 30;

                      if (insp.photos?.length) {

                        const photoWidth = 257;
                        const photoHeight = 172;
                        const gapX = 10;
                        const gapY = 30;

                        let x = xPointH;
                        let y = rectY;
                        let count = 0;

                        (insp.photos || []).forEach((photo) => {

                          if (y + photoHeight > doc.page.height) {
                            addPage(doc, page += 1, null, purpose);
                            let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name}, ${sSecInspPage}`;
                            printPageBreakHeader(doc, sValue);
                            printPageBreakSubHeader(doc, sSectInspActivity, color, symbol, icons);
                            x = xPointH;
                            y = doc.y + 10;
                          }

                          drawImage(doc, photo.photo, x, y, photoWidth, photoHeight, 4, photo.comments);
                          count++;

                          if (count % 2 === 0) {
                            x = xPointH;
                            if (photo.comments) {
                              y += photoHeight + gapY;
                            } else {
                              y += photoHeight + 5;
                            }
                          } else {
                            x += photoWidth + gapX;
                          }
                        });

                        const photoRowsFinal = Math.ceil(insp.photos.length / 2);
                        rectY = rectY + (photoRowsFinal * (photoHeight + gapY)) - gapY + 10;
                      }

                      rectY += 15;
                    });
                  }
                  //--------------------------------------------------------------
                  // 🏗️ Maintenance Activities for Section
                  //--------------------------------------------------------------
                  if (section.maint_acts?.length) {
                    rectX = 45;
                    rectY = 40;
                    addPage(doc, page += 1, null, purpose);

                    //--------------------------------------------------------------
                    // 🔹 Header Blue Bar
                    //--------------------------------------------------------------
                    drawRoundedRect(doc, xPointH, rectY, fullWidth, 50, 4, BORDER_BLUE);
                    let sMainActPage = "Maintenance Activities";
                    drawText(doc, `Building: ${building.name}, Section: ${section.name || ""}`, rectX, rectY + 10, { size: 14, color: BORDER_BLUE, bold: true, width: fullWidth });
                    drawText(doc, sMainActPage, rectX, rectY + 28, { size: 18, color: BORDER_BLUE, bold: true, width: fullWidth });
                    rectY += 55;

                    //----------------------------------------------------------------------
                    // 🔁 Render EACH Maintenance Activity
                    //----------------------------------------------------------------------
                    const renderMaintActivity = (activity) => {

                      //------------------------------------------------------------------
                      // PAGE BREAK CHECK before starting entire block
                      //------------------------------------------------------------------
                      if (rectY + 500 > doc.page.height - 60) {
                        addPage(doc, page += 1, null, purpose);
                        let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name}, ${sMainActPage}`
                        printPageBreakHeader(doc, sValue);
                        rectY = doc.y + 10;
                      }

                      //------------------------------------------------------------------
                      // 🟧 Activity Header (Orange, Bordered)
                      //------------------------------------------------------------------
                      const barColor = BORDER_ORANGE;
                      const barHeight = 25;

                      doc.lineJoin("round")
                        .lineWidth(1)
                        .strokeColor(barColor)
                        .roundedRect(xPointH, rectY, fullWidth, barHeight, 4)
                        .stroke();

                      let sMaintActivity = `${activity.activity}: ${activity.selections[0].selection}`;
                      drawText(doc, sMaintActivity, rectX, rectY + 8, { size: 14, bold: true, color: barColor, width: fullWidth });

                      rectY += barHeight + 5;

                      //------------------------------------------------------------------
                      // 🟠 DESCRIPTION
                      //------------------------------------------------------------------
                      drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                      drawText(doc, "Description", rectX, rectY + 7, { size: 14, color: BORDER_ORANGE, bold: true, width: fullWidth });
                      rectY += 32;
                      drawText(doc, activity.selections[0].description || "", rectX, rectY, { size: 10, color: TEXT_DARK, width: doc.page.width - 100, width: fullWidth });
                      rectY = doc.y + 5;

                      //------------------------------------------------------------------
                      // 🟠 COMMENTS
                      //------------------------------------------------------------------
                      drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                      drawText(doc, "Comments", rectX, rectY + 6, { size: 14, color: BORDER_ORANGE, bold: true, width: fullWidth });
                      rectY += 32;
                      drawText(doc, activity.comments || "—", rectX, rectY, { size: 10, color: TEXT_DARK, width: doc.page.width - 100, width: fullWidth });
                      rectY = doc.y + 7;

                      // -------------------------------------------------------------------
                      // 🟠 OVERVIEW PHOTO(S)
                      // -------------------------------------------------------------------
                      if (activity.overview_photos?.length) {

                        // Header
                        drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                        drawText(doc, "Overview Photo(s)", rectX, rectY + 6, { size: 14, color: BORDER_ORANGE, bold: true, width: fullWidth });

                        rectY += 30;

                        // --- PHOTO GRID (2 photos per row) ---
                        const photoWidth = 257;
                        const photoHeight = 172;
                        const gapX = 10;
                        const gapY = 30;
                        const photosPerRow = 2;

                        let x = xPointH;
                        let y = rectY;
                        let count = 0;

                        (activity.overview_photos || []).forEach((p) => {

                          // PAGE BREAK CHECK
                          if (y + photoHeight > doc.page.height - 60) {
                            addPage(doc, page += 1, null, purpose);
                            let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name}, ${sMainActPage}`
                            printPageBreakHeader(doc, sValue);
                            printPageBreakSubHeader(doc, sMaintActivity, BORDER_ORANGE, null, icons);
                            y = doc.y + 10;     // reset Y
                            x = xPointH;

                            // 🔥 CRITICAL FIX: also reset rectY so next section continues from this new page
                            rectY = y;
                          }

                          // DRAW photo
                          drawImage(doc, p.photo, x, y, photoWidth, photoHeight, 4, p.comments);
                          count++;
                          if (count % photosPerRow === 0) {
                            // Move to next row
                            x = xPointH;
                            if (p.comments) {
                              y += photoHeight + gapY;
                            } else {
                              y += photoHeight + 5;
                            }
                          } else {
                            // Move to next column
                            x += photoWidth + gapX;
                          }
                        });

                        // Final rectY after overview photos (correct: use actual Y from PDFKit)
                        rectY = doc.y + 10;
                      }

                      // 🔥 PAGE BREAK CHECK BEFORE STARTING DEFECT/REPAIR PHOTOS
                      if (rectY + 200 > doc.page.height - 40) {   // 200 = estimated header + one row buffer
                        addPage(doc, page += 1, null, purpose);
                        let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name}, ${sMainActPage}`;
                        printPageBreakHeader(doc, sValue);
                        printPageBreakSubHeader(doc, sMaintActivity, BORDER_ORANGE, null, icons);
                        rectY = doc.y + 10;
                      }

                      //-------------------------------------------------------------------
                      // 🟠 DEFECT PHOTOS & REPAIR PHOTOS — SIDE BY SIDE COLUMNS
                      //-------------------------------------------------------------------
                      const colW = 257;
                      const photoH = 172;

                      // Column X positions
                      const colLeftX = xPointH;
                      const colRightX = xPointH + colW + 10;

                      // Yellow separator line
                      const sepX = xPointH + colW + 5;

                      //-------------------------------------------------------------------
                      // COLUMN HEADERS
                      //-------------------------------------------------------------------
                      drawRoundedRect(doc, colLeftX, rectY, colW, 25, 4, BORDER_ORANGE);
                      drawText(doc, "Defect Photo(s)", colLeftX + 5, rectY + 6, {
                        size: 14, bold: true, color: BORDER_ORANGE, width: fullWidth
                      });

                      drawRoundedRect(doc, colRightX, rectY, colW, 25, 4, BORDER_ORANGE);
                      drawText(doc, "Repair Photo(s)", colRightX + 5, rectY + 6, {
                        size: 14, bold: true, color: BORDER_ORANGE, width: fullWidth
                      });

                      rectY += 30;

                      //-------------------------------------------------------------------
                      // DRAW defect_photos & repair_photos in vertical lists (independent columns)
                      //-------------------------------------------------------------------
                      let leftY = rectY;
                      let rightY = rectY;

                      // Track line positions for each page
                      let lineStartY = rectY; // Where line starts on current page
                      let currentPage = page;

                      // Function to draw the center line for current page content
                      function drawCenterLine(doc, startY, endY) {
                        if (endY > startY) {
                          doc.lineWidth(1)
                            .strokeColor(BORDER_ORANGE)
                            .moveTo(sepX, startY)
                            .lineTo(sepX, endY)
                            .stroke();
                        }
                      }
                      // DRAW LEFT COLUMN (defect photos)
                      for (let i = 0; i < (activity.defect_photos?.length || 0); i++) {

                        // PAGE BREAK FOR LEFT COLUMN
                        if (leftY + photoH > doc.page.height - 40) {
                          // Draw line for current page BEFORE page break
                          let lineEndY = Math.max(leftY, rightY) - 5;
                          drawCenterLine(doc, lineStartY - 30, lineEndY);
                          addPage(doc, page += 1, null, purpose);
                          let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name}, ${sMainActPage}`;
                          printPageBreakHeader(doc, sValue);
                          printPageBreakSubHeader(doc, sMaintActivity, BORDER_ORANGE, null, icons, "maintAct");
                          leftY = doc.y + 10;
                          rightY = doc.y + 10;
                          lineStartY = doc.y + 10; // Reset line start for new page
                        }

                        drawImage(doc, activity.defect_photos[i].photo, colLeftX, leftY, colW, photoH, 4, activity.defect_photos[i].comments);
                        leftY += photoH + 30;
                      }

                      // DRAW RIGHT COLUMN (repair photos)
                      for (let i = 0; i < (activity.repair_photos?.length || 0); i++) {

                        // PAGE BREAK FOR RIGHT COLUMN
                        if (rightY + photoH > doc.page.height - 40) {
                          // Draw line for current page BEFORE page break
                          let lineEndY = Math.max(leftY, rightY) - 5; // Subtract last spacing
                          drawCenterLine(doc, lineStartY - 30, lineEndY);
                          addPage(doc, page += 1, null, purpose);
                          let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name}, ${sMainActPage}`;
                          printPageBreakHeader(doc, sValue);
                          printPageBreakSubHeader(doc, sMaintActivity, BORDER_ORANGE, null, icons, "maintAct");
                          leftY = doc.y + 10;
                          rightY = doc.y + 10;
                          lineStartY = doc.y + 10; // Reset line start for new page
                        }

                        drawImage(doc, activity.repair_photos[i].photo, colRightX, rightY, colW, photoH, 4, activity.repair_photos[i].comments);
                        rightY += photoH + 30;
                      }

                      // IMPORTANT: Draw line for the LAST page after all photos are done
                      let finalLineEndY = Math.max(leftY, rightY) - 5; // Subtract last spacing
                      drawCenterLine(doc, lineStartY - 30, finalLineEndY);

                      // Final Y
                      rectY = Math.max(leftY, rightY) + 20;
                    };

                    //--------------------------------------------------------------------
                    // Render all maintenance activities
                    //--------------------------------------------------------------------
                    section.maint_acts.forEach(activity => renderMaintActivity(activity));
                  }
                  //--------------------------------------------------------------
                  // RECOMMENDED WORK ITEMS
                  //--------------------------------------------------------------
                  if (section.recommended_work?.length) {
                    rectX = 45;
                    rectY = 40;
                    addPage(doc, page += 1, null, purpose);
                    const headerX = rectX, headerWidth = fullWidth;

                    // ────────────────────────────────────────────────────────────────
                    // 🟦 RECOMMENDED WORK FOR SECTION HEADER
                    // ────────────────────────────────────────────────────────────────
                    drawRoundedRect(doc, xPointH, (rectY += 27) - 25, headerWidth, 50, 4, BORDER_BLUE);
                    // First line
                    let sRecomWork = "Recommended Work";
                    drawText(doc, `Building: ${building.name}, Section: ${section.name || ""}`, headerX, rectY - 18, { bold: true, size: 14, color: BORDER_BLUE, width: headerWidth - 20 });
                    // Second line
                    drawText(doc, sRecomWork, headerX, rectY + 2, { bold: true, size: 18, color: BORDER_BLUE, width: headerWidth });
                    rectY += 30;

                    let iRecomWorkCount = 0;

                    (section.recommended_work || []).forEach((work) => {

                      const photoRows = work.photos?.length ? Math.ceil(work.photos.length / 2) : 0;
                      const photoBlockHeight = photoRows * (172 + 20);
                      const descriptionHeight = 45;
                      const commentsHeight = work.comments ? 45 : 0;
                      const headerHeight = 30;
                      const photoHeaderHeight = 35;

                      const totalBlockHeight = headerHeight + descriptionHeight + commentsHeight + photoHeaderHeight + photoBlockHeight + 40;

                      if ((rectY + totalBlockHeight > doc.page.height - 60) && iRecomWorkCount !== 0) {
                        addPage(doc, page += 1, null, purpose);
                        let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name}, ${sRecomWork}`;
                        printPageBreakHeader(doc, sValue);
                        rectY = 85;
                      }

                      iRecomWorkCount++;

                      drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                      let sWorkActivity = `${work.activity || ""}: ${work.selections[0].selection}`;
                      drawText(doc, sWorkActivity, rectX, rectY + 7, { bold: true, size: 14, color: BORDER_ORANGE, width: doc.page.width - 100 });
                      rectY += 30;
                      if (work.comments && work.comments !== "-" && work.comments !== "—") {
                        // Comments (Yellow)
                        drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                        drawText(doc, "Comments", rectX, rectY + 6, { bold: true, size: 14, color: BORDER_ORANGE, width: fullWidth });
                        rectY += 32;
                        drawText(doc, work.comments, rectX, rectY, { size: 10, color: TEXT_DARK, width: fullWidth });
                        rectY = doc.y + 10;
                      }

                      drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                      drawText(doc, "Photo(s)", rectX, rectY + 6, { bold: true, size: 14, color: BORDER_ORANGE, width: fullWidth });
                      rectY += 30;

                      if (work.photos?.length) {

                        const photoWidth = 257;
                        const photoHeight = 172;
                        const gapX = 10;
                        const gapY = 30;

                        let x = xPointH;
                        let y = rectY;
                        let count = 0;

                        (work.photos || []).forEach((photo) => {

                          if (y + photoHeight > doc.page.height - 40) {
                            addPage(doc, page += 1, null, purpose);
                            let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name}, ${sRecomWork}`
                            printPageBreakHeader(doc, sValue);
                            printPageBreakSubHeader(doc, sWorkActivity, BORDER_ORANGE, null, icons);
                            x = xPointH;
                            y = doc.y + 10;
                          }

                          drawImage(doc, photo.photo, x, y, photoWidth, photoHeight, 4, photo.comments);
                          count++;

                          if (count % 2 === 0) {
                            x = xPointH;
                            if (photo.comments) {
                              y += photoHeight + gapY;
                            } else {
                              y += photoHeight + 5;
                            }
                          } else {
                            x += photoWidth + gapX;
                          }
                        });

                        const photoRowsFinal = Math.ceil(work.photos.length / 2);
                        rectY = rectY + (photoRowsFinal * (photoHeight + gapY)) - gapY + 10;
                      }
                    });
                  }
                });
              }
            });

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
          let logo = await that.toDataURL("pdfgen/CMLogotaglineHigh.png");
          let check = await that.toDataURL("pdfgen/Check.png");
          let cross = await that.toDataURL("pdfgen/Cross.png");

          niceDocument(logo, {
            reportName: reportName,
            reportNameX: 230,
            downloadName: "PM_Report",
            bType: bType,
            headerFn: header,
            page: 1,
            icons: [check, cross]
          });

        });

      },
      pdfTM: function (jsonData, bType = 'download', paperSize = 'LETTER') {
        var that = this;
        return new Promise(async function (resolve, reject) {
          if (!jsonData) {
            reject('Invalid Data');
          }
          var page = 1,
            reportName = 'Work Authorization and Service Summary';
          jsonData = JSON.parse(JSON.stringify(jsonData));
          let header = (doc, logo, icons, purpose) => {
            let xPoint = doc.page.margins.left;
            let yPoint = doc.page.margins.top;
            that.createFirstPageInfo(doc, jsonData, logo, reportName, xPoint, yPoint);
            addPage(doc, page += 1, null, purpose);
            const fullWidth = doc.page.width - 90;
            //--------------------------------------------------------------
            // 📄 Report Summary Header
            //--------------------------------------------------------------
            let rectX = 45;
            let rectY = 40;

            rectY += 25;
            drawRoundedRect(doc, xPointH, rectY - 25, fullWidth, 35, 4, BORDER_BLUE);
            drawText(doc, "Report Summary", rectX, rectY - 15, { size: 18, bold: true, color: BORDER_BLUE, width: doc.page.width - 100, align: "left", characterSpacing: -0.2, wordSpacing: -0.4 });
            //--------------------------------------------------------------
            // 🏗️ BUILDING SECTION SUMMARY 
            //--------------------------------------------------------------
            (jsonData.report_summary || []).forEach((building) => {

              //--------------------------------------------------------------
              // Helper: Draw header bar (blue/orange)
              //--------------------------------------------------------------
              const drawHeader = (color, title, textY, prefix = "") => {

                // PAGE BREAK FIX
                if (textY > doc.page.height - 40) {
                  addPage(doc, page += 1, null, purpose);
                  rectY = 65;
                  textY = rectY + 20;
                }

                drawRoundedRect(doc, xPointH, textY - 20, fullWidth, 25, 0, color, true);
                drawText(doc, `${prefix}${title}`, rectX, textY - 12, { bold: true, size: color === BORDER_BLUE ? 14 : 13, color: "white", width: doc.page.width - 100, align: "left", characterSpacing: -0.2, wordSpacing: -0.4 });
              };

              //--------------------------------------------------------------
              // Helper: Draw table-style row (3-column row)
              //--------------------------------------------------------------
              const drawTableRow = (label, activity, selection) => {
                const tableX = xPointH;
                const tableWidth = fullWidth;
                const colWidths = [tableWidth * 0.25, tableWidth * 0.35, tableWidth * 0.40];
                const rowHeight = 22;

                // PAGE BREAK FIX
                if (rectY + rowHeight + 20 > doc.page.height - 40) {
                  addPage(doc, page += 1, null, purpose);
                  reportSummaryBreakHeader(doc, building.building_name, sectionName);
                  rectY = doc.y + 10;
                }

                // Outer rounded rectangle
                drawRoundedRect(doc, tableX, rectY - 5, tableWidth, rowHeight, 0, BORDER_BLUE, false);

                // Column dividers
                let xPos = tableX;
                for (let i = 0; i < colWidths.length - 1; i++) {
                  xPos += colWidths[i];
                  doc.lineJoin("round").lineWidth(1).strokeColor(BORDER_BLUE)
                    .rect(xPos, rectY - 5, 0.5, rowHeight).stroke();
                }

                // Text inside the row
                drawText(doc, label, tableX + 6, rectY + 2, { size: 10, color: TEXT_DARK, width: colWidths[0] - 8 });
                drawText(doc, activity, tableX + colWidths[0] + 6, rectY + 2, { size: 10, color: TEXT_DARK, width: colWidths[1] - 8 });
                drawText(doc, selection, tableX + colWidths[0] + colWidths[1] + 6, rectY + 2, { size: 10, color: TEXT_DARK, width: colWidths[2] - 8 });

                rectY += rowHeight;
              };

              //--------------------------------------------------------------
              // 🔵 BUILDING HEADER
              //--------------------------------------------------------------
              rectY += 35;
              // PAGE BREAK FIX
              if (rectY > doc.page.height - 40) {
                addPage(doc, page += 1, null, purpose);
                rectY = 65;
              }
              drawHeader(BORDER_BLUE, building.building_name, rectY, "Building: ");

              rectY += 5;
              //--------------------------------------------------------------
              // 🟧 SECTION LIST
              //--------------------------------------------------------------
              (building.sections || []).forEach((section) => {
                rectY += 20;
                // PAGE BREAK FIX
                if (rectY + (3 * 22) > doc.page.height - 40) {
                  addPage(doc, page += 1, null, purpose);
                  reportSummaryBreakHeader(doc, building.building_name);
                  rectY = 85;
                }
                drawHeader(BORDER_ORANGE, section.section_name, rectY, "Section: ");
                rectY += 10;

                // 📋 DEFECT + RECOMMENDED WORK TABLES
                const renderRows = (items, prefix) => {
                  (items || []).forEach((item, i) => {
                    drawTableRow(`${prefix}: ${i + 1}`, item.activity || "", item.selection || "");
                  });
                };

                renderRows(section.defects, "Defect");
                renderRows(section.recommended_work, "Recommended Work");

                rectY -= 5;
              });

              rectY += 10;
            });
            //--------------------------------------------------------------
            // 🏗️ INITIAL SETUP
            //--------------------------------------------------------------
            rectX = 45;  // Left margin for all boxes and text
            rectY = 40;  // Starting Y position
            addPage(doc, page += 1, null, purpose); // Create the building page
            //--------------------------------------------------------------
            // 🏢 LOOP THROUGH EACH BUILDING ENTRY
            //--------------------------------------------------------------
            (jsonData.buildings || []).forEach((building) => {
              // ───────────────────────────────────────────────────────────────
              // 🏠 BUILDING HEADER  (Compact One-Line Style)
              // ────────────────────────────────────────────────────────────────
              // Outer box
              drawRoundedRect(doc, xPointH, (rectY += 27) - 25, fullWidth, 50, 4, BORDER_BLUE);
              // “Building:” label
              let sBuildPage = "Building:";
              drawText(doc, sBuildPage, rectX, rectY - 18, { bold: true, size: 14, color: BORDER_BLUE, width: fullWidth });
              // Building name
              drawText(doc, building.name || "", rectX, rectY + 2, { bold: true, size: 18, color: BORDER_BLUE, width: fullWidth });
              // Right-side button (BLUE FILLED ROUNDED RECTANGLE)
              if (building.aerial_photo_url) {
                const btnW = 220, btnH = 15;
                const btnX = (xPointH + fullWidth) - btnW - 10;
                const btnY = (rectY - 25) + (50 - btnH) / 2;
                // ⬇️ Using drawRoundedRect with fill
                drawRoundedRect(doc, btnX, btnY, btnW, btnH, 4, BORDER_BLUE, true);
                // Button text
                drawText(doc, "Building Aerial View Photo", btnX, btnY + 4, {
                  bold: true, size: 11, color: "white", width: btnW, align: "center",
                  link: building.aerial_photo_url
                });
              }
              rectY += 25;
              // ────────────────────────────────────────────────────────────────
              // 🟧 BUILDING COMMENTS
              // ────────────────────────────────────────────────────────────────
              drawRoundedRect(doc, xPointH, (rectY += 25) - 20, fullWidth, 25, 4, BORDER_ORANGE);
              drawText(doc, "Comments", rectX, rectY - 13, { bold: true, size: 14, color: BORDER_ORANGE });
              drawText(doc, building.comments || "No comments provided.", rectX, rectY + 20, {
                size: 10, width: fullWidth
              });
              // ────────────────────────────────────────────────────────────────
              // 🏗️ BUILDING PHOTO
              // ────────────────────────────────────────────────────────────────
              const photoHeaderY = doc.y + 10;
              drawRoundedRect(doc, xPointH, photoHeaderY, fullWidth, 25, 4, BORDER_ORANGE);
              drawText(doc, "Building Photo(s)", rectX, photoHeaderY + 8, { bold: true, size: 14, color: BORDER_ORANGE });
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
                  if (y + photoHeight > doc.page.height - 40) {
                    addPage(doc, page += 1, null, purpose);

                    let sValue = `${sBuildPage} ${building.name}`
                    printPageBreakHeader(doc, sValue);
                    y = doc.y + 10; // reset Y same as initial base
                    x = xPointH;
                  }

                  // 🖼️ Draw the photo (use your helper)
                  drawImage(doc, photo.photo, x, y, photoWidth, photoHeight, 4, photo.comments);

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
              // 🧱 Building Sections
              //--------------------------------------------------------------
              if (building.sections) {
                // ────────────────────────────────────────────────────────────────
                // 🏢 SECTIONS LOOP
                // ────────────────────────────────────────────────────────────────
                (building.sections || []).forEach((section) => {
                  rectX = 45; rectY = 40; addPage(doc, page += 1, null, purpose);
                  // ────────────────────────────────────────────────────────────────
                  // 📘 SECTION HEADER (Compact Two-Line Style)
                  // ────────────────────────────────────────────────────────────────
                  drawRoundedRect(doc, xPointH, (rectY += 27) - 25, fullWidth, 50, 4, BORDER_BLUE);
                  // First line: label
                  let sSectPage = "Section:";
                  drawText(doc, `Building: ${building.name}, ${sSectPage}`, rectX, rectY - 18, { bold: true, size: 14, color: BORDER_BLUE, width: fullWidth });
                  // Second line: section name
                  drawText(doc, section.name || "", rectX, rectY + 2, { bold: true, size: 18, color: BORDER_BLUE, width: fullWidth });

                  // Right-side button (BLUE FILLED ROUNDED RECTANGLE)
                  if (section.aerial_photo_url) {
                    const btnW = 220, btnH = 15;
                    const btnX = (xPointH + fullWidth) - btnW - 10;
                    const btnY = (rectY - 25) + (50 - btnH) / 2;

                    // ⬇️ Using drawRoundedRect with fill
                    drawRoundedRect(doc, btnX, btnY, btnW, btnH, 4, BORDER_BLUE, true);

                    // Button text
                    drawText(doc, "Section Aerial View Photo", btnX, btnY + 4, {
                      bold: true, size: 11, color: "white", width: btnW, align: "center",
                      link: section.aerial_photo_url
                    });
                  }

                  rectY += 25;
                  // COMMENTS
                  drawRoundedRect(doc, xPointH, (rectY += 25) - 20, fullWidth, 25, 4, BORDER_ORANGE);
                  drawText(doc, "Comments", rectX, rectY - 13, { bold: true, size: 14, color: BORDER_ORANGE });
                  drawText(doc, section.comments || "No comments provided.", rectX, rectY + 20, {
                    size: 10, width: fullWidth
                  });
                  // SECTION PHOTO
                  const photoY = doc.y + 10;
                  drawRoundedRect(doc, xPointH, photoY, fullWidth, 25, 4, BORDER_ORANGE);
                  drawText(doc, "Section Overview Photo", rectX, photoY + 8, { bold: true, size: 14, color: BORDER_ORANGE });
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
                      if (y + photoHeight > doc.page.height - 40) {
                        addPage(doc, page += 1, null, purpose);

                        let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name}`
                        printPageBreakHeader(doc, sValue);
                        y = doc.y + 10; // reset Y same as initial base
                        x = xPointH;
                      }

                      // 🖼️ Draw the photo (use your helper)
                      drawImage(doc, photo.photo, x, y, photoWidth, photoHeight, 4, photo.comments);

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
                  // 🏗️ Defects for Section
                  //--------------------------------------------------------------
                  if (section.defects?.length) {
                    rectX = 45;
                    rectY = 40;
                    addPage(doc, page += 1, null, purpose);

                    //--------------------------------------------------------------
                    // 🔹 Header Blue Bar
                    //--------------------------------------------------------------
                    drawRoundedRect(doc, xPointH, rectY, fullWidth, 50, 4, BORDER_BLUE);
                    let sMainActPage = "Defects";
                    drawText(doc, `Building: ${building.name}, Section: ${section.name || ""}`, rectX, rectY + 10, { size: 14, color: BORDER_BLUE, bold: true, width: fullWidth });
                    drawText(doc, sMainActPage, rectX, rectY + 28, { size: 18, color: BORDER_BLUE, bold: true, width: fullWidth });
                    rectY += 55;

                    //----------------------------------------------------------------------
                    // 🔁 Render EACH Maintenance Activity
                    //----------------------------------------------------------------------
                    const renderDefectActivity = (activity) => {

                      //------------------------------------------------------------------
                      // PAGE BREAK CHECK before starting entire block
                      //------------------------------------------------------------------
                      if (rectY + 500 > doc.page.height - 60) {
                        addPage(doc, page += 1, null, purpose);
                        let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name}, ${sMainActPage}`
                        printPageBreakHeader(doc, sValue);
                        rectY = doc.y + 10;
                      }

                      //------------------------------------------------------------------
                      // 🟧 Activity Header (Orange, Bordered)
                      //------------------------------------------------------------------
                      const barColor = BORDER_ORANGE;
                      const barHeight = 25;

                      doc.lineJoin("round")
                        .lineWidth(1)
                        .strokeColor(barColor)
                        .roundedRect(xPointH, rectY, fullWidth, barHeight, 4)
                        .stroke();

                      let sMaintActivity = `${activity.activity}: ${activity.selections[0].selection}`;
                      drawText(doc, sMaintActivity, rectX, rectY + 8, { size: 14, bold: true, color: barColor, width: fullWidth });

                      rectY += barHeight + 5;

                      //------------------------------------------------------------------
                      // 🟠 DESCRIPTION
                      //------------------------------------------------------------------
                      drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                      drawText(doc, "Description", rectX, rectY + 7, { size: 14, color: BORDER_ORANGE, bold: true, width: fullWidth });
                      rectY += 32;
                      drawText(doc, activity.selections[0].description || "", rectX, rectY, { size: 10, color: TEXT_DARK, width: doc.page.width - 100, width: fullWidth });
                      rectY = doc.y + 5;

                      //------------------------------------------------------------------
                      // 🟠 COMMENTS
                      //------------------------------------------------------------------
                      drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                      drawText(doc, "Comments", rectX, rectY + 6, { size: 14, color: BORDER_ORANGE, bold: true, width: fullWidth });
                      rectY += 32;
                      drawText(doc, activity.comments || "—", rectX, rectY, { size: 10, color: TEXT_DARK, width: doc.page.width - 100, width: fullWidth });
                      rectY = doc.y + 7;

                      // -------------------------------------------------------------------
                      // 🟠 OVERVIEW PHOTO(S)
                      // -------------------------------------------------------------------
                      if (activity.overview_photos?.length) {

                        // Header
                        drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                        drawText(doc, "Overview Photo(s)", rectX, rectY + 6, { size: 14, color: BORDER_ORANGE, bold: true, width: fullWidth });

                        rectY += 30;

                        // --- PHOTO GRID (2 photos per row) ---
                        const photoWidth = 257;
                        const photoHeight = 172;
                        const gapX = 10;
                        const gapY = 30;
                        const photosPerRow = 2;

                        let x = xPointH;
                        let y = rectY;
                        let count = 0;

                        (activity.overview_photos || []).forEach((p) => {

                          // PAGE BREAK CHECK
                          if (y + photoHeight > doc.page.height - 60) {
                            addPage(doc, page += 1, null, purpose);
                            let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name}, ${sMainActPage}`
                            printPageBreakHeader(doc, sValue);
                            printPageBreakSubHeader(doc, sMaintActivity, BORDER_ORANGE, null, icons);
                            y = doc.y + 10;     // reset Y
                            x = xPointH;

                            // 🔥 CRITICAL FIX: also reset rectY so next section continues from this new page
                            rectY = y;
                          }

                          // DRAW photo
                          drawImage(doc, p.photo, x, y, photoWidth, photoHeight, 4, p.comments);
                          count++;
                          if (count % photosPerRow === 0) {
                            // Move to next row
                            x = xPointH;
                            if (p.comments) {
                              y += photoHeight + gapY;
                            } else {
                              y += photoHeight + 5;
                            }
                          } else {
                            // Move to next column
                            x += photoWidth + gapX;
                          }
                        });

                        // Final rectY after overview photos (correct: use actual Y from PDFKit)
                        rectY = doc.y + 10;
                      }

                      // 🔥 PAGE BREAK CHECK BEFORE STARTING DEFECT/REPAIR PHOTOS
                      if (rectY + 200 > doc.page.height - 40) {   // 200 = estimated header + one row buffer
                        addPage(doc, page += 1, null, purpose);
                        let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name}, ${sMainActPage}`;
                        printPageBreakHeader(doc, sValue);
                        printPageBreakSubHeader(doc, sMaintActivity, BORDER_ORANGE, null, icons);
                        rectY = doc.y + 10;
                      }

                      //-------------------------------------------------------------------
                      // 🟠 DEFECT PHOTOS & REPAIR PHOTOS — SIDE BY SIDE COLUMNS
                      //-------------------------------------------------------------------
                      const colW = 257;
                      const photoH = 172;

                      // Column X positions
                      const colLeftX = xPointH;
                      const colRightX = xPointH + colW + 10;

                      // Yellow separator line
                      const sepX = xPointH + colW + 5;

                      //-------------------------------------------------------------------
                      // COLUMN HEADERS
                      //-------------------------------------------------------------------
                      drawRoundedRect(doc, colLeftX, rectY, colW, 25, 4, BORDER_ORANGE);
                      drawText(doc, "Defect Photo(s)", colLeftX + 5, rectY + 6, {
                        size: 14, bold: true, color: BORDER_ORANGE, width: fullWidth
                      });

                      drawRoundedRect(doc, colRightX, rectY, colW, 25, 4, BORDER_ORANGE);
                      drawText(doc, "Repair Photo(s)", colRightX + 5, rectY + 6, {
                        size: 14, bold: true, color: BORDER_ORANGE, width: fullWidth
                      });

                      rectY += 30;

                      //-------------------------------------------------------------------
                      // DRAW defect_photos & repair_photos in vertical lists (independent columns)
                      //-------------------------------------------------------------------
                      let leftY = rectY;
                      let rightY = rectY;

                      // Track line positions for each page
                      let lineStartY = rectY; // Where line starts on current page
                      let currentPage = page;

                      // Function to draw the center line for current page content
                      function drawCenterLine(doc, startY, endY) {
                        if (endY > startY) {
                          doc.lineWidth(1)
                            .strokeColor(BORDER_ORANGE)
                            .moveTo(sepX, startY)
                            .lineTo(sepX, endY)
                            .stroke();
                        }
                      }
                      // DRAW LEFT COLUMN (defect photos)
                      for (let i = 0; i < (activity.defect_photos?.length || 0); i++) {

                        // PAGE BREAK FOR LEFT COLUMN
                        if (leftY + photoH > doc.page.height - 40) {
                          // Draw line for current page BEFORE page break
                          let lineEndY = Math.max(leftY, rightY) - 5;
                          drawCenterLine(doc, lineStartY - 30, lineEndY);
                          addPage(doc, page += 1, null, purpose);
                          let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name}, ${sMainActPage}`;
                          printPageBreakHeader(doc, sValue);
                          printPageBreakSubHeader(doc, sMaintActivity, BORDER_ORANGE, null, icons, "defect");
                          leftY = doc.y + 10;
                          rightY = doc.y + 10;
                          lineStartY = doc.y + 10; // Reset line start for new page
                        }

                        drawImage(doc, activity.defect_photos[i].photo, colLeftX, leftY, colW, photoH, 4, activity.defect_photos[i].comments);
                        leftY += photoH + 30;
                      }

                      // DRAW RIGHT COLUMN (repair photos)
                      for (let i = 0; i < (activity.repair_photos?.length || 0); i++) {

                        // PAGE BREAK FOR RIGHT COLUMN
                        if (rightY + photoH > doc.page.height - 40) {
                          // Draw line for current page BEFORE page break
                          let lineEndY = Math.max(leftY, rightY) - 5;
                          drawCenterLine(doc, lineStartY - 30, lineEndY);
                          addPage(doc, page += 1, null, purpose);
                          let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name}, ${sMainActPage}`;
                          printPageBreakHeader(doc, sValue);
                          printPageBreakSubHeader(doc, sMaintActivity, BORDER_ORANGE, null, icons, "defect");
                          leftY = doc.y + 10;
                          rightY = doc.y + 10;
                          lineStartY = doc.y + 10; // Reset line start for new page
                        }

                        drawImage(doc, activity.repair_photos[i].photo, colRightX, rightY, colW, photoH, 4, activity.repair_photos[i].comments);
                        rightY += photoH + 30;
                      }

                      // IMPORTANT: Draw line for the LAST page after all photos are done
                      let finalLineEndY = Math.max(leftY, rightY) - 5; // Subtract last spacing
                      drawCenterLine(doc, lineStartY - 30, finalLineEndY);

                      // Final Y
                      rectY = Math.max(leftY, rightY) + 20;
                    };

                    //--------------------------------------------------------------------
                    // Render all maintenance activities
                    //--------------------------------------------------------------------
                    section.defects.forEach(activity => renderDefectActivity(activity));
                  }

                  //--------------------------------------------------------------
                  // RECOMMENDED WORK ITEMS
                  //--------------------------------------------------------------
                  if (section.recommended_work?.length) {
                    rectX = 45;
                    rectY = 40;
                    addPage(doc, page += 1, null, purpose);
                    const headerX = rectX, headerWidth = fullWidth;

                    // ────────────────────────────────────────────────────────────────
                    // 🟦 RECOMMENDED WORK FOR SECTION HEADER
                    // ────────────────────────────────────────────────────────────────
                    drawRoundedRect(doc, xPointH, (rectY += 27) - 25, headerWidth, 50, 4, BORDER_BLUE);
                    // First line
                    let sRecomWork = "Recommended Work";
                    drawText(doc, sRecomWork, headerX, rectY - 18, { bold: true, size: 14, color: BORDER_BLUE, width: headerWidth - 20 });
                    // Second line
                    drawText(doc, section.name || "", headerX, rectY + 2, { bold: true, size: 18, color: BORDER_BLUE, width: headerWidth });
                    rectY += 30;

                    let iRecomWorkCount = 0;

                    (section.recommended_work || []).forEach((work) => {

                      const photoRows = work.photos?.length ? Math.ceil(work.photos.length / 2) : 0;
                      const photoBlockHeight = photoRows * (172 + 20);
                      const descriptionHeight = 45;
                      const commentsHeight = work.comments ? 45 : 0;
                      const headerHeight = 30;
                      const photoHeaderHeight = 35;

                      const totalBlockHeight = headerHeight + descriptionHeight + commentsHeight + photoHeaderHeight + photoBlockHeight + 40;

                      if ((rectY + totalBlockHeight > doc.page.height - 60) && iRecomWorkCount !== 0) {
                        addPage(doc, page += 1, null, purpose);
                        let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name}, ${sRecomWork}`;
                        printPageBreakHeader(doc, sValue);
                        rectY = 85;
                      }

                      iRecomWorkCount++;

                      drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                      let sWorkActivity = `${work.activity || ""}: ${work.selections[0].selection}`;
                      drawText(doc, sWorkActivity, rectX, rectY + 7, { bold: true, size: 14, color: BORDER_ORANGE, width: doc.page.width - 100 });
                      rectY += 30;

                      if (work.comments && work.comments !== "-" && work.comments !== "—") {
                        // Comments (Yellow)
                        drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                        drawText(doc, "Comments", rectX, rectY + 6, { bold: true, size: 14, color: BORDER_ORANGE, width: fullWidth });
                        rectY += 32;
                        drawText(doc, work.comments, rectX, rectY, { size: 10, color: TEXT_DARK, width: fullWidth });
                        rectY = doc.y + 10;
                      }

                      drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                      drawText(doc, "Photo(s)", rectX, rectY + 6, { bold: true, size: 14, color: BORDER_ORANGE, width: fullWidth });
                      rectY += 30;

                      if (work.photos?.length) {

                        const photoWidth = 257;
                        const photoHeight = 172;
                        const gapX = 10;
                        const gapY = 30;

                        let x = xPointH;
                        let y = rectY;
                        let count = 0;

                        (work.photos || []).forEach((photo) => {

                          if (y + photoHeight > doc.page.height - 40) {
                            addPage(doc, page += 1, null, purpose);
                            let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name}, ${sRecomWork}`
                            printPageBreakHeader(doc, sValue);
                            printPageBreakSubHeader(doc, sWorkActivity, BORDER_ORANGE, null, icons);
                            x = xPointH;
                            y = doc.y + 10;
                          }

                          drawImage(doc, photo.photo, x, y, photoWidth, photoHeight, 4, photo.comments);
                          count++;

                          if (count % 2 === 0) {
                            x = xPointH;
                            if (photo.comments) {
                              y += photoHeight + gapY;
                            } else {
                              y += photoHeight + 5;
                            }
                          } else {
                            x += photoWidth + gapX;
                          }
                        });

                        const photoRowsFinal = Math.ceil(work.photos.length / 2);
                        rectY = rectY + (photoRowsFinal * (photoHeight + gapY)) - gapY + 10;
                      }
                    });
                  }
                });
              };
            });
            //--------------------------------------------------------------
            // 💼 Labor and Materials Section (Optimized — uses drawRoundedRect/drawText/drawImage)
            //--------------------------------------------------------------
            if (purpose !== "CONFIDENTIAL" && jsonData.labor_fees_and_materials) {
              addPage(doc, page += 1, null, purpose);
              let rectX = 45, rectY = 40;

              const blue = BORDER_BLUE;
              const orange = BORDER_ORANGE;
              const textColor = TEXT_DARK;

              // column widths (sum should be ~fullWidth)
              const colPerc = [0.40, 0.20, 0.20, 0.20];
              const colWidths = colPerc.map(p => Math.floor(fullWidth * p));

              // helper: draw table header (rounded filled header row)
              const renderTableHeader = (headers, y) => {
                drawRoundedRect(doc, xPointH, y, fullWidth, 24, 0, orange, true);
                let cx = xPointH;
                for (let i = 0; i < headers.length; i++) {
                  drawText(doc, headers[i], cx + 6, y + 6, {
                    bold: true,
                    size: 11,
                    color: "white",
                    width: colWidths[i] - 12,
                    align: i === 0 ? "left" : "right"
                  });
                  cx += colWidths[i];
                }
              };

              // helper: draw a single data row as rounded rect + vertical dividers + texts
              const renderDataRow = (values, y, isMaterial = false) => {
                // row rect
                drawRoundedRect(doc, xPointH, y, fullWidth, 24, 0, blue, false);

                // vertical dividers (draw lines)
                let vx = xPointH;
                doc.save();
                doc.lineWidth(0.8).strokeColor(blue);
                for (let i = 0; i < colWidths.length - 1; i++) {
                  vx += colWidths[i];
                  doc.moveTo(vx, y).lineTo(vx, y + 24).stroke();
                }
                doc.restore();

                // texts
                let tx = xPointH;
                for (let i = 0; i < values.length; i++) {
                  let val = values[i] == null ? "" : values[i];

                  // numeric formatting for numeric columns (except first)
                  if (i > 0 && val !== "" && !isNaN(val)) {
                    val = parseFloat(val).toLocaleString("en-US", { ...decimalOptions });
                  }

                  drawText(doc, String(val), tx + (i === 0 ? 6 : 0), y + 8, {
                    size: 10,
                    color: textColor,
                    width: colWidths[i] - (i === 0 ? 12 : 6),
                    align: i === 0 ? "left" : "right"
                  });
                  tx += colWidths[i];
                }
              };

              const renderRowsWithPaging = (rows, renderRowFn, headers, sTable) => {
                const rowHeight = 24;
                const pageMarginBottom = 60;

                for (let r = 0; r < rows.length; r++) {

                  // --- PAGE BREAK CHECK ---
                  if (rectY + rowHeight + pageMarginBottom > doc.page.height) {

                    // NEW PAGE
                    addPage(doc, page += 1, null, purpose);
                    let sValue = `${sTable}`
                    printPageBreakHeader(doc, sValue);
                    // RESET STARTING Y
                    rectY = 65;

                    // REPRINT TABLE HEADER AT TOP
                    if (headers) {
                      renderTableHeader(headers, rectY);
                      rectY += rowHeight;   // move below header
                    }
                  }

                  // --- DRAW ROW ---
                  renderRowFn(rows[r], rectY);

                  // move Y down for next row
                  rectY += rowHeight;
                }
              };


              //--------------------------------------------------------------
              // 📘 MAIN TITLE
              //--------------------------------------------------------------
              drawRoundedRect(doc, xPointH, rectY - 15, fullWidth, 30, 4, blue, false);
              drawText(doc, "Labor and Materials", rectX, rectY - 6, { bold: true, size: 18, color: blue, width: fullWidth });
              rectY += 25;

              //--------------------------------------------------------------
              // 🟦 Labor Header
              //--------------------------------------------------------------
              drawRoundedRect(doc, xPointH, rectY - 6, fullWidth, 24, 0, blue, true);
              let sTable = "Labor and Fees";
              drawText(doc, sTable, rectX, rectY + 2, { bold: true, size: 13, color: "white", width: fullWidth });
              rectY += 20;

              //--------------------------------------------------------------
              // 🟧 Labor Table Header + Rows
              //--------------------------------------------------------------
              const laborHeaders = ["Type", "Hrs/Qty", "Rate", "Total"];
              renderTableHeader(laborHeaders, rectY - 2);
              rectY += 22;

              // draw rows (page-break aware)
              const laborRows = (jsonData.labor_fees_and_materials.labor_and_fees || []).map(row => [
                row.type || "",
                row.qty ?? "",
                row.rate ?? "",
                row.total ?? ""
              ]);
              renderRowsWithPaging(laborRows, (vals, y) => renderDataRow(vals, y, false), laborHeaders, sTable);
              // after rows rectY already moved

              //--------------------------------------------------------------
              // 🟧 Labor Total
              //--------------------------------------------------------------
              if (rectY + 60 > doc.page.height) { addPage(doc, page += 1, null, purpose); rectY = 45; }
              drawRoundedRect(doc, xPointH, rectY, fullWidth, 24, 0, orange, true);
              drawText(doc, "Labor and Fees Total:", rectX, rectY + 8, { bold: true, size: 11, color: "white", width: fullWidth - 110 });
              drawText(doc, `${parseFloat(jsonData.labor_fees_and_materials.labor_and_fees_total || 0).toLocaleString('en-US', currencyOptions)}`, xPointH + fullWidth - 95, rectY + 8, { bold: true, size: 11, color: "white", align: "right", width: 90 });
              rectY += 42;

              //--------------------------------------------------------------
              // 🟦 Materials Header
              //--------------------------------------------------------------
              if (rectY + 120 > doc.page.height) { addPage(doc, page += 1, null, purpose); rectY = 45; }
              drawRoundedRect(doc, xPointH, rectY, fullWidth, 24, 0, blue, true);
              sTable = "Materials";
              drawText(doc, sTable, rectX, rectY + 7, { bold: true, size: 13, color: "white", width: fullWidth });
              rectY += 26;

              //--------------------------------------------------------------
              // 🟧 Material Table Header + Rows
              //--------------------------------------------------------------
              const matHeaders = ["Description", "Qty", "Unit Price", "Total"];
              renderTableHeader(matHeaders, rectY - 2);
              rectY += 22;

              const matRows = (jsonData.labor_fees_and_materials.materials || []).map(row => [
                row.description || "",
                row.qty ?? "",
                row.unit_price ?? "",
                row.total ?? ""
              ]);
              renderRowsWithPaging(matRows, (vals, y) => renderDataRow(vals, y, true), matHeaders, sTable);

              //--------------------------------------------------------------
              // 🟧 Materials Total
              //--------------------------------------------------------------
              if (rectY + 80 > doc.page.height) { addPage(doc, page += 1, null, purpose); rectY = 45; }
              drawRoundedRect(doc, xPointH, rectY, fullWidth, 24, 0, orange, true);
              drawText(doc, "Materials Total:", rectX, rectY + 8, { bold: true, size: 11, color: "white", width: fullWidth - 110 });
              drawText(doc, `${parseFloat(jsonData.labor_fees_and_materials.material_total || 0).toLocaleString('en-US', currencyOptions)}`, xPointH + fullWidth - 95, rectY + 8, { bold: true, size: 11, color: "white", align: "right", width: 90 });
              rectY += 24;

              //--------------------------------------------------------------
              // 🔵 Totals Summary Box
              //--------------------------------------------------------------
              if (rectY + 120 > doc.page.height) { addPage(doc, page += 1, null, purpose); rectY = 45; }
              const totalsHeight = 70;
              drawRoundedRect(doc, xPointH, rectY, fullWidth, totalsHeight, 0, blue, true);

              drawText(doc, "Subtotal:", xPointH + fullWidth - 250, rectY + 11, { size: 11, color: "white", width: 140 });
              drawText(doc, `${parseFloat(jsonData.labor_fees_and_materials.subtotal || 0).toLocaleString('en-US', currencyOptions)}`, xPointH + fullWidth - 95, rectY + 11, { size: 11, color: "white", align: "right", width: 90 });

              drawText(doc, `Tax Amount (Rate ${parseFloat(jsonData.labor_fees_and_materials.taxes?.tax_rate || 0).toFixed(2)}%):`, xPointH + fullWidth - 250, rectY + 24, { size: 11, color: "white", width: 140 });
              drawText(doc, `${parseFloat(jsonData.labor_fees_and_materials.taxes?.total || 0).toLocaleString('en-US', currencyOptions)}`, xPointH + fullWidth - 95, rectY + 24, { size: 11, color: "white", align: "right", width: 90 });

              // white divider line inside totals box (use doc primitives — not a text helper)
              doc.lineWidth(1).strokeColor("white")
                .moveTo(xPointH + fullWidth - 250, rectY + 43)
                .lineTo(xPointH + fullWidth - 5, rectY + 43)
                .stroke();

              drawText(doc, "Grand Total:", xPointH + fullWidth - 250, rectY + 51, { bold: true, size: 12, color: "white", width: 140 });
              drawText(doc, `${parseFloat(jsonData.labor_fees_and_materials.grand_total || 0).toLocaleString('en-US', currencyOptions)}`, xPointH + fullWidth - 95, rectY + 51, { bold: true, size: 12, color: "white", align: "right", width: 90 });

              // advance rectY after the totals box
              rectY += totalsHeight + 10;
            }
            //--------------------------------------------------------------
            // 📋 STATUS LOG FROM TABLET
            //--------------------------------------------------------------
            if (purpose !== "CONFIDENTIAL" && jsonData.status_log && jsonData.status_log.length) {
              that.createStatusLogScreen(doc, jsonData, page, addPage, xPointH, purpose);
            }
          }
          const addPage = (doc, page = null, checkSpace = null, purpose) => {

            if (purpose === "CONFIDENTIAL") {

              // Add watermark on first page
              addWatermark(doc, "CONFIDENTIAL", {
                opacity: 0.4,
                fontSize: 90,
                angle: -45,
                color: "red"
              });

            }

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
          let logo = await that.toDataURL("pdfgen/CMLogotaglineHigh.png");
          let check = await that.toDataURL("pdfgen/Check.png");
          let cross = await that.toDataURL("pdfgen/Cross.png");

          let aPDFType = [
            {
              type: "TM",
              purpose: "CONFIDENTIAL"
            },
            {
              type: "TM",
              purpose: "CUSTOMER"
            }
          ]
          for (const pdfType of aPDFType) {
            await niceDocument(logo, {
              reportName: reportName,
              reportNameX: 230,
              downloadName: 'ServiceRepairSummaryForSvcMgr',
              bType: bType,
              headerFn: header,
              page: 1,
              icons: [check, cross],
              purpose: pdfType.purpose
            });
          }
        });
      },
      createFirstPageInfo: async function (doc, jsonData, logo, reportName, xPoint, yPoint) {

        const pd = jsonData;
        const lineW = 2;
        const colWidth = 230;
        let fullWidth = doc.page.width - 90;

        // HEADER BOX (replaces .rect)
        const drawHeaderBox = (x, y, title, titleX) => {
          drawRoundedRect(doc, x, y, colWidth, 25, 4, BORDER_BLUE, false);
          drawText(doc, title, titleX, y + 8, { bold: true, size: 14, color: BORDER_BLUE, width: fullWidth });
        };

        // ADDRESS BLOCK (replaces doc.text)
        const drawAddressBlock = (data, x, y) => {
          drawText(doc, data.name || "", x, y + 40, { bold: true, size: 12 });
          drawText(doc, data.address || "", x, y + 60);
          drawText(doc, (data.city ? `${data.city}, ` : "") + (data.state || "") + " " + (data.zip || ""), x, y + 80);
          drawText(doc, `Attn: ${data.contact_name || ""}`, x, y + 100);
          drawText(doc, (data.contact_email || "").toLowerCase(), x, y + 120);
        };

        const drawManagerBlock = (data, x, y, title, titleX) => {
          drawHeaderBox(x, y, title, titleX);
          drawText(doc, data.name || "", xPointCol2 = (xPointH + 292), yPointCol2 = (y + 40), { bold: true, size: 12 });
          drawText(doc, data.address || "", xPointCol2, yPointCol2 += 20);
          drawText(doc, (data.city ? `${data.city}, ` : "") + (data.state || "") + " " + (data.zip || ""), xPointCol2, yPointCol2 += 20);
          if (data.email) drawText(doc, (data.email || "").toLowerCase(), xPointCol2, yPointCol2 += 20);
          if (data.phone) drawText(doc, `Phone: ${data.phone || ""}`, xPointCol2, yPointCol2 += 20);
          if (data.fax) drawText(doc, `Fax: ${data.fax || ""}`, xPointCol2, yPointCol2 += 20);
        };

        // -----------------------------------------------------------
        // LOGO + REPORT TITLE
        // -----------------------------------------------------------
        doc.image(logo, xPoint + 2, yPoint, { width: 230, align: "left" });

        drawText(doc, reportName, 328, yPoint + 15, { bold: true, size: 16, color: BORDER_BLUE, width: doc.pageWidth - 90 });

        // -----------------------------------------------------------
        // TOP BLUE LINE
        // -----------------------------------------------------------
        drawRoundedRect(doc, xPointH, yPointH, fullWidth, 1, 0, BORDER_BLUE, false);
        drawText(doc, `Notification:`, xPointCol1, yPointCol1, { size: 12, color: LABEL_TEXT });
        drawText(doc, `${pd.notification_number || ""}`, xPointCol1 + 65, yPointCol1, { size: 12 });
        drawText(doc, `Start Work Date:`, xPointH + 290, yPointCol2, { size: 12, color: LABEL_TEXT });
        drawText(doc, pd.start_work_date ? `${pd.start_work_date}` : "", xPointH + 380, yPointCol2, { size: 12 });
        if (pd.po_number) drawText(doc, `PO Number:`, xPointCol1, yPointCol1 + 20, { size: 12, color: LABEL_TEXT });
        if (pd.po_number) drawText(doc, `${pd.po_number || ""}`, xPointCol1 + 68, yPointCol1 + 20, { size: 12 });
        drawText(doc, `Completed Work Date:`, xPointH + 290, yPointCol2 + 20, { size: 12, color: LABEL_TEXT });
        drawText(doc, pd.completed_work_date ? `${pd.completed_work_date}` : "", xPointH + 410, yPointCol2 + 20, { size: 12 });

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
          .lineTo(xPointH + fullWidth, yPointH)
          .stroke();

        // BEFORE CONTACT
        drawText(doc, `Site Contact: ${pd.site_contact_before.contact_name || ""}`, xPointCol1, yPointCol1 = (yPointH + 12), { size: 14 });
        drawText(doc, `${pd.site_contact_before.text || ""}`, xPointCol1, doc.y, { size: 8, bold: true, width: 245 });
        drawText(doc, `${pd.site_contact_before.url_text}`, xPointCol1, doc.y, { size: 8, color: BORDER_BLUE, link: pd.site_contact_before.url, underline: true });

        const siteContactTextH = doc.y;

        // AFTER CONTACT
        drawText(doc, `Site Contact: ${pd.site_contact_after.contact_name || ""}`, xPointH + 290, yPointCol1, { size: 14 });
        drawText(doc, `${pd.site_contact_after.text}`, xPointH + 290, doc.y, { size: 8, bold: true, width: 245 });
        yPointCol1 = Math.max(doc.y, siteContactTextH);

        // -----------------------------------------------------------
        // SIGNATURE / BYPASS
        // -----------------------------------------------------------
        const renderSignature = (sig, x, y, reasonText) => {
          if (sig) {
            doc.image(`data:image/png;base64,${sig}`, x, y + 5, { width: 160 });
          } else {
            drawText(doc, reasonText || "", x, y + 20, { size: 14 });
          }
        };

        renderSignature(pd.site_contact_before.signature, xPointH + 50, yPointCol1, pd.site_contact_before.bypass_reason_text);
        renderSignature(pd.site_contact_after.signature, xPointH + 330, yPointCol1, pd.site_contact_after.bypass_reason_text);

        // -----------------------------------------------------------
        // FOOTER LINES + LABELS
        // -----------------------------------------------------------
        drawRoundedRect(doc, xPointH, yPointH += 195, 230, 1, 0, BORDER_BLUE, false);
        drawRoundedRect(doc, xPointH + 292, yPointH, fullWidth - 292, 1, 0, BORDER_BLUE, false);

        drawText(doc, "Authorized signatory", xPointH, yPointH + 5, { size: 14 });
        drawText(doc, "Authorized signatory", xPointH + 290, yPointH + 5, { size: 14 });
      },
      createStatusLogScreen: function (doc, jsonData, page, addPage, xPointH, purpose) {
        addPage(doc, page += 1, null, purpose);
        const borderColor = BORDER_BLUE;
        const textColor = TEXT_DARK;
        const rectX = 45, fullWidth = doc.page.width - 90;
        let rectY = 40;

        //-------------------------------------------------------
        // 🟦 MAIN HEADING (Transparent, Blue Border)
        //-------------------------------------------------------
        const headingHeight = 30;
        drawRoundedRect(doc, xPointH, rectY, fullWidth, headingHeight, 4, borderColor);
        let sHeaderTitle = `Status Log from Tablet for Notification: ${jsonData.notification_number}`;
        drawText(doc, sHeaderTitle, rectX, rectY + 9, { bold: true, size: 16, color: borderColor, width: fullWidth - 20, align: "left" });

        rectY += headingHeight + 5;

        //-------------------------------------------------------
        // TABLE CONFIGURATION
        //-------------------------------------------------------
        const columns = [
          { title: "Foreman", width: fullWidth * 0.25, align: "left", prop: "name" },
          { title: "Date", width: fullWidth * 0.18, align: "center", prop: "start_date" },
          { title: "Time (EST)", width: fullWidth * 0.15, align: "center", prop: "start_time" },
          { title: "Status", width: fullWidth * 0.25, align: "center", prop: "status" },
          { title: "Elapsed Time (Hrs)", width: fullWidth * 0.17, align: "center", prop: "elapsed_time" }
        ];
        //-------------------------------------------------------
        // 🟦 DRAW HEADER ROW
        //-------------------------------------------------------
        const HEADER_HEIGHT = 40; // ✅ Fixed compact header height

        const drawHeader = () => {
          let colX = xPointH;

          // Draw header background
          drawRoundedRect(doc, xPointH, rectY, fullWidth, HEADER_HEIGHT, 0, borderColor, true);

          // ✅ Set header font
          doc.font('Helvetica-Bold').fontSize(12);

          for (const col of columns) {
            const textHeight = doc.heightOfString(col.title, { width: col.width - 10 });
            const textY = rectY + (HEADER_HEIGHT - textHeight) / 2;

            drawText(doc, col.title, colX + 5, textY, { bold: true, size: 12, color: "white", width: col.width - 10, align: col.align });
            colX += col.width;
          }

          rectY += HEADER_HEIGHT;

          // ✅ Reset font after header
          doc.font('Helvetica').fontSize(10);
        };

        drawHeader();

        //-------------------------------------------------------
        // 🧾 DRAW ROW - USE FIXED HEIGHT FOR ALL ROWS
        //-------------------------------------------------------
        const FIXED_ROW_HEIGHT = 30; // ✅ Same fixed height for ALL rows

        const drawRow = (row) => {

          // PAGE BREAK
          if (rectY + FIXED_ROW_HEIGHT > doc.page.height - 40) {
            addPage(doc, page += 1, null, purpose);
            printPageBreakHeader(doc, sHeaderTitle);
            rectY = 65;
            drawHeader();
          }
          drawRoundedRect(doc, xPointH, rectY, fullWidth, FIXED_ROW_HEIGHT, 0, borderColor, false);

          // DRAW VERTICAL DIVIDERS
          let colX = xPointH;
          columns.forEach((col, i) => {
            if (i > 0) {
              doc
                .moveTo(colX, rectY)
                .lineTo(colX, rectY + FIXED_ROW_HEIGHT)
                .strokeColor(borderColor)
                .lineWidth(1)
                .stroke();
            }
            colX += col.width;
          });

          // ✅ FIX: Reset font BEFORE calculating text height and drawing
          doc.font('Helvetica').fontSize(10);

          // DRAW TEXT - Vertically centered
          colX = xPointH;
          columns.forEach(col => {
            const text = row[col.prop] || "";

            // ✅ Recalculate with correct font settings
            const textHeight = doc.heightOfString(text, { width: col.width - 10 });
            const textY = rectY + (FIXED_ROW_HEIGHT - textHeight) / 2;

            drawText(doc, text, colX + 5, textY, { size: 10, color: textColor, width: col.width - 10, align: col.align });
            colX += col.width;
          });

          rectY += FIXED_ROW_HEIGHT;
        };

        //-------------------------------------------------------
        // ADD ROWS
        //-------------------------------------------------------
        (jsonData.status_log || []).forEach(drawRow);

      },
      toDataURL: function (src) {
        return new Promise((resolve, reject) => {
          const image = new Image();
          image.crossOrigin = "Anonymous";

          image.onload = function () {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            canvas.width = this.naturalWidth;
            canvas.height = this.naturalHeight;

            context.drawImage(this, 0, 0);

            const ext = src.split(".").pop() || "jpeg";
            const mime = `image/${ext}`;

            const dataURL = canvas.toDataURL(mime, 0.6);
            resolve(dataURL);
          };

          image.onerror = reject;
          image.src = src;
        });
      }
    };
  });