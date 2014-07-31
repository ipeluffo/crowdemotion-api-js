var data = ["time", "happy", "surprised", "puzzled", "disgusted", "afraid", "sad"];

function showGraphDT(dataFull) {

    var m = [20, 20, 20, 20]; // margins
    var w = 1200 - m[1] - m[3]; // width
    var h = 400 - m[0] - m[2]; // height
    var data = dataFull[1];
    var x = d3.scale.linear().domain([0, dataFull[0].length]).range([0, w]);
    // Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
    var y = d3.scale.linear().domain([0, 1]).range([h, 0]);
    // automatically determining max range can work something like this
    // var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);

    // create a line function that can convert data[] into x and y points
    var line = d3.svg.line()
        // assign the X function to plot our line as we wish
        .x(function(d,i) {
            // verbose logging to show what's actually being done
            console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
            // return the X coordinate where we want to plot this datapoint
            return x(i);
        })
        .y(function(d) {
            // verbose logging to show what's actually being done
            console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
            // return the Y coordinate where we want to plot this datapoint
            return y(d);
        })

    // Add an SVG element with the desired dimensions and margin.
    var graph = d3.select("#graph").append("svg:svg")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
        .append("svg:g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    // create yAxis
    var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true);
    // Add the x-axis.
    graph.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis);


    // create left yAxis
    var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
    // Add the y-axis to the left
    graph.append("svg:g")
        .attr("class", "y axis")
        .attr("transform", "translate(-25,0)")
        .call(yAxisLeft);

    // Add the line by appending an svg:path element with the data line we created above
    // do this AFTER the axes above so that the line is above the tick-lines
    for(var pos =1; pos<=6; pos++ ){
        graph.append("svg:path").attr("class","path"+pos).attr("d", line(dataFull[pos]));
    }




}
