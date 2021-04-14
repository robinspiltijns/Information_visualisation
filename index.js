let margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    },
    width = 700,
    height = 700;

let body = d3.select("body");

let svg = body.append("svg").attr("width", width).attr("height", height);

d3.json("data/data.json").then((data) => {
    let matrix = [];
    let nodes = data.entities
        .filter((e) => e.type === "entitlement")
        .map((e, i) => {return {id: e.id, name: e.name, index: i, count: 0}});

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

    let links = data.relationships
        .filter((r) => (r.fromEntityType === "user" && r.toEntityType === "entitlement"))
        .map((r) => {return {source: r.fromEntityId, target: r.toEntityId}});

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

    console.log(nodes)
    console.log(links)
    console.log(matrix)
});

