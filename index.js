let body = d3.select("body");

const width = 800,
    height = 300,
    margin =  {left: 50, top: 50, right: 50, bottom: 50};

let color = d3.scaleOrdinal(d3.schemeCategory10);

let svg = body
    .append("svg")
    .attr("width", width)
    .attr("height", height);

d3.csv("books.csv").then((data) => {
    let xScale = d3.scaleLinear()
        .domain([0,d3.max(data, d => parseInt(d.ranking))])
        .range([margin.left, width - margin.right - margin.left]);

    svg.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => d.ranking * 30)
        .attr("cy", 100)
        .attr("r", d => d.pages / 20)
        .attr("fill", d => color(d.id));

    let xAxis = d3.axisBottom(xScale);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxis);
});

