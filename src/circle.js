const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    console.error('Unable to initialize WebGL. Your browser may not support it.');
}

// Vertex shader program
const vsSource = `
    attribute vec4 aVertexPosition;
    void main(void) {
        gl_Position = aVertexPosition;
        gl_PointSize = 5.0; // Set the point size
    }
`;

// Fragment shader program
const fsSource = `
    precision mediump float;
    void main(void) {
        gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); // Set the color to green
    }
`;

// Compile shader function
function compileShader(gl, source, type) {
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

// Create shader program
const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);

const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);

gl.useProgram(shaderProgram);

// Set up position buffer
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// Circle properties
const numSegments = 100; // Number of segments to approximate the circle
const radius = 0.1; // Radius of the circle
const circleVertices = [];

// Generate circle vertices
for (let i = 0; i <= numSegments; i++) {
    const angle = (i * 2 * Math.PI) / numSegments;
    const x = 0.1 * Math.cos(angle);
    const y = 0.16 * Math.sin(angle);
    circleVertices.push(x, y);
}

// Create a Float32Array from circle vertices
const vertices = new Float32Array(circleVertices);

// Pass the vertex data to the buffer
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionLocation);

// Render function
function render() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the circle as a triangle fan
    gl.drawArrays(gl.TRIANGLE_FAN, 0, numSegments + 1);
}

// Initial render
render();
