
import generateCube from "./generateCube.js";
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
    uniform bool uUseFixedColor;
    void main() {
        
          if (uUseFixedColor) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Black color
    } else {
        gl_FragColor = vColor; // Use the vertex color
    }
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
const uUseFixedColor = gl.getUniformLocation(program, 'uUseFixedColor');

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

    0.0, 1.0, 0.0, 1.0, // Vertex 1 of edge
    0.0, 1.0, 0.0, 1.0, // Vertex 2 of edge
    0.0, 1.0, 0.0, 1.0, // Vertex 1 of edge
    0.0, 1.0, 0.0, 1.0, // Vertex 2 of edge

    0.0, 1.0, 0.0, 1.0, // Vertex 1 of edge
    0.0, 1.0, 0.0, 1.0, // Vertex 2 of edge
    0.0, 1.0, 0.0, 1.0, // Vertex 1 of edge
    0.0, 1.0, 0.0, 1.0, // Vertex 2 of edge
]);
const blueEdgeColors = new Float32Array([
    0.0, 0.0, 1.0, 1.0, // Blue
    0.0, 0.0, 1.0, 1.0, // Blue
    0.0, 0.0, 1.0, 1.0, // Blue
    0.0, 0.0, 1.0, 1.0, // Blue
    0.0, 0.0, 1.0, 1.0, // Blue
    0.0, 0.0, 1.0, 1.0, // Blue
    0.0, 0.0, 1.0, 1.0, // Blue
    0.0, 0.0, 1.0, 1.0  // Blue
]);



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
mat4.translate(modelViewMatrix, modelViewMatrix, [0.5, -0.5, -5]); // Move up by 5 units
// mat4.rotateX(modelViewMatrix, modelViewMatrix, Math.PI / 2); // Rotate down to look at the cube

gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);


// Create and bind buffer for vertices
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// Create and bind buffer for indices
const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, edgeColors, gl.STATIC_DRAW);



const edgeIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, edgeIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, edgeIndices, gl.STATIC_DRAW);



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





// Define vertices for (n+1) points, where each pair defines an edge
// let edge = new Float32Array([
//     // Define vertices sequentially; add more as needed
//     -0.5, 2,  -1,   // Vertex 1
//      -0.3, 1.5,  -1, // Vertex 2
//      -0.7, 1.2,  -1, // Vertex 3
//      -0.6, 0.3,  -0.8,  // Vertex 4 (for example, a 3-edge shape)

//      0.5, 1,  -0.5,   // Vertex 1
//      0.3, 1.5,  -0.5, // Vertex 2
//      0.7, 1.2,  -0.3, // Vertex 3
//      0.6, 0.3,  -0.8,  // Vertex 4 (for example, a 3-edge shape)
//     // Add more vertices here if needed
// ]);
// let indexs=[];

// console.log(edge)
// console.log(edge)
let [edge,indexs]=generateCube()
edge=new Float32Array(edge)
// console.log(edge.length)



// Create and bind the vertex buffer
const lineBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
gl.bufferData(gl.ARRAY_BUFFER, edge, gl.STATIC_DRAW);

// Define colors for each vertex
const lineColors = new Float32Array([
    // Color for each vertex in sequence
    1.0, 0.0, 0.0, 1, // Vertex 1 (red)
    0.0, 0.0, 1.0, 1, // Vertex 2 (blue)
    0.0, 1.0, 0.0, 1, // Vertex 3 (green)
    1.0, 1.0, 0.0, 1,  // Vertex 4 (yellow)
    1.0, 0.0, 0.0, 1, // Vertex 1 (red)
    0.0, 0.0, 1.0, 1, // Vertex 2 (blue)
    0.0, 1.0, 0.0, 1, // Vertex 3 (green)
    1.0, 1.0, 0.0, 1  // Vertex 4 (yellow)
    // Add more colors as needed to match each vertex
]);

// Create and bind the color buffer
const edgecolorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, edgecolorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, lineColors, gl.STATIC_DRAW);

// Enable vertex attribute for position
gl.enableVertexAttribArray(aPosition);
gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

// Enable vertex attribute for color
// gl.enableVertexAttribArray(aColor);
// gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
// gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
gl.uniform1i(uUseFixedColor, true);
// Draw lines between each consecutive vertex pair

// gl.drawArrays(gl.LINE_STRIP, 0,4); // n+1 vertices -> n edges
// gl.drawArrays(gl.LINE_STRIP, 4, 4); // n+1 vertices -> n edges



//注意color要匹配顶点个数
let index=0;
for(let i=0;i<indexs.length;i++){
    // if(i<6){
    //     index+=indexs[i];
    //     continue
    // }
    console.log(indexs[i])
    gl.drawArrays(gl.LINE_STRIP, index, 2); // n+1 vertices -> n edges
    index+=indexs[i];
}
// const colorLocation = gl.getUniformLocation(shaderProgram, 'uColor');
