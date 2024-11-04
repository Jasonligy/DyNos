import generateGraph from "./generateRandom.js";
// import mat4  from 'gl-matrix';
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

const vsSource = `
    attribute vec2 aPosition;  // Node and edge positions (x, y)
    void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);  // Project 2D position into 3D space
    }
`;

const fsSource = `
    precision highp float;
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



function getNodeEdge(graph, timeframe){
    const totalFrame=Math.floor(10000/16);
    // nodeList=[];
    let edges=graph.edges;
    const nodePosition=graph.nodeAttributes['nodePosition'];
    let segment = new Map();
    nodePosition.forEach((block,id) =>
     {segment.set(id,[block.rightValue[0]-block.leftValue[0],block.rightValue[1]-block.leftValue[1]]);
        
    });
    let currentPosition= new Map();
    nodePosition.forEach((block,id) =>
    {
        currentPosition.set(id,[block.leftValue[0]+timeframe*segment.get(id)[0]/totalFrame,block.leftValue[1]+timeframe*segment.get(id)[1]/totalFrame])
    }
    )
    let nodes =[];
    currentPosition.forEach((p,id) =>
    {
        nodes.push(p[0]);
        nodes.push(p[1]);
    })
    console.log(nodes)
    nodes = new Float32Array(nodes);

    let nodelink=[];
    for(const edge of edges){
        // const [first,second] = edge.split('-').map(v=>parseInt(v));
        const first = parseInt(edge.sourceNode.id);
        const second = parseInt(edge.targetNode.id);
        // console.log(currentPosition);
        // const lineSegment=currentPosition.get(first).concat(currentPosition.get(second))
        // nodelink.concat(lineSegment);
        nodelink.push(currentPosition.get(first)[0]);
        nodelink.push(currentPosition.get(first)[1]);
        nodelink.push(currentPosition.get(second)[0]);
        nodelink.push(currentPosition.get(second)[1]);
    }
    nodelink = new Float32Array(nodelink)
    return{
        position:nodes,
        edges: nodelink
    }
}

let count=0;
let lastUpdate = 0;
const updateInterval = 1000;  // Update every 1000ms (1 second)
const animationDuration = 3000;  // Stop after 10 seconds (10,000 ms)
let startTime = null;

function run(){
    // Function to draw nodes
    function drawNodes() {
        gl.bindBuffer(gl.ARRAY_BUFFER, nodeBuffer);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        
        // Set color for nodes (red)
        gl.uniform4f(colorLocation, 0.0, 1.0, 0.0, 1.0);
        
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

    function animate(timestamp) {
        // Set the start time on the first frame
        if (!startTime) startTime = timestamp;
        
        // Calculate elapsed time
        const elapsedTime = timestamp - startTime;
        
        // Stop the animation if we've exceeded the duration
        if (elapsedTime > animationDuration) return;
        
        gl.clearColor(1.0, 1.0, 1.0, 1.0);  // White background
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // Update positions only if the interval has passed
        
        updateNodePositions(count);  // Update node positions every second
        lastUpdate = timestamp;
        // console.log(edges);
        
        count+=1;
        // drawNodes();            // Draw nodes
        drawEdges();            // Draw edges
        // drawCircle();
        console.log(count)
        // Request the next frame
        requestAnimationFrame(animate);
    }
    function updateNodePositions(count) {
        const nodeEdge=getNodeEdge(graph,count);
    
        nodes=nodeEdge.position;
        edges=nodeEdge.edges;
        console.log(nodeEdge)
        // circleVertices=getNodesCircle(nodes);
        // circle=new Float32Array(circleVertices);
        gl.bindBuffer(gl.ARRAY_BUFFER, nodeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, nodes, gl.DYNAMIC_DRAW);  // Update buffer with new positions
        // gl.bufferData(gl.ARRAY_BUFFER, nodes, gl.STATIC_DRAW);  // Update buffer with new positions

        gl.bindBuffer(gl.ARRAY_BUFFER, edgeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, edges, gl.DYNAMIC_DRAW);
        // gl.bufferData(gl.ARRAY_BUFFER, edges, gl.STATIC_DRAW);
        // gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, circle, gl.STATIC_DRAW);
    
    
    }

    const graph = generateGraph();

    const nodeEdge=getNodeEdge(graph,0);

    let nodes=nodeEdge.position;
    let edges=nodeEdge.edges;

    // Create buffer for nodes
    const nodeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nodeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, nodes, gl.DYNAMIC_DRAW);

    // Create buffer for edges
    const edgeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, edgeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, edges, gl.DYNAMIC_DRAW);

    // const circleBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, circle, gl.STATIC_DRAW);

    // Get attribute location
    const position = gl.getAttribLocation(shaderProgram, 'aPosition');
    gl.enableVertexAttribArray(position);

    // Get uniform location for color
    const colorLocation = gl.getUniformLocation(shaderProgram, 'uColor');

    
    requestAnimationFrame(animate);
}
run();