// main.js
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

// Set the canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Vertex Shader Source
const vertexShaderSource = `
    attribute vec3 aPosition;
    attribute vec4 aColor;
    varying vec4 vColor;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
        vColor = aColor; // Pass the color to the fragment shader
    }
`;

// Fragment Shader Source
const fragmentShaderSource = `
    precision mediump float;
    varying vec4 vColor;
    void main() {
        
        gl_FragColor = vColor; // Blue color
    }
`;

// Shader compilation function
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

// Define vertices for a cube
const vertices = new Float32Array([
    // Front face
    -1, -1,  1,
     1, -1,  1,
     1,  2,  1,
    -1,  2,  1,
    // Back face
    -1, -1, -1,
    -1,  2, -1,
     1,  2, -1,
     1, -1, -1,
]);

// Define indices for drawing the cube
const indices = new Uint16Array([
    // Front face
    0, 1, 2, 0, 2, 3,
    // Back face
    4, 5, 6, 4, 6, 7,
    // Left face
    0, 3, 5, 0, 5, 4,
    // Right face
    1, 7, 6, 1, 6, 2,
    // Top face
    3, 2, 6, 3, 6, 5,
    // Bottom face
    0, 4, 7, 0, 7, 1,
]);
// Define indices for drawing the edges of the cube
const edgeIndices = new Uint16Array([
    // Front face edges
    0, 1,  // Bottom edge
    1, 2,  // Right edge
    2, 3,  // Top edge
    3, 0,  // Left edge
    // Back face edges
    4, 5,  // Bottom edge
    5, 6,  // Right edge
    6, 7,  // Top edge
    7, 4,  // Left edge
    // Connecting edges
    0, 4,  // Left bottom edge
    1, 7,  // Right bottom edge
    2, 6,  // Right top edge
    3, 5   // Left top edge
]);

const edgeColors = new Float32Array([

    // Connecting edges (all blue)
    0.0, 0.0, 1.0, 1.0, // Vertex 1 of edge
    0.0, 0.0, 1.0, 1.0, // Vertex 2 of edge
    0.0, 0.0, 1.0, 1.0, // Vertex 1 of edge
    0.0, 0.0, 1.0, 1.0,  // Vertex 2 of edge

    // Front face edges (all red)
    0.0, 0.0, 1.0, 0.2, // Vertex 1 of edge
    0.0, 0.0, 1.0, 0.2, // Vertex 2 of edge
    0.0, 0.0, 1.0, 0.2, // Vertex 1 of edge
    0.0, 0.0, 1.0, 0.2, // Vertex 2 of edge
    // Back face edges (all green)

    0.0, 1.0, 0.0, 1.0, // Vertex 1 of edge
    0.0, 1.0, 0.0, 1.0, // Vertex 2 of edge
    0.0, 1.0, 0.0, 1.0, // Vertex 1 of edge
    0.0, 1.0, 0.0, 1.0, // Vertex 2 of edge
]);


// Create and bind buffer for vertices
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// Create and bind buffer for indices
// const indexBuffer = gl.createBuffer();
// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
// gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, edgeColors, gl.STATIC_DRAW);

const edgeIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, edgeIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, edgeIndices, gl.STATIC_DRAW);

// Get attribute and uniform locations
const aPosition = gl.getAttribLocation(program, 'aPosition');
const aColor = gl.getAttribLocation(program, 'aColor');
const uModelViewMatrix = gl.getUniformLocation(program, 'uModelViewMatrix');
const uProjectionMatrix = gl.getUniformLocation(program, 'uProjectionMatrix');

// Set the viewport
gl.viewport(0, 0, canvas.width, canvas.height);

// Set up the projection and view matrices
const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100);

const modelViewMatrix = mat4.create();
// mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -10]);
// mat4.rotateX(modelViewMatrix, modelViewMatrix, Math.PI / 4); // Rotate down to look at the cube
mat4.translate(modelViewMatrix, modelViewMatrix, [0, -0.5, -5]); // Move up by 5 units
// mat4.rotateX(modelViewMatrix, modelViewMatrix, Math.PI / 2); // Rotate down to look at the cube

gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);

// Draw the cube
gl.clearColor(1.0, 1.0, 1.0, 1.0); // White background
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

// Enable the attribute
gl.enableVertexAttribArray(aPosition);
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

// Bind the index buffer and draw the cube
// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
// gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

gl.enableVertexAttribArray(aColor);
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, edgeIndexBuffer);
gl.drawElements(gl.LINES, edgeIndices.length, gl.UNSIGNED_SHORT, 0);
