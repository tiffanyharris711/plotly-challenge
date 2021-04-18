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
   plotCharts(initId);

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
        //.attr("class", "list-group-item")
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
    };

    var barData = [barTrace];

    Plotly.newPlot("bar",barData);
  
    //-----------------------------------------------------
    //-----------------------------------------------------
    //       THIS SECTION IS FOR THE BUBBLE CHART 
    //-----------------------------------------------------
    //-----------------------------------------------------
    console.log(sampleValues[0]);
    var bubbleTrace = {
      x: otuIDs[0],
      y: sampleValues[0],
      text: otuLabels[0], //this is for the hover text
      mode: 'markers',
        marker: {
          size: sampleValues[0], //size of bubbles
          color: otuIDs[0] //color of bubbles
        }
    };

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
    
  });
} //close plotCharts

function resetHtml() {
  demoTable.html("");
}

function optionChanged(id) {
  plotCharts(id); //updates chart when drop down option is changed
}

init();