$(function(){

    //Init the WebSocket
    var socket = io();

    //Define the data points and set the max graph span to be 1 minute
    var dataPoints = {rx: [], tx: []},
        totalPoints = 60

    //Initialize the data to be 0, and in turn initialize the x-axis
    for (var i = 0; i < totalPoints; ++i) {
        dataPoints.rx.push(0);
        dataPoints.tx.push(0);
    }

    // Function to revert the points order, so that the graph flows from right to left
    function getData(data) {
        if(!data) data = {rx: 0, tx: 0};
        if (dataPoints.rx.length == totalPoints)
            dataPoints.rx = dataPoints.rx.slice(1);
        if (dataPoints.tx.length == totalPoints)
            dataPoints.tx = dataPoints.tx.slice(1);

        dataPoints.rx.push(data.rx);
        dataPoints.tx.push(data.tx);

        var res = {rx: [], tx: []};

        for (var i = 0; i < dataPoints.rx.length; ++i) {
            res.rx.push([i, dataPoints.rx[i]]);
            res.tx.push([i, dataPoints.tx[i]]);
        }

        return res;
    }

    //Define the graph axes and other options like legend
    var seriesData = getData();
    var rxSeries = {
        data: seriesData.rx,
        label: 'RX'
    };
    var txSeries = {
        data: seriesData.tx,
        label: 'TX'
    };
    var absMax = 100;
    var plot = $.plot("#datachart", [ rxSeries, txSeries ], {
        series: {
            shadowSize: 0	// Drawing is faster without shadows
        },
        yaxis: {
            min: 0,
            max: absMax //Initial max 100Kb
        },
        xaxis: {
            show: true
        },
        legend: {
            show: true
        }
    });

    // Receive the time series data via the WebSocket.
    // Server pushes every second
    socket.on('data', function(data){
        var dataSeries = getData(data);
        // Dynamically adjust the y-axis, so when a higher rate comes to be visible in the graph
        // and not cut off.
        var curMax = (data.rx>data.tx ? data.rx : data.tx);
        if(curMax>absMax) absMax = Math.ceil(curMax);
        if(plot) {
            var axes = plot.getAxes();
            axes.yaxis.options.max = absMax;
            rxSeries.data = dataSeries.rx;
            txSeries.data = dataSeries.tx;
            // Redraw
            plot.setupGrid();
            plot.setData([ rxSeries, txSeries ]);
            plot.draw();
        }
    });
});