let margin = {
        top: 285,
        right: 0,
        bottom: 10,
        left: 285
    },
    width = 700,
    height = 700;


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

d3.json("data/data.json").then((data) => {
    let matrix = [];
    let nodes = data.entities
        .filter((e) => e.type === "entitlement")
        .map((e, i) => {return {id: e.id, name: e.name, index: i, count: 0, roles: 0}});

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

    // count roles that contain entitlement
    data.relationships
        .filter((r) => (r.fromEntityType === "role" && r.toEntityType === "entitlement"))
        .forEach((r) => {
            nodes.find(n => n.id === r.toEntityId).roles += 1;
        })

    let links = data.relationships
        .filter((r) => (r.fromEntityType === "user" && r.toEntityType === "entitlement"))
        .map((r) => {return {source: r.fromEntityId, target: r.toEntityId}});

    nodes.forEach((node) => {
        let entitlementId = node.id;
        node.count = links.filter((link) => link.target === entitlementId).length;
        }
    );

    links.forEach((link) => {
        let userId = link.source;
        let entitlementId = link.target;
        let node1 = nodes.find((node) => node.id === entitlementId);
        links.filter((link) => link.source === userId)
             .map((link) => (nodes.find((node) => node.id === link.target)))
             .forEach((node2) => {
                if (node1.id === node2.id) {
                    node1.count += 1;
                } else {
                    matrix[node1.index][node2.index].z += 1;  
                }
                             
        });
    });

    let matrixScale = d3.scaleBand().range([0, width]).domain(d3.range(amountOfNodes));
    let opacityScale = d3.scaleLinear().domain([0, 5]).range([0.0, 1.0]).clamp(true);
    let countOpacityScale = d3.scaleLinear().domain([Math.min(...nodes.map(n => n.count))-5, Math.max(...nodes.map(n => n.count))+5]).range([0.0, 1.0]).clamp(true);

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
        .style("fill", d => d.x == d.y ? "red" : "blue")
        .style("fill-opacity", d => d.x == d.y ? countOpacityScale(nodes[d.y].count) : opacityScale(d.z));

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
        .text((d, i) => nodes[i].name);

    columns.append("text")
        .attr("class", "label")
        .attr("y", 100)
        .attr("y", matrixScale.bandwidth() / 2)
        .attr("dx", ".32em")
        .attr("text-anchor", "start")
        .text((d, i) => nodes[i].name);

    let orders = {
        name_ascending: d3.range(amountOfNodes).sort((a, b) => {
            return d3.ascending(nodes[a].name, nodes[b].name);
        }),
        name_descending: d3.range(amountOfNodes).sort((a, b) => {
            return d3.descending(nodes[a].name, nodes[b].name);
        }),
        count: d3.range(amountOfNodes).sort((a, b) => {
            return nodes[b].count - nodes[a].count;
        }),
    };

    d3.select("#order").on("change", function() {
        changeOrder(this.value);
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

    console.log(nodes)
    console.log(links)
    console.log(matrix)
});



