let margin = {
        top: 285,
        right: 0,
        bottom: 10,
        left: 285
    },
    width = 700,
    height = 700;

let body = d3.select("body");

let svg = body.append("svg").attr("width", width).attr("height", height);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width - margin.right)
    .attr("height", height - margin.top)
    .attr("transform", "translate(" + margin.right + "," + margin.top + ")");

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height);

d3.json("data/data.json").then(function (data) {
    let permissions = data.entities.filter((e) => e.type == "permission");
    let nbPermissions = permissions.length
    console.log(permissions[0])

    permissions.forEach((p) => {
        // counts the number of leaf nodes for which this node is an ancestor
        p.count = 0;
    })
});
