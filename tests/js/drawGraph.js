var line1_rest;
var emo_labels = ["happy", "surprised", "puzzled", "disgusted", "afraid", "sad"];


function draw_graphs_rest(data)
{
    var elName = 'engChart';
    elName = 'graph';
    if(data==undefined){ data = []; }

    console.log(data);
    var xlabels = [];

    if(!line1_rest || (line1_rest.series.length<= 0)) {
        //add_export(elName);

        var series_rest = [];

        for(var i=0; i < data.length; i++) {
            series_rest.push({
                name: emo_labels[i],
                data: data[i]
            });
        }

        console.log('==================line1_rest');
        console.log(data[i]);


        line1_rest = new Highcharts.Chart({
            credits: { enabled: false },
            chart: {
                renderTo: elName,
                type: 'line',
                animation: true,
                marginRight: 50,
                marginBottom: 90,
                zoomType: 'x'
            },
            title: {
                text: 'emotions - api (kanako)',
                x: -20 //center
            },
            xAxis: {
                min: 0,
                categories: xlabels,
                labels: {
                    rotation: -35,
                    align: 'right'
                }
            },
            yAxis: {
                min: null,
                max: null,
                maxPadding: 0,
                minPadding: 0,
                title: {
                    text: ''
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            }, /*
            tooltip: {
                formatter: tooltipFormatter
            }, */
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: -10,
                y: 60,
                borderWidth: 0
            },
            series: series_rest
        });
    } else {

        if(data.length > 0) {
            for(var i=0; i < line1_rest.series.length; i++) {
                line1_rest.series[i].setData(data[i], false);
            }
        } else {
            for(var i=0; i < line1_rest.series.length; i++) {
                line1_rest.series[i].setData([], false);
            }
        }

        line1_rest.xAxis[0].setCategories(xlabels, false);
        line1_rest.redraw();
    }

}

function showGraph(data)
{
    try{
        draw_graphs_rest(data);
    }catch(err){
        console.log('error');
        console.log(err);
    }

}

function tooltipFormatter() {
    return '<b>'+ this.series.name +'</b><br/>'+ (this.x!=null?this.x:'value') +': '+ Math.round(this.y*100)/100;
}
