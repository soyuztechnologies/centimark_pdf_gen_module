/*global QUnit*/

sap.ui.define([
	"centipdfgenerator/pdfgenerator/controller/PDFGenerater.controller"
], function (Controller) {
	"use strict";

	QUnit.module("PDFGenerater Controller");

	QUnit.test("I should test the PDFGenerater controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
