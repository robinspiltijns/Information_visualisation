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

d3.json("data/data.json").then(function (data) {
    let matrix = [];
    let nodes = data.entities
        .filter((e) => e.type == "entitlement")
        .map((e) => {return {id: e.id, name: e.name}});
    
    nodes.forEach((n, i) => {n.index = i;});

    let total_items = nodes.length;

    let links = data.relationships
        .filter((r) => (r.fromEntityType == "user" && r.toEntityType == "entitlement"))
        .map((r) => {return {source: r.fromEntityId, target: r.toEntityId}})

    nodes.forEach((node) => {
        matrix[node.index] = d3.range(total_items).map(item_index => {
            return {
                x: item_index,
                y: node.index,
                z: 0
            };
        });
    })

    links.forEach((link1) => {
        let user = link1.source;
        let node1_index = nodes.filter((n) => n.id == link1.target)[0].index;
        links.filter((l) => l.source == user)
             .map((l) => (nodes.filter((n) => n.id == l.target)[0].index))
             .filter((node2_index) => node2_index != node1_index)
             .forEach((node2_index) => {
                matrix[node1_index][node2_index].z += 1;
        });
    });

    let matrixScale = d3.scaleBand().range([0, width]).domain(d3.range(total_items));
    var opacityScale = d3.scaleLinear().domain([0, 5]).range([0.0, 1.0]).clamp(true);

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
        .style("fill", "blue")
        .style("fill-opacity", d => opacityScale(d.z))

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
