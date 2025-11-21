
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

    // ────────────────────────────────────────────────────────────────
    // 🧩 Local helpers (non-global)
    // ────────────────────────────────────────────────────────────────
    const drawRoundedRect = (doc, x, y, width, height, radius = 4, color = BORDER_BLUE, bFill) => {
      doc.lineJoin("round").lineWidth(1.5).strokeColor(color);
      doc.roundedRect(x, y, width, height, radius)

      if (bFill) {
        doc.fillAndStroke(color, color);
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
    const drawImage = (doc, img, x, y, w = 257, h = 172, radius = 4, commentText = "No Comments") => {
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

      drawText(doc, `Report Summary: ${text} (continued)`, xPointH, 40, { size: 16, bold: true, color: BORDER_BLUE, width: doc.page.width - 100, align: "left", characterSpacing: -0.2, wordSpacing: -0.4 });
    };
    const printPageBreakHeader = (doc, value = null) => {

      let text = `${value}`;
      text += `   (continued)`;

      drawText(doc, text, xPointH, 45, { bold: true, size: 16, color: BORDER_BLUE, width: doc.page.width - 100 });
    };
    const printPageBreakSubHeader = (doc, value, sColor, symbol) => {

      let y = doc.y;
      let x = xPointH;
      if (symbol) {
        doc.circle(x + 9, y + 8, 8).fillAndStroke(sColor, sColor);
        drawText(doc, symbol, x + 2, y + 5, { bold: true, size: 11, color: "white", width: doc.page.width - 90 });

        x = xPointH + 20;
      }
      let text = `${value} (continued)`;

      drawText(doc, text, x, y + 3, { bold: true, size: 14, color: sColor ? sColor : BORDER_BLUE, width: doc.page.width - 90 });
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
      doc.lineWidth(1.5)
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
                  addPage(doc, page += 1);
                  rectY = 45;
                  textY = rectY + 20;
                }

                drawRoundedRect(doc, xPointH, textY - 20, fullWidth, 25, 4, color, true);
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
                if (rectY + rowHeight + 20 > doc.page.height - 40) {
                  addPage(doc, page += 1);
                  reportSummaryBreakHeader(doc, building.building_name, sectionName);
                  rectY = 70;
                }

                drawRoundedRect(doc, tableX, rectY - 5, tableWidth, rowHeight, 4, BORDER_BLUE);

                // Vertical divider
                doc.lineJoin("round")
                  .lineWidth(1.5)
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
                addPage(doc, page += 1);
                rectY = 45;
              }
              drawHeader(BORDER_BLUE, building.building_name, rectY, "Building: ");

              rectY += 15;
              drawSummaryRow("Building Inspections", `${building.building_inspection_dfct_cnt || "0"} Defects`);
              rectY -= 5;

              //--------------------------------------------------------------
              // 🟧 SECTIONS SUMMARY
              //--------------------------------------------------------------
              (building.sections || []).forEach((section) => {
                rectY += 25;
                // PAGE BREAK FIX
                if (rectY > doc.page.height - 40) {
                  addPage(doc, page += 1);
                  rectY = 45;
                }
                drawHeader(BORDER_ORANGE, section.section_name, rectY, "Section: ");
                rectY += 15;

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
            addPage(doc, page += 1); // Create the first page
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
                    addPage(doc, page += 1);

                    let sValue = `${sBuildPage} ${building.name}`
                    printPageBreakHeader(doc, sValue);
                    y = 65; // reset Y same as initial base
                    x = xPointH;
                  }

                  // 🖼️ Draw the photo (use your helper)
                  drawImage(doc, photo.photo, x, y, photoWidth, photoHeight, 4, photo.comments || "No Comments");

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
              addPage(doc, page += 1); // Create the first page

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
                drawRoundedRect(doc, tableX, y, fullWidth, 25, 4, BORDER_BLUE, true);
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
                drawRoundedRect(doc, tableX, y, fullWidth, rowHeight, 4, BORDER_BLUE, false);

                // Internal vertical lines
                let x = xPointH;
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
                  drawText(doc, comp || "", tableX + colWidths[0] + 10, y + 5, { size: 10, width: colWidths[1] - 20 });
                  // Defect text
                  drawText(doc, defect || "", tableX + colWidths[0] + colWidths[1] + 10, y + 5, { size: 10, width: colWidths[2] - 20 });

                } else {
                  let textX = rectX;

                  (values || []).forEach((v, i) => {
                    drawText(doc, v || "", textX, y + 5, { size: 10, width: colWidths[i] - 20 });
                    textX += colWidths[i] + 5;
                  });
                }

                return rowHeight;
              };
              //--------------------------------------------------------------
              // 🏗️ Building Specification Matrix
              //--------------------------------------------------------------
              if (building.specification_matrix?.length) {

                rectY += 25;
                drawHeaderBar("Building Specification Matrix", rectY);
                rectY += 10;

                const specCols = [
                  (fullWidth) * 0.5,
                  (fullWidth) * 0.5
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
                  (fullWidth) * 0.15,
                  (fullWidth) * 0.45,
                  (fullWidth) * 0.40
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
                rectY = 40;

                let iBuildCount = 0;

                // ────────────────────────────────────────────────────────────────
                // 🧱 BUILDING INSPECTIONS HEADER (Compact One-Line Style)
                // ────────────────────────────────────────────────────────────────
                // Outer box — same layout as building header
                drawRoundedRect(doc, xPointH, (rectY += 27) - 25, fullWidth, 50, 4, BORDER_BLUE, false);
                // First line label
                let sBuildInspPage = "Inspections";
                drawText(doc, sBuildInspPage, rectX, rectY - 18, { bold: true, size: 14, color: BORDER_BLUE, width: fullWidth });
                // Second line dynamic building name
                drawText(doc, building.name || "", rectX, rectY + 2, { bold: true, size: 18, color: BORDER_BLUE, width: fullWidth });

                (building.inspections || []).forEach(inspection => {

                  const photoRows = inspection.photos?.length ? Math.ceil(inspection.photos.length / 2) : 0;
                  const photoBlockHeight = photoRows * (172 + 20);
                  const descriptionHeight = 45;
                  const commentsHeight = inspection.comments ? 45 : 0;
                  const headerHeight = 30;
                  const photoHeaderHeight = 35;

                  const totalBlockHeight = headerHeight + descriptionHeight + commentsHeight + photoHeaderHeight + photoBlockHeight + 40;

                  if ((rectY + totalBlockHeight > doc.page.height - 60) && iBuildCount !== 0) {
                    addPage(doc, page += 1);
                    let sValue = `${sBuildPage} ${building.name} ${sBuildInspPage}`
                    printPageBreakHeader(doc, sValue);
                    rectY = 65;
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
                        addPage(doc, page += 1);

                        let sValue = `${sBuildPage} ${building.name} ${sBuildInspPage}`
                        printPageBreakHeader(doc, sValue);
                        printPageBreakSubHeader(doc, sBuildInspActivity, BORDER_ORANGE);
                        x = xPointH;
                        y = 85;
                      }

                      // Image
                      drawImage(doc, photo.photo, x, y, photoWidth, photoHeight, 4, photo.comments || "No Comments");
                      count++;

                      if (count % perRow === 0) {
                        x = xPointH;
                        y += photoHeight + gapY;
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
                  rectX = 45; rectY = 40; addPage(doc, page += 1);
                  // ────────────────────────────────────────────────────────────────
                  // 📘 SECTION HEADER (Compact Two-Line Style)
                  // ────────────────────────────────────────────────────────────────
                  drawRoundedRect(doc, xPointH, (rectY += 27) - 25, fullWidth, 50, 4, BORDER_BLUE);
                  // First line: label
                  let sSectPage = "Section:";
                  drawText(doc, sSectPage, rectX, rectY - 18, { bold: true, size: 14, color: BORDER_BLUE, width: fullWidth });
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
                        addPage(doc, page += 1);

                        let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name}`
                        printPageBreakHeader(doc, sValue);
                        y = 65; // reset Y same as initial base
                        x = xPointH;
                      }

                      // 🖼️ Draw the photo (use your helper)
                      drawImage(doc, photo.photo, x, y, photoWidth, photoHeight, 4, photo.comments || "No Comments");

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
                  rectY = 40;
                  addPage(doc, page += 1);
                  //--------------------------------------------------------------
                  // 🏗️ Roof Specification Matrix
                  //--------------------------------------------------------------
                  if (section.specification_matrix?.length) {
                    rectY += 25;
                    drawHeaderBar("Roof Specification Matrix", rectY);
                    rectY += 10;

                    const specCols = [
                      (fullWidth) * 0.5,
                      (fullWidth) * 0.5
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
                      (fullWidth) * 0.15,
                      (fullWidth) * 0.45,
                      (fullWidth) * 0.40
                    ];

                    drawTableHeader(["Rating", "Component", "Defect"], maintCols, rectY);
                    rectY += 30;

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
                  rectY = 40;
                  addPage(doc, page += 1);
                  if (section.inspection_matrix?.length) {
                    if (addPage(doc, page += 1, 270)) rectY = doc.y; else page -= 1;

                    rectY += 25;
                    // Header bar
                    drawHeaderBar("Section Inspection Matrix", rectY);
                    rectY += 10;

                    // Column structure
                    const inspCols = [
                      (fullWidth) * 0.15, // Rating
                      (fullWidth) * 0.45, // Component
                      (fullWidth) * 0.40  // Defect
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
                    rectY = 40;
                    addPage(doc, page += 1);

                    // ────────────────────────────────────────────────────────────────
                    // 🔵 INSPECTIONS FOR SECTION HEADER
                    // ────────────────────────────────────────────────────────────────
                    drawRoundedRect(doc, xPointH, (rectY += 27) - 25, fullWidth, 50, 4, BORDER_BLUE);
                    // First line
                    let sSecInspPage = "Inspections";
                    drawText(doc, sSecInspPage, rectX, rectY - 18, { bold: true, size: 14, color: BORDER_BLUE, width: fullWidth });
                    // Second line = section name
                    drawText(doc, section.name || "", rectX, rectY + 2, { bold: true, size: 18, color: BORDER_BLUE, width: fullWidth });
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
                        addPage(doc, page += 1);
                        let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name} ${sSecInspPage}`;
                        printPageBreakHeader(doc, sValue);
                        rectY = 65;
                      }

                      iSectInspCount++;
                      const isRepair = insp.rating === "RN";
                      const color = isRepair ? BORDER_RED : BORDER_GREEN;
                      const symbol = isRepair ? "RN" : "ND";

                      drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, color);
                      doc.circle(rectX + 9, rectY + 12, 8).fillAndStroke(color, color);
                      drawText(doc, symbol, rectX + 2, rectY + 7, { bold: true, size: 11, color: "white", width: doc.page.width - 100 });
                      let sSectInspActivity = `${insp.activity} : ${insp.selections[0].selection}`;
                      drawText(doc, sSectInspActivity, rectX + 22, rectY + 7, { bold: true, size: 14, color: color, width: doc.page.width - 100 });
                      rectY += 30;
                      drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                      drawText(doc, "Description:", rectX, rectY + 6, { bold: true, size: 14, color: BORDER_ORANGE, width: doc.page.width - 100 });
                      rectY += 32;
                      drawText(doc, insp.selections[0].description || "—", rectX, rectY, { size: 10, color: TEXT_DARK, width: fullWidth });
                      rectY = doc.y + 10;

                      if (insp.comments && insp.comments !== "-" && insp.comments !== "—") {
                        drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                        drawText(doc, "Comments:", rectX, rectY + 6, { bold: true, size: 14, color: BORDER_ORANGE, width: fullWidth });
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
                            addPage(doc, page += 1);
                            let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name} ${sSecInspPage}`;
                            printPageBreakHeader(doc, sValue);
                            printPageBreakSubHeader(doc, sSectInspActivity, color, symbol);
                            x = xPointH;
                            y = 85;
                          }

                          drawImage(doc, photo.photo, x, y, photoWidth, photoHeight, 4, photo.comments || "No Comments");
                          count++;

                          if (count % 2 === 0) {
                            x = xPointH;
                            y += photoHeight + gapY;
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
                    addPage(doc, page += 1);

                    //--------------------------------------------------------------
                    // 🔹 Header Blue Bar
                    //--------------------------------------------------------------
                    drawRoundedRect(doc, xPointH, rectY, fullWidth, 50, 4, BORDER_BLUE);
                    let sMainActPage = "Maintenance Activities";
                    drawText(doc, sMainActPage, rectX, rectY + 10, { size: 14, color: BORDER_BLUE, bold: true, width: fullWidth });
                    drawText(doc, section.name || "", rectX, rectY + 28, { size: 18, color: BORDER_BLUE, bold: true, width: fullWidth });
                    rectY += 55;

                    //----------------------------------------------------------------------
                    // 🔁 Render EACH Maintenance Activity
                    //----------------------------------------------------------------------
                    const renderMaintActivity = (activity) => {

                      //------------------------------------------------------------------
                      // PAGE BREAK CHECK before starting entire block
                      //------------------------------------------------------------------
                      if (rectY + 500 > doc.page.height - 60) {
                        addPage(doc, page += 1);

                        let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name} ${sMainActPage}`
                        printPageBreakHeader(doc, sValue);

                        rectY = 85;
                      }

                      //------------------------------------------------------------------
                      // 🟧 Activity Header (Orange, Bordered)
                      //------------------------------------------------------------------
                      const barColor = BORDER_ORANGE;
                      const barHeight = 25;

                      doc.lineJoin("round")
                        .lineWidth(1.5)
                        .strokeColor(barColor)
                        .roundedRect(xPointH, rectY, fullWidth, barHeight, 4)
                        .stroke();

                      let sMaintActivity = `${activity.activity} ${activity.selections[0].selection}`;
                      drawText(doc, sMaintActivity, rectX, rectY + 8, { size: 14, bold: true, color: barColor, width: fullWidth });

                      rectY += barHeight + 5;

                      //------------------------------------------------------------------
                      // 🟠 DESCRIPTION
                      //------------------------------------------------------------------
                      drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                      drawText(doc, "Description:", rectX, rectY + 7, { size: 14, color: BORDER_ORANGE, bold: true, width: fullWidth });
                      rectY += 32;
                      drawText(doc, activity.selections[0].description || "", rectX, rectY, { size: 10, color: TEXT_DARK, width: doc.page.width - 100, width: fullWidth });
                      rectY = doc.y + 5;

                      //------------------------------------------------------------------
                      // 🟠 COMMENTS
                      //------------------------------------------------------------------
                      drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                      drawText(doc, "Comments:", rectX, rectY + 6, { size: 14, color: BORDER_ORANGE, bold: true, width: fullWidth });
                      rectY += 32;
                      drawText(doc, activity.comments || "—", rectX, rectY, { size: 10, color: TEXT_DARK, width: doc.page.width - 100, width: fullWidth });
                      rectY = doc.y + 7;

                      // -------------------------------------------------------------------
                      // 🟠 OVERVIEW PHOTO(S)
                      // -------------------------------------------------------------------
                      if (activity.overview_photos?.length) {

                        // Header
                        drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                        drawText(doc, "Overview Photo(s):", rectX, rectY + 6, { size: 14, color: BORDER_ORANGE, bold: true, width: fullWidth });

                        rectY += 30;

                        // --- PHOTO GRID (2 photos per row) ---
                        const photoWidth = 257;
                        const photoHeight = 172;
                        const gapX = 10;
                        const gapY = 20;
                        const photosPerRow = 2;

                        let x = xPointH;
                        let y = rectY;
                        let count = 0;

                        (activity.overview_photos || []).forEach((p) => {

                          // PAGE BREAK CHECK
                          if (y + photoHeight > doc.page.height - 40) {
                            addPage(doc, page += 1);
                            let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name} ${sMainActPage}`
                            printPageBreakHeader(doc, sValue);
                            printPageBreakSubHeader(doc, sMaintActivity, BORDER_ORANGE);
                            y = 105;     // reset Y
                            x = xPointH;
                          }

                          // DRAW photo
                          drawImage(doc, p.photo, x, y, photoWidth, photoHeight, 4, p.comments || "No Comments");
                          count++;
                          if (count % photosPerRow === 0) {
                            // Move to next row
                            x = xPointH;
                            y += photoHeight + gapY;
                          } else {
                            // Move to next column
                            x += photoWidth + gapX;
                          }
                        });

                        // Final rectY after last row — CLEAN, no extra spacing
                        const totalRows = Math.ceil(activity.overview_photos.length / photosPerRow);
                        rectY = rectY + totalRows * (photoHeight + gapY) - gapY + 10;
                      }

                      rectY += 20;
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
                      drawText(doc, "Defect Photo(s):", colLeftX + 5, rectY + 6, {
                        size: 14, bold: true, color: BORDER_ORANGE, width: fullWidth
                      });

                      drawRoundedRect(doc, colRightX, rectY, colW, 25, 4, BORDER_ORANGE);
                      drawText(doc, "Repair Photo(s):", colRightX + 5, rectY + 6, {
                        size: 14, bold: true, color: BORDER_ORANGE, width: fullWidth
                      });

                      rectY += 30;

                      //-------------------------------------------------------------------
                      // DRAW defect_photos & repair_photos in vertical lists
                      //-------------------------------------------------------------------
                      const maxRows = Math.max(
                        activity.defect_photos?.length || 0,
                        activity.repair_photos?.length || 0
                      );

                      let leftY = rectY;
                      let rightY = rectY;

                      for (let i = 0; i < maxRows; i++) {

                        // PAGE BREAK BEFORE PLACING ROW
                        if (Math.min(leftY, rightY) + photoH > doc.page.height - 40) {
                          addPage(doc, page += 1);

                          let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name} ${sMainActPage}`
                          printPageBreakHeader(doc, sValue);
                          printPageBreakSubHeader(doc, sMaintActivity, BORDER_ORANGE);
                          leftY = 105;
                          rightY = 105;
                        }

                        // Yellow vertical divider
                        doc.lineWidth(1.5)
                          .strokeColor(BORDER_ORANGE)
                          .moveTo(sepX, Math.min(leftY, rightY))
                          .lineTo(sepX, Math.max(leftY, rightY) + photoH + 20)
                          .stroke();

                        // DEFECT PHOTO (left column)
                        if (activity.defect_photos?.[i]) {
                          drawImage(doc, activity.defect_photos[i].photo, colLeftX, leftY, colW, photoH, 4, activity.defect_photos[i].comments || "No Comments");
                          leftY += photoH + 30;
                        }

                        // REPAIR PHOTO (right column)
                        if (activity.repair_photos?.[i]) {
                          drawImage(doc, activity.repair_photos[i].photo, colRightX, rightY, colW, photoH, 4, activity.repair_photos[i].comments || "No Comments");
                          rightY += photoH + 30;
                        }
                      }

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
                    addPage(doc, page += 1);
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
                        addPage(doc, page += 1);
                        let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name} ${sRecomWork}`;
                        printPageBreakHeader(doc, sValue);
                        rectY = 85;
                      }

                      iRecomWorkCount++;

                      drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                      let sWorkActivity = `${work.activity || ""}: ${work.selections[0].selection}`;
                      drawText(doc, sWorkActivity, rectX, rectY + 7, { bold: true, size: 14, color: BORDER_ORANGE, width: doc.page.width - 100 });
                      rectY += 30;
                      drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                      drawText(doc, "Description:", rectX, rectY + 6, { bold: true, size: 14, color: BORDER_ORANGE, width: doc.page.width - 100 });
                      rectY += 32;
                      drawText(doc, work.selections[0].description || "—", rectX, rectY, { size: 10, color: TEXT_DARK, width: fullWidth });
                      rectY = doc.y + 10;

                      if (work.comments && work.comments !== "-" && work.comments !== "—") {
                        // Comments (Yellow)
                        drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                        drawText(doc, "Comments:", rectX, rectY + 6, { bold: true, size: 14, color: BORDER_ORANGE, width: fullWidth });
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
                            addPage(doc, page += 1);
                            let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name} ${sRecomWork}`
                            printPageBreakHeader(doc, sValue);
                            printPageBreakSubHeader(doc, sWorkActivity, BORDER_ORANGE);
                            x = xPointH;
                            y = 105;
                          }

                          drawImage(doc, photo.photo, x, y, photoWidth, photoHeight, 4, photo.comments || "No Comments");
                          count++;

                          if (count % 2 === 0) {
                            x = xPointH;
                            y += photoHeight + gapY;
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
            const fullWidth = doc.page.width - 90;
            //--------------------------------------------------------------
            // 📄 Report Summary Header
            //--------------------------------------------------------------
            let rectX = 45;
            let rectY = 40;

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
                drawRoundedRect(doc, xPointH, textY - 20, fullWidth, 25, 4, color, true);
                drawText(doc, `${prefix}${title}`, rectX, textY - 12, { bold: true, size: color === BORDER_BLUE ? 14 : 13, color: "white", width: doc.page.width - 100, align: "left" });
              };

              //--------------------------------------------------------------
              // Helper: Draw table-style row (3-column row)
              //--------------------------------------------------------------
              const drawTableRow = (label, activity, selection) => {
                const tableX = xPointH;
                const tableWidth = fullWidth;
                const colWidths = [tableWidth * 0.25, tableWidth * 0.35, tableWidth * 0.40];
                const rowHeight = 22;

                // Outer rounded rectangle
                drawRoundedRect(doc, tableX, rectY - 5, tableWidth, rowHeight, 4, BORDER_BLUE, false);

                // Column dividers
                let xPos = tableX;
                for (let i = 0; i < colWidths.length - 1; i++) {
                  xPos += colWidths[i];
                  doc.lineJoin("round").lineWidth(1.5).strokeColor(BORDER_BLUE)
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
              drawHeader(BORDER_BLUE, building.building_name, rectY, "Building: ");

              //--------------------------------------------------------------
              // 🟧 SECTION LIST
              //--------------------------------------------------------------
              (building.sections || []).forEach((section) => {
                rectY += 30;
                drawHeader(BORDER_ORANGE, section.section_name, rectY, "Section: ");
                rectY += 15;

                // 📋 DEFECT + RECOMMENDED WORK TABLES
                const renderRows = (items, prefix) => {
                  (items || []).forEach((item, i) => {
                    if (addPage(doc, page += 1, 100)) rectY = doc.y;
                    drawTableRow(`${prefix}: ${i + 1}`, item.activity || "", item.selection || "");
                  });
                };

                renderRows(section.defects, "Defect");
                renderRows(section.recommended_work, "Recommended Work");

                rectY -= 10;
              });

              rectY += 10;
            });

            //--------------------------------------------------------------
            // 🏗️ INITIAL SETUP
            //--------------------------------------------------------------
            rectX = 45;  // Left margin for all boxes and text
            rectY = 40;  // Starting Y position
            addPage(doc, page += 1); // Create the first page

            //--------------------------------------------------------------
            // 🏢 LOOP THROUGH EACH BUILDING ENTRY
            //--------------------------------------------------------------
            (jsonData.buildings || []).forEach((building) => {
              // ────────────────────────────────────────────────────────────────
              // 🧩 Local helpers (non-global)
              // ────────────────────────────────────────────────────────────────
              const drawRect = (color, x, y, w, h = 25, lw = 2) => {
                // doc.lineJoin("round").lineWidth(lw).strokeColor(color).rect(x, y, w, h).stroke();
              };

              // ────────────────────────────────────────────────────────────────
              // 📄 PAGE CHECKER
              // ────────────────────────────────────────────────────────────────
              if (addPage(doc, page += 1, 270)) rectY = doc.y; else page -= 1;

              // ────────────────────────────────────────────────────────────────
              // 🏠 BUILDING HEADER
              // ────────────────────────────────────────────────────────────────
              drawRect(doc, BORDER_BLUE, xPointH, (rectY += 27) - 25, fullWidth);
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
              drawRect(doc, BORDER_ORANGE, xPointH, (rectY += 25) - 20, fullWidth);
              drawText(doc, "Comments", rectX, rectY - 13, { bold: true, size: 14, color: BORDER_ORANGE });
              drawText(doc, building.building_comments || "No comments provided.", rectX, rectY + 20, {
                size: 10, width: fullWidth
              });

              // ────────────────────────────────────────────────────────────────
              // 🏗️ BUILDING PHOTO
              // ────────────────────────────────────────────────────────────────
              const photoHeaderY = doc.y + 10;
              drawRect(doc, BORDER_ORANGE, xPointH, photoHeaderY, fullWidth);
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
                  if (y + photoHeight > doc.page.height - 40) {
                    addPage(doc, page += 1);
                    y = 45; // reset Y same as initial base
                    x = xPointH;
                  }

                  // 🖼️ Draw the photo (use your helper)
                  drawImage(doc, photo.photo, x, y, photoWidth, photoHeight, 4, photo.comments || "No Comments");

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
                rectX = 45; rectY = 40; addPage(doc, page += 1);

                // SECTION HEADER
                drawRect(doc, BORDER_BLUE, xPointH, (rectY += 27) - 25, fullWidth);
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
                drawRect(doc, BORDER_ORANGE, xPointH, (rectY += 25) - 20, fullWidth);
                drawText(doc, "Comments", rectX, rectY - 13, { bold: true, size: 14, color: BORDER_ORANGE });
                drawText(doc, section.section_comments || "No comments provided.", rectX, rectY + 20, {
                  size: 10, width: fullWidth
                });

                // SECTION PHOTO
                const photoY = doc.y + 10;
                drawRect(doc, BORDER_ORANGE, xPointH, photoY, fullWidth);
                drawText(doc, "Section Overview Photo", rectX, photoY + 8, { bold: true, size: 14, color: BORDER_ORANGE });
                if (section.section_photo) {
                  drawImage(doc, section.section_photo, xPointH, photoY + 35, 4);
                  rectY = photoY + 35 + 212 + 15;
                }

                // DEFECT SUMMARY
                if (section.defects?.length) {
                  rectX = 45; rectY = 40; addPage(doc, page += 1);
                  drawRect(doc, BORDER_BLUE, xPointH, (rectY += 52) - 50, fullWidth, 50);
                  drawText(doc, "Defect Summary For Section:", rectX, rectY - 42, {
                    bold: true, size: 14, color: BORDER_BLUE, width: fullWidth
                  });
                  drawText(doc, section.section_name || "", rectX, rectY - 20, {
                    bold: true, size: 14, color: BORDER_BLUE, width: fullWidth
                  });
                }

                // DEFECTS LOOP
                (section.defects || []).forEach(defect => {
                  rectX = 45;
                  rectY = 40;
                  addPage(doc, page += 1);

                  // DEFECT HEADER
                  drawRect(doc, BORDER_ORANGE, xPointH, (rectY += 52) - 45, fullWidth);
                  drawText(doc, `Field of roof : ${defect.activity || ""} ${defect.selection || ""}`, rectX, rectY - 38, {
                    bold: true, size: 14, color: BORDER_ORANGE, width: doc.page.width - 100
                  });

                  const leftColX = xPointH, rightColX = xPointH + 270, sectionTopY = rectY - 10;

                  // Overview
                  drawRect(doc, BORDER_ORANGE, leftColX, sectionTopY, 257);
                  drawText(doc, "Overview:", rectX, sectionTopY + 7, { bold: true, size: 14, color: BORDER_ORANGE });
                  drawImage(doc, defect.repair_overview_photo, leftColX, sectionTopY + 35, 257, 172, 4);

                  // Description
                  drawRect(doc, BORDER_ORANGE, rightColX, sectionTopY, doc.page.width - 360);
                  drawText(doc, "Description:", rightColX + 5, sectionTopY + 7, { bold: true, size: 14, color: BORDER_ORANGE });
                  drawText(doc, defect.description || "No description provided.", rightColX, sectionTopY + 35, {
                    size: 10, width: doc.page.width - 380
                  });

                  // Comments
                  const commentY = doc.y + 10;
                  drawRect(doc, BORDER_ORANGE, rightColX, commentY, doc.page.width - 360);
                  drawText(doc, "Comments:", rightColX + 5, commentY + 7, { bold: true, size: 14, color: BORDER_ORANGE });
                  drawText(doc, defect.comments || "No comments provided.", rightColX, commentY + 32, {
                    size: 10, width: doc.page.width - 380
                  });

                  // Defect + Repair Photos
                  const photoRowY = Math.max(doc.y + 25, sectionTopY + 270);
                  drawRect(doc, BORDER_ORANGE, leftColX, photoRowY, 257);
                  drawText(doc, "Defect:", rectX, photoRowY + 7, { bold: true, size: 14, color: BORDER_ORANGE });
                  drawImage(doc, defect.defect_photo, leftColX, photoRowY + 35, 257, 172);

                  drawRect(doc, BORDER_ORANGE, rightColX, photoRowY, doc.page.width - 360);
                  drawText(doc, "Repair:", rightColX + 5, photoRowY + 7, { bold: true, size: 14, color: BORDER_ORANGE });
                  drawImage(doc, defect.repair_photo, rightColX, photoRowY + 35, 257, 172, 4);
                });

                //--------------------------------------------------------------
                // RECOMMENDED WORK ITEMS
                //--------------------------------------------------------------
                if (section.recommended_work?.length) {
                  rectX = 45;
                  rectY = 40;
                  addPage(doc, page += 1);
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
                      addPage(doc, page += 1);
                      let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name} ${sRecomWork}`;
                      printPageBreakHeader(doc, sValue);
                      rectY = 85;
                    }

                    iRecomWorkCount++;

                    drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                    let sWorkActivity = `${work.activity || ""}: ${work.selections[0].selection}`;
                    drawText(doc, sWorkActivity, rectX, rectY + 7, { bold: true, size: 14, color: BORDER_ORANGE, width: doc.page.width - 100 });
                    rectY += 30;
                    drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                    drawText(doc, "Description:", rectX, rectY + 6, { bold: true, size: 14, color: BORDER_ORANGE, width: doc.page.width - 100 });
                    rectY += 32;
                    drawText(doc, work.selections[0].description || "—", rectX, rectY, { size: 10, color: TEXT_DARK, width: fullWidth });
                    rectY = doc.y + 10;

                    if (work.comments && work.comments !== "-" && work.comments !== "—") {
                      // Comments (Yellow)
                      drawRoundedRect(doc, xPointH, rectY, fullWidth, 25, 4, BORDER_ORANGE);
                      drawText(doc, "Comments:", rectX, rectY + 6, { bold: true, size: 14, color: BORDER_ORANGE, width: fullWidth });
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
                          addPage(doc, page += 1);
                          let sValue = `${sBuildPage} ${building.name}, ${sSectPage} ${section.name} ${sRecomWork}`
                          printPageBreakHeader(doc, sValue);
                          printPageBreakSubHeader(doc, sWorkActivity, BORDER_ORANGE);
                          x = xPointH;
                          y = 105;
                        }

                        drawImage(doc, photo.photo, x, y, photoWidth, photoHeight, 4, photo.comments || "No Comments");
                        count++;

                        if (count % 2 === 0) {
                          x = xPointH;
                          y += photoHeight + gapY;
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
            });

            //--------------------------------------------------------------
            // 💼 Labor and Materials Section (Perfect Alignment)
            //--------------------------------------------------------------
            if (jsonData.labor_fees_and_materials) {
              addPage(doc, page += 1);
              let rectX = 45, rectY = 40;
              const borderColor = BORDER_BLUE, textColor = TEXT_DARK, orange = BORDER_ORANGE;

              //--------------------------------------------------------------
              // 🔧 Helper Functions (no layout change)
              //--------------------------------------------------------------
              const drawRect = (x, y, w, h, color, fill = false) => {
                doc.lineJoin("round").lineWidth(1.5).strokeColor(color);
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
              drawDataRows(jsonData.labor_fees_and_materials.labor_and_fees || [], colWidths, 2);

              //--------------------------------------------------------------
              // 🟧 Labor Total
              //--------------------------------------------------------------
              drawRect(doc, xPointH, rectY + 6, fullWidth, 22, orange, true);
              drawHeaderText("Labor and Fees Total:", rectX, rectY + 12, "white", 11);
              drawHeaderText(
                `${parseFloat(jsonData.labor_fees_and_materials.labor_and_fees_total || 0)
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
              drawDataRows(jsonData.labor_fees_and_materials.materials || [], matWidths, 8, true);

              //--------------------------------------------------------------
              // 🟧 Material Total
              //--------------------------------------------------------------
              drawRect(doc, xPointH, rectY + 12, fullWidth, 22, orange, true);
              drawHeaderText("Materials Total:", rectX, rectY + 18, "white", 11);
              drawHeaderText(
                `${parseFloat(jsonData.labor_fees_and_materials.material_total || 0)
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
              doc.text(`${parseFloat(jsonData.labor_fees_and_materials.subtotal || 0)
                .toLocaleString('en-US', currencyOptions)}`, xPointH + fullWidth - 95, rectY + 11,
                { width: 90, align: "right", characterSpacing: -0.2, wordSpacing: -0.4 });

              doc.text(`Tax Amount (Rate ${parseFloat(jsonData.labor_fees_and_materials.taxes?.tax_rate || 0)
                .toFixed(2)}%):`, xPointH + fullWidth - 250, rectY + 26);
              doc.text(`${parseFloat(jsonData.labor_fees_and_materials.taxes?.total || 0)
                .toLocaleString('en-US', currencyOptions)}`, xPointH + fullWidth - 95, rectY + 26,
                { width: 90, align: "right" });

              doc.lineWidth(1.5).strokeColor("white")
                .moveTo(xPointH + fullWidth - 250, rectY + 43)
                .lineTo(xPointH + fullWidth - 5, rectY + 43).stroke();

              doc.font("Helvetica-Bold").fontSize(12);
              doc.text("Grand Total:", xPointH + fullWidth - 250, rectY + 51);
              doc.text(`${parseFloat(jsonData.labor_fees_and_materials.grand_total || 0)
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
        let fullWidth = doc.page.width - 90;

        // HEADER BOX (replaces .rect)
        const drawHeaderBox = (x, y, title, titleX) => {
          drawRoundedRect(doc, x, y, colWidth, 25, 4, BORDER_BLUE, false);
          drawText(doc, title, titleX, y + 8, {
            bold: true,
            size: 14,
            color: BORDER_BLUE,
            width: fullWidth
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
        drawRoundedRect(doc, xPointH, yPointH, fullWidth, 1, 0, BORDER_BLUE, false);

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
          .lineTo(xPointH + fullWidth, yPointH)
          .stroke();

        // BEFORE CONTACT
        drawText(doc, `Site Contact: ${pd.site_contact_before.contact_name || ""}`,
          xPointCol1, yPointCol1 = (yPointH + 12), { size: 14 });

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
          xPointH + 290, yPointCol1, { size: 14 });

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
      createStatusLogScreen: function (doc, jsonData, page, addPage, xPointH) {
        addPage(doc, page += 1, null);
        const borderColor = BORDER_BLUE;
        const textColor = TEXT_DARK;
        const rectX = 45, fullWidth = doc.page.width - 90;
        let rectY = 40;

        //-------------------------------------------------------
        // 🟦 MAIN HEADING (Transparent, Blue Border)
        //-------------------------------------------------------
        const headingHeight = 30;
        drawRoundedRect(doc, xPointH, rectY, fullWidth, headingHeight, 4, borderColor);
        drawText(doc, `Status Log from Tablet for Notification: ${jsonData.notification_number}`, rectX, rectY + 9, { bold: true, size: 16, color: borderColor, width: fullWidth - 20, align: "left" });

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
        // 🟦 DRAW HEADER ROW (One Big Rectangle + Multiple Texts)
        //-------------------------------------------------------
        const drawHeader = () => {
          let colX = xPointH;
          const headerHeight = Math.max(
            ...columns.map(col =>
              doc.heightOfString(col.title, { width: col.width - 10 })
            )
          );
          // ✅ One full-width header rectangle
          drawRoundedRect(doc, xPointH, rectY, fullWidth, headerHeight, 4, borderColor, true);

          // 🎯 Only draw the text for each column
          for (const col of columns) {
            drawText(doc, col.title, colX + 5, rectY + (headerHeight - doc.heightOfString(col.title, { width: col.width - 10 })) / 2,
              { bold: true, size: 14, color: "white", width: col.width - 10, align: col.align }
            );

            colX += col.width;
          }

          rectY += headerHeight;
          return headerHeight;
        };

        drawHeader();

        //-------------------------------------------------------
        // 🧾 DRAW ROW
        //-------------------------------------------------------
        rectY += 5;
        const drawRow = (row) => {
          // 1️⃣ Calculate max row height based on wrapped text
          const maxHeight = Math.max(
            ...columns.map(col =>
              doc.heightOfString(row[col.prop] || "", { width: col.width - 10 }) + 10
            )
          );

          // 2️⃣ PAGE BREAK
          if (rectY + maxHeight + 40 > doc.page.height - 45) {
            addPage(doc, page += 1, null);
            rectY = 40;
            drawHeader();
          }

          //-------------------------------------------------------
          // 3️⃣ ONE SINGLE RECTANGLE FOR THE ENTIRE ROW
          //-------------------------------------------------------
          drawRoundedRect(doc, xPointH, rectY, fullWidth, maxHeight, 4, borderColor);

          //-------------------------------------------------------
          // 4️⃣ DRAW VERTICAL DIVIDERS ONLY
          //-------------------------------------------------------
          let colX = xPointH;
          columns.forEach((col, i) => {
            if (i > 0) {
              doc
                .moveTo(colX, rectY)
                .lineTo(colX, rectY + maxHeight)
                .strokeColor(borderColor)
                .lineWidth(2)
                .stroke();
            }
            colX += col.width;
          });

          //-------------------------------------------------------
          // 5️⃣ DRAW TEXT INSIDE EACH COLUMN
          //-------------------------------------------------------
          colX = xPointH;
          columns.forEach(col => {
            const text = row[col.prop] || "";
            drawText(doc, text, colX + 5, rectY + 6, {
              size: 10,
              color: textColor,
              width: col.width - 10,
              align: col.align
            });
            colX += col.width;
          });

          rectY += maxHeight;
        };


        //-------------------------------------------------------
        // ADD ROWS
        //-------------------------------------------------------
        (jsonData.status_log || []).forEach(drawRow);

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