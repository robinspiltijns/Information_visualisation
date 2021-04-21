import {getData} from "./parser.js";

const entities = await getData();
const entityType = "entitlement"

const margin = {
        top: 285,
        right: 0,
        bottom: 10,
        left: 285
    };
const width = 700;
const height = 700;

function drawMatrix(entityType) {
    d3.selectAll("graph > *").remove();

    let svg = d3.select("graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("rect")
        .attr("class", "background")
        .attr("width", width - margin.right)
        .attr("height", height - margin.top)
        .attr("transform", "translate(" + margin.right + "," + margin.top + ")");

    svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "white")
    ;

    let matrix = [];
    let nodes = entities
        .filter((e) => e.getType() === entityType)
        .map((e, i) => {return {entity: e, index: i, amountOwningUsers: 0}});
    console.log(nodes);


    let amountOfNodes = nodes.length;

    nodes.forEach((node) => {
        matrix[node.index] = d3.range(amountOfNodes).map(item_index => {
            return {
                x: item_index,
                y: node.index,
                z: 0
            };
        });
    });

    // loop over users to increase the z and the count of each node/matrix point
    let users = entities.filter((e) => e.getType() === "user")
    users.forEach((user) => {
        let entitlements = user.getDescendants().filter((d) => d.getType() === entityType)
        for (let i = 0; i < entitlements.length; i++) {
            let firstEntitlementNode = nodes.find((n) => n.entity === entitlements[i]);
            firstEntitlementNode.amountOwningUsers += 1;
            for (let j = i + 1; j < entitlements.length; j++) {
                let secondEntitlementNode = nodes.find((n) => n.entity === entitlements[j]);
                matrix[firstEntitlementNode.index][secondEntitlementNode.index].z += 1;
                matrix[secondEntitlementNode.index][firstEntitlementNode.index].z += 1;
            }
        }
    })

    // loop over the nodes to detemine the number of roles for each entitlement
    nodes.forEach((n) => n.roles = n.entity.getParents().filter((e) => e.getType() === "role").length)

    let matrixScale = d3.scaleBand().range([0, width]).domain(d3.range(amountOfNodes)).padding(0.05);;
    let opacityScale = d3.scaleLog().domain([0.1, Math.max( ...matrix.flat().map(n => n.z))]).range([0.0, 1.0]).clamp(true);
    let countOpacityScale = d3.scaleLog().domain([0.1, Math.max(...nodes.map(n => n.amountOwningUsers))]).range([0.0, 1.0]).clamp(true);

    let rows = svg.selectAll('.row')
        .data(matrix)
        .enter().append("g")
        .attr("class", "row")
        .attr("transform", (_, i) => {
            return "translate(0," + matrixScale(i) + ")";
        });


    let squares = rows.selectAll(".cell")
        .data(d => d)
        .enter().append("rect")
        .attr("class", "cell")
        .attr("x", d => matrixScale(d.x))
        .attr("width", matrixScale.bandwidth())
        .attr("height", matrixScale.bandwidth())
        .attr("rx", 3)
        .attr("ry", 3)
        .style("fill", d => d.x == d.y ? "#F46036" : (d.z == 0 ? "grey" : "#5c9bd1ff"))
        .style("fill-opacity", d => d.x == d.y ? countOpacityScale(nodes[d.y].amountOwningUsers) : (d.z == 0 ? 0.2 : opacityScale(d.z)))
        .style("stroke-width", 2)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    let tooltip = d3.select("graph")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");


    let columns = svg.selectAll(".column")
        .data(matrix)
        .enter().append("g")
        .attr("class", "column")
        .attr("transform", (d, i) => {
            return "translate(" + matrixScale(i) + ")rotate(-90)";
        });

    rows.append("text")
        .attr("class", "label")
        .attr("x", -5)
        .attr("y", matrixScale.bandwidth() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "end")
        .text((d, i) => nodes[i].entity.getName());

    columns.append("text")
        .attr("class", "label")
        .attr("y", 100)
        .attr("y", matrixScale.bandwidth() / 2)
        .attr("dx", ".32em")
        .attr("text-anchor", "start")
        .text((d, i) => nodes[i].entity.getName());

    let orders = {
        name_ascending: d3.range(amountOfNodes).sort((a, b) => {
            return d3.ascending(nodes[a].entity.getName(), nodes[b].entity.getName());
        }),
        name_descending: d3.range(amountOfNodes).sort((a, b) => {
            return d3.descending(nodes[a].entity.getName(), nodes[b].entity.getName());
        }),
        count: d3.range(amountOfNodes).sort((a, b) => {
            return nodes[b].amountOwningUsers - nodes[a].amountOwningUsers;
        }),
        role_count: d3.range(amountOfNodes).sort((a, b) => {
            return nodes[b].roles - nodes[a].roles;
        }),
    };

    let opacityRanges = {
        normal: [0.0, 1.0],
        inverse: [1.0, 0.0]
    }

    d3.select("#order").on("change", function() {
        changeOrder(this.value);
    });

    d3.select("#scale").on("change", function() {
        changeColorScale(this.value)
    });

    function changeOrder(value) {
        matrixScale.domain(orders[value]);
        let t = svg.transition().duration(1000);

        t.selectAll(".row")
            .delay((d, i) => matrixScale(i) * 4)
            .attr("transform", function(d, i) {
                return "translate(0," + matrixScale(i) + ")";
            })
            .selectAll(".cell")
            .delay(d => matrixScale(d.x) * 4)
            .attr("x", d => matrixScale(d.x));

        t.selectAll(".column")
            .delay((d, i) => matrixScale(i) * 4)
            .attr("transform", (d, i) => "translate(" + matrixScale(i) + ")rotate(-90)");
    }

    function changeColorScale(value) {
        opacityScale.range(opacityRanges[value]);
        d3.selectAll(".cell")
            .transition()
            .duration(1000)
            .style("fill-opacity", d => d.x == d.y ? countOpacityScale(nodes[d.y].amountOwningUsers) : (d.z == 0 ? 0.2 : opacityScale(d.z)))
    }

    function mouseover(event, data) {
        tooltip
            .style("opacity", 1);
        d3.select(this)
            .style("stroke", "black")

        d3.selectAll(".row text").classed("active", (d, i) => {
            return i == data.y;
        });
        d3.selectAll(".column text").classed("active", (d, i) => {
            return i == data.x;
        });
    }

    function mousemove(event, data) {
        tooltip
            .html(data.z + " common users.")
            .style("left", (event.pageX + 20) + "px")
            .style("top", (event.pageY) + "px")
    }

    function mouseleave(event, data) {
        tooltip
            .style("opacity", 0)
        d3.select(this)
            .style("stroke", "none")
        d3.selectAll("text").classed("active", false);
        tooltip.transition().duration(500).style("opacity", 0);
    }
}

drawMatrix("permission")

d3.select("#entity").on("change", function() {
    drawMatrix(this.value)
});
