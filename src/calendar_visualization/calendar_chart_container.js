// © 2019 Google LLC.  All rights reserved.
//
// This software is subject to the Google Cloud Terms of Service, as
// modified by the "General Software Terms" of the Google Cloud Service Specific Terms, available at: https://cloud.google.com/terms/service-terms.

import React from "react";
import ReactDOM from "react-dom";
import CalendarHeatmap from "./CalendarHeatmap";
import * as d3 from "d3";
import moment from "moment";
import { timeYears } from "d3";

const colorByOps = {
  SEGMENT: "segment",
  RANGE: "range",
};
const baseOptions = {
  color_picker: {
    type: "array",
    label: "Calendar Color",
    display: "colors",
    default: [
      "#7FCDAE",
      "#7ED09C",
      "#7DD389",
      "#85D67C",
      "#9AD97B",
      "#B1DB7A",
      "#CADF79",
      "#E2DF78",
      "#E5C877",
      "#E7AF75",
      "#EB9474",
      "#EE7772",
    ],
    section: "Style",
    order: 0,
  },
  formatting_override: {
    type: "string",
    label: "Value Formatting Override",
    default: "",
    section: "Style",
    order: 7,
  },
  rounded: {
    type: "boolean",
    label: "Rounded Cells",
    default: false,
    section: "Style",
    order: 4,
  },
  outline: {
    type: "string",
    label: "Outline Type",
    display: "select",
    section: "Style",
    values: [{ Month: "month" }, { Quarter: "quarter" }, { None: "none" }],
    default: "month",
    order: 3,
  },
  label_year: {
    type: "boolean",
    label: "Year Labels",
    default: "true",
    section: "Style",
    order: 1,
  },
  label_month: {
    type: "boolean",
    label: "Month Labels",
    default: "false",
    section: "Style",
    order: 2,
  },
  viz_show_legend: {
    type: "boolean",
    label: "Show Legend",
    default: "true",
    section: "Style",
    order: 5,
  },
  focus_tooltip: {
    type: "boolean",
    label: "Focus on Hover",
    default: "true",
    section: "Style",
    order: 6,
  },
  outline_weight: {
    type: "number",
    label: "Outline Weight",
    default: 1,
    section: "‎Advanced",
    display: "range",
    min: 0,
    max: 6,
    step: 0.1,
    order: 1,
  },
  cell_color: {
    type: "string",
    label: "Cell Border Color",
    display: "color",
    default: "#fff",
    section: "‎Advanced",
    order: 0,
  },
  outline_color: {
    type: "string",
    label: "Outline Color",
    display: "color",
    default: "#000",
    section: "‎Advanced",
    order: 0,
  },
  cell_reducer: {
    type: "number",
    label: "Cell Weight",
    default: 1,
    section: "‎Advanced",
    display: "range",
    min: 0,
    max: 1,
    step: 0.05,
    order: 2,
  },
  axis_label_color: {
    type: "string",
    label: "Axis Label Color",
    display: "color",
    default: "#282828",
    section: "‎Advanced",
    order: 3,
  },

  // HIDDEN OPTIONS
  cal_h: {
    type: "number",
    hidden: true,
  },
  cal_w: {
    type: "number",
    hidden: true,
  },
};

looker.plugins.visualizations.add({
  id: "heatmap_chart",
  label: "Calendar Heatmap",
  options: baseOptions,
  create: function (element, config) {
    this.chart = ReactDOM.render(<div className="vis"></div>, element);
  },
  updateAsync: function (data, element, config, queryResponse, details, done) {
    this.clearErrors();

    if (queryResponse.fields.measure_like.length == 0) {
      this.addError({
        title: "No Measures",
        message: "This chart requires measures.",
      });
      return;
    }
    if (queryResponse.fields.measure_like.length > 1) {
      this.addError({
        title: "Wrong input data.",
        message: "This chart requires 1 measure.",
      });
      return;
    }
    if (queryResponse.fields.dimension_like.length > 1) {
      this.addError({
        title: "Wrong input data.",
        message: "This chart requires 1 dimension.",
      });
      return;
    }
    if (queryResponse.fields.dimension_like.length == 0) {
      this.addError({
        title: "No Dimensions",
        message: "This chart requires dimensions.",
      });
      return;
    }
    if (data.length == 0) {
      this.addError({
        title: "No Results",
        message: "",
      });
      return;
    }

    // Used to catch the rare edge case on DB-next that the config is unset
    const applyDefualtConfig = () => {
      for (let option in baseOptions) {
        if (config[option] === undefined) {
          config[option] = baseOptions[option].default;
        }
      }
    };
    // If color_picker is undefined, chances are
    // all other config attributes are also undefined
    if (config.color_picker === undefined) {
      applyDefualtConfig();
    }

    const dim1 = queryResponse.fields.dimension_like[0].name;
    const dim1_label = queryResponse.fields.dimension_like[0].label_short;

    const meas1 = queryResponse.fields.measure_like[0].name;
    const meas1_label = queryResponse.fields.measure_like[0].label_short
      ? queryResponse.fields.measure_like[0].label_short
      : queryResponse.fields.measure_like[0].label;

    const value_format =
      queryResponse.fields.measure_like[0].value_format != null
        ? queryResponse.fields.measure_like[0].value_format
        : "";

    let chunks = data.map((d) => {
      return {
        dimension: d[dim1],
        value: d[meas1],
        date: moment(d[dim1].value)._d,
      };
    });

    if (chunks.length == 0) {
      this.addError({
        title: "Wrong input pattern or insufficient data.",
        message:
          "Calendar Heatmap requires one non-null date dimension and one measure.",
      });
      return;
    }

    this.chart = ReactDOM.render(
      <CalendarHeatmap
        data={chunks}
        width={element.getBoundingClientRect().width}
        height={element.getBoundingClientRect().height}
        color={config.color_picker}
        overview={config.overview}
        outline={config.outline}
        rounded={config.rounded}
        formatting={config.formatting_override}
        sizeonday={config.sizeshape}
        rows={config.rows}
        measure_label={meas1_label}
        dim_label={dim1_label}
        value_format={value_format}
        label_year={config.label_year}
        label_month={config.label_month}
        label_week={config.label_week}
        legend={config.viz_show_legend}
        focus_tooltip={config.focus_tooltip}
        outline_weight={config.outline_weight}
        cell_color={config.cell_color}
        cell_reducer={config.cell_reducer}
        axis_label_color={config.axis_label_color}
        outline_color={config.outline_color}
      />,
      element
    );
    done();
  },
});
