// © 2019 Google LLC.  All rights reserved.
//
// This software is subject to the Google Cloud Terms of Service, as
// modified by the "General Software Terms" of the Google Cloud Service Specific Terms, available at: https://cloud.google.com/terms/service-terms.

//import CalendarHM from '../src/calendar_visualization/calendar_chart';
//import React from "react";
//import ReactDOM from "react-dom";

looker.plugins.visualizations.add({
  create: function (element, config) {
    element.innerHTML = "<h1>Ready to render!</h1>";
  },
  updateAsync: function (
    data,
    element,
    config,
    queryResponse,
    details,
    doneRendering
  ) {
    var html = "<h1>Ready to render!</h1>";
    // for(var row of data) {
    // 	var cell = row[queryResponse.fields.dimensions[0].name];
    // 	html += LookerCharts.Utils.htmlForCell(cell);
    // }
    element.innerHTML = html;
    doneRendering();
  },
});
