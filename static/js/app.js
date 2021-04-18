var samplesJson = "data/samples.json"

var idSelect = d3.select("#selDataset"); //dropdown menu
var demoTable = d3.select("#sample-metadata"); //demographics table
var barChart = d3.select("#bar"); //barchart
var bubbleChart = d3.select("#bubble"); //bubblechart

function init() {

  d3.json(samplesJson).then(data => {
    
    data.names.forEach(name => {
      var option = idSelect.append("option");
      option.text(name);
      }); //close forEach

   var initId = idSelect.property("value")
   plotCharts(initId); //leave this commented out until you get the function plotcharts built

  }); //then  
}  //close init

function plotCharts(id) {

  resetHtml(); //clear html to prevent multiple IDs showing on top of each other

  //this builds the demographic info table
  d3.json(samplesJson).then(data => {
    var individualMetadata = data.metadata.filter(participant => participant.id == id)[0]; //must use square brackets to call the data from the list

    Object.entries(individualMetadata).forEach(([key, value]) => {
      var demolist = demoTable.append("ul")
        .attr("class","list-group");
      var listItem = demolist.append("li")
        .attr("style", "list-style-type: none");
      listItem.text(`${key}: ${value}`);
    });

    //filter the samples.json file for the drop down selection
    var individualSample = data.samples.filter(sample => sample.id == id)[0];
    
    //values for trace (x axis)
    var sampleValues = []
      sampleValues.push(individualSample.sample_values);
      var top1Ootusamples = sampleValues[0].slice(0, 10).reverse();
    
    //values for trace (y axis)
    var otuIDs = []
      otuIDs.push(individualSample.otu_ids);
      var top1OotuIDs = otuIDs[0].slice(0, 10).reverse();

    //values for hover labels
    var otuLabels = []
      otuLabels.push(individualSample.otu_labels);
      var top1OotuLabels = otuLabels[0].slice(0, 10).reverse();
    
    //-----------------------------------------------------
    //-----------------------------------------------------
    //          THIS SECTION IS FOR THE BAR CHART 
    //-----------------------------------------------------
    //-----------------------------------------------------

    var barTrace = {
      x: top1Ootusamples,
      y: top1OotuIDs.map(otu => `OTU ${otu}`),
      type: "bar",
      orientation: "h", //left/right bars instead of up/down
      text: top1OotuLabels //this is for the hover text
    }; //close barTrace

    var layout = {
      height: 650,
      width: 450
    }

    var barData = [barTrace];

    Plotly.newPlot("bar",barData, layout);
  
    //-----------------------------------------------------
    //-----------------------------------------------------
    //       THIS SECTION IS FOR THE BUBBLE CHART 
    //-----------------------------------------------------
    //-----------------------------------------------------
    var bubbleTrace = {
      x: otuIDs[0],
      y: sampleValues[0],
      text: otuLabels[0], //this is for the hover text
      mode: 'markers',
        marker: {
          size: sampleValues[0], //size of bubbles
          color: otuIDs[0] //color of bubbles
        }
    }; //close bubbleTrace

    var layout = {
      xaxis: {
        title: "OTU ID",
        autotick: false,
        dtick: "500"
      },
      showlegend: false,
      height: 600,
      width: 1200
    };

    var bubbleData = [bubbleTrace];

    Plotly.newPlot("bubble",bubbleData, layout);

    //-----------------------------------------------------
    //-----------------------------------------------------
    //       THIS SECTION IS FOR THE GAUGE CHART 
    //-----------------------------------------------------
    //-----------------------------------------------------
    // ----------------------------------
    
    var wfreq = individualMetadata.wfreq;

    if (wfreq == null) {
      wfreq = 0;
    }

    // create an indicator trace for the gauge chart
    var traceGauge = {
        // domain: { x: [0, 1], y: [0, 1] },
        value: wfreq,
        type: "indicator",
        mode: "gauge",
        gauge: {
            axis: {
                range: [0, 9],
                tickmode: 'linear',
                tickfont: {
                    size: 22
                }
            },
            bar: { color: 'rgba(8,29,88,0)' }, // making gauge bar transparent
            steps: [
                { range: [0, 1], color: 'rgb(243,244,224)' }, //controls how big each "slice" is and what color
                { range: [1, 2], color: 'rgb(238,240,218)' },
                { range: [2, 3], color: 'rgb(228,230,201)' },
                { range: [3, 4], color: 'rgb(238,243,186)' },
                { range: [4, 5], color: 'rgb(220,238,184)' },
                { range: [5, 6], color: 'rgb(192,209,156)' },
                { range: [6, 7], color: 'rgb(169,215,156)' },
                { range: [7, 8], color: 'rgb(144,188,149)' },
                { range: [8, 9], color: 'rgb(108,156,114)' }
            ]
        }
    };

    // determine angle for each wfreq segment on the chart
    var angle = (wfreq / 9) * 180; //there's 9 steps and the gauge is 180 degrees

    // calculate end points for triangle pointer path
    var degrees = 180 - angle,
        radius = .75;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path to create needle shape
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        cX = String(x),
        cY = String(y),
        pathEnd = ' Z';
    var path = mainPath + cX + " " + cY + pathEnd;

    // create a trace to draw the circle where the needle is centered
    var needleCenter = {
        x: [0],
        y: [0],
        marker: {
          size: 15,
          color: '850000'
      }
    };

    var dataGauge = [traceGauge, needleCenter];

    var layout = {
        // draw the needle pointer shape using path defined above
        shapes: [{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
                color: '850000',
                width: 7
            }
        }],
        title: {
            text: `<b>Belly Button Washing Frequency</b><br>Scrubs per Week`,
            font: {
                size: 20
            },
        },
        height: 500,
        width: 500,
        xaxis: {
            zeroline: false,
            showticklabels: false,
            showgrid: false,
            range: [-1, 1],
            fixedrange: true
        },
        yaxis: {
            zeroline: false,
            showticklabels: false,
            showgrid: false,
            range: [-0.5, 1.5],
            fixedrange: true
        }
    };

    Plotly.newPlot('gauge', dataGauge, layout);

  }); //close d3.json then

} //close plotCharts

function resetHtml() {
  demoTable.html("");
}

function optionChanged(id) {
  plotCharts(id); //updates chart when drop down option is changed
}

init();