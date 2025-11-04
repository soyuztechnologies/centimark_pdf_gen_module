
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
    return {
      pdfPM: function (jsonData, bType = 'download', paperSize = 'LETTER') {
        var that = this;
        return new Promise(function (resolve, reject) {
          // resolve();
          if (!jsonData) {
            reject('Invalid Data');
          }
          var page = 1,
            reportName = 'PREVENTATIVE MAINTENANCE REPORT';
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

            var rectX = 80, rectY = 65;
            doc.lineJoin("round")
              .lineWidth(3)
              .strokeColor("#00529B")
              .rect(xPointH, yPoint - 18, doc.page.width - 90, 30)
              .stroke() // 👈 draw after defining the rect
              .fontSize(16)
              .font("Helvetica-Bold")
              .fillColor("#00529B")
              .text("BUILDING SECTION SUMMARY", rectX, 35, {
                width: 440,
                align: "center",
                characterSpacing: -0.2,
                wordSpacing: -0.4
              });

            jsonData.building_section_summary.forEach(building_section_summary => {
              if (addPage(doc, page += 1, 90)) {
                rectY = doc.y;
              } else {
                page -= 1;
              }
              doc.rect(rectX, (rectY += 27) - 25, 440, 25)
                .fill('#00529B')
                .fillColor("white")
                .fontSize(14)
                .font("Helvetica-Bold")
                .text(`BUILDING: ${building_section_summary.building_name || ''}`, rectX + 80, rectY - 17)
                .fillColor("black")
                .font('Helvetica')
                .fontSize(10);
              doc.lineWidth(1)
                .moveTo(rectX, doc.y)
                .lineTo(520, doc.y)
                .stroke();
              rectY = doc.y + 12;
              doc.text(`BUILDING INSPECTION:`, rectX + 20, rectY, {
                width: 140,
                align: 'left'
              });
              doc.text(`${building_section_summary.building_inspection || ""}`, (doc.page.width / 2) + 20, rectY, {
                width: 140,
                align: 'left'
              });
              doc.lineWidth(1)
                .moveTo(rectX, rectY - 12)
                .lineTo(rectX, doc.y)
                .moveTo(doc.page.width / 2, rectY - 12)
                .lineTo(doc.page.width / 2, doc.y)
                .moveTo(rectX + 440, rectY - 12)
                .lineTo(rectX + 440, doc.y)
                .stroke();
              doc.lineWidth(1)
                .moveTo(rectX, doc.y)
                .lineTo(520, doc.y)
                .stroke();
              rectY = doc.y;
              (building_section_summary.sections_summary || []).forEach(section_summary => {
                if (addPage(doc, page += 1, 90)) {
                  rectY = doc.y;
                } else {
                  page -= 1;
                }
                doc.rect(rectX, (rectY += 25) - 25, 440, 25)
                  .fill('#C47C08')
                  .fillColor("white")
                  .fontSize(14)
                  .font("Helvetica-Bold")
                  .text(`SECTION: ${section_summary.section_name || ''}`, rectX + 82, rectY - 17)
                  .fillColor("black")
                  .font('Helvetica')
                  .fontSize(10);
                doc.lineWidth(1)
                  .moveTo(rectX, doc.y)
                  .lineTo(520, doc.y)
                  .stroke();
                rectY = doc.y + 12;
                doc.text(`SECTION INSPECTION:`, rectX + 20, rectY, {
                  width: 140,
                  align: 'left'
                });
                doc.text(`${section_summary.section_inspection || ''}`, (doc.page.width / 2) + 20, rectY, {
                  width: 140,
                  align: 'left'
                });
                doc.lineWidth(1)
                  .moveTo(rectX, rectY - 12)
                  .lineTo(rectX, doc.y)
                  .moveTo(doc.page.width / 2, rectY - 12)
                  .lineTo(doc.page.width / 2, doc.y)
                  .moveTo(rectX + 440, rectY - 12)
                  .lineTo(rectX + 440, doc.y)
                  .stroke();
                doc.lineWidth(1)
                  .moveTo(rectX, doc.y)
                  .lineTo(520, doc.y)
                  .stroke();
                rectY = doc.y;
                doc.lineWidth(1)
                  .moveTo(rectX, doc.y)
                  .lineTo(520, doc.y)
                  .stroke();
                rectY = doc.y + 12;
                doc.text(`MAINTENANCE ACTIVITIES:`, rectX + 20, rectY, {
                  width: 140,
                  align: 'left'
                });
                doc.text(`${section_summary.maintenance_activities || ''}`, (doc.page.width / 2) + 20, rectY, {
                  width: 140,
                  align: 'left'
                });
                doc.lineWidth(1)
                  .moveTo(rectX, rectY - 12)
                  .lineTo(rectX, doc.y)
                  .moveTo(doc.page.width / 2, rectY - 12)
                  .lineTo(doc.page.width / 2, doc.y)
                  .moveTo(rectX + 440, rectY - 12)
                  .lineTo(rectX + 440, doc.y)
                  .stroke();
                doc.lineWidth(1)
                  .moveTo(rectX, doc.y)
                  .lineTo(520, doc.y)
                  .stroke();
                rectY = doc.y;
              });
            });
            rectX = 45;
            rectY = 45;
            jsonData.building_summary.forEach(building_summary => {
              rectX = 45;
              rectY = 45;
              addPage(doc, page += 1);
              doc.rect(rectX, (rectY += 27) - 25, doc.page.width - 90, 25)
                .fill('#00529B')
                .fillColor("white")
                .fontSize(14)
                .font("Helvetica-Bold");
              doc.y = rectY - 17;
              doc.x = rectX;
              doc.text(`BUILDING: ${building_summary.building_name || ""}`, {
                width: doc.page.width - 90,
                align: "center"
              })
                .rect(rectX, (rectY += 25) - 25, doc.page.width - 90, 25)
                .fill('#C47C08')
                .fillColor("white")
                .fontSize(14)
                .font("Helvetica-Bold")
                .text(`BUILDING PHOTO`, rectX + 80, rectY - 17);
              if (building_summary.building_photo) {
                doc.image(`data:image/jpg;base64,${building_summary.building_photo}`, rectX, (rectY += 182) - 180, { width: 300, height: 180 });
              }
              if (building_summary.aerial_photo_url) {
                let arlPhtY = building_summary.building_photo ? rectY - 90 : (rectY += 45) - 25;
                doc.y = arlPhtY;
                doc.x = rectX + 302;
                doc.fillColor("#00529B")
                  .fontSize(9)
                  .text("Building Aerial View Photo", {
                    align: "center",
                    link: `${building_summary.aerial_photo_url || ""}`,
                    underline: true
                  });
              }
              if (building_summary.specification_matrix) {
                doc.x = rectX;
                doc.y = rectY += 20;
                if (addPage(doc, page += 1, 270)) {
                  rectY = doc.y;
                } else {
                  page -= 1;
                }
                doc.fontSize(14)
                  .fillColor("black")
                  .font("Helvetica-Bold")
                  .text("BUILDING SPECIFICATION MATRIX", {
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
                doc.fillColor("black")
                  .font('Helvetica')
                  .fontSize(10);
                building_summary.specification_matrix.forEach(specification_matrix => {
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
              if (building_summary.inspection_matrix) {
                doc.x = rectX;
                doc.y = rectY += 20;
                if (addPage(doc, page += 1, 270)) {
                  rectY = doc.y;
                } else {
                  page -= 1;
                }
                doc.fontSize(14)
                  .fillColor("black")
                  .font("Helvetica-Bold")
                  .text("BUILDING INSPECTION MATRIX", {
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
                doc.fillColor("black")
                  .font('Helvetica')
                  .fontSize(10);
                building_summary.inspection_matrix.forEach(inspection_matrix => {
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
                    .fillAndStroke("black", "black")
                    .fillColor("white")
                    .font("Helvetica-Bold")
                    .text(`${inspection_matrix.rating === "RN" ? "X" : "+"}`, rectX, rectY, {
                      width: doc.page.width * 1 / 5,
                      align: 'center'
                    })
                    .font("Helvetica")
                    .fillColor("black");
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
                  .fillColor("black")
                  .fontSize(14)
                  .font("Helvetica-Bold")
                  .fillColor("white")
                  .text("+", 112, rectY - 5)
                  .fillColor("black")
                  .fontSize(12)
                  .text("    Inspection - No Defects", 120, rectY - 5)
                  .fillColor("white")
                  .fontSize(14)
                  .text("x", 352, rectY - 5)
                  .fillColor("black")
                  .fontSize(12)
                  .text("    Inspection - Repair Needed", 360, rectY - 5)
                  .font("Helvetica");
                rectY = doc.y;
              }
              // addPage(doc, page += 1);

              if (building_summary.building_specifications) {
                addPage(doc, page += 1);
                rectX = doc.x;
                rectY = doc.y;
                // if (addPage(doc, page += 1, 270)) {
                //   rectY = doc.y;
                // } else {
                //   page -= 1;
                // }
                doc.rect(rectX, (rectY += 52) - 50, doc.page.width - 90, 50)
                  .fill('#00529B')
                  .fillColor("white")
                  .fontSize(14)
                  .font("Helvetica-Bold");
                doc.y = rectY - 42;
                doc.x = rectX;
                doc.text(`BUILDING SPECIFICATIONS FOR:`, {
                  width: doc.page.width - 90,
                  align: "center"
                });
                doc.y = rectY - 20;
                doc.text(`${building_summary.building_name || ""}`, {
                  width: doc.page.width - 90,
                  align: "center"
                });
                (building_summary.building_specifications || []).forEach(building_specifications => {
                  if (addPage(doc, page += 1, 270)) {
                    rectY = doc.y;
                  } else {
                    page -= 1;
                  }
                  doc.rect(rectX, (rectY += 27) - 25, doc.page.width - 90, 25)
                    .fill('#C47C08')
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
                    doc.fillColor("black")
                      .fontSize(10)
                      .text(`${building_specifications.description || ""}`, doc.page.width - 285, rectY - 160, { width: 240, height: 180, underline: true });
                  }
                  rectY = doc.y > rectY ? doc.y : rectY;
                  doc.x = rectX;
                  doc.y = rectY;
                });
              }

              if (building_summary.section_details) {
                (building_summary.section_details).forEach(section_details => {
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
                    .fill('#C47C08')
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
                    doc.fillColor('black')
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
                      .fillColor("black")
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
                    doc.fillColor("black")
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
                      .fillColor("black")
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
                    doc.fillColor("black")
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
                        .fillAndStroke("black", "black")
                        .fillColor("white")
                        .font("Helvetica-Bold")
                        .text(`${maintenance_activity_matrix.rating === "RN" ? "X" : "+"}`, rectX, rectY, {
                          width: doc.page.width * 1 / 5,
                          align: 'center'
                        })
                        .font("Helvetica")
                        .fillColor("black");
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
                      .fillColor("black")
                      .fontSize(14)
                      .font("Helvetica-Bold")
                      .fillColor("white")
                      .text("+", 112, rectY - 5)
                      .fillColor("black")
                      .fontSize(12)
                      .text("    Maintenance - No Defects", 120, rectY - 5)
                      .fillColor("white")
                      .fontSize(14)
                      .text("x", 352, rectY - 5)
                      .fillColor("black")
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
                      .fillColor("black")
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
                    doc.fillColor("black")
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
                        .fillAndStroke("black", "black")
                        .fillColor('white')
                        .font("Helvetica-Bold")
                        .text(`${inspection_matrix.rating === "RN" ? "X" : "+"}`, rectX, rectY, {
                          width: doc.page.width * 1 / 5,
                          align: 'center'
                        })
                        .font("Helvetica")
                        .fillColor('black');
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
                      .fillColor("black")
                      .fontSize(14)
                      .font("Helvetica-Bold")
                      .fillColor("white")
                      .text("+", 112, rectY - 5)
                      .fillColor("black")
                      .fontSize(12)
                      .text("    Inspection - No Defects", 120, rectY - 5)
                      .fillColor("white")
                      .fontSize(14)
                      .text("x", 352, rectY - 5)
                      .fillColor("black")
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
                        .fill('#C47C08')
                        .fillColor("white")
                        .fontSize(14)
                        .font("Helvetica-Bold")
                        .text(`INSPECTION PHOTO`, rectX + 65, rectY - 17)
                        .text(`DESCRIPTION`, doc.page.width - 220, rectY - 17)
                        .font("Helvetica");
                      if (section_inspections.inspection_photo) {
                        doc.image(`data:image/jpeg;base64,${section_inspections.inspection_photo}`, rectX, (rectY += 182) - 180, { width: 240, height: 180 });
                      }
                      doc.fillColor("black")
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
                  // if (section_details.section_maintenance_activities) {
                  //   if (addPage(doc, page += 1, 570)) {
                  //     rectY = doc.y;
                  //   } else {
                  //     page -= 1;
                  //   }
                  //   doc.rect(rectX, (rectY += 52) - 50, doc.page.width - 90, 50)
                  //     .fill('#00529B')
                  //     .fillColor("white")
                  //     .fontSize(14)
                  //     .font("Helvetica-Bold")
                  //     .text(`MAINTENANCE ACTIVITIES FOR SECTION:`, rectX, rectY - 42, {
                  //       align: "center",
                  //       width: doc.page.width - 90
                  //     })
                  //     .text(`${section_details.name}`, rectX, rectY - 20, {
                  //       align: "center",
                  //       width: doc.page.width - 90
                  //     });
                  //   (section_details.section_maintenance_activities || []).forEach(section_maintenance_activities => {
                  //     if (addPage(doc, page += 1, 270)) {
                  //       rectY = doc.y;
                  //     } else {
                  //       page -= 1;
                  //     }
                  //     doc.rect(rectX, (rectY += 25) - 25, doc.page.width - 90, 25)
                  //       .fill('#C47C08')
                  //       .fillColor("white")
                  //       .fontSize(14)
                  //       .font("Helvetica-Bold")
                  //       .text(`MAINTENANCE PHOTO`, rectX + 65, rectY - 17)
                  //       .text(`DESCRIPTION`, doc.page.width - 220, rectY - 17);
                  //     if (section_maintenance_activities.maintenance_photo) {
                  //       doc.image(`data:image/jpeg;base64,${section_maintenance_activities.maintenance_photo}`, rectX, (rectY += 182) - 180, { width: 240, height: 180 });
                  //     }
                  //     doc.fillColor("black")
                  //       .fontSize(10)
                  //       .font("Helvetica-Bold")
                  //       .text(`${section_maintenance_activities.description || ""}`, doc.page.width - 285, (section_maintenance_activities.maintenance_photo ? rectY - 160 : rectY + 20), { width: 240, underline: true })
                  //       .font("Helvetica")
                  //       .text(`${section_maintenance_activities.description_text || ""}`, doc.page.width - 275, doc.y, { width: 230, height: 180 })
                  //       .font("Helvetica-Bold")
                  //       .text(`${section_maintenance_activities.comments ? "Comments" : ""}`, doc.page.width - 285, doc.y + 4, { width: 240, underline: true })
                  //       .font("Helvetica")
                  //       .text(`${section_maintenance_activities.comments || ""}`, doc.page.width - 275, doc.y + 4, { width: 230 });
                  //     rectY = doc.y > rectY ? doc.y + 2 : rectY + 2;
                  //     doc.x = rectX;
                  //   });
                  // }
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
                        .fill('#C47C08')
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

                      // doc.rect(rectX, (rectY += 25) - 25, doc.page.width - 360, 25)
                      //   .fill('#C47C08')
                      //   .fillColor("white")
                      //   .fontSize(14)
                      //   .text(`REPAIR OVERVIEW PHOTO`, rectX + 20, rectY - 17)
                      // if (section_maint_act_defects.repair_overview_photo) {
                      //   doc.image(`data:image/jpeg;base64,${section_maint_act_defects.repair_overview_photo}`, rectX, (rectY += 182) - 180, { width: 250, height: 180 });
                      // }
                      doc.fillColor("black")
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
                        .fill('#C47C08')
                        .fillColor("white")
                        .fontSize(14)
                        .font("Helvetica-Bold")
                        .text(`MAINTENANCE PHOTO`, rectX + 65, rectY - 17)
                        .text(`DESCRIPTION`, doc.page.width - 220, rectY - 17);
                      // .text(`REPAIR OVERVIEW PHOTO`, doc.page.width - 270, rectY - 17);
                      if (section_maint_act_no_defects.maintenance_photo) {
                        doc.image(`data:image/jpeg;base64,${section_maint_act_no_defects.maintenance_photo}`, rectX, (rectY += 182) - 180, { width: 240, height: 180 });
                      }
                      // if (section_maint_act_no_defects.repair_overview_photo) {
                      //   doc.image(`data:image/jpeg;base64,${section_maint_act_no_defects.repair_overview_photo}`, doc.page.width - 295, (rectY) - 180, { width: 240, height: 180 });
                      // }
                      doc.fillColor("black")
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
                      // doc.fillColor("black")
                      //   .fontSize(10)
                      //   .font("Helvetica-Bold")
                      //   .text(`${section_maint_act_no_defects.description || ""}`, rectX, rectY += 5, { width: doc.page.width - 90, underline: true })
                      //   .font("Helvetica")
                      //   .text(`${section_maint_act_no_defects.description_text || ""}`, rectX + 10, doc.y, { width: doc.page.width - 100 })
                      //   .font("Helvetica-Bold")
                      //   .text(`${section_maint_act_no_defects.comments ? "Comments" : ""}`, rectX, doc.y + 4, { width: doc.page.width - 90, underline: true })
                      //   .font("Helvetica")
                      //   .text(`${section_maint_act_no_defects.comments || ""}`, rectX + 10, doc.y + 4, { width: doc.page.width - 100 });
                      // rectY = doc.y > rectY ? doc.y + 2 : rectY + 2;
                      // doc.x = rectX;
                    });
                  }
                });
              }

            });
            if (jsonData.status_log) {
              // Status Section  
              addPage(doc, page += 1, null);
              rectX = 45;
              rectY = 45;
              doc.rect(rectX, (rectY += 27) - 25, doc.page.width - 90, 25)
                .fill('#00529B')
                .fillColor("white")
                .fontSize(14)
                .font("Helvetica-Bold")
                .text(`Status Log from Tablet for Notification: ${jsonData.project_details.notification_number}`, rectX + 80, rectY - 17)
                .fillColor("black")
                .font('Helvetica')
                .fontSize(10);
              let maxY = doc.y;
              jsonData.status_log = jsonData.status_log ? [{
                foreman_name: "Foreman Name",
                date: "Date",
                time: 'Time (EST)',
                status: "Status",
                elapsed_time: "Elapsed Time (Hrs)"
              }].concat(jsonData.status_log) : [];
              (jsonData.status_log || []).forEach((status_log, dIndex) => {
                if (addPage(doc, page += 1, 75)) {
                  rectY = doc.y;
                  maxY = doc.y;
                  rectX = doc.x;
                  doc.lineWidth(1)
                    .moveTo(rectX, doc.y)
                    .lineTo(doc.page.width - 45, doc.y)
                    .stroke();
                } else {
                  page -= 1;
                }
                if (dIndex === 0) {
                  doc.font("Helvetica-Bold");
                } else {
                  doc.font("Helvetica");
                }
                doc.lineWidth(1)
                  .moveTo(rectX, doc.y)
                  .lineTo(doc.page.width - 45, doc.y)
                  .stroke();
                rectY = doc.y + 12;
                doc.text(`${status_log.foreman_name || ''}`, rectX + 5, rectY, {
                  width: 90,
                  align: 'left'
                });
                maxY = maxY < doc.y ? doc.y : maxY;
                doc.text(`${status_log.date || ''}`, rectX + 110, rectY, {
                  width: 80,
                  align: 'center'
                });
                maxY = maxY < doc.y ? doc.y : maxY;
                doc.text(`${status_log.time || ''}`, rectX + 205, rectY, {
                  width: 80,
                  align: 'right'
                });
                maxY = maxY < doc.y ? doc.y : maxY;
                doc.text(`${status_log.status || ''}`, rectX + 305, rectY, {
                  width: 100,
                  align: 'left'
                });
                maxY = maxY < doc.y ? doc.y : maxY;
                doc.text(`${status_log.elapsed_time || ''}`, rectX + 400, rectY, {
                  width: 100,
                  align: 'right'
                });
                doc.y = maxY < doc.y ? doc.y : maxY;
                doc.lineWidth(1)
                  .moveTo(rectX, rectY - 12)
                  .lineTo(rectX, doc.y)
                  .moveTo(rectX + 110, rectY - 12)
                  .lineTo(rectX + 110, doc.y)
                  .moveTo(rectX + 200, rectY - 12)
                  .lineTo(rectX + 200, doc.y)
                  .moveTo(rectX + 300, rectY - 12)
                  .lineTo(rectX + 300, doc.y)
                  .moveTo(rectX + 400, rectY - 12)
                  .lineTo(rectX + 400, doc.y)
                  .moveTo(rectX + doc.page.width - 90, rectY - 12)
                  .lineTo(rectX + doc.page.width - 90, doc.y)
                  .stroke();
              });
              doc.lineWidth(1)
                .moveTo(rectX, doc.y)
                .lineTo(rectX + doc.page.width - 90, doc.y)
                .stroke();
              rectY = doc.y;
            }
          }
          let addPage = (doc, page = null, checkSpace = null) => {
            if ((!checkSpace) || (doc.page.maxY() <= doc.y + checkSpace)) {
              doc.addPage({ size: paperSize, margins: { top: 45, bottom: 1, left: 40, right: 40 } });
              doc.lineWidth(1)
                .moveTo(45, doc.page.height - 28)
                .lineTo(doc.page.width - 45, doc.page.height - 28)
                .stroke()
                .fillColor("#00529B")
                .fontSize(10)
                .text("CentiMark.com", 45, doc.page.height - 24, {
                  link: `http://centimark.com/`,
                  underline: false
                })
                .text(reportName, 190, doc.page.height - 24, {
                  underline: false
                });
              if (page) {
                doc.text(`Page ${page}`, doc.page.width - 100, doc.page.height - 24);
              }
              doc.fillColor('black');
              doc.x = 45;
              doc.y = 45;
              return true;
            } else {
              return false;
            }
          }
          let niceDocument = (logo) => {
            var doc = new PDFDocument({
              size: paperSize,
              margins: { top: 45, bottom: 1, left: 40, right: 40 }
            });
            doc.lineWidth(1)
              .moveTo(40, doc.page.height - 28)
              .lineTo(doc.page.width - 45, doc.page.height - 28)
              .stroke()
              .fillColor("#00529B")
              .font('Helvetica')
              .fontSize(10)
              .text("CentiMark.com", 40, doc.page.height - 24, {
                link: `http://centimark.com/`,
                underline: false,
                characterSpacing: -0.2,
                wordSpacing: -0.4
              })
              .text(reportName, 210, doc.page.height - 24, {
                underline: false,
                characterSpacing: -0.2,
                wordSpacing: -0.4
              });
            if (page) {
              doc.text(`Page 1`, doc.page.width - 75, doc.page.height - 24, {
                characterSpacing: -0.2,
                wordSpacing: -0.4
              });
            }
            doc.fillColor('black');
            doc.x = 45;
            doc.y = 45;
            var stream = doc.pipe(blobStream());
            header(doc, logo);
            doc.end();
            stream.on('finish', function () {
              // get a blob you can do whatever you like with
              const blob = stream.toBlob('application/pdf');
              // or get a blob URL for display in the browser
              const url = stream.toBlobURL('application/pdf');
              if (bType === 'binary') {
                var reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = function () {
                  var base64data = reader.result;
                  resolve(atob(base64data.split('base64,')[1]));
                }

              } else if (bType === 'blobURL') {
                resolve(url);
              } else {
                window.open(url, '_blank');
                // const downloadLink = document.createElement('a');
                // downloadLink.href = url;
                // var date = new Date();
                // downloadLink.download = `PM_Report_${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
                // downloadLink.click();
                // resolve("PDF Downloaded Successfully");
              }
            });
          }
          that.toDataURL("pdfgen/CMLogotaglineHigh.png", function (logo) {
            return niceDocument(logo, {
              reportName: reportName,     // use your existing variable
              reportNameX: 210,
              downloadName: 'PM_Report'
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

            var rectX = 45, rectY = 55;
            doc.lineJoin("round")
              .lineWidth(3)
              .strokeColor("#00529B")
              .rect(xPointH, yPoint - 18, doc.page.width - 90, 30)
              .stroke() // 👈 draw after defining the rect
              .fontSize(16)
              .font("Helvetica-Bold")
              .fillColor("#00529B")
              .text("Building Section Summary", rectX, 35, {
                width: 440,
                align: "left",
                characterSpacing: -0.2,
                wordSpacing: -0.4
              });

            jsonData.building_section_summary.forEach(building_section_summary => {
              doc.lineJoin("round")
                .lineWidth(3)
                .strokeColor("#00529B")
                .rect(xPointH, (rectY += 32) - 25, doc.page.width - 90, 25)
                .stroke() // 👈 draw after defining the rect
                .fillColor('#00529B')
                .fontSize(14)
                .font("Helvetica-Bold")
                .text(`Building: ${building_section_summary.building_name}`, rectX, rectY - 17, {
                  width: 440,
                  align: "left",
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                });
              (building_section_summary.sections || []).forEach(bsSection => {
                doc.lineJoin("round")
                  .lineWidth(3)
                  .strokeColor("#C47C08")
                  .rect(xPointH, (rectY += 30) - 25, doc.page.width - 90, 25)
                  .stroke() // 👈 draw after defining the rect
                  .fillColor('#C47C08')
                  .fontSize(14)
                  .font("Helvetica-Bold")
                  .text(`Section: ${bsSection.section_name}`, rectX, rectY - 17, {
                    width: 440,
                    align: "left",
                    characterSpacing: -0.2,
                    wordSpacing: -0.4
                  })
                  .font('Helvetica')
                  .fontSize(10);

                doc.fillColor("black");
                (bsSection.defects || []).forEach((defect, dIndex) => {
                  if (addPage(doc, page += 1, 120)) {
                    rectY = doc.y;
                  } else {
                    page -= 1;
                  }

                  rectY += 12; // ⬇️ small gap below section box

                  const tableX = xPointH;
                  const tableWidth = doc.page.width - 90; // match header rectangle width
                  const colWidths = [tableWidth * 0.33, tableWidth * 0.33, tableWidth * 0.34];
                  const rowHeight = 20;

                  // 🟦 Draw border box using rect()
                  doc.lineJoin("miter")
                    .lineWidth(1)
                    .strokeColor("black")
                    .rect(tableX, rectY - 5, tableWidth, rowHeight)
                    .stroke();

                  // ✏️ Draw column dividers
                  let xPos = tableX;
                  for (let i = 0; i < colWidths.length - 1; i++) {
                    xPos += colWidths[i];
                    doc.moveTo(xPos, rectY - 5).lineTo(xPos, rectY - 5 + rowHeight).stroke();
                  }

                  // 📝 Fill text
                  doc.font('Helvetica')
                    .fontSize(10)
                    .fillColor('black')
                    .text(`Defect: ${dIndex + 1}`, tableX + 5, rectY, {
                      width: colWidths[0] - 10
                    })
                    .text(`${defect.activity || ''}`, tableX + colWidths[0] + 5, rectY, {
                      width: colWidths[1] - 10
                    })
                    .text(`${defect.selection || ''}`, tableX + colWidths[0] + colWidths[1] + 5, rectY, {
                      width: colWidths[2] - 10
                    });

                  rectY += rowHeight; // move down for next item
                });
                // --- Recommended Work Table ---
                (bsSection.recommended_work || []).forEach((recommended_work, dIndex) => {
                  if (addPage(doc, page += 1, 120)) {
                    rectY = doc.y;
                  } else {
                    page -= 1;
                  }

                  rectY += 8; // ⬇️ small gap below defects table

                  const tableX = xPointH;
                  const tableWidth = doc.page.width - 90; // match header rectangle width
                  const colWidths = [tableWidth * 0.33, tableWidth * 0.33, tableWidth * 0.34];
                  const rowHeight = 20;

                  // 🟧 Draw border box
                  doc.lineJoin("miter")
                    .lineWidth(1)
                    .strokeColor("black")
                    .rect(tableX, rectY - 5, tableWidth, rowHeight)
                    .stroke();

                  // ✏️ Draw column lines
                  let xPos = tableX;
                  for (let i = 0; i < colWidths.length - 1; i++) {
                    xPos += colWidths[i];
                    doc.moveTo(xPos, rectY - 5).lineTo(xPos, rectY - 5 + rowHeight).stroke();
                  }

                  // 📝 Text content
                  doc.font('Helvetica')
                    .fontSize(10)
                    .fillColor('black')
                    .text(`Recommended Work: ${dIndex + 1}`, tableX + 5, rectY, {
                      width: colWidths[0] - 10
                    })
                    .text(`${recommended_work.activity || ''}`, tableX + colWidths[0] + 5, rectY, {
                      width: colWidths[1] - 10
                    })
                    .text(`${recommended_work.selection || ''}`, tableX + colWidths[0] + colWidths[1] + 5, rectY, {
                      width: colWidths[2] - 10
                    });

                  rectY += rowHeight; // move down for next
                });
                rectY = doc.y;
              });
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

              //--------------------------------------------------------------
              // 📄 PAGE CHECKER — Ensure content fits before adding new section
              //--------------------------------------------------------------
              if (addPage(doc, page += 1, 270)) {
                rectY = doc.y; // Reset Y if new page added
              } else {
                page -= 1; // Rollback if not needed
              }

              //--------------------------------------------------------------
              // 🟦 BUILDING HEADER — Building Title Box
              //--------------------------------------------------------------
              doc.lineJoin("round")
                .lineWidth(3)
                .strokeColor("#00529B") // Deep blue header border
                .rect(xPointH, (rectY += 27) - 25, doc.page.width - 90, 25)
                .stroke(); // Border only, no fill

              // 🏠 Building Name Text
              doc.fontSize(14)
                .font("Helvetica-Bold")
                .fillColor("#00529B")
                .text(`Building: ${building.building_name}`, rectX, rectY - 17, {
                  width: doc.page.width - 120,
                  align: "left",
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                });

              // 🔗 Add clickable "Aerial View Photo" link (if available)
              if (building.aerial_photo_url) {
                doc.fillColor("#00529B")
                  .fontSize(10)
                  .text("Building Aerial View Photo", rectX, rectY - 17, {
                    link: building.aerial_photo_url,
                    width: doc.page.width - 100,
                    align: "right",
                    underline: true,
                    characterSpacing: -0.2,
                    wordSpacing: -0.4
                  });
              }

              //--------------------------------------------------------------
              // 🟧 COMMENTS SECTION — Appears before building photo
              //--------------------------------------------------------------
              const buildingCommentMarginTop = 25; // Consistent spacing between sections

              // Section header rectangle (orange)
              doc.lineJoin("round")
                .lineWidth(3)
                .strokeColor("#C47C08")
                .rect(xPointH, (rectY += buildingCommentMarginTop) - 20, doc.page.width - 90, 25)
                .stroke();

              // Header text
              doc.fontSize(14)
                .font("Helvetica-Bold")
                .fillColor("#C47C08")
                .text("Comments", rectX, rectY - 13, {
                  width: doc.page.width - 90,
                  align: "left",
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                });

              // Comment content — clean and compact
              doc.fillColor("black")
                .fontSize(10)
                .font("Helvetica")
                .text(
                  building.building_comments ? building.building_comments : "No comments provided.",
                  rectX,
                  rectY + 20,
                  {
                    width: doc.page.width - 90,
                    align: "left",
                    characterSpacing: -0.2,
                    wordSpacing: -0.4
                  }
                );

              //--------------------------------------------------------------
              // 🟧 BUILDING PHOTO SECTION — Immediately after comments
              //--------------------------------------------------------------
              const photoHeaderY = doc.y + 10; // minimal gap after comments

              // Orange header box
              doc.lineJoin("round")
                .lineWidth(3)
                .strokeColor("#C47C08")
                .rect(xPointH, photoHeaderY, doc.page.width - 90, 25)
                .stroke();

              // Header text
              doc.fontSize(14)
                .font("Helvetica-Bold")
                .fillColor("#C47C08")
                .text("Building Photo", rectX, photoHeaderY + 8, {
                  width: doc.page.width - 90,
                  align: "left",
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                });

              // 🖼️ Building Image (Rounded Corners, No Border)
              if (building.building_photo) {
                const imgX = xPointH;
                const imgY = photoHeaderY + 35; // close to header
                const imgW = 282;
                const imgH = 212;
                const radius = 8;

                doc.save();
                doc.roundedRect(imgX, imgY, imgW, imgH, radius).clip();
                doc.image(`data:image/jpg;base64,${building.building_photo}`, imgX, imgY, {
                  width: imgW,
                  height: imgH
                });
                doc.restore();

                // Move Y position below the image
                rectY = imgY + imgH + 15;
              }

              //--------------------------------------------------------------
              // 🏢 LOOP THROUGH EACH SECTION INSIDE BUILDING
              //--------------------------------------------------------------
              (building.sections || []).forEach((section) => {

                //--------------------------------------------------------------
                // 🏗️ INITIAL SETUP PER SECTION
                //--------------------------------------------------------------
                rectX = 45;   // Left margin
                rectY = 45;   // Start position
                addPage(doc, page += 1); // Create new page for section

                //--------------------------------------------------------------
                // 🟦 SECTION HEADER — Section Title Box
                //--------------------------------------------------------------
                doc.lineJoin("round")
                  .lineWidth(3)
                  .strokeColor("#00529B")
                  .rect(xPointH, (rectY += 27) - 25, doc.page.width - 90, 25)
                  .stroke(); // Border only, no fill

                // 📘 Section Name Text
                doc.fontSize(14)
                  .font("Helvetica-Bold")
                  .fillColor("#00529B")
                  .text(`Section: ${section.section_name}`, rectX, rectY - 17, {
                    width: doc.page.width - 120,
                    align: "left",
                    characterSpacing: -0.2,
                    wordSpacing: -0.4
                  });

                // 🔗 Optional "Aerial View Photo" link on right
                if (section.aerial_photo_url) {
                  doc.fillColor("#00529B")
                    .fontSize(10)
                    .text("Section Aerial View Photo", rectX, rectY - 17, {
                      link: section.aerial_photo_url,
                      width: doc.page.width - 100,
                      align: "right",
                      underline: true,
                      characterSpacing: -0.2,
                      wordSpacing: -0.4
                    });
                }

                //--------------------------------------------------------------
                // 🟧 COMMENTS SECTION — Appears before section photo
                //--------------------------------------------------------------
                const sectionMarginTop = 25; // Consistent spacing
                doc.lineJoin("round")
                  .lineWidth(3)
                  .strokeColor("#C47C08")
                  .rect(xPointH, (rectY += sectionMarginTop) - 20, doc.page.width - 90, 25)
                  .stroke();

                // Header text
                doc.fontSize(14)
                  .font("Helvetica-Bold")
                  .fillColor("#C47C08")
                  .text("Comments", rectX, rectY - 13, {
                    width: doc.page.width - 90,
                    align: "left",
                    characterSpacing: -0.2,
                    wordSpacing: -0.4
                  });

                // Comment text — compact, consistent alignment
                doc.fillColor("black")
                  .fontSize(10)
                  .font("Helvetica")
                  .text(
                    section.section_comments ? section.section_comments : "No comments provided.",
                    rectX,
                    rectY + 20,
                    {
                      width: doc.page.width - 90,
                      align: "left",
                      characterSpacing: -0.2,
                      wordSpacing: -0.4
                    }
                  );

                //--------------------------------------------------------------
                // 🟧 SECTION OVERVIEW PHOTO — After comments
                //--------------------------------------------------------------
                const photoHeaderY = doc.y + 10; // minimal gap after comments

                // Orange header box
                doc.lineJoin("round")
                  .lineWidth(3)
                  .strokeColor("#C47C08")
                  .rect(xPointH, photoHeaderY, doc.page.width - 90, 25)
                  .stroke();

                // Header text
                doc.fontSize(14)
                  .font("Helvetica-Bold")
                  .fillColor("#C47C08")
                  .text("Section Overview Photo", rectX, photoHeaderY + 8, {
                    width: doc.page.width - 90,
                    align: "left",
                    characterSpacing: -0.2,
                    wordSpacing: -0.4
                  });

                // 🖼️ Section image (rounded corners, no border)
                if (section.section_photo) {
                  const imgX = xPointH;
                  const imgY = photoHeaderY + 35;
                  const imgW = 282;
                  const imgH = 212;
                  const radius = 4;

                  doc.save();
                  doc.roundedRect(imgX, imgY, imgW, imgH, radius).clip();
                  doc.image(`data:image/jpg;base64,${section.section_photo}`, imgX, imgY, {
                    width: imgW,
                    height: imgH
                  });
                  doc.restore();

                  rectY = imgY + imgH + 15; // reduce whitespace after image
                }

                //--------------------------------------------------------------
                // 🟦 DEFECT SUMMARY SECTION — Separate Page
                //--------------------------------------------------------------
                if (section.defects && section.defects.length) {
                  rectX = 45;
                  rectY = 45;
                  addPage(doc, page += 1);

                  // Header box
                  doc.lineJoin("round")
                    .lineWidth(3)
                    .strokeColor("#00529B")
                    .rect(xPointH, (rectY += 52) - 50, doc.page.width - 90, 50)
                    .stroke();

                  // Header text (blue)
                  doc.fontSize(14)
                    .font("Helvetica")
                    .fillColor("#00529B")
                    .text("Defect Summary For Section:", rectX, rectY - 42, {
                      width: doc.page.width - 90,
                      align: "left",
                      characterSpacing: -0.2,
                      wordSpacing: -0.4
                    })
                    .font("Helvetica-Bold")
                    .text(`${section.section_name || ""}`, rectX, rectY - 20, {
                      width: doc.page.width - 90,
                      align: "left",
                      characterSpacing: -0.2,
                      wordSpacing: -0.4
                    });
                }

                //--------------------------------------------------------------
                // 🔧 LOOP THROUGH DEFECTS INSIDE SECTION
                //--------------------------------------------------------------
                (section.defects || []).forEach(defect => {

                  //--------------------------------------------------------------
                  // 🏗️ PAGE HANDLING — Add page if needed
                  //--------------------------------------------------------------
                  if (addPage(doc, page += 1, 270)) {
                    rectY = doc.y;
                  } else {
                    page -= 1;
                  }

                  //--------------------------------------------------------------
                  // 🟧 DEFECT HEADER — Activity Summary
                  //--------------------------------------------------------------
                  doc.lineJoin("round")
                    .lineWidth(3)
                    .strokeColor("#C47C08")
                    .rect(xPointH, (rectY += 52) - 45, doc.page.width - 90, 25)
                    .stroke();

                  doc.fontSize(14)
                    .font("Helvetica-Bold")
                    .fillColor("#C47C08")
                    .text(`Field of roof : ${defect.activity || ""} ${defect.selection || ""}`, rectX, rectY - 38, {
                      width: doc.page.width - 100,
                      align: "left",
                      characterSpacing: -0.2,
                      wordSpacing: -0.4
                    });

                  //--------------------------------------------------------------
                  // 🟧 OVERVIEW + DESCRIPTION + COMMENTS
                  //--------------------------------------------------------------
                  const sectionTopY = rectY - 10;
                  const leftColX = xPointH;
                  const rightColX = xPointH + 290;

                  // 🟧 Overview Header
                  doc.lineJoin("round")
                    .lineWidth(2)
                    .strokeColor("#C47C08")
                    .rect(leftColX, sectionTopY, 282, 25)
                    .stroke();

                  doc.fontSize(12)
                    .font("Helvetica-Bold")
                    .fillColor("#C47C08")
                    .text("Overview:", rectX, sectionTopY + 7, {
                      characterSpacing: -0.2,
                      wordSpacing: -0.4
                    });

                  // 🖼️ Overview Photo
                  if (defect.repair_overview_photo) {
                    const imgX = leftColX;
                    const imgY = sectionTopY + 35;
                    const imgW = 282;
                    const imgH = 212;
                    const radius = 4;

                    doc.save();
                    doc.roundedRect(imgX, imgY, imgW, imgH, radius).clip();
                    doc.image(`data:image/jpg;base64,${defect.repair_overview_photo}`, imgX, imgY, {
                      width: imgW,
                      height: imgH
                    });
                    doc.restore();

                    doc.fillColor("black")
                      .font("Helvetica")
                      .fontSize(9)
                      .text("This is a sample photo comment.", imgX, imgY + imgH + 6, {
                        width: imgW,
                        align: "left",
                        characterSpacing: -0.2,
                        wordSpacing: -0.4
                      });
                  }

                  // 🟧 Description Header
                  doc.lineJoin("round")
                    .lineWidth(2)
                    .strokeColor("#C47C08")
                    .rect(rightColX, sectionTopY, doc.page.width - 380, 25)
                    .stroke();

                  doc.fontSize(12)
                    .font("Helvetica-Bold")
                    .fillColor("#C47C08")
                    .text("Description:", rightColX  + 5, sectionTopY + 7, {
                      characterSpacing: -0.2,
                      wordSpacing: -0.4
                    });

                  // 📝 Description text
                  doc.font("Helvetica")
                    .fontSize(10)
                    .fillColor("black")
                    .text(defect.description || "No description provided.", rightColX, sectionTopY + 35, {
                      width: doc.page.width - 380,
                      align: "left",
                      characterSpacing: -0.2,
                      wordSpacing: -0.4
                    });

                  // 🟧 Comments Header
                  const commentY = doc.y + 10;
                  doc.lineJoin("round")
                    .lineWidth(2)
                    .strokeColor("#C47C08")
                    .rect(rightColX, commentY, doc.page.width - 380, 25)
                    .stroke();

                  doc.fontSize(12)
                    .font("Helvetica-Bold")
                    .fillColor("#C47C08")
                    .text("Comments:", rightColX  + 5, commentY + 7, {
                      characterSpacing: -0.2,
                      wordSpacing: -0.4
                    });

                  // 🗒️ Comment text
                  doc.font("Helvetica")
                    .fontSize(10)
                    .fillColor("black")
                    .text(defect.comments || "No comments provided.", rightColX, commentY + 32, {
                      width: doc.page.width - 380,
                      align: "left",
                      characterSpacing: -0.2,
                      wordSpacing: -0.4
                    });

                  //--------------------------------------------------------------
                  // 🟧 DEFECT + REPAIR PHOTO ROW
                  //--------------------------------------------------------------
                  const photoRowY = Math.max(doc.y + 25, sectionTopY + 270);

                  // 🔶 Defect Header
                  doc.lineJoin("round")
                    .lineWidth(2)
                    .strokeColor("#C47C08")
                    .rect(leftColX, photoRowY, 282, 25)
                    .stroke();

                  doc.font("Helvetica-Bold")
                    .fontSize(12)
                    .fillColor("#C47C08")
                    .text("Defect:", rectX, photoRowY + 7, {
                      characterSpacing: -0.2,
                      wordSpacing: -0.4
                    });

                  // 🖼️ Defect Image
                  if (defect.defect_photo) {
                    const dImgY = photoRowY + 35;
                    const imgW = 282;
                    const imgH = 212;
                    const radius = 4;

                    doc.save();
                    doc.roundedRect(leftColX, dImgY, imgW, imgH, radius).clip();
                    doc.image(`data:image/jpg;base64,${defect.defect_photo}`, leftColX, dImgY, {
                      width: imgW,
                      height: imgH
                    });
                    doc.restore();

                    doc.fillColor("black")
                      .font("Helvetica")
                      .fontSize(9)
                      .text("This is a sample photo comment.", leftColX, dImgY + imgH + 6, {
                        width: imgW,
                        align: "left",
                        characterSpacing: -0.2,
                        wordSpacing: -0.4
                      });
                  }

                  // 🔶 Repair Header
                  doc.lineJoin("round")
                    .lineWidth(2)
                    .strokeColor("#C47C08")
                    .rect(rightColX, photoRowY, doc.page.width - 380, 25)
                    .stroke();

                  doc.font("Helvetica-Bold")
                    .fontSize(12)
                    .fillColor("#C47C08")
                    .text("Repair:", rightColX  + 5, photoRowY + 7, {
                      width: doc.page.width - 380,
                      characterSpacing: -0.2,
                      wordSpacing: -0.4
                    });

                  // 🖼️ Repair Image
                  if (defect.repair_photo) {
                    const rImgY = photoRowY + 35;
                    const imgW = 282;
                    const imgH = 212;
                    const radius = 4;

                    doc.save();
                    doc.roundedRect(rightColX, rImgY, imgW, imgH, radius).clip();
                    doc.image(`data:image/jpg;base64,${defect.repair_photo}`, rightColX, rImgY, {
                      width: imgW,
                      height: imgH
                    });
                    doc.restore();

                    doc.fillColor("black")
                      .font("Helvetica")
                      .fontSize(9)
                      .text("This is a sample photo comment.", rightColX, rImgY + imgH + 6, {
                        width: imgW,
                        align: "left",
                        characterSpacing: -0.2,
                        wordSpacing: -0.4
                      });
                  }

                });

                // (section.recommended_work || []).forEach(recommended_work => {
                //   if (addPage(doc, page += 1, 270)) {
                //     rectY = doc.y;
                //   } else {
                //     page -= 1;
                //   }
                //   doc.rect(rectX, (rectY += 25) - 25, doc.page.width - 90, 25)
                //     .fill('#C47C08')
                //     .fillColor("white")
                //     .fontSize(14)
                //     .text(`RECOMMENDED WORK PHOTO`, rectX + 20, rectY - 17, {
                //       characterSpacing: -0.2,
                //       wordSpacing: -0.4
                //     })
                //     .text(`DESCRIPTION`, doc.page.width - 220, rectY - 17, {
                //       characterSpacing: -0.2,
                //       wordSpacing: -0.4
                //     });
                //   if (recommended_work.photo) {
                //     doc.image(`data:image/jpeg;base64,${recommended_work.photo}`, rectX, (rectY += 182) - 180, { width: 250, height: 180 });
                //   }
                //   if (recommended_work.comments) {
                //     doc.fillColor("black")
                //       .fontSize(10)
                //       .font("Helvetica-Bold")
                //       .text(`${recommended_work.selection || ''}`, doc.page.width - 288, rectY - 150, {
                //         width: 240,
                //         characterSpacing: -0.2,
                //         wordSpacing: -0.4
                //       })
                //       .font("Helvetica")
                //       .text(`${recommended_work.description || ''}`, doc.page.width - 285, doc.y, {
                //         width: 240,
                //         characterSpacing: -0.2,
                //         wordSpacing: -0.4
                //       })
                //       .font("Helvetica-Bold")
                //       .text(`${recommended_work.selection ? 'COMMENTS' : ''}`, doc.page.width - 288, doc.y + 4, {
                //         width: 240,
                //         characterSpacing: -0.2,
                //         wordSpacing: -0.4
                //       })
                //       .font("Helvetica")
                //       .text(`${recommended_work.comments || ''}`, doc.page.width - 285, doc.y, {
                //         width: 240,
                //         characterSpacing: -0.2,
                //         wordSpacing: -0.4
                //       });
                //   }

                // });
              });
            });
            if (jsonData.labor_materials_summary) {
              addPage(doc, page += 1);

              rectX = 45;
              rectY = 45;
              doc.rect(rectX, (rectY += 27) - 25, doc.page.width - 90, 25)
                .fill('#00529B')
                .fillColor("white")
                .fontSize(14)
                .font("Helvetica-Bold")
                .text(`LABOR AND MATERIALS FOR: ${jsonData.project_details.notification_number || ''}`, rectX, rectY - 17, {
                  width: doc.page.width - 90,
                  align: "center",
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                });
              doc.rect(rectX, (rectY += 25) - 25, doc.page.width - 90, 25)
                .fill('#C47C08')
                .fillColor("white")
                .fontSize(14)
                .font("Helvetica-Bold")
                .text(`Material`, rectX + 100, rectY - 17, {
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                })
                .text(`Total: ${parseFloat(jsonData.labor_materials_summary.material_total || '0').toLocaleString('en-US', currencyOptions)}`, rectX + 300, rectY - 17, {
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                })
                .fillColor("black")
                .font('Helvetica')
                .fontSize(10);
              let maxY = doc.y;
              jsonData.labor_materials_summary.materials = jsonData.labor_materials_summary.materials ? [{
                material_description: "Description",
                qty: "Quantity",
                unit_price: 'Unit Price',
                total: "Total"
              }].concat(jsonData.labor_materials_summary.materials) : [];
              (jsonData.labor_materials_summary.materials || []).forEach((material, dIndex) => {
                if (addPage(doc, page += 1, 100)) {
                  rectY = doc.y;
                  maxY = doc.y;
                  rectX = doc.x;
                } else {
                  page -= 1;
                }
                if (dIndex === 0) {
                  doc.font("Helvetica-Bold");
                } else {
                  doc.font('Helvetica');
                }
                doc.lineWidth(1)
                  .moveTo(rectX, doc.y)
                  .lineTo(doc.page.width - 45, doc.y)
                  .stroke();
                rectY = doc.y + 12;
                doc.text(`${material.material_description}`, rectX + 5, rectY, {
                  width: 115,
                  align: 'left',
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                });
                maxY = maxY < doc.y ? doc.y : maxY;
                doc.text(`${isNaN(material.qty) ? material.qty : parseFloat(material.qty).toLocaleString('en-US', decimalOptions)}`, rectX + 130, rectY, {
                  width: 115,
                  align: 'right',
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                });
                maxY = maxY < doc.y ? doc.y : maxY;
                doc.text(`${isNaN(material.unit_price) ? material.unit_price : parseFloat(material.unit_price).toLocaleString('en-US', currencyOptions)}`, rectX + 250, rectY, {
                  width: 115,
                  align: 'right',
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                });
                maxY = maxY < doc.y ? doc.y : maxY;
                doc.text(`${isNaN(material.total) ? material.total : parseFloat(material.total).toLocaleString('en-US', currencyOptions)}`, rectX + 370, rectY, {
                  width: 115,
                  align: 'right',
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                });
                doc.y = maxY < doc.y ? doc.y : maxY;
                doc.lineWidth(1)
                  .moveTo(rectX, rectY - 12)
                  .lineTo(rectX, doc.y)
                  .moveTo(rectX + 130, rectY - 12)
                  .lineTo(rectX + 130, doc.y)
                  .moveTo(rectX + 250, rectY - 12)
                  .lineTo(rectX + 250, doc.y)
                  .moveTo(rectX + 370, rectY - 12)
                  .lineTo(rectX + 370, doc.y)
                  .moveTo(rectX + doc.page.width - 90, rectY - 12)
                  .lineTo(rectX + doc.page.width - 90, doc.y)
                  .stroke();
                doc.lineWidth(1)
                  .moveTo(rectX, doc.y)
                  .lineTo(doc.page.width - 45, doc.y)
                  .stroke();
              });
              rectY = doc.y;
              doc.rect(rectX, (rectY += 25) - 25, doc.page.width - 90, 25)
                .fill('#C47C08')
                .fillColor("white")
                .fontSize(14)
                .font("Helvetica-Bold")
                .text(`Labor and Fees`, rectX + 100, rectY - 17, {
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                })
                .text(`Total: ${parseFloat(jsonData.labor_materials_summary.labor_and_fees_total ? jsonData.labor_materials_summary.labor_and_fees_total : "0.00").toLocaleString('en-US', currencyOptions)}`, rectX + 300, rectY - 17, {
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                })
                .fillColor("black")
                .font('Helvetica')
                .fontSize(10);
              maxY = doc.y;

              jsonData.labor_materials_summary.labor_and_fees = jsonData.labor_materials_summary.labor_and_fees ? [{
                type: "Fee Type",
                qty: "Hours",
                rate: 'Rate',
                total: "Total"
              }].concat(jsonData.labor_materials_summary.labor_and_fees) : [];
              (jsonData.labor_materials_summary.labor_and_fees || []).forEach((labor_and_fees, dIndex) => {
                if (addPage(doc, page += 1, 100)) {
                  rectY = doc.y;
                  maxY = doc.y;
                  rectX = doc.x;
                } else {
                  page -= 1;
                }
                if (dIndex === 0) {
                  doc.font("Helvetica-Bold");
                } else {
                  doc.font('Helvetica');
                }
                doc.lineWidth(1)
                  .moveTo(rectX, doc.y)
                  .lineTo(doc.page.width - 45, doc.y)
                  .stroke();
                rectY = doc.y + 12;
                doc.text(`${labor_and_fees.type}`, rectX + 5, rectY, {
                  width: 115,
                  align: 'left',
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                });
                maxY = maxY < doc.y ? doc.y : maxY;
                doc.text(`${isNaN(labor_and_fees.qty) ? labor_and_fees.qty : parseFloat(labor_and_fees.qty).toLocaleString('en-US', decimalOptions)}`, rectX + 130, rectY, {
                  width: 115,
                  align: 'right',
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                });
                maxY = maxY < doc.y ? doc.y : maxY;
                doc.text(`${isNaN(labor_and_fees.rate) ? labor_and_fees.rate : parseFloat(labor_and_fees.rate).toLocaleString('en-US', currencyOptions)}`, rectX + 250, rectY, {
                  width: 115,
                  align: 'right',
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                });
                maxY = maxY < doc.y ? doc.y : maxY;
                doc.text(`${isNaN(labor_and_fees.total) ? labor_and_fees.total : parseFloat(labor_and_fees.total).toLocaleString('en-US', currencyOptions)}`, rectX + 370, rectY, {
                  width: 115,
                  align: 'right',
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                });
                doc.y = maxY < doc.y ? doc.y : maxY;
                doc.lineWidth(1)
                  .moveTo(rectX, rectY - 12)
                  .lineTo(rectX, doc.y)
                  .moveTo(rectX + 130, rectY - 12)
                  .lineTo(rectX + 130, doc.y)
                  .moveTo(rectX + 250, rectY - 12)
                  .lineTo(rectX + 250, doc.y)
                  .moveTo(rectX + 370, rectY - 12)
                  .lineTo(rectX + 370, doc.y)
                  .moveTo(rectX + doc.page.width - 90, rectY - 12)
                  .lineTo(rectX + doc.page.width - 90, doc.y)
                  .stroke();
                doc.lineWidth(1)
                  .moveTo(rectX, doc.y)
                  .lineTo(rectX + doc.page.width - 90, doc.y)
                  .stroke();
              });

              rectY = doc.y;
              // tax rate
              doc.rect(rectX, (rectY += 25) - 20, doc.page.width - 90, 25)
                .fill('#C47C08')
                .fillColor("white")
                .fontSize(14)
                .font("Helvetica-Bold")
                .text(`TAX RATE`, rectX + 100, rectY - 14, {
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                })
                .text(`${parseFloat(jsonData.labor_materials_summary.taxes ? jsonData.labor_materials_summary.taxes.tax_rate ? jsonData.labor_materials_summary.taxes.tax_rate : "0.00" : "0.00").toLocaleString('en-US', currencyOptions)} %`, rectX + 310, rectY - 14, {
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                });

              // sub total
              doc.rect(rectX, (rectY += 25) - 20, doc.page.width - 90, 25)
                .fill('#C47C08')
                .fillColor("white")
                .fontSize(14)
                .font("Helvetica-Bold")
                .text(`TAX AMOUNT`, rectX + 100, rectY - 14, {
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                })
                .text(`${parseFloat(jsonData.labor_materials_summary.taxes ? jsonData.labor_materials_summary.taxes.total ? jsonData.labor_materials_summary.taxes.total : "0.00" : "0.00").toLocaleString('en-US', currencyOptions)}`, rectX + 310, rectY - 14, {
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                });

              // grand total
              doc.rect(rectX, (rectY += 25) - 20, doc.page.width - 90, 25)
                .fill('#C47C08')
                .fillColor("white")
                .fontSize(14)
                .font("Helvetica-Bold")
                .text(`GRAND TOTAL`, rectX + 100, rectY - 14, {
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                })
                // .text(`Total: ${parseFloat(jsonData.labor_materials_summary.grand_total).toLocaleString('en-US', currencyOptions)}`, rectX + 300, rectY - 17);
                .text(parseFloat(jsonData.labor_materials_summary.grand_total).toLocaleString('en-US', currencyOptions), rectX + 310, rectY - 14, {
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                });
            }

            if (jsonData.status_log) {
              // Status Section  
              addPage(doc, page += 1, null);
              rectX = 45;
              rectY = 45;
              doc.rect(rectX, (rectY += 27) - 25, doc.page.width - 90, 25)
                .fill('#00529B')
                .fillColor("white")
                .fontSize(14)
                .font("Helvetica-Bold")
                .text(`Status Log from Tablet for Notification: ${jsonData.project_details.notification_number}`, rectX + 80, rectY - 17, {
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                })
                .fillColor("black")
                .font('Helvetica')
                .fontSize(10);
              let maxY = doc.y;
              doc.lineWidth(1)
                .moveTo(rectX, doc.y)
                .lineTo(doc.page.width - 45, doc.y)
                .stroke();
              jsonData.status_log = jsonData.status_log ? [{
                foreman_name: "Foreman Name",
                date: "Date",
                time: 'Time (EST)',
                status: "Status",
                elapsed_time: "Elapsed Time (Hrs)"
              }].concat(jsonData.status_log) : [];
              (jsonData.status_log || []).forEach((status_log, dIndex) => {
                if (addPage(doc, page += 1, 75)) {
                  rectY = doc.y;
                  maxY = doc.y;
                  rectX = doc.x;
                  doc.lineWidth(1)
                    .moveTo(rectX, doc.y)
                    .lineTo(doc.page.width - 45, doc.y)
                    .stroke();
                } else {
                  page -= 1;
                }
                if (dIndex === 0) {
                  doc.font("Helvetica-Bold");
                } else {
                  doc.font("Helvetica");
                }
                rectY = doc.y + 12;
                doc.text(`${status_log.foreman_name || ''}`, rectX + 5, rectY, {
                  width: 90,
                  align: 'left',
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                });
                maxY = maxY < doc.y ? doc.y : maxY;
                doc.text(`${status_log.date || ''}`, rectX + 110, rectY, {
                  width: 80,
                  align: 'center',
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                });
                maxY = maxY < doc.y ? doc.y : maxY;
                doc.text(`${status_log.time || ''}`, rectX + 205, rectY, {
                  width: 80,
                  align: 'right',
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                });
                maxY = maxY < doc.y ? doc.y : maxY;
                doc.text(`${status_log.status || ''}`, rectX + 305, rectY, {
                  width: 100,
                  align: 'left',
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                });
                maxY = maxY < doc.y ? doc.y : maxY;
                doc.text(`${status_log.elapsed_time || ''}`, rectX + 400, rectY, {
                  width: 100,
                  align: 'right',
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                });
                doc.y = maxY < doc.y ? doc.y : maxY;
                doc.lineWidth(1)
                  .moveTo(rectX, rectY - 12)
                  .lineTo(rectX, doc.y)
                  .moveTo(rectX + 110, rectY - 12)
                  .lineTo(rectX + 110, doc.y)
                  .moveTo(rectX + 200, rectY - 12)
                  .lineTo(rectX + 200, doc.y)
                  .moveTo(rectX + 300, rectY - 12)
                  .lineTo(rectX + 300, doc.y)
                  .moveTo(rectX + 400, rectY - 12)
                  .lineTo(rectX + 400, doc.y)
                  .moveTo(rectX + doc.page.width - 90, rectY - 12)
                  .lineTo(rectX + doc.page.width - 90, doc.y)
                  .stroke();
                doc.lineWidth(1)
                  .moveTo(rectX, doc.y)
                  .lineTo(rectX + doc.page.width - 90, doc.y)
                  .stroke();
              });
              rectY = doc.y;
            }
          }
          let addPage = (doc, page = null, checkSpace = null) => {
            // "checkspace" will check if there is enough space left on the page.
            if ((!checkSpace) || (doc.page.maxY() <= doc.y + checkSpace)) {
              doc.addPage({ size: paperSize, margins: { top: 45, bottom: 1, left: 40, right: 40 } });
              doc.lineWidth(1)
                .moveTo(40, doc.page.height - 28)
                .lineTo(doc.page.width - 45, doc.page.height - 28)
                .stroke()
                .fillColor("#00529B")
                .font('Helvetica')
                .fontSize(10)
                .text("CentiMark.com", 40, doc.page.height - 24, {
                  link: `http://centimark.com/`,
                  underline: false,
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                })
                .text(reportName, 192, doc.page.height - 24, {
                  underline: false,
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                });
              if (page) {
                doc.text(`Page ${page}`, doc.page.width - 75, doc.page.height - 24, {
                  characterSpacing: -0.2,
                  wordSpacing: -0.4
                });
              }
              doc.fillColor('black');
              doc.x = 45;
              doc.y = 45;
              return true;
            } else {
              return false;
            }
          }
          let niceDocument = (logo) => {
            var doc = new PDFDocument({
              size: paperSize,
              margins: { top: 45, bottom: 1, left: 40, right: 40 }
            });

            PDFDocument.prototype.roundedImage = function (imgSrc, x, y, width, height, radius) {
              this.save();
              this.roundedRect(x, y, width, height, radius).clip();
              this.image(imgSrc, x, y, { width, height });
              this.restore();
              return this;
            };

            doc.lineWidth(1)
              .moveTo(40, doc.page.height - 28)
              .lineTo(doc.page.width - 45, doc.page.height - 28)
              .stroke()
              .fillColor("#00529B")
              .font('Helvetica')
              .fontSize(10)
              .text("CentiMark.com", 40, doc.page.height - 24, {
                link: `http://centimark.com/`,
                underline: false,
                characterSpacing: -0.2,
                wordSpacing: -0.4
              })
              .text(reportName, 192, doc.page.height - 24, {
                underline: false,
                characterSpacing: -0.2,
                wordSpacing: -0.4
              });
            if (page) {
              doc.text(`Page 1`, doc.page.width - 75, doc.page.height - 24, {
                characterSpacing: -0.2,
                wordSpacing: -0.4
              });
            }
            doc.fillColor('black');
            doc.x = 45;
            doc.y = 45;
            var stream = doc.pipe(blobStream());
            header(doc, logo);
            doc.end();
            stream.on('finish', function () {
              // get a blob you can do whatever you like with
              const blob = stream.toBlob('application/pdf');
              // or get a blob URL for display in the browser
              const url = stream.toBlobURL('application/pdf');
              if (bType === 'binary') {
                var reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = function () {
                  var base64data = reader.result;
                  resolve(atob(base64data.split('base64,')[1]));
                }

              } else if (bType === 'blobURL') {
                resolve(url);
              } else {
                window.open(url, '_blank');
                // const downloadLink = document.createElement('a');
                // downloadLink.href = url;
                // var date = new Date();
                // downloadLink.download = `ServiceRepairSummaryForSvcMgr_${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
                // downloadLink.click();
                // resolve("PDF Downloaded Successfully");
              }
            });
          }
          that.toDataURL("pdfgen/CMLogotaglineHigh.png", function (logo) {
            return niceDocument(logo, {
              reportName: reportName,
              reportNameX: 192,
              downloadName: 'ServiceRepairSummaryForSvcMgr'
            });
          });
        });

      },

      createFirstPageInfo: function (doc, jsonData, logo, reportName, xPoint, yPoint, xPointH, yPointH, xPointCol1, yPointCol1, xPointCol2, yPointCol2) {

        let imageWidth = 230;
        let imageX = xPoint;
        let imageY = yPoint; // Positioned above the main content
        doc.image(logo, imageX + 3, imageY, {
          width: imageWidth,
          align: "left"
        });

        doc.fontSize(16)
          .fillColor("#00529B")
          .font("Helvetica-Bold")
          .text(reportName, imageWidth + 98, imageY + 15, {
            width: (imageWidth + 50),
            characterSpacing: -0.2,
            wordSpacing: -0.4
          });

        doc.lineJoin("round")
          .lineWidth(3)
          .strokeColor("#00529B")
          .rect(xPointH, yPointH, doc.page.width - 90, 1)
          .stroke(); // 👈 draw after defining the rect

        doc.y = yPointH + 8;
        doc
          .fillColor("black")
          .font("Helvetica")
          .fontSize(12)
          .text("Notification: " + (jsonData.project_details.notification_number || ""), xPointCol1, yPointCol1, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .text(jsonData.project_details.start_work_date ? `Start Work Date: ${jsonData.project_details.start_work_date}` : "", xPointCol2, yPointCol2, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .text("PO Number: " + (jsonData.project_details.po_number || ""), xPointCol1, yPointCol1 += 20, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .text(jsonData.project_details.completed_work_date ? `Completed Work Date: ${jsonData.project_details.completed_work_date}` : "", xPointCol2, yPointCol2 += 20, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          });
        doc.lineJoin("round")
          .lineWidth(3)
          .strokeColor("#00529B")
          .rect(xPointH, yPointH += 55, 230, 25)
          .stroke() // 👈 draw after defining the rect
          .fillColor("#00529B").font("Helvetica-Bold").fontSize(12).text("Customer", 45, yPointH + 8, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .fillColor("black")
          .font("Helvetica")
          .fontSize(11)
          .text(jsonData.project_details.customer.name || "", xPointCol1, yPointCol1 = (yPointH + 40), {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .text(jsonData.project_details.customer.address || "", xPointCol1, yPointCol1 += 20, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .text((jsonData.project_details.customer.city ? jsonData.project_details.customer.city + ", " : "") + (jsonData.project_details.customer.state || "") + " " + (jsonData.project_details.customer.zip || ""), xPointCol1, yPointCol1 += 20, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .text("Attn: ", xPointCol1, yPointCol1 += 20, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .text(jsonData.project_details.customer.contact_name || "", xPointCol1, yPointCol1 += 20, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .text((jsonData.project_details.customer.contact_email || "").toLowerCase(), xPointCol1, yPointCol1 += 20, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          });
        doc.lineJoin("round")
          .lineWidth(3)
          .strokeColor("#00529B")
          .rect(xPointH + 290, yPointH, 230, 25)
          .stroke() // 👈 draw after defining the rect
          .fillColor("#00529B").font("Helvetica-Bold").fontSize(12).text("Service Manager", 335, yPointH + 8, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .fillColor("black")
          .font("Helvetica")
          .fontSize(11)
          .text(jsonData.project_details.service_manager.name || "", xPointCol2 = (xPointH + 292), yPointCol2 = (yPointH + 40), {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .text(jsonData.project_details.service_manager.address || "", xPointCol2, yPointCol2 += 20, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .text((jsonData.project_details.service_manager.city || "") + ", " + (jsonData.project_details.service_manager.state || "") + " " + (jsonData.project_details.service_manager.zip || ""), xPointCol2, yPointCol2 += 20, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .text((jsonData.project_details.service_manager.email || "").toLowerCase(), xPointCol2, yPointCol2 += 20, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .text('Phone: ' + (jsonData.project_details.service_manager.phone || ""), xPointCol2, yPointCol2 += 20, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .text('Fax: ' + (jsonData.project_details.service_manager.fax || ""), xPointCol2, yPointCol2 += 20, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          });
        doc.lineJoin("round")
          .lineWidth(3)
          .strokeColor("#00529B")
          .rect(xPointH, yPointH += 160, 230, 25)
          .stroke() // 👈 draw after defining the rect
          .fillColor("#00529B").font("Helvetica-Bold").fontSize(12).text("Location", 45, yPointH + 8, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .fillColor("black")
          .font("Helvetica")
          .fontSize(11)
          .text(jsonData.project_details.location.name || "", xPointCol1, yPointCol1 = (yPointH + 40), {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .text(jsonData.project_details.location.address || "", xPointCol1, yPointCol1 += 20, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .text((jsonData.project_details.location.city || "") + ", " + (jsonData.project_details.location.state || "") + " " + (jsonData.project_details.location.zip || ""), xPointCol1, yPointCol1 += 20, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .text("Attn: ", xPointCol1, yPointCol1 += 20, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .text(jsonData.project_details.location.contact_name || "", xPointCol1, yPointCol1 += 20, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .text((jsonData.project_details.location.contact_email || "").toLowerCase(), xPointCol1, yPointCol1 += 20, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          });

        doc.lineJoin("round")
          .lineWidth(3)
          .strokeColor("#00529B")
          .rect(xPointH + 290, yPointH, 230, 25)
          .stroke() // 👈 draw after defining the rect
          .fillColor("#00529B").font("Helvetica-Bold").fontSize(12).text("Sales Representative", xPointH + 295, yPointH + 8, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .fillColor("black")
          .font("Helvetica")
          .fontSize(11)
          .text(jsonData.project_details.sales_rep.name || "", xPointCol2 = (xPointH + 292), yPointCol2 = (yPointH + 40), {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .text(jsonData.project_details.sales_rep.address || "", xPointCol2, yPointCol2 += 20, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .text((jsonData.project_details.sales_rep.city ? `${jsonData.project_details.sales_rep.city}, ` : "") + (jsonData.project_details.sales_rep.state || "") + " " + (jsonData.project_details.sales_rep.zip || ""), xPointCol2, yPointCol2 += 20, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .text((jsonData.project_details.sales_rep.email || "").toLowerCase(), xPointCol2, yPointCol2 += 20, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .text('Phone: ' + (jsonData.project_details.sales_rep.phone || ""), xPointCol2, yPointCol2 += 20, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .text('Fax: ' + (jsonData.project_details.sales_rep.fax || ""), xPointCol2, yPointCol2 += 20, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          });

        yPointH += 20;
        doc
          .lineJoin("round")
          .moveTo(xPointH, yPointH += 167)
          .lineTo(xPointH + doc.page.width - 90, yPointH)
          .stroke()
          .text(`Site Contact: ${jsonData.project_details.site_contact_before.contact_name || ""}`, xPointCol1, yPointCol1 = (yPointH + 12), {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .fontSize(8)
          .font('Helvetica-Bold')
          .text(`${jsonData.project_details.site_contact_before.text || ""}`, {
            width: 245,
            align: 'left',
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .fillColor("#00529B")
          .text(`${jsonData.project_details.site_contact_before.url_text}`, {
            link: jsonData.project_details.site_contact_before.url,
            underline: true,
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .fillColor("black");
        var siteContactTextH = doc.y;
        doc.font("Helvetica")
          .fontSize(12)
          .text(`Site Contact: ${jsonData.project_details.site_contact_after.contact_name || ""}`, xPointH + 290, yPointCol1, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .fontSize(8)
          .font('Helvetica-Bold')
          .text(`${jsonData.project_details.site_contact_after.text}`, {
            width: 245,
            align: 'left',
            characterSpacing: -0.2,
            wordSpacing: -0.4
          });

        yPointCol1 = doc.y > siteContactTextH ? doc.y : siteContactTextH;

        if (jsonData.project_details.site_contact_before.signature) {
          doc.image(`data:image/png;base64, ${jsonData.project_details.site_contact_before.signature}`, xPointH + 50, yPointCol1 + 5, {
            width: 160
          });
        } else {
          doc.x = xPointCol1;
          doc.y = yPointCol1;
          doc.font("Helvetica")
            .fontSize(12)
            .text(`\n\n${jsonData.project_details.site_contact_before.bypass_reason_text || ""}`, {
              characterSpacing: -0.2,
              wordSpacing: -0.4
            });
        }

        if (jsonData.project_details.site_contact_after.signature) {
          doc.image(`data:image/png;base64, ${jsonData.project_details.site_contact_after.signature}`, xPointH + 330, yPointCol1 + 5, {
            width: 160
          });
        } else {
          doc.x = xPointH + 290;
          doc.y = yPointCol1;
          doc.font("Helvetica")
            .fontSize(12)
            .text(`\n\n${jsonData.project_details.site_contact_after.bypass_reason_text || ""}`, {
              characterSpacing: -0.2,
              wordSpacing: -0.4
            });
        }
        doc.lineWidth(2)
          .moveTo(xPointH, yPointH += 195)
          .lineTo(xPointH + 230, yPointH)
          .stroke()
          .moveTo(xPointH + 292, yPointH)
          .lineTo(xPointH + doc.page.width - 90, yPointH)
          .stroke();
        doc.font("Helvetica")
          .fontSize(12)
          .text("Authorized signatory", xPointH, yPointH + 5, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          })
          .text("Authorized signatory", xPointH + 290, yPointH + 5, {
            characterSpacing: -0.2,
            wordSpacing: -0.4
          });
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
          var dataURL = canvas.toDataURL('image/png');
          return callback(dataURL);
        };
        image.src = src;
      }
    };
  });
