sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "centi/pdf/generator/pdfgenerator/pdfgen/pdfEngine",
  "centi/pdf/generator/pdfgenerator/attributes/constants",
],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, pdfEngine, constants) {
    "use strict";

    return Controller.extend("centi.pdf.generator.pdfgenerator.controller.PDFGenerater", {
      onInit: function () {

      },
      onPDFGenerateTM: async function () {
        let sPaperSize = "LETTER"; //A4, LETTER
        const binary = await pdfEngine.pdfTM(constants.newJsonDataTM, 'download', sPaperSize);
      },
      onPDFGeneratePM: async function () {
        let sPaperSize = "LETTER"; //A4, LETTER
        const binary = await pdfEngine.pdfPM(constants.newJsonDataPM, 'download', sPaperSize);
      }
    });
  });
