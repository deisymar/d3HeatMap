// This product includes color specifications and designs developed by Cynthia Brewer (http://colorbrewer.org/).
// JavaScript specs as packaged in the D3 library (d3js.org). Please see license at http://colorbrewer.org/export/LICENSE.txt
var colorbrewer = { 
    Paired: {
   3: ["#a6cee3","#1f78b4","#b2df8a"],
   4: ["#a6cee3","#1f78b4","#b2df8a","#33a02c"],
   5: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99"],
   6: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c"],
   7: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f"],
   8: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00"],
   9: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6"],
   10: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a"],
   11: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99"],
   12: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"]
   }
   };
   
   var svgContainer,
       fontSize = 16,
       padding = {
         left: 6 * fontSize,
         right: 6 * fontSize,
         top: 1 * fontSize,
         bottom: 8 * fontSize
       };
       
   const createTitle = (data) => { 
     d3.selectAll('.container')
         .append('h1')
         .attr('id','title')
         .style('text-align','center')
         .text("Monthly Global Land-Surface Temperature");
     
     d3.selectAll('.container')
         .append('h2')
         .attr('id','description')
         .style('text-align','center')
         .html(data.monthlyVariance[0].year
              +' - '
              + data.monthlyVariance[data.monthlyVariance.length -1].year 
              +': base temperature '
              + data.baseTemperature
              +'&#8451;');      
   };
   
   const createTooltip = () => {
     return d3.selectAll('.container')
       .append('div')
       .attr('id', 'tooltip')
       .attr('class', 'd3-tip')
       .html( function (d) {
                 return d;
               });
   };
   
   const createCanvas = (width, height) => {
     //var tip = d3.selectAll('#tooltip');
      return d3.selectAll('.container')
               .append('svg')
               .attr("width", width + padding.right + padding.left)
               .attr("height", height + padding.top + padding.bottom)
               .attr("class", "canva")
              //.call(tip);
   };
   
   const defineScales = (data, width, height) => {
      var xScale = d3.scaleBand()
              .domain(data.monthlyVariance
                 .map(function (val) {
                    return val.year;
                 })
               )
              .range([0, width])
              .padding(0);
     
     /*domain yScale is months*/
     /* scaleBand construct a new band scale with the domain specified*/
     var yScale = d3.scaleBand()
                    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
                    .rangeRound([0, height])
                    .padding(0);
     
     return {xScale, yScale};  
   };
   
   const createAxes = (scales, width, height ) => {
     //axis X
     var xAxis = d3
         .axisBottom()
         .scale(scales.xScale)
         .tickValues(
           scales.xScale.domain()
           .filter(function (year){
             //set ticks to year divisible by 10
             return (year % 10 === 0);
           })
         )
         .tickFormat( function (year) {
           var date = new Date(0);
           date.setUTCFullYear(year);
           var formatTime = d3.timeFormat('%Y');
           return formatTime(date);
         })
         .tickSize(10, 1);
     
     svgContainer.append('g')
                 .classed('x-axis', true)
                 .attr('id', 'x-axis')
                 .attr('transform',
                       'translate('+ padding.left +','
                             + (height + padding.top) + ')'
                      )
                 .call(xAxis)
                 .append('text')
                 .text('Years')
                 .style('text-anchor', 'middle')
                 .attr('transform', 
                       'translate(' + width/2 +',' 
                       + 3*fontSize +')'
                      )
                 .attr('fill', 'black');
     //axis Y
     var yAxis = d3.axisLeft()
                   .scale(scales.yScale)
                   .tickValues(scales.yScale.domain())
                   .tickFormat( 
                      function (month) {
                        var date = new Date(0); 
                        date.setUTCMonth((month+1));
                        /*month+1 start January*/
                        /*Format date %B month in String*/
                        var formatTime = d3.timeFormat('%B'); 
                        return formatTime(date);
                      })
                   .tickSize(10,1);
     
     svgContainer.append('g')
                 .classed('y-axis', true)
                 .attr('id', 'y-axis')
                 .attr('transform', 
                       'translate(' 
                       + padding.left + ',' 
                       + padding.top + ')')
                 .call(yAxis)
                 .append("text")
                 .text('Months')
                 .style('text-anchor', 'middle')
                 .attr('transform', 
                       'translate(' 
                       + (-5 * fontSize) + ',' 
                       + height/2 +')' 
                       + ' rotate(-90)' 
                      )
                 .attr('fill', 'black');
   };
   
   const createHeatMap = (data, scales, width, height) => {
     
     var variance = data.monthlyVariance.map( function (val) {
       return val.variance;
     });
     
     var minTemp = data.baseTemperature + Math.min.apply(null, variance);
     
     var maxTemp = data.baseTemperature + Math.max.apply(null, variance);
     
     //var legendColors = colorbrewer.Paired[11].reverse();
     var legendColors = colorbrewer.Paired[11];
        
     //learning d3.scaleQuantize(), d3.scaleQuantile(), d3.scaleThreshold()
     //http://using-d3js.com/04_06_quantize_scales.html
     // ejm: https://bl.ocks.org/mbostock/4573883  
     var legendThreshold = d3
             .scaleThreshold()
             .domain(
                 (function (min, max, count) {
                    var array =[];
                    var step = (max - min)/count;
                    var base = min;
                    for(var i=1; i<count; i++) {
                      array.push(base + i * step);
                    }
                   //console.log(array);
                   return array;
                 })(minTemp, maxTemp, legendColors.length)
             )
           .range(legendColors);
     
     //draw cell
     svgContainer.append('g')
                 .classed('map',true)
                 .attr('transform', 
                       'translate(' 
                       +padding.left +',' 
                       +padding.top+')'
                  )
                 .selectAll('rect')
                 .data(data.monthlyVariance)
                 .enter()
                 .append('rect')
                 .attr('class', 'cell')
                 .attr('data-month', function (d) {
                      return d.month;
                    })
                 .attr('data-year', function (d) {
                      return d.year;
                    })
                 .attr('data-temp', function (d) {
                     return data.baseTemperature + d.variance;
                    })
                 .attr('x', (d) => scales.xScale(d.year))
                 .attr('y', (d) => scales.yScale(d.month))
                 .attr('width', (d) => scales.xScale.bandwidth(d.year))
                 .attr('height', (d) => scales.yScale.bandwidth(d.month))                   .attr('fill', (d) => {  
                   //return colorScale(d.variance);
                   return legendThreshold(data.baseTemperature + d.variance);                })
                 .on('mouseover', function(e, d) {
                     var date = new Date(d.year, d.month);
                     var str = "<p>" 
                               + d3.timeFormat('%Y - %B')(date)
                               +"<br/>"
                               +"Temperature: "
                               + d3.format('.1f')(data.baseTemperature + d.variance) + "&#8451;"
                               +"<br/>"
                               +"Variance: "
                               + d3.format('.1f')(d.variance)+ "&#8451;"
                               +"</p>"
                   d3.selectAll('#tooltip')
                     .style('opacity', 0.9)
                     .style('left', e.pageX + 'px')
                     .style('top', e.pageY + 'px')
                     .attr('data-year', d.year)
                     .html(str);
                 })
                 .on('mouseout', function (e, d) {                                             d3.selectAll('#tooltip')
                     .style('opacity', 0)
                     .style('left', 0)
                     .style('top', 0); 
                 });
     //draw Legend
     //createLegendColors(minTemp, maxTemp, legendThreshold, width, height);
     createLegend(minTemp, maxTemp, legendColors, legendThreshold, width, height );
   };
   
   const createLegendColors = ( minTemp, maxTemp, legendThreshold, width, height ) => {
    //in the algorithm it is missing that color agrees with the temperature range, do not use it
     var legendColors = colorbrewer.Paired[11];
     
     var legendWidth = 400;
     var legendHeight = 30;
   
     var legendRectWidth = legendWidth/legendColors.length;
   
     //define scale
      var legendX = d3.scaleLinear()
                     .domain([minTemp, maxTemp])
                     .range([0, legendWidth]);
     //define Xaxis
     var legendXAxis = d3.axisBottom()
                         .scale(legendX)
                         .tickSize(10,0)
                         .tickValues(                                               legendThreshold.domain()
                         )
                         .tickFormat( d3.format('.1f'));
     
    //draw Legend Colors 
   const legend = svgContainer.append('g')
                   .classed('legend', true)
                   .attr('id', 'legend')
                   .attr('width', legendWidth)
                   .attr('height', legendHeight)
                   .attr('transform', 
                         'translate(' 
                         + padding.left + ',' 
                         + (padding.top + height 
                         +  padding.bottom -2 * legendHeight) 
                         + ')'
                     );
     
         legend.selectAll('rect')
               .data(legendColors)
               .enter()
               .append('rect')
               .attr('x', (d,i) => i*legendRectWidth)
               .attr('y', 0)
               .attr('width', legendRectWidth)
               .attr('height', legendHeight)
               .attr('fill', c => c);
     
      legend.append('g')
           .attr('transform', 'translate('+0+','+ legendHeight +')')
           .call(legendXAxis);
   
   };
   
   const createLegend = ( minTemp, maxTemp, legendColors, legendThreshold, width, height ) => {
     //Freecodecamp
     var legendWidth = 400;
     var legendHeight = 300/legendColors.length;
     
     //define scale
      var legendX = d3.scaleLinear()
                     .domain([minTemp, maxTemp])
                     .range([0, legendWidth]);
     //define Xaxis
     var legendXAxis = d3.axisBottom()
                         .scale(legendX)
                         .tickSize(10)
                         .tickValues(                                               legendThreshold.domain()
                         )
                         .tickFormat( d3.format('.1f'));
     
     //draw legend axis y colors
     var legend = svgContainer.append('g')
                   .classed('legend', true)
                   .attr('id','legend')
                   .attr('transform', 
                         'translate(' 
                         + padding.left + ',' 
                         + (padding.top + height 
                         +  padding.bottom -2 * legendHeight) 
                         + ')'
                     );
     
   legend.append('g')
         .selectAll('rect')
         .data( legendThreshold.range()
               .map( function (color) {
                // .invertExtent return the extent of the values specified domain
                 var d = legendThreshold.invertExtent(color);
                 if(d[0] === null) {
                   d[0] = legendX.domain()[0];
                 }
                 if(d[1] === null) {
                   d[1] = legendX.domain()[1];      
                 }
                 return d;
             })
         )
         .enter()
         .append('rect')
         .style('fill', function (d) {
           return legendThreshold(d[0]);
         })
         .attr('x', (d) => legendX(d[0]))
         .attr('y', 0)
         .attr('height', legendHeight)
         .attr('width', (d) => ( 
           d[0] && d[1]) ? legendX(d[1]) - legendX(d[0]): legendX(null)
          );
     
     legend.append('g')
           .attr('transform', 'translate('+0+','+ legendHeight +')')
           .call(legendXAxis);
   };
   
   function callback(data) {
     //console.log(data);
     var width = 4 * Math.ceil(data.monthlyVariance.length / 12);
     var height = 33 * 12;    
     
     /*to match data cell with the month in the graph*/
     data.monthlyVariance.forEach( function (val) {
       val.month -= 1;
     });
     
     createTitle(data);
     createTooltip();
     svgContainer = createCanvas(width, height);  
     const scales = defineScales(data, width, height ); //{ xScale, yScale}
     createAxes(scales, width, height);
     createHeatMap(data, scales, width, height);  
   }
   
   const leadingGraphic = () => {
         var url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
   
         d3.json(url)
            .then((data) => callback(data))
            .catch((err) => console.log(err));
   };
   leadingGraphic(); 