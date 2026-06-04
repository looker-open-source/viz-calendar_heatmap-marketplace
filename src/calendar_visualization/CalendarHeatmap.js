// © 2019 Google LLC.  All rights reserved.
//
// This software is subject to the Google Cloud Terms of Service, as
// modified by the "General Software Terms" of the Google Cloud Service Specific Terms, available at: https://cloud.google.com/terms/service-terms.

import React, { useEffect } from "react";
import * as d3 from "d3";
import "d3-selection";
import "d3-transition";
import { legendColor, legendHelpers } from "d3-svg-legend";
import SSF from "ssf";
import styled from "styled-components";

const CalendarChartWrapper = styled.div`
  font-family: "Roboto", "Open Sans", "Noto Sans JP", "Noto Sans",
    "Noto Sans CJK KR", Helvetica, Arial, sans-serif;
  justify-content: center;
  align-items: center;
  text-align: center;
  overflow-x: hidden;
  overflow-y: auto;

  .viz {
    font-family: sans-serif;
    shape-rendering: crispEdges;
  }

  .hidden {
    opacity: 0.2;
  }

  div.tooltip {
    font-family: "Roboto", "Open Sans", "Noto Sans JP", "Noto Sans",
      "Noto Sans CJK KR", Helvetica, Arial, sans-serif;
    position: absolute;
    text-align: center;
    width: auto;
    height: auto;
    padding: 2px;
    color: #fff;
    font: 12px sans-serif;
    background: #444;
    border: 0px;
    border-radius: 8px;
    pointer-events: none;
  }
`;

const CalendarHeatmap = (props) => {
  useEffect(() => {
    d3.selectAll("svg").remove();
    d3.selectAll(".year").remove();
    d3.selectAll(".monthLabels").remove();
    d3.selectAll(".legendSVG").remove();
    d3.selectAll(".tooltip").remove();
    drawCalendar(props);
  }, [props]);
  return <CalendarChartWrapper className="vis" />;
};

const drawCalendar = (props) => {
  var svg = d3
    .select(".vis")
    .append("svg")
    .attr("id", "vis-svg")
    .attr("width", "100%")
    

  var chartSize = Math.max(props.width, props.height),
    cellSize = (chartSize/60);

  var percent = d3.format(".1%"),
    format = d3.timeFormat("%Y-%m-%d"),
    Dayformat = d3.timeFormat("%d");

  var tooltip = d3
    .select(".vis")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  let max_value = d3.max(props.data, (d) => d.value.value);
  let min_value = d3.min(props.data, (d) => d.value.value);

  let max_date = d3.max(props.data, (d) => d.date);
  let min_date = d3.min(props.data, (d) => d.date);

  var Rainbow = require("rainbowvis.js");
  var rainbow = new Rainbow();
  rainbow.setNumberRange(1, 5);
  rainbow.setSpectrum("#FAFAFA", props.color[0]);
  var generatedColor = [];
  for (var i = 1; i <= 5; i++) {
    var hexColour = rainbow.colourAt(i);
    generatedColor.push("#" + hexColour);
  }

  let colors = props.color.length == 1 ? generatedColor : props.color;

  let color = d3.scaleQuantize().range(colors).domain([min_value, max_value]);

  function nthWeekdayOfMonth(weekday, n, date) {
    var count = 0,
      idate = new Date(date.getFullYear(), date.getMonth(), 1);
    while (true) {
      if (idate.getDay() === weekday) {
        if (++count == n) {
          break;
        }
      }
      idate.setDate(idate.getDate() + 1);
    }
    return idate;
  }
  var monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  var dateParts = [
    "-01-01",
    "-02-01",
    "-03-01",
    "-04-01",
    "-05-01",
    "-06-01",
    "-07-01",
    "-08-01",
    "-09-01",
    "-10-01",
    "-11-01",
    "-12-01",
  ];
  var monthLabelPadding = 35;
  props.label_month
    ? d3
        .select("#vis-svg")
        .append("g")
        .attr("class", "monthLabels")
        .attr("width", chartSize)
        .attr("height", monthLabelPadding)
        .selectAll("text")
        .data(d3.range(0, 12))
        .enter()
        .append("text")
        .attr("class", "monthLabel")
        .attr("fill", props.axis_label_color)
        .attr("font-size", "1.5vw")
        .text(function (d) {
          return monthNames[d];
        })
        .attr("x", function (d) {
          var x_date = new Date(
            (min_date.getYear() + 1900 + dateParts[d] + 1).replace(/-/g, "/")
          );
          return (
            d3.timeWeek.count(
              d3.timeYear(nthWeekdayOfMonth(0, 1, x_date)),
              nthWeekdayOfMonth(0, 1, x_date)
            ) *
              cellSize +
            cellSize * 3.5
          );
        })
        .attr("y", monthLabelPadding - 8)
        .on("mouseover", function (d) {
          d3.selectAll(".day")
            .filter(function (datum) {
              return datum.getMonth() !== d;
            })
            .style("opacity", 0.2);
        })
        .on("mouseleave", function (d) {
          d3.selectAll(".day").style("opacity", checkHidden);
        })
    : null;

  var years = d3.range(
    min_date.getYear() + 1900,
    max_date.getYear() + 1900 + 1
  );

  var height = Math.max(cellSize * 8, props.height / (years.length + 1));
  svg.attr("height", height * (years.length + 1) - 8);

  var year = d3
    .select("#vis-svg")
    .selectAll(".year")
    .data(years)
    .enter()
    .append("g")
    .attr("width", chartSize)
    .attr("height", height)
    .attr("class", "year")
    .attr("transform", function (d, i) {
      let x = (chartSize - cellSize * 53) / 2;
      let y = height * i + monthLabelPadding;
      return "translate(" + x + "," + y + ")";
    });

  props.label_year
    ? year
        .append("text")
        .attr("font-size", "2vw")
        .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
        .style("text-anchor", "middle")
        .attr("fill", props.axis_label_color)
        .text(function (d) {
          return d;
        })
        .on("mouseover", function (d) {
          d3.selectAll(".day")
            .filter(function (datum) {
              return datum.getYear() + 1900 !== d;
            })
            .style("opacity", 0.2);
        })
        .on("mouseleave", function (d) {
          d3.selectAll(".day").style("opacity", checkHidden);
        })
    : null;

  var rect = year
    .selectAll(".day")
    .data(function (d) {
      return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1));
    })
    .enter()
    .append("rect")
    .attr("class", "day")
    .attr("id", function (d) {
      return "D" + format(d);
    })
    .attr("width", cellSize * props.cell_reducer)
    .attr("height", cellSize * props.cell_reducer)
    .attr("rx", props.rounded ? 100 : 0)
    .attr("ry", props.rounded ? 100 : 0)
    .style("pointer-events", "visible")
    .style("cursor", "pointer")
    .attr("fill", "transparent")
    .attr("stroke", props.cell_color)
    .attr("x", function (d) {
      return d3.timeWeek.count(d3.timeYear(d), d) * cellSize;
    })
    .attr("y", function (d) {
      return d.getDay() * cellSize;
    })
    .on("mouseover", showTooltip)
    .on("mouseleave", hideTooltip)
    .on("click", function (d) {
      var target = props.data.filter(function (v) {
        return format(v.date) === format(d);
      });
      LookerCharts.Utils.openDrillMenu({
        links: target[0].value.links,
        event: event,
      });
    });

  rect
    .append("span")
    .attr("display", "none")
    .append("title")
    .text(function (d) {
      return format(d);
    });

  props.outline !== "none"
    ? year
        .selectAll(".month")
        .data(function (d) {
          var monthArr = d3.timeMonths(
            new Date(d, 0, 1),
            new Date(d + 1, 0, 1)
          );
          return props.outline === "quarter"
            ? [monthArr[0], monthArr[3], monthArr[6], monthArr[9]]
            : monthArr;
        })
        .enter()
        .append("path")
        .attr("class", "month")
        .attr("fill", "none")
        .attr("stroke", props.outline_color)
        .attr("stroke-width", props.outline_weight)
        .attr("d", props.outline === "quarter" ? quarterPath : monthPath)
    : null;

  props.data.forEach((d) => {
    var valueFormatted =
      props.formatting !== ""
        ? SSF.format(props.formatting, d.value.value)
        : LookerCharts.Utils.textForCell(d.value);
    d3.select("#D" + format(d.date))
      .attr("fill", d.value.value ? color(d.value.value) : "#FFF")
      .select("title")
      .text(format(d.date) + ": " + valueFormatted)
      .on("click", LookerCharts.Utils.openDrillMenu(d.value.links));
  });
  var baseL = props.color.length === 1 ? 4 : props.color.length;
  var legendX = Math.round(chartSize - cellSize * (baseL + 5));
  var legendY =
    height * years.length + 2 * cellSize + (props.rounded ? 20 : 10);
  var legend = d3
    .select("#vis-svg")
    .append("g")
    .attr("class", "legendSVG")
    .attr("width", "100%")
    .attr("height", 2 * cellSize)
    .attr("font-size", "1.5vw");
  legend
    .append("g")
    .attr("class", "legendLinear")
    .attr("transform", 
      "translate(" + legendX + "," + legendY + ")"
    );

  var range_labels = [];
  props.color.length !== 1
    ? props.color.forEach(function (d, i) {
        i === 0
          ? range_labels.push("less")
          : i === props.color.length - 1
          ? range_labels.push("more")
          : range_labels.push("");
      })
    : range_labels.push("less", "", "", "", "more");

  var legendLinear = legendColor()
    .shape(props.rounded ? "circle" : "rect")
    .shapeWidth(cellSize)
    .shapeHeight(cellSize)
    .shapeRadius(cellSize / 2)
    .cells(props.color.length)
    .orient("horizontal")
    .labels(legendHelpers.thresholdLabels)
    .labelOffset(props.height)
    .scale(color)
    .on("cellclick", function (d) {
      var legendCell = d3.selectAll(".swatch").filter(function () {
        return d.toString().includes("#")
          ? d3.select(this).style("fill") == hexToRgb(d.slice(1))
          : d3.select(this).style("fill") == color(d);
      });
      legendCell.classed("hidden", !legendCell.classed("hidden"));
      var days = d3.selectAll(".day").filter(function () {
        return d.toString().includes("#")
          ? d3.select(this).style("fill") == hexToRgb(d.slice(1))
          : d3.select(this).style("fill") == color(d);
      });
      days.classed("hidden", legendCell.classed("hidden"));
      d3.selectAll(".hidden").style("opacity", 0.2);
      d3.selectAll(".swatch").style("opacity", 1);
      d3.selectAll(".swatch.hidden").style("opacity", 0.2);
    })
    .on("cellover", function (d) {
      d3.select(this).select(".label").call(showTooltip);

      d3.selectAll(".day")
        .style("opacity", 0.2)
        .filter(function () {
          return (
            d3.select(this).attr("fill") == d &&
            d3.select(this).classed("hidden") === false
          );
        })
        .style("opacity", 1);
    })
    .on("cellout", function (d) {
      d3.select(this).select(".label").call(hideTooltip);

      d3.selectAll(".day")
        .filter(function () {
          return d3.select(this).classed("hidden") === false;
        })
        .style("opacity", 1.0);
    });

  props.legend ? legend.select(".legendLinear").call(legendLinear) : null;

  function showTooltip(d) {
    //if showTooltip is passed a selection, then we know it's a legend swatch. Otherwise, it's a normal rect
    if (d instanceof d3.selection) {
      let formatted = d
        .text()
        .split(" ")
        .map((ele) => {
          if (isNaN(Number(ele))) {
            return ele;
          }
          var defaultFormatting =
            props.value_format != ""
              ? SSF.format(props.value_format, Number(ele))
              : ele;
          return props.formatting !== ""
            ? SSF.format(props.formatting, Number(ele))
            : defaultFormatting;
        });
      tooltip.style("opacity", 0.9);
      tooltip
        .html(`<b>${formatted.join(" ")}</b>`)
        .style(
          "left",
          d3.event.pageX - tooltip.style("width").slice(0, -2) + "px"
        )
        .style("top", d3.event.pageY - 40 + "px");
    } else {
      var side = d3.event.pageX / window.innerWidth;
      var text = d3.select(this).select("title").text();
      if (
        !text.split(":")[1] ||
        d3.select(this).classed("hidden") ||
        text.split(":")[1] == " ∅"
      ) {
        return;
      }
      if (props.focus_tooltip) {
        d3.selectAll(".day").style("opacity", 0.4);
        d3.select(this).style("opacity", 1.0);
      }
      tooltip.style("opacity", 0.9);
      tooltip
        .html(
          `
                    ${props.dim_label}: <b>${text.split(":")[0]}</b></br>\
                    ${text.split(":")[1] ? props.measure_label + ":" : ""} <b>${
            text.split(":")[1] ? text.split(":")[1] : ""
          }</b>
                `
        )
        .style(
          "left",
          (side > 0.5
            ? d3.event.pageX - tooltip.style("width").slice(0, -2)
            : d3.event.pageX) + "px"
        )
        .style("top", d3.event.pageY - 40 + "px");
    }
  }

  function hideTooltip() {
    tooltip.style("opacity", 0);
    d3.selectAll(".day").style("opacity", checkHidden);
  }

  function checkHidden(d) {
    if (d3.select(this).classed("hidden")) {
      return 0.2;
    }
    return 1;
  }

  function monthPath(t0) {
    var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = t0.getDay(),
      w0 = d3.timeWeek.count(d3.timeYear(t0), t0),
      d1 = t1.getDay(),
      w1 = d3.timeWeek.count(d3.timeYear(t1), t1);
    return (
      "M" +
      (w0 + 1) * cellSize +
      "," +
      d0 * cellSize +
      "H" +
      w0 * cellSize +
      "V" +
      7 * cellSize +
      "H" +
      w1 * cellSize +
      "V" +
      (d1 + 1) * cellSize +
      "H" +
      (w1 + 1) * cellSize +
      "V" +
      0 +
      "H" +
      (w0 + 1) * cellSize +
      "Z"
    );
  }
  function quarterPath(t0) {
    var t1 = new Date(t0.getFullYear(), t0.getMonth() + 3, 0),
      d0 = t0.getDay(),
      w0 = d3.timeWeek.count(d3.timeYear(t0), t0),
      d1 = t1.getDay(),
      w1 = d3.timeWeek.count(d3.timeYear(t1), t1);
    return (
      "M" +
      (w0 + 1) * cellSize +
      "," +
      d0 * cellSize +
      "H" +
      w0 * cellSize +
      "V" +
      7 * cellSize +
      "H" +
      w1 * cellSize +
      "V" +
      (d1 + 1) * cellSize +
      "H" +
      (w1 + 1) * cellSize +
      "V" +
      0 +
      "H" +
      (w0 + 1) * cellSize +
      "Z"
    );
  }
  function hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return "rgb(" + r + ", " + g + ", " + b + ")";
  }
};

export default CalendarHeatmap;
