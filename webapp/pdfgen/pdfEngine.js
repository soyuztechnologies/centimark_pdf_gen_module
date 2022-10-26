
sap.ui.define([
  "jquery.sap.global",
  "sap/m/MessageBox",
  "sap/ui/core/mvc/Controller"
], function (jQuery, MessageBox, Controller) {
  "use strict";

  return {
    pdf: function (jsonData) {
      var that = this,
        page = 1,
        reportName = 'WORK AUTHORIZATION AND SERVICE SUMMARY';
      jsonData = JSON.parse(JSON.stringify(jsonData));
      
      let header = (doc, logo) => {
        doc.image(logo, 148, 35, {
          width: 302
        })
          .fontSize(16)
          .font("Helvetica-Bold")
          .text(reportName, 100, 120);
        // doc.moveDown();
        var xPointH = 45,
          yPointH = 145,
          xPointCol1 = 47,
          yPointCol1 = 185,
          xPointCol2 = 290,
          yPointCol2 = 185;
        doc.rect(xPointH, yPointH, doc.page.width - 90, 25)
          .fill('#004d99')
          .fillColor("white")
          .fontSize(14)
          .text("PROJECT DETAILS", 210, yPointH + 8)
          .fillColor("black")
          .font("Helvetica")
          .fontSize(12)
          .text("Notification: " + (jsonData.project_details.notification_number || ""), xPointCol1, yPointCol1)
          .text(jsonData.project_details.start_work_date ? `Start Work Date: ${jsonData.project_details.start_work_date}` : "", xPointCol2, yPointCol2)
          .text("PO Number: " + (jsonData.project_details.po_number || ""), xPointCol1, yPointCol1 += 20)
          .text(jsonData.project_details.completed_work_date ? `Completed Work Date: ${jsonData.project_details.completed_work_date}` : "", xPointCol2, yPointCol2 += 20);
        doc.rect(xPointH, yPointH += 85, 230, 25)
          .fill('#004d99')
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
          .fill('#004d99')
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
          .fill('#004d99')
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
          .fill('#004d99')
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
        doc.moveTo(xPointH, yPointH += 165)
          .lineTo(xPointH + doc.page.width - 90, yPointH)
          .stroke()
          .text("Site Contact: ", xPointCol1, yPointCol1 = (yPointH + 10))
          .fontSize(10)
          .font('Times-Bold')
          .text(`${jsonData.project_details.site_contact_before.text || ""}`, {
            width: 245,
            align: 'left'
          });
        if (jsonData.project_details.site_contact_before.signature) {
          doc.image(`data:image/png;base64, ${jsonData.project_details.site_contact_before.signature}`, xPointH + 60, yPointCol1 + 120, {
            width: 160
          });
        } else {
          doc.text(`\n\n${jsonData.project_details.site_contact_before.bypass_reason_text}`);
        }
        doc.font("Helvetica")
          .fontSize(12)
          .text("Site Contact: ", xPointH + 260, yPointCol1)
          .fontSize(10)
          .font('Times-Bold')
          .text(`${jsonData.project_details.site_contact_after.text}`, {
            width: 245,
            align: 'left'
          });
        if (jsonData.project_details.site_contact_after.signature) {
          doc.image(`data:image/png;base64, ${jsonData.project_details.site_contact_after.signature}`, xPointH + 300, yPointCol1 + 120, {
            width: 160
          });
        } else {
          doc.text(`\n\n${jsonData.project_details.site_contact_before.bypass_reason_text}`);
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
        // doc.addPage({ size: "A4", margins: { top: 45, bottom: 1, left: 45, right: 45 } })
        addPage(doc, page += 1);
        doc.fontSize(16)
          .font("Helvetica-Bold")
          .text("BUILDING SECTION SUMMARY", 160, 35);
        // doc.lineWidth(1)
        //   .moveTo(40, doc.page.height - 20)
        //   .lineTo(doc.page.width - 45, doc.page.height - 20)
        //   .stroke()
        //   .fillColor('blue')
        //   .fontSize(10)
        //   .text("MyCentiMark.com", 40, doc.page.height - 16, {
        //     link: `http://www.mycentimark.com/`,
        //     underline: false
        //   });
        var rectX = 80, rectY = 55;
        jsonData.building_section_summary.forEach(building_section_summary => {
          doc.rect(rectX, (rectY += 27) - 25, 440, 25)
            .fill('#004d99')
            .fillColor("white")
            .fontSize(14)
            .text(`${building_section_summary.building_name}`, rectX + 80, rectY - 17);
          (building_section_summary.sections || []).forEach(bsSection => {
            doc.rect(rectX, (rectY += 25) - 25, 440, 25)
              .fill('#e68a00')
              .fillColor("white")
              .fontSize(14)
              .text(`${bsSection.section_name}`, rectX + 82, rectY - 17)
              .fillColor("black")
              .font('Helvetica')
              .fontSize(10);
            (bsSection.defects || []).forEach((defect, dIndex) => {
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
                .stroke();
            });
            (bsSection.recommended_work || []).forEach((recommended_work, dIndex) => {
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
                .stroke();
            });
            doc.lineWidth(1)
              .moveTo(rectX, doc.y)
              .lineTo(520, doc.y)
              .stroke();
            rectY = doc.y;
          });
        });
        // doc.addPage({ size: "A4", margins: { top: 45, bottom: 1, left: 45, right: 45 } });
        // doc.lineWidth(1)
        //   .moveTo(40, doc.page.height - 20)
        //   .lineTo(doc.page.width - 45, doc.page.height - 20)
        //   .stroke()
        //   .fillColor('blue')
        //   .fontSize(10)
        //   .text("MyCentiMark.com", 40, doc.page.height - 16, {
        //     link: `http://www.mycentimark.com/`,
        //     underline: false
        //   });
        rectX = 45;
        rectY = 45;
        addPage(doc, page += 1);
        jsonData.buildings.forEach(building => {
          // if (doc.page.maxY() <= doc.y + 270) {
          //   doc.addPage({ size: "A4", margins: { top: 45, bottom: 1, left: 45, right: 45 } });
          //   rectY = 45;
          //   doc.lineWidth(1)
          //     .moveTo(40, doc.page.height - 20)
          //     .lineTo(doc.page.width - 45, doc.page.height - 20)
          //     .stroke()
          //     .fillColor('blue')
          //     .fontSize(10)
          //     .text("MyCentiMark.com", 40, doc.page.height - 16, {
          //       link: `http://www.mycentimark.com/`,
          //       underline: false
          //     });
          // }
          // rectY = addPage(doc, page += 1, 270) ? 45 : rectY;
          if (addPage(doc, page += 1, 270)) {
            rectY = doc.y;
          } else {
            page -= 1;
          }
          doc.rect(rectX, (rectY += 27) - 25, doc.page.width - 90, 25)
            .fill('#004d99')
            .fillColor("white")
            .fontSize(14)
            .text(`BUILDING: ${building.building_name}`, rectX + 80, rectY - 17)
            .rect(rectX, (rectY += 25) - 25, doc.page.width - 90, 25)
            .fill('#e68a00')
            .fillColor("white")
            .fontSize(14)
            .text(`${building.building_comments ? building.building_comments : 'N/A'}`, rectX + 65, rectY - 17);
          if (building.building_photo) {
            doc.image(`data:image/jpg;base64,${building.building_photo}`, rectX, (rectY += 182) - 180, { width: 300, height: 180 });
          }
          if (building.aerial_photo_url) {
            let arlPhtY = building.building_photo ? rectY - 90 : (rectY += 45) - 25;
            doc.fillColor('blue')
              .fontSize(11)
              .text("Building Aerial View Photo", rectX + 330, arlPhtY, {
                link: `${building.aerial_photo_url}`,
                underline: true
              });
          }

          (building.sections || []).forEach(section => {
            // if (doc.page.maxY() <= doc.y + 270) {
            //   doc.addPage({ size: "A4", margins: { top: 45, bottom: 1, left: 45, right: 45 } });
            //   rectY = 45;
            //   doc.lineWidth(1)
            //     .moveTo(40, doc.page.height - 20)
            //     .lineTo(doc.page.width - 45, doc.page.height - 20)
            //     .stroke()
            //     .fillColor('blue')
            //     .fontSize(10)
            //     .text("MyCentiMark.com", 40, doc.page.height - 16, {
            //       link: `http://www.mycentimark.com/`,
            //       underline: false
            //     });
            // }
            // rectY = addPage(doc, page += 1, 270) ? 45 : rectY;
            if (addPage(doc, page += 1, 270)) {
              rectY = doc.y;
            } else {
              page -= 1;
            }
            doc.rect(rectX, (rectY += 27) - 25, doc.page.width - 90, 25)
              .fill('#004d99')
              .fillColor("white")
              .fontSize(14)
              .text(`SECTION: ${section.section_name}`, rectX + 80, rectY - 17)
              .rect(rectX, (rectY += 25) - 25, doc.page.width - 90, 25)
              .fill('#e68a00')
              .fillColor("white")
              .fontSize(14)
              .text(`${section.section_comments}`, rectX + 65, rectY - 17);
            if (section.section_photo) {
              doc.image(`data:image/jpg;base64,${section.section_photo}`, rectX, (rectY += 182) - 180, { width: 300, height: 180 });
            }
            if (section.defects) {
              debugger;
              if (addPage(doc, page += 1, 570)) {
                rectY = doc.y;
              } else {
                page -= 1;
              }
              doc.rect(rectX, (rectY += 52) - 50, doc.page.width - 90, 50)
                .fill('#004d99')
                .fillColor("white")
                .fontSize(14)
                .text(`DEFECT SUMMARY FOR SECTION:`, rectX + 120, rectY - 42)
                .text(`${section.defects.reduce((agg, item) => { return agg + (agg ? "/" : "") + (item.activity || "") }, '')}`, rectX + 140, rectY - 20);
            }
            (section.defects || []).forEach(defect => {
              if (addPage(doc, page += 1, 270)) {
                rectY = doc.y;
              } else {
                page -= 1;
              }
              // rectY = addPage(doc, page+=1, 270) ? doc.y : rectY;
              doc.rect(rectX, (rectY += 50) - 50, doc.page.width - 90, 50)
                .fill('#e68a00')
                .fillColor("white")
                .fontSize(12)
                .text(`${defect.activity} / ${defect.selection}`, rectX + 70, rectY - 42);
                var tempY = doc.y < rectY - 20 ? rectY - 20 : doc.y;
                doc.text(`DEFECT PHOTO`, rectX + 65, tempY)
                .text(`REPAIR PHOTO`, doc.page.width - 220, tempY);
              if (defect.defect_photo) {
                doc.image(`data:image/jpg;base64,${defect.defect_photo}`, rectX, (rectY += 182) - 180, { width: 240, height: 180 });
              }
              if (defect.repair_photo) {
                doc.image(`data:image/jpg;base64,${defect.repair_photo}`, doc.page.width - 285, rectY - 180, { width: 240, height: 180 });
              }
              doc.fillColor('black')
                .fontSize(9)
                .font("Helvetica-Bold")
                .text("Comments", rectX + 2, rectY += 5, {
                  underline: true
                })
                .font("Helvetica")
                .text(`${defect.comments}`, rectX + 7, doc.y + 4);
              rectY = doc.y + 2;
            });
            if (section.recommended_work) {
              // rectY = addPage(doc, page += 1, 370) ? doc.y : rectY;
              if (addPage(doc, page += 1, 570)) {
                rectY = doc.y;
              } else {
                page -= 1;
              }
              doc.rect(rectX, (rectY += 52) - 50, doc.page.width - 90, 50)
                .fill('#004d99')
                .fillColor("white")
                .fontSize(14)
                .text(`RECOMMENDED WORK FOR SECTION:`, rectX + 120, rectY - 42)
                .text(`${section.recommended_work.reduce((agg, item) => { return agg + (agg ? "/" : "") + (item.selection || "") }, '')}`, rectX + 140, rectY - 20);
            }
            (section.recommended_work || []).forEach(recommended_work => {
              // rectY = addPage(doc, page += 1, 270) ? doc.y : rectY;
              if (addPage(doc, page += 1, 270)) {
                rectY = doc.y;
              } else {
                page -= 1;
              }
              doc.rect(rectX, (rectY += 25) - 25, doc.page.width - 90, 25)
                .fill('#e68a00')
                .fillColor("white")
                .fontSize(12)
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
              // doc.fillColor('black')
              //   .fontSize(9)
              //   .font("Helvetica-Bold")
              //   .text("Comments", rectX + 2, rectY += 5, {
              //     underline: true
              //   })
              //   .font("Helvetica")
              //   .text(`${defect.comments}`, rectX + 7, doc.y + 4);
              // rectY = doc.y + 2;
            });
          });
        });
        if (jsonData.labor_materials_summary) {
          addPage(doc, page += 1);
          // doc.addPage({ size: "A4", margins: { top: 45, bottom: 1, left: 45, right: 45 } });
          // doc.lineWidth(1)
          //   .moveTo(40, doc.page.height - 20)
          //   .lineTo(doc.page.width - 45, doc.page.height - 20)
          //   .stroke()
          //   .fillColor('blue')
          //   .fontSize(10)
          //   .text("MyCentiMark.com", 40, doc.page.height - 16, {
          //     link: `http://www.mycentimark.com/`,
          //     underline: false
          //   });
          rectX = 45;
          rectY = 45;
          doc.rect(rectX, (rectY += 27) - 25, doc.page.width - 90, 25)
            .fill('#004d99')
            .fillColor("white")
            .fontSize(14)
            .text(`LABOR AND MATERIALS FOR: ${jsonData.project_details.notification_number}`, rectX + 80, rectY - 17);
          doc.rect(rectX, (rectY += 25) - 25, doc.page.width - 90, 25)
            .fill('#e68a00')
            .fillColor("white")
            .fontSize(14)
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
          });
          doc.lineWidth(1)
            .moveTo(rectX, doc.y)
            .lineTo(doc.page.width - 45, doc.y)
            .stroke();
          rectY = doc.y;
          doc.rect(rectX, (rectY += 25) - 25, doc.page.width - 90, 25)
            .fill('#e68a00')
            .fillColor("white")
            .fontSize(14)
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
          });
          doc.lineWidth(1)
            .moveTo(rectX, doc.y)
            .lineTo(rectX + doc.page.width - 90, doc.y)
            .stroke();
          rectY = doc.y;
          doc.rect(rectX, (rectY += 25) - 25, doc.page.width - 90, 25)
            .fill('#e68a00')
            .fillColor("white")
            .fontSize(14)
            .text(`TOTAL`, rectX + 100, rectY - 17)
            .text(`Total: $${jsonData.labor_materials_summary.grand_total}`, rectX + 300, rectY - 17);

          // Status Section  
          addPage(doc,page+=1, null);
          rectX = 45;
          rectY = 45;
          doc.rect(rectX, (rectY += 27) - 25, doc.page.width - 90, 25)
            .fill('#004d99')
            .fillColor("white")
            .fontSize(14)
            .text(`Status Log from Tablet for Notification: ${jsonData.project_details.notification_number}`, rectX + 80, rectY - 17)
            .fillColor("black")
            .font('Helvetica')
            .fontSize(10);
          maxY = doc.y;
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
          doc.addPage({ size: "A4", margins: { top: 45, bottom: 1, left: 45, right: 45 } });
          doc.lineWidth(1)
            .moveTo(40, doc.page.height - 20)
            .lineTo(doc.page.width - 45, doc.page.height - 20)
            .stroke()
            .fillColor('blue')
            .fontSize(10)
            .text("MyCentiMark.com", 45, doc.page.height - 16, {
              link: `http://www.mycentimark.com/`,
              underline: false
            })
            .text(reportName, 190, doc.page.height - 16, {
              underline: false
            });
          if (page) {
            doc.text(`Page ${page}`, doc.page.width - 85, doc.page.height - 16);
          }
          doc.x = 45;
          doc.y = 45;
          return true;
        } else {
          return false;
        }
      }
      let niceDocument = (logo) => {
        var doc = new PDFDocument({
          size: "A4",
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

          const downloadLink = document.createElement('a');
          downloadLink.href = url;
          var date = new Date();
          downloadLink.download = `ServiceRepairSummaryForSvcMgr_${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
          downloadLink.click();
        });
      }
      that.toDataURL("pdfgen/CMLogotaglineHigh.png", function (logo) {
        niceDocument(logo);
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
        callback(dataURL);
      };
      image.src = src;
    }
  };
});
