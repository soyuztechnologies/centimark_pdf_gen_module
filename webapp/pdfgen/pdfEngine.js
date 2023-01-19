
sap.ui.define([
  "jquery.sap.global",
  "sap/m/MessageBox",
  "sap/ui/core/mvc/Controller"
], function (jQuery, MessageBox, Controller) {
  "use strict";

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
          doc.image(logo, (doc.page.width - 302) / 2, 35, {
            width: 302,
            align: "center"
          });
          doc.y = 120;
          doc.fontSize(16)
            .font("Helvetica-Bold")
            .text(reportName, {
              width: doc.page.width - 90,
              align: "center"
            });
          var xPointH = 45,
            yPointH = 145,
            xPointCol1 = 47,
            yPointCol1 = 185,
            xPointCol2 = 290,
            yPointCol2 = 185;
          doc.rect(xPointH, yPointH, doc.page.width - 90, 25)
            .fill('#00529C')
            .fillColor("white")
            .fontSize(14)
            .font("Helvetica-Bold");
          doc.y = yPointH + 8;
          doc.text("PROJECT DETAILS", {
            width: doc.page.width - 90,
            align: "center"
          })
            .fillColor("black")
            .font("Helvetica")
            .fontSize(12)
            .text("Notification: " + (jsonData.project_details.notification_number || ""), xPointCol1, yPointCol1)
            .text(jsonData.project_details.start_work_date ? `Start Work Date: ${jsonData.project_details.start_work_date}` : "", xPointCol2, yPointCol2)
            .text("PO Number: " + (jsonData.project_details.po_number || ""), xPointCol1, yPointCol1 += 20)
            .text(jsonData.project_details.completed_work_date ? `Completed Work Date: ${jsonData.project_details.completed_work_date}` : "", xPointCol2, yPointCol2 += 20);
          doc.rect(xPointH, yPointH += 85, 230, 25)
            .fill('#00529C')
            .font("Helvetica-Bold")
            .fillColor("white")
            .fontSize(14)
            .text("CUSTOMER", 115, yPointH + 8)
            .fillColor("black")
            .font("Helvetica")
            .fontSize(12)
            .text(jsonData.project_details.customer.name || "", xPointCol1, yPointCol1 = (yPointH + 40))
            .text(jsonData.project_details.customer.address || "", xPointCol1, yPointCol1 += 20)
            .text((jsonData.project_details.customer.city ? jsonData.project_details.customer.city + ", " : "") + (jsonData.project_details.customer.state || "") + " " + (jsonData.project_details.customer.zip || ""), xPointCol1, yPointCol1 += 20)
            .text("Attn: ", xPointCol1, yPointCol1 += 20)
            .text(jsonData.project_details.customer.contact_name || "", xPointCol1, yPointCol1 += 20)
            .text((jsonData.project_details.customer.contact_email || "").toLowerCase(), xPointCol1, yPointCol1 += 20);
          doc.rect(xPointH + 270, yPointH, 230, 25)
            .fill('#00529C')
            .font("Helvetica-Bold")
            .fillColor("white")
            .fontSize(14)
            .text("SERVICE MANAGER", 365, yPointH + 8)
            .fillColor("black")
            .font("Helvetica")
            .fontSize(12)
            .text(jsonData.project_details.service_manager.name || "", xPointCol2 = (xPointH + 272), yPointCol2 = (yPointH + 40))
            .text(jsonData.project_details.service_manager.address || "", xPointCol2, yPointCol2 += 20)
            .text((jsonData.project_details.service_manager.city || "") + ", " + (jsonData.project_details.service_manager.state || "") + " " + (jsonData.project_details.service_manager.zip || ""), xPointCol2, yPointCol2 += 20)
            .text((jsonData.project_details.service_manager.email || "").toLowerCase(), xPointCol2, yPointCol2 += 20)
            .text('Phone: ' + (jsonData.project_details.service_manager.phone || ""), xPointCol2, yPointCol2 += 20)
            .text('Fax: ' + (jsonData.project_details.service_manager.fax || ""), xPointCol2, yPointCol2 += 20);
          doc.rect(xPointH, yPointH += 160, 230, 25)
            .fill('#00529C')
            .font("Helvetica-Bold")
            .fillColor("white")
            .fontSize(14)
            .text("LOCATION", 115, yPointH + 8)
            .fillColor("black")
            .font("Helvetica")
            .fontSize(12)
            .text(jsonData.project_details.location.name || "", xPointCol1, yPointCol1 = (yPointH + 40))
            .text(jsonData.project_details.location.address || "", xPointCol1, yPointCol1 += 20)
            .text((jsonData.project_details.location.city || "") + ", " + (jsonData.project_details.location.state || "") + " " + (jsonData.project_details.location.zip || ""), xPointCol1, yPointCol1 += 20)
            .text("Attn: ", xPointCol1, yPointCol1 += 20)
            .text(jsonData.project_details.location.contact_name || "", xPointCol1, yPointCol1 += 20)
            .text((jsonData.project_details.location.contact_email || "").toLowerCase(), xPointCol1, yPointCol1 += 20);
          doc.rect(xPointH + 270, yPointH, 230, 25)
            .fill('#00529C')
            .font("Helvetica-Bold")
            .fillColor("white")
            .fontSize(14)
            .text("SALES REPRESENTATIVE", xPointH + 295, yPointH + 8)
            .fillColor("black")
            .font("Helvetica")
            .fontSize(12)
            .text(jsonData.project_details.sales_rep.name || "", xPointCol2 = (xPointH + 272), yPointCol2 = (yPointH + 40))
            .text(jsonData.project_details.sales_rep.address || "", xPointCol2, yPointCol2 += 20)
            .text((jsonData.project_details.sales_rep.city ? `${jsonData.project_details.sales_rep.city}, ` : "") + (jsonData.project_details.sales_rep.state || "") + " " + (jsonData.project_details.sales_rep.zip || ""), xPointCol2, yPointCol2 += 20)
            .text((jsonData.project_details.sales_rep.email || "").toLowerCase(), xPointCol2, yPointCol2 += 20)
            .text('Phone: ' + (jsonData.project_details.sales_rep.phone || ""), xPointCol2, yPointCol2 += 20)
            .text('Fax: ' + (jsonData.project_details.sales_rep.fax || ""), xPointCol2, yPointCol2 += 20);
          doc.moveTo(xPointH, yPointH += 167)
            .lineTo(xPointH + doc.page.width - 90, yPointH)
            .stroke()
            .text(`Site Contact: ${jsonData.project_details.site_contact_before.contact_name || ""}`, xPointCol1, yPointCol1 = (yPointH + 12))
            .fontSize(8)
            .font('Helvetica-Bold')
            .text(`${jsonData.project_details.site_contact_before.text || ""}`, {
              width: 245,
              align: 'left'
            })
            .fillColor("#00529C")
            .text(`${jsonData.project_details.site_contact_before.url_text}`, {
              link: jsonData.project_details.site_contact_before.url,
              underline: true
            })
            .fillColor("black");
          var siteContactTextH = doc.y;
          doc.font("Helvetica")
            .fontSize(12)
            .text(`Site Contact: ${jsonData.project_details.site_contact_after.contact_name || ""}`, xPointH + 260, yPointCol1)
            .fontSize(8)
            .font('Helvetica-Bold')
            .text(`${jsonData.project_details.site_contact_after.text}`, {
              width: 245,
              align: 'left'
            });

          yPointCol1 = doc.y > siteContactTextH ? doc.y : siteContactTextH;

          if (jsonData.project_details.site_contact_before.signature) {
            doc.image(`data:image/png;base64, ${jsonData.project_details.site_contact_before.signature}`, xPointH + 60, yPointCol1 + 5, {
              width: 160
            });
          } else {
            doc.x = xPointCol1;
            doc.font("Helvetica")
              .fontSize(12)
              .text(`\n\n${jsonData.project_details.site_contact_before.bypass_reason_text || ""}`);
          }

          if (jsonData.project_details.site_contact_after.signature) {
            doc.image(`data:image/png;base64, ${jsonData.project_details.site_contact_after.signature}`, xPointH + 300, yPointCol1 + 5, {
              width: 160
            });
          } else {
            doc.x = xPointH + 260;
            doc.font("Helvetica")
              .fontSize(12)
              .text(`\n\n${jsonData.project_details.site_contact_before.bypass_reason_text || ""}`);
          }
          doc.lineWidth(2)
            .moveTo(xPointH, yPointH += 195)
            .lineTo(xPointH + 248, yPointH)
            .stroke()
            .moveTo(xPointH + 252, yPointH)
            .lineTo(xPointH + doc.page.width - 90, yPointH)
            .stroke();
          doc.font("Helvetica")
            .fontSize(12)
            .text("Authorized signatory", xPointH, yPointH + 5)
            .text("Authorized signatory", xPointH + 260, yPointH + 5);


          addPage(doc, page += 1);
          doc.fontSize(16)
            .font("Helvetica-Bold")
            .text("BUILDING SECTION SUMMARY", {
              width: doc.page.width - 90,
              align: "center"
            });
          var rectX = 80, rectY = 65;
          jsonData.building_section_summary.forEach(building_section_summary => {
            if (addPage(doc, page += 1, 90)) {
              rectY = doc.y;
            } else {
              page -= 1;
            }
            doc.rect(rectX, (rectY += 27) - 25, 440, 25)
              .fill('#00529C')
              .fillColor("white")
              .fontSize(14)
              .font("Helvetica-Bold")
              .text(`BUILDING: ${building_section_summary.building_name}`, rectX + 80, rectY - 17)
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
                .fill('#f7b344')
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
              doc.text(`${section_summary.section_inspection}`, (doc.page.width / 2) + 20, rectY, {
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
              doc.text(`${section_summary.maintenance_activities}`, (doc.page.width / 2) + 20, rectY, {
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
              .fill('#00529C')
              .fillColor("white")
              .fontSize(14)
              .font("Helvetica-Bold");
            doc.y = rectY - 17;
            doc.x = rectX;
            doc.text(`BUILDING: ${building_summary.building_name}`, {
              width: doc.page.width - 90,
              align: "center"
            })
              .rect(rectX, (rectY += 25) - 25, doc.page.width - 90, 25)
              .fill('#f7b344')
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
              doc.fillColor("#00529C")
                .fontSize(9)
                .text("Building Aerial View Photo", {
                  align: "center",
                  link: `${building_summary.aerial_photo_url}`,
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
                .fill('#00529C')
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
                doc.text(`${specification_matrix.component}`, rectX + 20, rectY, {
                  width: (doc.page.width - 45) / 2,
                  align: 'left'
                });
                doc.text(`${specification_matrix.type}`, (doc.page.width / 2) + 20, rectY, {
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
                .fill('#00529C')
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
                doc.text(`${inspection_matrix.component}`, (doc.page.width * 1 / 5) + 70, rectY, {
                  width: doc.page.width * 2 / 5,
                  align: 'left'
                });
                doc.text(`${inspection_matrix.defect}`, (doc.page.width * 3 / 5) + 20, rectY, {
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
                .fill('#00529C')
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
              doc.text(`${building_summary.building_name}`, {
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
                  .fill('#f7b344')
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
                    .text(`${building_specifications.description}`, doc.page.width - 285, rectY - 160, { width: 240, height: 180, underline: true });
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
                  .fill('#00529C')
                  .fillColor("white")
                  .fontSize(14)
                  .font("Helvetica-Bold");
                doc.y = rectY - 17;
                doc.x = rectX;
                doc.text(`SECTION: ${section_details.name}`, {
                  width: doc.page.width - 90,
                  align: "center"
                })
                  .rect(rectX, (rectY += 25) - 25, doc.page.width - 90, 25)
                  .fill('#f7b344')
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
                    .fill('#00529C')
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
                    doc.text(`${specification_matrix.component}`, rectX + 20, rectY, {
                      width: (doc.page.width - 45) / 2,
                      align: 'left'
                    });
                    doc.text(`${specification_matrix.type}`, (doc.page.width / 2) + 20, rectY, {
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
                    .fill('#00529C')
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
                    doc.text(`${maintenance_activity_matrix.component}`, (doc.page.width * 1 / 5) + 70, rectY, {
                      width: doc.page.width * 2 / 5,
                      align: 'left'
                    });
                    doc.text(`${maintenance_activity_matrix.defect}`, (doc.page.width * 3 / 5) + 20, rectY, {
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
                    .fill('#00529C')
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
                    doc.text(`${inspection_matrix.component}`, (doc.page.width * 1 / 5) + 70, rectY, {
                      width: doc.page.width * 2 / 5,
                      align: 'left'
                    });
                    doc.text(`${inspection_matrix.defect}`, (doc.page.width * 3 / 5) + 20, rectY, {
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
                    .fill('#00529C')
                    .fillColor("white")
                    .fontSize(14)
                    .font("Helvetica-Bold")
                    .text(`INSPECTIONS FOR SECTION:`, rectX, rectY - 42, {
                      align: "center",
                      width: doc.page.width - 90
                    })
                    .text(`${section_details.name}`, rectX, rectY - 20, {
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
                      .fill('#f7b344')
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
                //     .fill('#00529C')
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
                //       .fill('#f7b344')
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
                    .fill('#00529C')
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
                      .fill('#f7b344')
                      .fillColor("white")
                      .fontSize(14)
                      .font("Helvetica-Bold")
                      .text(`MAINTENANCE PHOTO`, rectX + 65, rectY - 17)
                      .text(`REPAIR PHOTO`, doc.page.width - 220, rectY - 17);
                    if (section_maint_act_defects.maintenance_photo) {
                      doc.image(`data:image/jpeg;base64,${section_maint_act_defects.maintenance_photo}`, rectX, (rectY += 182) - 180, { width: 250, height: 180 });
                    }
                    if (section_maint_act_defects.repair_photo) {
                      doc.image(`data:image/jpeg;base64,${section_maint_act_defects.repair_photo}`, doc.page.width - 295, (rectY) - 180, { width: 250, height: 180 });
                    }
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
                    .fill('#00529C')
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
                      .fill('#f7b344')
                      .fillColor("white")
                      .fontSize(14)
                      .font("Helvetica-Bold")
                      .text(`MAINTENANCE PHOTO`, rectX + 65, rectY - 17)
                      .text(`DESCRIPTION`, doc.page.width - 220, rectY - 17);
                    if (section_maint_act_no_defects.maintenance_photo) {
                      doc.image(`data:image/jpeg;base64,${section_maint_act_no_defects.maintenance_photo}`, rectX, (rectY += 182) - 180, { width: 240, height: 180 });
                    }
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
              .fill('#00529C')
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
              doc.lineWidth(1)
                .moveTo(rectX, doc.y)
                .lineTo(doc.page.width - 45, doc.y)
                .stroke();
              rectY = doc.y + 12;
              doc.text(`${status_log.foreman_name}`, rectX + 5, rectY, {
                width: 90,
                align: 'left'
              });
              maxY = maxY < doc.y ? doc.y : maxY;
              doc.text(`${status_log.date}`, rectX + 110, rectY, {
                width: 80,
                align: 'center'
              });
              maxY = maxY < doc.y ? doc.y : maxY;
              doc.text(`${status_log.time}`, rectX + 205, rectY, {
                width: 80,
                align: 'right'
              });
              maxY = maxY < doc.y ? doc.y : maxY;
              doc.text(`${status_log.status}`, rectX + 305, rectY, {
                width: 100,
                align: 'left'
              });
              maxY = maxY < doc.y ? doc.y : maxY;
              doc.text(`${status_log.elapsed_time}`, rectX + 400, rectY, {
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
            doc.addPage({ size: paperSize, margins: { top: 45, bottom: 1, left: 45, right: 45 } });
            doc.lineWidth(1)
              .moveTo(45, doc.page.height - 28)
              .lineTo(doc.page.width - 45, doc.page.height - 28)
              .stroke()
              .fillColor("#00529C")
              .fontSize(10)
              .text("MyCentiMark.com", 45, doc.page.height - 24, {
                link: `http://www.mycentimark.com/`,
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
            margins: { top: 45, bottom: 1, left: 45, right: 45 }
          });
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
              const downloadLink = document.createElement('a');
              downloadLink.href = url;
              var date = new Date();
              downloadLink.download = `PM_Report_${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
              downloadLink.click();
              resolve("PDF Downloaded Successfully");
            }
          });
        }
        that.toDataURL("pdfgen/CMLogotaglineHigh.png", function (logo) {
          return niceDocument(logo);
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
          reportName = 'WORK AUTHORIZATION AND SERVICE SUMMARY';
        jsonData = JSON.parse(JSON.stringify(jsonData));

        let header = (doc, logo) => {
          doc.image(logo, (doc.page.width - 302) / 2, 35, {
            width: 302,
            align: "center"
          });
          doc.y = 120;
          doc.fontSize(16)
            .font("Helvetica-Bold")
            .text(reportName, {
              width: doc.page.width - 90,
              align: "center"
            });
          var xPointH = 45,
            yPointH = 145,
            xPointCol1 = 47,
            yPointCol1 = 185,
            xPointCol2 = 290,
            yPointCol2 = 185;
          doc.rect(xPointH, yPointH, doc.page.width - 90, 25)
            .fill('#00529C')
            .fillColor("white")
            .fontSize(14)
            .font("Helvetica-Bold");
          doc.y = yPointH + 8;
          doc.text("PROJECT DETAILS", {
            width: doc.page.width - 90,
            align: "center"
          })
            .fillColor("black")
            .font("Helvetica")
            .fontSize(12)
            .text("Notification: " + (jsonData.project_details.notification_number || ""), xPointCol1, yPointCol1)
            .text(jsonData.project_details.start_work_date ? `Start Work Date: ${jsonData.project_details.start_work_date}` : "", xPointCol2, yPointCol2)
            .text("PO Number: " + (jsonData.project_details.po_number || ""), xPointCol1, yPointCol1 += 20)
            .text(jsonData.project_details.completed_work_date ? `Completed Work Date: ${jsonData.project_details.completed_work_date}` : "", xPointCol2, yPointCol2 += 20);
          doc.rect(xPointH, yPointH += 85, 230, 25)
            .fill('#00529C')
            .font("Helvetica-Bold")
            .fillColor("white")
            .fontSize(14)
            .text("CUSTOMER", 115, yPointH + 8)
            .fillColor("black")
            .font("Helvetica")
            .fontSize(12)
            .text(jsonData.project_details.customer.name || "", xPointCol1, yPointCol1 = (yPointH + 40))
            .text(jsonData.project_details.customer.address || "", xPointCol1, yPointCol1 += 20)
            .text((jsonData.project_details.customer.city ? jsonData.project_details.customer.city + ", " : "") + (jsonData.project_details.customer.state || "") + " " + (jsonData.project_details.customer.zip || ""), xPointCol1, yPointCol1 += 20)
            .text("Attn: ", xPointCol1, yPointCol1 += 20)
            .text(jsonData.project_details.customer.contact_name || "", xPointCol1, yPointCol1 += 20)
            .text((jsonData.project_details.customer.contact_email || "").toLowerCase(), xPointCol1, yPointCol1 += 20);
          doc.rect(xPointH + 270, yPointH, 230, 25)
            .fill('#00529C')
            .font("Helvetica-Bold")
            .fillColor("white")
            .fontSize(14)
            .text("SERVICE MANAGER", 365, yPointH + 8)
            .fillColor("black")
            .font("Helvetica")
            .fontSize(12)
            .text(jsonData.project_details.service_manager.name || "", xPointCol2 = (xPointH + 272), yPointCol2 = (yPointH + 40))
            .text(jsonData.project_details.service_manager.address || "", xPointCol2, yPointCol2 += 20)
            .text((jsonData.project_details.service_manager.city || "") + ", " + (jsonData.project_details.service_manager.state || "") + " " + (jsonData.project_details.service_manager.zip || ""), xPointCol2, yPointCol2 += 20)
            .text((jsonData.project_details.service_manager.email || "").toLowerCase(), xPointCol2, yPointCol2 += 20)
            .text('Phone: ' + (jsonData.project_details.service_manager.phone || ""), xPointCol2, yPointCol2 += 20)
            .text('Fax: ' + (jsonData.project_details.service_manager.fax || ""), xPointCol2, yPointCol2 += 20);
          doc.rect(xPointH, yPointH += 160, 230, 25)
            .fill('#00529C')
            .font("Helvetica-Bold")
            .fillColor("white")
            .fontSize(14)
            .text("LOCATION", 115, yPointH + 8)
            .fillColor("black")
            .font("Helvetica")
            .fontSize(12)
            .text(jsonData.project_details.location.name || "", xPointCol1, yPointCol1 = (yPointH + 40))
            .text(jsonData.project_details.location.address || "", xPointCol1, yPointCol1 += 20)
            .text((jsonData.project_details.location.city || "") + ", " + (jsonData.project_details.location.state || "") + " " + (jsonData.project_details.location.zip || ""), xPointCol1, yPointCol1 += 20)
            .text("Attn: ", xPointCol1, yPointCol1 += 20)
            .text(jsonData.project_details.location.contact_name || "", xPointCol1, yPointCol1 += 20)
            .text((jsonData.project_details.location.contact_email || "").toLowerCase(), xPointCol1, yPointCol1 += 20);
          doc.rect(xPointH + 270, yPointH, 230, 25)
            .fill('#00529C')
            .font("Helvetica-Bold")
            .fillColor("white")
            .fontSize(14)
            .text("SALES REPRESENTATIVE", xPointH + 295, yPointH + 8)
            .fillColor("black")
            .font("Helvetica")
            .fontSize(12)
            .text(jsonData.project_details.sales_rep.name || "", xPointCol2 = (xPointH + 272), yPointCol2 = (yPointH + 40))
            .text(jsonData.project_details.sales_rep.address || "", xPointCol2, yPointCol2 += 20)
            .text((jsonData.project_details.sales_rep.city ? `${jsonData.project_details.sales_rep.city}, ` : "") + (jsonData.project_details.sales_rep.state || "") + " " + (jsonData.project_details.sales_rep.zip || ""), xPointCol2, yPointCol2 += 20)
            .text((jsonData.project_details.sales_rep.email || "").toLowerCase(), xPointCol2, yPointCol2 += 20)
            .text('Phone: ' + (jsonData.project_details.sales_rep.phone || ""), xPointCol2, yPointCol2 += 20)
            .text('Fax: ' + (jsonData.project_details.sales_rep.fax || ""), xPointCol2, yPointCol2 += 20);
          doc.moveTo(xPointH, yPointH += 167)
            .lineTo(xPointH + doc.page.width - 90, yPointH)
            .stroke()
            .text(`Site Contact: ${jsonData.project_details.site_contact_before.contact_name || ""}`, xPointCol1, yPointCol1 = (yPointH + 12))
            .fontSize(8)
            .font('Helvetica-Bold')
            .text(`${jsonData.project_details.site_contact_before.text || ""}`, {
              width: 245,
              align: 'left'
            })
            .fillColor("#00529C")
            .text(`${jsonData.project_details.site_contact_before.url_text}`, {
              link: jsonData.project_details.site_contact_before.url,
              underline: true
            })
            .fillColor("black");
          var siteContactTextH = doc.y;
          doc.font("Helvetica")
            .fontSize(12)
            .text(`Site Contact: ${jsonData.project_details.site_contact_after.contact_name || ""}`, xPointH + 260, yPointCol1)
            .fontSize(8)
            .font('Helvetica-Bold')
            .text(`${jsonData.project_details.site_contact_after.text}`, {
              width: 245,
              align: 'left'
            });

          yPointCol1 = doc.y > siteContactTextH ? doc.y : siteContactTextH;

          if (jsonData.project_details.site_contact_before.signature) {
            doc.image(`data:image/png;base64, ${jsonData.project_details.site_contact_before.signature}`, xPointH + 60, yPointCol1 + 5, {
              width: 160
            });
          } else {
            doc.x = xPointCol1;
            doc.font("Helvetica")
              .fontSize(12)
              .text(`\n\n${jsonData.project_details.site_contact_before.bypass_reason_text || ""}`);
          }

          if (jsonData.project_details.site_contact_after.signature) {
            doc.image(`data:image/png;base64, ${jsonData.project_details.site_contact_after.signature}`, xPointH + 300, yPointCol1 + 5, {
              width: 160
            });
          } else {
            doc.x = xPointH + 260
            doc.font("Helvetica")
              .fontSize(12)
              .text(`\n\n${jsonData.project_details.site_contact_before.bypass_reason_text || ""}`);
          }
          doc.lineWidth(2)
            .moveTo(xPointH, yPointH += 195)
            .lineTo(xPointH + 248, yPointH)
            .stroke()
            .moveTo(xPointH + 252, yPointH)
            .lineTo(xPointH + doc.page.width - 90, yPointH)
            .stroke();
          doc.font("Helvetica")
            .fontSize(12)
            .text("Authorized signatory", xPointH, yPointH + 5)
            .text("Authorized signatory", xPointH + 260, yPointH + 5);

          addPage(doc, page += 1);

          var rectX = 80, rectY = 55;
          doc.fontSize(16)
            .font("Helvetica-Bold")
            .text("BUILDING SECTION SUMMARY", rectX, 35, {
              width: 440,
              align: "center"
            });

          jsonData.building_section_summary.forEach(building_section_summary => {
            doc.rect(rectX, (rectY += 27) - 25, 440, 25)
              .fill('#00529C')
              .fillColor("white")
              .fontSize(14)
              .font("Helvetica-Bold")
              .text(`BUILDING: ${building_section_summary.building_name}`, rectX, rectY - 17, {
                width: 440,
                align: "center"
              });
            (building_section_summary.sections || []).forEach(bsSection => {
              doc.rect(rectX, (rectY += 25) - 25, 440, 25)
                .fill('#f7b344')
                .fillColor("white")
                .fontSize(14)
                .font("Helvetica-Bold")
                .text(`SECTION: ${bsSection.section_name}`, rectX, rectY - 17, {
                  width: 440,
                  align: "center"
                })
                .fillColor("black")
                .font('Helvetica')
                .fontSize(10);
              (bsSection.defects || []).forEach((defect, dIndex) => {
                if (addPage(doc, page += 1, 100)) {
                  rectY = doc.y;
                } else {
                  page -= 1;
                }
                doc.lineWidth(1)
                  .moveTo(rectX, doc.y)
                  .lineTo(520, doc.y)
                  .stroke();
                rectY = doc.y + 12;
                doc.text(`Defect: ${dIndex + 1}`, rectX + 5, rectY, {
                  width: 140,
                  align: 'left'
                });
                doc.text(`${defect.activity}`, rectX + 150, rectY, {
                  width: 140,
                  align: 'left'
                });
                doc.text(`${defect.selection}`, rectX + 280, rectY, {
                  width: 140,
                  align: 'left'
                });
                doc.lineWidth(1)
                  .moveTo(rectX, rectY - 12)
                  .lineTo(rectX, doc.y)
                  .moveTo(rectX + 140, rectY - 12)
                  .lineTo(rectX + 140, doc.y)
                  .moveTo(rectX + 270, rectY - 12)
                  .lineTo(rectX + 270, doc.y)
                  .moveTo(rectX + 440, rectY - 12)
                  .lineTo(rectX + 440, doc.y)
                  .moveTo(rectX, doc.y)
                  .lineTo(520, doc.y)
                  .stroke();
              });
              (bsSection.recommended_work || []).forEach((recommended_work, dIndex) => {
                if (addPage(doc, page += 1, 100)) {
                  rectY = doc.y;
                } else {
                  page -= 1;
                }
                doc.lineWidth(1)
                  .moveTo(rectX, doc.y)
                  .lineTo(520, doc.y)
                  .stroke();
                rectY = doc.y + 12;
                doc.text(`Recommended Work: ${dIndex + 1}`, rectX + 5, rectY, {
                  width: 140,
                  align: 'left'
                });
                doc.text(`${recommended_work.activity}`, rectX + 150, rectY, {
                  width: 140,
                  align: 'left'
                });
                doc.text(`${recommended_work.selection}`, rectX + 280, rectY, {
                  width: 140,
                  align: 'left'
                });
                doc.lineWidth(1)
                  .moveTo(rectX, rectY - 12)
                  .lineTo(rectX, doc.y)
                  .moveTo(rectX + 140, rectY - 12)
                  .lineTo(rectX + 140, doc.y)
                  .moveTo(rectX + 270, rectY - 12)
                  .lineTo(rectX + 270, doc.y)
                  .moveTo(rectX + 440, rectY - 12)
                  .lineTo(rectX + 440, doc.y)
                  .moveTo(rectX, doc.y)
                  .lineTo(520, doc.y)
                  .stroke();
              });
              // doc.lineWidth(1)
              //   .moveTo(rectX, doc.y)
              //   .lineTo(520, doc.y)
              //   .stroke();
              rectY = doc.y;
            });
          });

          rectX = 45;
          rectY = 45;
          addPage(doc, page += 1);
          jsonData.buildings.forEach(building => {

            if (addPage(doc, page += 1, 270)) {
              rectY = doc.y;
            } else {
              page -= 1;
            }
            doc.rect(rectX, (rectY += 27) - 25, doc.page.width - 90, 25)
              .fill('#00529C')
              .fillColor("white")
              .fontSize(14)
              .font("Helvetica-Bold")
              .text(`BUILDING: ${building.building_name}`, rectX, rectY - 17, {
                width: doc.page.width - 90,
                align: "center"
              })
              .rect(rectX, (rectY += 25) - 25, doc.page.width - 90, 25)
              .fill('#f7b344')
              .fillColor("white")
              .fontSize(14)
              .font("Helvetica-Bold")
              .text(`BUILDING PHOTO`, rectX + 65, rectY - 17)
              .text('COMMENTS', rectX + 350, rectY - 17);
            if (building.building_photo) {
              doc.image(`data:image/jpg;base64,${building.building_photo}`, rectX, (rectY += 182) - 180, { width: 300, height: 180 });
            }
            if (building.aerial_photo_url) {
              let arlPhtY = building.building_photo ? rectY - 110 : (rectY += 45) - 25;
              doc.fillColor("black")
                .fontSize(10)
                .text(`${building.building_comments ? building.building_comments : ''}`, doc.page.width / 2 + 45, arlPhtY, {
                  width: doc.page.width / 2 - 90,
                  align: "center"
                })
              doc.fillColor("#00529C")
                .fontSize(10)
                .text("Building Aerial View Photo", (doc.page.width) / 2 + 45, doc.y, {
                  link: `${building.aerial_photo_url}`,
                  width: doc.page.width / 2 - 90,
                  align: "center",
                  underline: true
                });
            }

            (building.sections || []).forEach(section => {

              if (addPage(doc, page += 1, 270)) {
                rectY = doc.y;
              } else {
                page -= 1;
              }
              doc.rect(rectX, (rectY += 27) - 25, doc.page.width - 90, 25)
                .fill('#00529C')
                .fillColor("white")
                .fontSize(14)
                .font("Helvetica-Bold")
                .text(`SECTION: ${section.section_name}`, rectX, rectY - 17, {
                  width: doc.page.width - 90,
                  align: "center"
                })
                .rect(rectX, (rectY += 25) - 25, doc.page.width - 90, 25)
                .fill('#f7b344')
                .fillColor("white")
                .fontSize(14)
                .font("Helvetica-Bold")
                .text(`SECTION OVERVIEW PHOTO`, rectX + 65, rectY - 17)
                .text(`${section.section_comments ? 'COMMENTS' : ''}`, rectX + 340, rectY - 17);
              if (section.section_photo) {
                doc.image(`data:image/jpg;base64,${section.section_photo}`, rectX, (rectY += 182) - 180, { width: 300, height: 180 });
              }
              if (section.section_photo) {
                let arlPhtY = section.section_photo ? rectY - 90 : (rectY += 45) - 25;
                doc.fontSize(10)
                  .fillColor("black")
                  .text(`${section.section_comments ? section.section_comments : ''}`, doc.page.width / 2 + 45, arlPhtY, {
                    width: doc.page.width / 2 - 90,
                    align: "center"
                  });
              }

              if (section.defects) {
                if (addPage(doc, page += 1, 570)) {
                  rectY = doc.y;
                } else {
                  page -= 1;
                }
                doc.rect(rectX, (rectY += 52) - 50, doc.page.width - 90, 50)
                  .fill('#00529C')
                  .fillColor("white")
                  .fontSize(14)
                  .font("Helvetica-Bold")
                  .text(`DEFECT SUMMARY FOR SECTION:`, rectX, rectY - 42, {
                    width: doc.page.width - 90,
                    align: "center"
                  })
                  .text(`${section.defects.section_name || ''}`, rectX, rectY - 20, {
                    width: doc.page.width - 90,
                    align: "center"
                  });
              }
              (section.defects || []).forEach(defect => {
                if (addPage(doc, page += 1, 270)) {
                  rectY = doc.y;
                } else {
                  page -= 1;
                }
                doc.rect(rectX, (rectY += 50) - 50, doc.page.width - 90, 55)
                  .fill('#f7b344')
                  .fillColor("white")
                  .fontSize(14)
                  .font("Helvetica-Bold")
                  .text(`Defect - ${defect.activity || ''} ${defect.selection || ''}`, rectX, rectY - 42, {
                    width: doc.page.width - 90,
                    align: "center"
                  });
                var tempY = doc.y < rectY - 20 ? rectY - 20 : doc.y;
                doc.text(`DEFECT PHOTO`, rectX + 65, tempY)
                  .text(`REPAIR PHOTO`, doc.page.width - 220, tempY);
                if (defect.defect_photo) {
                  doc.image(`data:image/jpg;base64,${defect.defect_photo}`, rectX, (rectY += 187) - 180, { width: 240, height: 180 });
                }
                if (defect.repair_photo) {
                  doc.image(`data:image/jpg;base64,${defect.repair_photo}`, doc.page.width - 285, rectY - 180, { width: 240, height: 180 });
                }
                doc.fillColor('black')
                  .fontSize(9)
                  .font("Helvetica-Bold")
                  .text(`${defect.comments ? 'COMMENTS' : ''}`, rectX + 2, rectY += 5, {
                    underline: true
                  })
                  .font("Helvetica")
                  .text(`${defect.comments || ''}`, rectX + 7, doc.y + 4);
                rectY = doc.y + 2;
              });
              if (section.recommended_work) {
                if (addPage(doc, page += 1, 570)) {
                  rectY = doc.y;
                } else {
                  page -= 1;
                }
                doc.rect(rectX, (rectY += 52) - 50, doc.page.width - 90, 50)
                  .fill('#00529C')
                  .fillColor("white")
                  .fontSize(14)
                  .font("Helvetica-Bold")
                  .text(`RECOMMENDED WORK FOR SECTION:`, rectX + 120, rectY - 42)
                  .text(`${section.recommended_work.section_name || ''}`, rectX + 140, rectY - 20);
              }
              (section.recommended_work || []).forEach(recommended_work => {
                if (addPage(doc, page += 1, 270)) {
                  rectY = doc.y;
                } else {
                  page -= 1;
                }
                doc.rect(rectX, (rectY += 25) - 25, doc.page.width - 90, 25)
                  .fill('#f7b344')
                  .fillColor("white")
                  .fontSize(14)
                  .text(`RECOMMENDED WORK PHOTO`, rectX + 65, rectY - 17)
                  .text(`DESCRIPTION`, doc.page.width - 220, rectY - 17);
                if (recommended_work.photo) {
                  doc.image(`data:image/jpeg;base64,${recommended_work.photo}`, rectX, (rectY += 182) - 180, { width: 240, height: 180 });
                }
                if (recommended_work.comments) {
                  doc.fillColor("black")
                    .text(`${recommended_work.selection}`, doc.page.width - 285, rectY - 160, { width: 240, height: 180 })
                    .text(`${recommended_work.comments}`, doc.page.width - 285, doc.y + 4, { width: 240, height: 180 });
                }

              });
            });
          });
          if (jsonData.labor_materials_summary) {
            addPage(doc, page += 1);

            rectX = 45;
            rectY = 45;
            doc.rect(rectX, (rectY += 27) - 25, doc.page.width - 90, 25)
              .fill('#00529C')
              .fillColor("white")
              .fontSize(14)
              .font("Helvetica-Bold")
              .text(`LABOR AND MATERIALS FOR: ${jsonData.project_details.notification_number}`, rectX, rectY - 17, {
                width: doc.page.width - 90,
                align: "center"
              });
            doc.rect(rectX, (rectY += 25) - 25, doc.page.width - 90, 25)
              .fill('#f7b344')
              .fillColor("white")
              .fontSize(14)
              .font("Helvetica-Bold")
              .text(`Material`, rectX + 100, rectY - 17)
              .text(`Total: $${jsonData.labor_materials_summary.material_total || '0'}`, rectX + 300, rectY - 17)
              .fillColor("black")
              .font('Helvetica')
              .fontSize(10);
            let maxY = doc.y;
            jsonData.labor_materials_summary.materials = jsonData.labor_materials_summary.materials ? [{
              material_description: "Description",
              qty: "Quantity",
              unit_price: 'Unite Price',
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
              doc.lineWidth(1)
                .moveTo(rectX, doc.y)
                .lineTo(doc.page.width - 45, doc.y)
                .stroke();
              rectY = doc.y + 12;
              doc.text(`${material.material_description}`, rectX + 5, rectY, {
                width: 115,
                align: 'left'
              });
              maxY = maxY < doc.y ? doc.y : maxY;
              doc.text(`${material.qty}`, rectX + 130, rectY, {
                width: 115,
                align: 'right'
              });
              maxY = maxY < doc.y ? doc.y : maxY;
              doc.text(`${isNaN(material.unit_price) ? material.unit_price : '$' + material.unit_price}`, rectX + 250, rectY, {
                width: 115,
                align: 'right'
              });
              maxY = maxY < doc.y ? doc.y : maxY;
              doc.text(`${isNaN(material.total) ? material.total : '$' + material.total}`, rectX + 370, rectY, {
                width: 115,
                align: 'right'
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
              .fill('#f7b344')
              .fillColor("white")
              .fontSize(14)
              .font("Helvetica-Bold")
              .text(`Labor and Fees`, rectX + 100, rectY - 17)
              .text(`Total: $${jsonData.labor_materials_summary.labor_and_fees_total}`, rectX + 300, rectY - 17)
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
              doc.lineWidth(1)
                .moveTo(rectX, doc.y)
                .lineTo(doc.page.width - 45, doc.y)
                .stroke();
              rectY = doc.y + 12;
              doc.text(`${labor_and_fees.type}`, rectX + 5, rectY, {
                width: 115,
                align: 'left'
              });
              maxY = maxY < doc.y ? doc.y : maxY;
              doc.text(`${labor_and_fees.qty}`, rectX + 130, rectY, {
                width: 115,
                align: 'right'
              });
              maxY = maxY < doc.y ? doc.y : maxY;
              doc.text(`${isNaN(labor_and_fees.rate) ? labor_and_fees.rate : '$' + labor_and_fees.rate}`, rectX + 250, rectY, {
                width: 115,
                align: 'right'
              });
              maxY = maxY < doc.y ? doc.y : maxY;
              doc.text(`${isNaN(labor_and_fees.total) ? labor_and_fees.total : '$' + labor_and_fees.total}`, rectX + 370, rectY, {
                width: 115,
                align: 'right'
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
            doc.rect(rectX, (rectY += 25) - 25, doc.page.width - 90, 25)
              .fill('#f7b344')
              .fillColor("white")
              .fontSize(14)
              .font("Helvetica-Bold")
              .text(`TOTAL`, rectX + 100, rectY - 17)
              .text(`Total: $${jsonData.labor_materials_summary.grand_total}`, rectX + 300, rectY - 17);
          }
          if (jsonData.status_log) {
            // Status Section  
            addPage(doc, page += 1, null);
            rectX = 45;
            rectY = 45;
            doc.rect(rectX, (rectY += 27) - 25, doc.page.width - 90, 25)
              .fill('#00529C')
              .fillColor("white")
              .fontSize(14)
              .font("Helvetica-Bold")
              .text(`Status Log from Tablet for Notification: ${jsonData.project_details.notification_number}`, rectX + 80, rectY - 17)
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
              rectY = doc.y + 12;
              doc.text(`${status_log.foreman_name || ''}`, rectX + 5, rectY, {
                width: 90,
                align: 'left'
              });
              maxY = maxY < doc.y ? doc.y : maxY;
              doc.text(`${status_log.date}`, rectX + 110, rectY, {
                width: 80,
                align: 'center'
              });
              maxY = maxY < doc.y ? doc.y : maxY;
              doc.text(`${status_log.time}`, rectX + 205, rectY, {
                width: 80,
                align: 'right'
              });
              maxY = maxY < doc.y ? doc.y : maxY;
              doc.text(`${status_log.status}`, rectX + 305, rectY, {
                width: 100,
                align: 'left'
              });
              maxY = maxY < doc.y ? doc.y : maxY;
              doc.text(`${status_log.elapsed_time}`, rectX + 400, rectY, {
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
              doc.lineWidth(1)
                .moveTo(rectX, doc.y)
                .lineTo(rectX + doc.page.width - 90, doc.y)
                .stroke();
            });
            rectY = doc.y;
          }
        }
        let addPage = (doc, page = null, checkSpace = null) => {
          if ((!checkSpace) || (doc.page.maxY() <= doc.y + checkSpace)) {
            doc.addPage({ size: paperSize, margins: { top: 45, bottom: 1, left: 45, right: 45 } });
            doc.lineWidth(1)
              .moveTo(40, doc.page.height - 28)
              .lineTo(doc.page.width - 45, doc.page.height - 28)
              .stroke()
              .fillColor("#00529C")
              .font('Helvetica')
              .fontSize(10)
              .text("MyCentiMark.com", 45, doc.page.height - 24, {
                link: `http://www.mycentimark.com/`,
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
            margins: { top: 45, bottom: 1, left: 45, right: 45 }
          });
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
              const downloadLink = document.createElement('a');
              downloadLink.href = url;
              var date = new Date();
              downloadLink.download = `ServiceRepairSummaryForSvcMgr_${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
              downloadLink.click();
              resolve("PDF Downloaded Successfully");
            }
          });
        }
        that.toDataURL("pdfgen/CMLogotaglineHigh.png", function (logo) {
          return niceDocument(logo);
        });
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
