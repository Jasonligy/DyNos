// main.js
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

// Vertex Shader Source
const vertexShaderSource = `
    attribute vec3 aPosition;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uViewMatrix;
    void main() {
        gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);
    }
`;

// Fragment Shader Source
const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 uColor;
    void main() {
        gl_FragColor = uColor;
    }
`;

// Shader compilation
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Create and link shaders
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// Define coordinates for the axes
const axes = new Float32Array([
    // X axis (red)
    -1, 0, 0,
    1, 0, 0,
    // Y axis (green)
    0, -1, 0,
    0, 1, 0,
    // Z axis (blue)
    0, 0, -1,
    0, 0, 1,
]);

// Define additional lines (example lines)
const lines = new Float32Array([
    // Line 1: from (-0.5, 0, 0) to (0.5, 0.5, 0)
    -0.5, 0, 0,
    0.5, 0.5, 0,
    // Line 2: from (0, 0.5, 0) to (0, 0, -0.5)
    0, 0.5, 0,
    0, 0, -0.5,
    // Line 3: from (0, 0, 0.5) to (-0.5, -0.5, 0)
    0, 0, 0.5,
    -0.5, -0.5, 0,
]);

// Create buffers for axes and lines
const axisBuffer = gl.createBuffer();
const lineBuffer = gl.createBuffer();

// Bind and set data for axes
gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
gl.bufferData(gl.ARRAY_BUFFER, axes, gl.STATIC_DRAW);

// Bind and set data for lines
gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
gl.bufferData(gl.ARRAY_BUFFER, lines, gl.STATIC_DRAW);

// Get attribute and uniform locations
const aPosition = gl.getAttribLocation(program, 'aPosition');
const uProjectionMatrix = gl.getUniformLocation(program, 'uProjectionMatrix');
const uViewMatrix = gl.getUniformLocation(program, 'uViewMatrix');
const uColor = gl.getUniformLocation(program, 'uColor');

// Set the viewport
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

// Set up the projection and view matrices
const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100);

const viewMatrix = mat4.create();
mat4.translate(viewMatrix, viewMatrix, [0, 0, -5]);

gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix);

// Function to draw the axes
function drawAxes() {
    gl.enableVertexAttribArray(aPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    
    // Draw the X axis in red
    gl.uniform4f(uColor, 0.0, 1.0, 0.0, 1.0); // Red color
    gl.drawArrays(gl.LINES, 0, 2);
    
    // Draw the Y axis in green
    gl.uniform4f(uColor, 0.0, 1.0, 0.0, 1.0); // Green color
    gl.drawArrays(gl.LINES, 2, 2);
    
    // Draw the Z axis in blue
    gl.uniform4f(uColor, 0.0, 1.0, 0.0, 1.0); // Blue color
    gl.drawArrays(gl.LINES, 4, 2);
}

// Function to draw the additional lines
function drawLines() {
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    
    // Draw the lines in white
    gl.uniform4f(uColor, 1.0, 1.0, 1.0, 1.0); // White color
    gl.drawArrays(gl.LINES, 0, 6); // There are 3 lines, 2 vertices each
}

// Draw everything
drawAxes();
drawLines();
