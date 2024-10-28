const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');


const vsSource = `
    attribute vec2 aPosition;  // Node and edge positions (x, y)
    void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);  // Project 2D position into 3D space
    }
`;


const fsSource = `
    precision mediump float;
    uniform vec4 uColor;  // Color passed in as a uniform
    void main() {
        gl_FragColor = uColor;  // Set the pixel color
    }
`;


function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);

if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
}
gl.useProgram(shaderProgram);


// Example nodes (x, y)
const nodes = new Float32Array([
    -0.5,  0.5,  // Node 1
     0.5,  0.5,  // Node 2
     0.0, -0.5   // Node 3
]);

// Example edges (pairs of node indices)
const edges = new Float32Array([
    -0.5,  0.5,  0.5,  0.5,   // Edge from Node 1 to Node 2
     0.5,  0.5,  0.0, -0.5    // Edge from Node 2 to Node 3
]);


// Create buffer for nodes
const nodeBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, nodeBuffer);
gl.bufferData(gl.ARRAY_BUFFER, nodes, gl.STATIC_DRAW);

// Create buffer for edges
const edgeBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, edgeBuffer);
gl.bufferData(gl.ARRAY_BUFFER, edges, gl.STATIC_DRAW);


// Get attribute location
const position = gl.getAttribLocation(shaderProgram, 'aPosition');
gl.enableVertexAttribArray(position);

// Get uniform location for color
const colorLocation = gl.getUniformLocation(shaderProgram, 'uColor');

// Function to draw nodes
function drawNodes() {
    gl.bindBuffer(gl.ARRAY_BUFFER, nodeBuffer);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    
    // Set color for nodes (red)
    gl.uniform4f(colorLocation, 1.0, 0.0, 0.0, 1.0);
    
    // Draw points for each node
    gl.drawArrays(gl.POINTS, 0, nodes.length / 2);
}

// Function to draw edges
function drawEdges() {
    gl.bindBuffer(gl.ARRAY_BUFFER, edgeBuffer);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    
    // Set color for edges (blue)
    gl.uniform4f(colorLocation, 0.0, 0.0, 1.0, 1.0);
    
    // Draw lines for each edge
    gl.drawArrays(gl.LINES, 0, edges.length / 2);
}

// Clear the canvas and draw
gl.clearColor(1.0, 1.0, 1.0, 1.0);  // White background
gl.clear(gl.COLOR_BUFFER_BIT);

drawNodes();
drawEdges();
