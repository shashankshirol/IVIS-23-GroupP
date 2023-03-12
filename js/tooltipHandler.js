function generateTooltip(){
    return d3.select("body")
                .append("div")
                .attr("class", "tooltip d-flex flex-column")
                .style("opacity", 0)
                .style("position", "absolute")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "2px")
                .style("border-radius", "5px")
                .style("pointer-events", "none")
                .style("padding", "5px")
                .style("z-index", 1)
                .html(
                    `<div id="tooltipTitle" class="p-1"><p>Content availability</p></div>
                    <div id='nation' class="p-1"></div>
                    <div id='tipDiv' class="p-2"></div>
                    <div id='totalTitles' class="p-1"></div>`
                    );
}

function tooltipWouldBeOutOfBoundBasedOnMousePos(element){
    let rect = element.getBoundingClientRect();
    let position_exiting = []
    if(d3.event.pageY < 30){
        position_exiting.push("top")
    }
    if(d3.event.pageX < 0){
        position_exiting.push("left")
    }
    if(d3.event.pageX + (rect.width-25) > window.innerWidth){
        position_exiting.push("right")
    }
    if(d3.event.pageY + (rect.height-25) > window.innerHeight){
        position_exiting.push("bottom")
    }
    return position_exiting
}

function moveTooltip(d) {
    let overflowingPositions = tooltipWouldBeOutOfBoundBasedOnMousePos(tooltip.node())

    tooltip.style("top",function(){
        if(overflowingPositions.includes("top")){
            return (tooltip.node().getBoundingClientRect().height+10)+"px";
        }else if(overflowingPositions.includes("bottom")){
            return window.innerHeight-(tooltip.node().getBoundingClientRect().height-10)+"px";
        } else{
            return (d3.event.pageY - 25) + "px"
        }
    })
    .style("left", function(d){
        if(overflowingPositions.includes("left")){
            return (tooltip.node().getBoundingClientRect().width+10)+"px";
        }else if(overflowingPositions.includes("right")){
            return window.innerWidth-(tooltip.node().getBoundingClientRect().width+10)+"px";
        } else{
            return (d3.event.pageX + 10) + "px"
        }
    })  
}

function generateScatterChartInElement(data, x, y, element) {
    console.log(data)
    // Step 1
        let parentSize = {width: d3.select(".tooltip").node().getBoundingClientRect().width,
            height: d3.select(".tooltip").node().getBoundingClientRect().height}
        let margin = {top: 10, right: 120, bottom: 30, left: 60}
        let scatterWidth = parentSize.width*1.5 - margin.left - margin.right
        let scatterHeight = parentSize.height*1.2 - margin.top - margin.bottom

        // Step 3
        let scatterSvg = element.append("svg")
            .attr("width", scatterWidth + margin.left + margin.right)
            .attr("height", scatterHeight + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");
        scatterSvg
              .append("rect")
                .attr("x",0)
                .attr("y",0)
                .attr("height", scatterHeight)
                .attr("width", scatterWidth)
                .style("fill", "black")
        // Step 4 
        let xScale = d3.scaleLinear().domain([2000, 3000]).range([0, scatterWidth]),
            yScale = d3.scaleLinear().domain([3000, 6500]).range([scatterHeight, 0]);
            
        //Add x axis
        scatterSvg.append("g")
            .attr("transform", "translate(0," + scatterHeight + ")")
            .call(d3.axisBottom(xScale).tickSize(-scatterHeight*1.3).ticks(5))
            .select(".domain")
            .remove();

        //Add y axis
        scatterSvg.append("g")
            .call(d3.axisLeft(yScale).tickSize(-scatterWidth*1.3).ticks(7))
            .select(".domain").remove();

        scatterSvg.selectAll(".tick line").attr("stroke", "white")
        //X axis label:
        scatterSvg.append("text")
            .attr("text-anchor", "end")
            .attr("x", scatterWidth/4 + margin.left)
            .attr("y", scatterHeight + margin.top + 20)
            .text("Series");

        // Y axis label:
        scatterSvg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 20)
            .attr("x", -margin.top - scatterHeight/2 + 20)
            .text("Movies")
          
        scatterSvg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
          .attr("cx", function (d) { return xScale(d[0]); } )
          .attr("cy", function (d) { return yScale(d[1]); } )
          .attr("r", function(d){
            if(d[1] == x && d[0] == y){
                return 6
            }
            return 3
          })
          .style("z-index", function(d){
                if(d[1] == x && d[0] == y){
                    return -1
                }
                return 0
          })
          .style("fill", function(d){
                if(d[1] == x && d[0] == y){
                    return "#FF0000"
                }
                return "#69b3a2"
          })
          .style("stroke", function(d){
                if(d[1] == x && d[0] == y){
                    return "#FF0000"
                }
                return "#69b3a2"
          })
          .filter(function(d){
                return d[1] == x && d[0] == y
          }).raise()


          let dataEntries = [["Hovered country", "#FF0000"], ["Other countries", "#69b3a2"]]

          scatterSvg
            .selectAll("myLegend")
            .data(dataEntries)
            .enter()
                .append('g')
                .append("text")
                .attr('x', scatterWidth+17)
                .attr('y', (d,i) => 30+i*20)
                .attr("id", function(d){ if(d[0] == "Hovered country"){return "hoveredCountryLegendScatter"}else{return "otherCountries"}})
                .style("font-weight", "bold")
                .text(d => d[0])
                .style("fill", d => d[1])
                .style("font-size", 11)

        scatterSvg.append('g')
            .selectAll("legendDot")
                .data(dataEntries)
                .enter()
                .append("circle")
                  .attr("cx", scatterWidth+8 )
                  .attr("cy", (d,i) => 30+i*20 -5 )
                  .attr("r", function(d){
                    if(d[0] == "Hovered country"){
                        return 6
                    }else{
                        return 4
                        }
                    })
                  .style("fill", d => d[1])

}