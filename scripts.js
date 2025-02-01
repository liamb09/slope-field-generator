function coordToCanvas (x, y, xmin, xmax, ymin, ymax, width, height, margin) {
    // converts a coordinate on the graph to the x and y for the canvas
    xStepLen = (width - 2*margin) / (xmax - xmin);
    yStepLen = (height - 2*margin) / (ymax - ymin);
    return [margin + (x-xmin)*xStepLen, margin + (ymax-y)*yStepLen];
}

function drawLine (x1, y1, x2, y2, color, line_width, width, height, ctx, margin) {
    var xmin = document.getElementById("x-axis-min").value;
    var xmax = document.getElementById("x-axis-max").value;
    var ymin = document.getElementById("y-axis-min").value;
    var ymax = document.getElementById("y-axis-max").value;
    ctx.strokeStyle = color;
    ctx.lineWidth = line_width;
    ctx.beginPath();
    p1 = coordToCanvas(x1, y1, xmin, xmax, ymin, ymax, width, height, margin)
    p2 = coordToCanvas(x2, y2, xmin, xmax, ymin, ymax, width, height, margin)
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();
    return [p1, p2]
}

function drawAxes (ctx, width, height, xmin, xmax, xstep, ymin, ymax, ystep, margin, size, color) {
    xae = drawLine(xmin, 0, xmax, 0, "grey", 2, width, height, ctx, margin) // x-axis-endpoints
    ctx.beginPath();
    ctx.moveTo(xae[0][0]+size, xae[0][1]-size);
    ctx.lineTo(xae[0][0], xae[0][1]);
    ctx.lineTo(xae[0][0]+size, xae[0][1]+size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(xae[1][0]-size, xae[1][1]-size);
    ctx.lineTo(xae[1][0], xae[1][1]);
    ctx.lineTo(xae[1][0]-size, xae[1][1]+size);
    ctx.stroke();
    console.log(xstep + 2)
    for (var i = 0; i < xmax; i += xstep) {
        ctx.beginPath();
        p = coordToCanvas(i, 0, xmin, xmax, ymin, ymax, width, height, margin)
        ctx.moveTo(p[0], p[1] + size);
        ctx.lineTo(p[0], p[1] - size);
        ctx.stroke();
    }
    for (var i = 0; i > xmin; i -= xstep) {
        ctx.beginPath();
        p = coordToCanvas(i, 0, xmin, xmax, ymin, ymax, width, height, margin)
        ctx.moveTo(p[0], p[1] + size);
        ctx.lineTo(p[0], p[1] - size);
        ctx.stroke();
    }

    yae = drawLine(0, ymin, 0, ymax, "grey", 2, width, height, ctx, margin) // y-axis-endpoints
    ctx.beginPath();
    ctx.moveTo(yae[0][0]-size, yae[0][1]-size);
    ctx.lineTo(yae[0][0], yae[0][1]);
    ctx.lineTo(yae[0][0]+size, yae[0][1]-size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(yae[1][0]-size, yae[1][1]+size);
    ctx.lineTo(yae[1][0], yae[1][1]);
    ctx.lineTo(yae[1][0]+size, yae[1][1]+size);
    ctx.stroke();
    for (var i = 0; i < ymax; i += ystep) {
        ctx.beginPath();
        p = coordToCanvas(0, i, xmin, xmax, ymin, ymax, width, height, margin)
        ctx.moveTo(p[0] - size, p[1]);
        ctx.lineTo(p[0] + size, p[1]);
        ctx.stroke();
    }
    for (var i = 0; i > ymin; i -= ystep) {
        ctx.beginPath();
        p = coordToCanvas(0, i, xmin, xmax, ymin, ymax, width, height, margin)
        ctx.moveTo(p[0] - size, p[1]);
        ctx.lineTo(p[0] + size, p[1]);
        ctx.stroke();
    }
    
}

function render () {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const margin = 50;
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, width, height)
    var xmin = document.getElementById("x-axis-min").value;
    var xmax = document.getElementById("x-axis-max").value;
    var xstep = parseInt(document.getElementById("x-axis-step").value);
    var ymin = document.getElementById("y-axis-min").value;
    var ymax = document.getElementById("y-axis-max").value;
    var ystep = parseInt(document.getElementById("y-axis-step").value);
    drawAxes(ctx, width, height, xmin, xmax, xstep, ymin, ymax, ystep, margin, 8, "grey")
}