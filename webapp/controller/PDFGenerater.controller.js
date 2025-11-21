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
        const binary = await pdfEngine.pdfTM(constants.newJsonDataTM, 'download');
      },
      onPDFGeneratePM: async function () {
        // const binary = await pdfEngine.pdfPM(constants.jsonDataPM, 'download');
        const binary = await pdfEngine.pdfPM(constants.newJsonDataPM, 'download');
      }
    });
  });
