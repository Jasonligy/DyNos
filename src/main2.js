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
let nodes = new Float32Array([
    -0.5,  0.5,  // Node 1
     0.5,  0.5,  // Node 2
     0.0, -0.5   // Node 3
]);

// Example edges (pairs of node indices)
let edges = new Float32Array([
    nodes[0],  nodes[1],  nodes[2],  nodes[3],   // Edge from Node 1 to Node 2
    nodes[2],  nodes[3],  nodes[4], nodes[5]   // Edge from Node 2 to Node 3
]);

let circleVertices=getNodesCircle(nodes);
let circle=new Float32Array(circleVertices);

// Create buffer for nodes
const nodeBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, nodeBuffer);
gl.bufferData(gl.ARRAY_BUFFER, nodes, gl.STATIC_DRAW);

// Create buffer for edges
const edgeBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, edgeBuffer);
gl.bufferData(gl.ARRAY_BUFFER, edges, gl.STATIC_DRAW);

const circleBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffer);
gl.bufferData(gl.ARRAY_BUFFER, circle, gl.STATIC_DRAW);

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

function drawCircle() {
    const numSegments = 100;
    gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffer);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    // Set color for circles (blue)
    gl.uniform4f(colorLocation, 0.0, 0.0, 1.0, 1.0);

    let vertexOffset = 0;
    for (let i = 0; i < nodes.length / 2; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, vertexOffset, numSegments + 1);
        vertexOffset += (numSegments + 1);
    }
}

function getNodesCircle(nodes) {
    let circleVertices = [];
    const numSegments=100;
    let circles=[];
    for (let i=0;i<nodes.length;i+=2){
        circles.push([nodes[i],nodes[i+1]]);
    }
    for (const circlecount of circles) {
        x=circlecount[0];
        y=circlecount[1];
        for (let i = 0; i <= numSegments; i++) {
            const angle = (i * 2 * Math.PI) / numSegments;
            const cx = x + 0.01 * Math.cos(angle); // X position
            const cy = y + 0.016 * Math.sin(angle); // Y position
            circleVertices.push(cx, cy);
        }
    }
    return circleVertices
}

// Function to generate random node positions
function updateNodePositions() {
    for (let i = 0; i < nodes.length; i++) {
        nodes[i] = Math.random() * 2 - 1;  // Random position between -1 and 1
    }
    edges = new Float32Array([
        nodes[0],  nodes[1],  nodes[2],  nodes[3],   // Edge from Node 1 to Node 2
        nodes[2],  nodes[3],  nodes[4], nodes[5]   // Edge from Node 2 to Node 3
    ]);
    circleVertices=getNodesCircle(nodes);
    circle=new Float32Array(circleVertices);
    gl.bindBuffer(gl.ARRAY_BUFFER, nodeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, nodes, gl.STATIC_DRAW);  // Update buffer with new positions
    gl.bindBuffer(gl.ARRAY_BUFFER, edgeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, edges, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, circle, gl.STATIC_DRAW);

}

// Animation loop
function animate() {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);  // White background
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // updateNodePositions();  // Update node positions
    drawNodes();            // Draw nodes
    drawEdges();            // Draw edges
    drawCircle();
    console.log('test')
    // requestAnimationFrame(animate);  // Request the next frame
}

setInterval(() => {
    updateNodePositions();  // Update node positions every 500ms
    console.log(nodes)
    animate();              // Draw the updated nodes and edges
}, 1000);
