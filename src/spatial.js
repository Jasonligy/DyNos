// import mat4  from 'gl-matrix';
// const { mat4 } = require('gl-matrix');
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl");
if (!gl) {
console.log("WebGL not supported, falling back on experimental-webgl");
gl = canvas.getContext("experimental-webgl");
}
if (!gl) {
alert("Your browser does not support WebGL");
}
const vertexShaderSource = `
  attribute vec3 aPosition;
  uniform mat4 uProjectionMatrix;
  uniform mat4 uViewMatrix;
  void main() {
    gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);
  }
`;
const fragmentShaderSource = `
  precision mediump float;
  uniform vec4 uColor;
  void main() {
    gl_FragColor = uColor;
  }
`;

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

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));   
}
gl.useProgram(program);
const [x1,y1,z1]=[0.5,0.5,0.5];
const [x2,y2,z2]=[-0.5,-0.5,-0.5];
const lines = [
    x1, y1, z1,
    x2, y2, z2
    // Add more lines by adding pairs of points here
  ];
const lineBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines), gl.STATIC_DRAW);
const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
const uViewMatrix = gl.getUniformLocation(program, "uViewMatrix");

const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, 45 * Math.PI / 180, canvas.width / canvas.height, 0.1, 100);

const viewMatrix = mat4.create();
mat4.translate(viewMatrix, viewMatrix, [0, 0, -5]);

gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix);
const aPosition = gl.getAttribLocation(program, "aPosition");
gl.enableVertexAttribArray(aPosition);
gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

// Set line color
const uColor = gl.getUniformLocation(program, "uColor");
gl.uniform4f(uColor, 1.0, 0.0, 0.0, 1.0); // Red color

// Draw the lines
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.drawArrays(gl.LINES, 0, lines.length / 3);
