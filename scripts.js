function coordToCanvas (x, y, xmin, xmax, ymin, ymax, width, height, margin) {
    // converts a coordinate on the graph to the x and y for the canvas
    xStepLen = (width - 2*margin) / (xmax - xmin);
    yStepLen = (height - 2*margin) / (ymax - ymin);
    return [margin + (x-xmin)*xStepLen, margin + (ymax-y)*yStepLen];
}

function drawLine (x1, y1, x2, y2, color, line_width, width, height, ctx, margin) {
    var xmin = parseInt(document.getElementById("x-axis-min").value);
    var xmax = parseInt(document.getElementById("x-axis-max").value);
    var ymin = parseInt(document.getElementById("y-axis-min").value);
    var ymax = parseInt(document.getElementById("y-axis-max").value);
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

function isNumeric (number) {
    return /^[+-]?\d+(\.\d+)?$/.test(number);
}

function isAlphabetic (str) {
    return /^[a-zA-Z]+$/.test(str);
  }

function toSign (boolean) {
    return ((+boolean) - 0.5)*2;
}

function formatMultiDArray (array) {
    result = "["
    for (var i = 0; i < array.length; i++) {
        if (Array.isArray(array[i])) {
            result += formatMultiDArray(array[i])
        } else {
            result += "\"" + array[i] + "\""
        }
        if (i+1 < array.length) result += ", ";
    }
    return result + "]";
}

function splitExpression (expression) {
    // returns [terms, last index] in recursive form
    var result = [""];

    for (var i = 0; i < expression.length; i++) {
        var char = expression[i];

        if (char == "(") {
            var partialResult = splitExpression(expression.slice(i+1));
            i += partialResult[1] + 1;
            // if (expression[i] == ")") {
            //     i++;
            // }
            result.push(partialResult[0]);
            result.push("")
        } else if (char == ")") {
            return [result, i];
        } else if (char == "+" || char == "-") {
            result.push(char);
        } else {
            if (result[result.length-1] == "+" || result[result.length-1] == "-") {
                result.push("");
            }
            result[result.length-1] += "" + char;
        }
    }

    return result;
}

function operate (a, b, operation) {
    if (operation == "*") return a*b;
    if (operation == "/") return a/b;
    if (operation == "^") return a**b;
}

function evaluateExpression (terms, x, y) {
    if (terms.length == 0) return 0;
    if (terms.length == 1 && terms[0] == "x") return x;
    if (terms.length == 1 && terms[0] == "y") return y;

    // Simplify terms into numbers, +/-, and functions (sqrt, sin, etc)
    var finalTerms = [];
    var endsWithOperator = false;
    var lastTerm = 0;
    var lastTermOperator = "";
    var startsWithOperator;
    var firstOperator = "";
    terms.forEach((term) => {
        startsWithOperator = false;
        if (term == "") {
            return;
        }
        if (Array.isArray(term)) {
            if (!endsWithOperator) {
                finalTerms.push(evaluateExpression(term, x, y));
            } else {
                finalTerms.push(operate(lastTerm, evaluateExpression(term, x, y), lastTermOperator));
            }
            return; // acts like a continue for forEach
        }
        if (term == "+" || term == "-" || (isAlphabetic(term) && term != "x" && term != "y")) {
            finalTerms.push(term);
            return;
        }
        var coefficient = 0;
        var lastWasCoef = false;
        var soFar = 1;
        var operation = "*";
        for (var i = 0; i < term.length; i++) {
            var char = term[i];

            if (isNumeric(char)) {
                if (lastWasCoef) {
                    coefficient = parseFloat(coefficient.toString() + char);
                } else {
                    coefficient = parseFloat(char);
                }
                lastWasCoef = true;
            } else {
                if (lastWasCoef) {
                    soFar = operate(soFar, coefficient, operation);
                }
                lastWasCoef = false;
            }
            
            if (char == "*" || char == "/" || char == "^") {
                operation = char;
                if (i == 0) {
                    startsWithOperator = true;
                    firstOperator = char;
                    operation = "*";
                }
            }

            if (char == "x") {
                soFar = operate(soFar, x, operation)
            } else if (char == "y") {
                soFar = operate(soFar, y, operation)
            }
        }
        if (lastWasCoef) {
            soFar = operate(soFar, coefficient, operation)
        }
        if (term[term.length-1] == "*" || term[term.length-1] == "/" || term[term.length-1] == "^") {
            endsWithOperator = true;
            lastTerm = soFar;
            lastTermOperator = term[term.length-1];
        } else if (startsWithOperator) {
            finalTerms[finalTerms.length-1] = operate(finalTerms[finalTerms.length-1], soFar, firstOperator);
        } else {
            endsWithOperator = false;
            finalTerms.push(soFar);
        }
    });
    var result = 0;

    // parse finalTerms
    var sign = true; // true=positive, false=negative
    var func = null;
    for (var i = 0; i < finalTerms.length; i++) {
        var term = finalTerms[i];

        if (isAlphabetic(term) && !(term == Number.POSITIVE_INFINITY || term == Number.NEGATIVE_INFINITY)) {
            func = term;
            continue;
        }

        if (term == "+") {
            sign = true;
        } else if (term == "-") {
            sign = false;
        } else {
            var partial;
            if (func != null) {
                if (func == "sqrt") {
                    partial = Math.sqrt(term);
                } else if (func == "sin") {
                    partial = Math.sin(term);
                } else if (func == "cos") {
                    partial = Math.cos(term);
                } else if (func == "tan") {
                    partial = Math.tan(term);
                } else if (func == "arcsin") {
                    partial = Math.asin(term);
                } else if (func == "arccos") {
                    partial = Math.acos(term);
                } else if (func == "arctan") {
                    partial = Math.atan(term);
                } else if (func == "abs") {
                    partial = Math.abs(term);
                } else if (func == "ln") {
                    partial = Math.log(term);
                } else {
                    partial = term;
                }
                func = null;
            } else {
                partial = term;
            }

            result += partial * toSign(sign);
        }
    }

    return result;
}

function drawSlopeField (expression, ctx, width, height, margin) {
    var xmin = parseInt(document.getElementById("x-axis-min").value);
    var xmax = parseInt(document.getElementById("x-axis-max").value);
    var xstep = parseFloat(document.getElementById("x-axis-step").value);
    var ymin = parseInt(document.getElementById("y-axis-min").value);
    var ymax = parseInt(document.getElementById("y-axis-max").value);
    var ystep = parseFloat(document.getElementById("y-axis-step").value);

    var terms = splitExpression(expression);

    for (var x = xmin; x <= xmax; x += xstep) {
        for (var y = ymin; y <= ymax; y += ystep) {
            var currentSlope = evaluateExpression(terms, x, y);
            var angle = Math.atan(currentSlope);
            var x1 = x - 0.4*Math.cos(angle)*xstep;
            var x2 = x + 0.4*Math.cos(angle)*xstep;
            var y1 = y - 0.4*Math.sin(angle)*ystep;
            var y2 = y + 0.4*Math.sin(angle)*ystep;
            drawLine(x1, y1, x2, y2, "black", 2, width, height, ctx, margin);
        }
    }
}

function drawEstimatedParticularSolution (ctx, expression, width, height, margin, xmin, xmax, ymin, ymax, sx, sy, step) {
    var currentY = sy;
    for (var currentX = sx; currentX <= xmax; currentX += step) {
        var currentSlope = evaluateExpression(splitExpression(expression), currentX, currentY);
        if (currentSlope > Math.abs(ymin - ymax) || currentSlope < -Math.abs(ymin - ymax)) {
            break;
        }
        x1 = currentX;
        x2 = currentX + step;
        y1 = currentY;
        y2 = currentY + step*currentSlope;
        drawLine(x1, y1, x2, y2, "red", 2, width, height, ctx, margin);
        currentY = y2;
    }

    var currentY = sy;
    for (var currentX = sx; currentX >= xmin; currentX -= step) {
        var currentSlope = evaluateExpression(splitExpression(expression), currentX, currentY);
        if (currentSlope > Math.abs(ymin - ymax) || currentSlope < -Math.abs(ymin - ymax)) {
            break;
        }
        x1 = currentX;
        x2 = currentX - step;
        y1 = currentY;
        y2 = currentY - step*currentSlope;
        drawLine(x1, y1, x2, y2, "red", 2, width, height, ctx, margin);
        currentY = y2;
    }
}

function drawExpression (ctx, expression, width, height, margin, xmin, xmax) {
    var step = 0.05;
    var lastX = xmin;
    var lastY = evaluateExpression(splitExpression(expression), xmin, 0);
    for (var x = xmin; x <= xmax; x += step) {
        var y = evaluateExpression(splitExpression(expression), x, 0);
        if (!isNaN(y) && !isNaN(lastY)) {
            drawLine(lastX, lastY, x, y, "blue", 2, width, height, ctx, margin);
        }
        lastX = x;
        lastY = y;
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
    var xmin = parseInt(document.getElementById("x-axis-min").value);
    var xmax = parseInt(document.getElementById("x-axis-max").value);
    var xstep = parseFloat(document.getElementById("x-axis-step").value);
    var ymin = parseInt(document.getElementById("y-axis-min").value);
    var ymax = parseInt(document.getElementById("y-axis-max").value);
    var ystep = parseFloat(document.getElementById("y-axis-step").value);
    var expression = document.getElementById("differential-equation").value;
    if (xstep == 0 || ystep == 0 || expression == "") return;
    drawAxes(ctx, width, height, xmin, xmax, xstep, ymin, ymax, ystep, margin, 8, "grey");
    drawSlopeField(expression, ctx, width, height, margin)

    var solutionX = parseFloat(document.getElementById("solution-x").value);
    var solutionY = parseFloat(document.getElementById("solution-y").value);
    var solutionStep = parseFloat(document.getElementById("solution-step").value);
    if (!isNaN(solutionX) && !isNaN(solutionY) && !isNaN(solutionStep) && solutionStep != 0) {
        drawEstimatedParticularSolution(ctx, expression, width, height, margin, xmin, xmax, ymin, ymax, solutionX, solutionY, solutionStep);
    }
    var solutionGuess = document.getElementById("solution-guess").value;
    if (solutionGuess != "") {
        drawExpression(ctx, solutionGuess, width, height, margin, xmin, xmax)
    }
}