export function getUnitVector(vector) {
    // Calculate the magnitude of the vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));

    // Avoid division by zero
    if (magnitude === 0) {
        throw new Error("Cannot normalize a zero vector.");
    }

    // Divide each element by the magnitude
    return vector.map(val => val / magnitude);
}
export function distance2points(pointA,pointB){
    if (pointA.length !== pointB.length) {
        throw new Error("Points must have the same number of dimensions");
      }
    
      const sumOfSquares = pointA.reduce((sum, coord, index) => {
        return sum + Math.pow(coord - pointB[index], 2);
      }, 0);
    
      return Math.sqrt(sumOfSquares);
}
export function avgVectors(vector1,vector2){
    if(vector1.length!=vector2.length){
        throw new Error("the two vector don't have same length");
    }
    // let newvector=[];
    return vector1.map((value, index) => (value + vector2[index]) / 2);
}
export function magnitude(vector){
    return Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
}
export function getIntersection(vector1,vector2){
    if(vector1.length!=2 &&vector2.length!=2){
        throw new Error("Not a valid interval")
    }
    const [start1, end1] = vector1;
    const [start2, end2] = vector2;
    
    // Calculate the overlapping range
    const start = Math.max(start1, start2); // Higher start
    const end = Math.min(end1, end2);       // Lower end
    
    // Check if there is an actual overlap
    if (start < end) {
        return [start, end]; // Overlapping interval
    } else {
        return null; // No overlap
    }

}
export function getclosestPoint(point, lineStart, lineEnd) {
    // Decompose the inputs
    const [px, py, pz] = point;
    const [x1, y1, z1] = lineStart;
    const [x2, y2, z2] = lineEnd;

    // Vector from lineStart to lineEnd
    const lineVector = [x2 - x1, y2 - y1, z2 - z1];

    // Vector from lineStart to the given point
    const pointVector = [px - x1, py - y1, pz - z1];

    // Dot product of lineVector and itself
    const lineLengthSquared = lineVector[0] ** 2 + lineVector[1] ** 2 + lineVector[2] ** 2;

    // Edge case: lineStart and lineEnd are the same point
    if (lineLengthSquared === 0) return lineStart;

    // Dot product of pointVector and lineVector
    const dotProduct = pointVector[0] * lineVector[0] +
                       pointVector[1] * lineVector[1] +
                       pointVector[2] * lineVector[2];

    // Normalized position along the line
    let t = dotProduct / lineLengthSquared;
    let isProjectedInclude=false;
    if(t>=0 ||t<=1){
        isProjectedInclude=true;
    }


    // Clamp t to the range [0, 1] to handle points outside the segment
    t = Math.max(0, Math.min(1, t));

    // Calculate the closest point on the line segment
    const closestPoint = [
        x1 + t * lineVector[0],
        y1 + t * lineVector[1],
        z1 + t * lineVector[2],
    ];

    return {
            closestPoint:closestPoint,
            isIncluded:isProjectedInclude,
    };
}
export function betweenAngle(vectorA, vectorB) {
    if (vectorA.length !== 3 || vectorB.length !== 3) {
        throw new Error("Both vectors must have exactly 3 elements.");
    }

    // Dot product of vectorA and vectorB
    let dotProduct = vectorA[0] * vectorB[0] + vectorA[1] * vectorB[1] + vectorA[2] * vectorB[2];

    // Magnitudes of vectorA and vectorB
    const magnitudeA = Math.sqrt(vectorA[0] ** 2 + vectorA[1] ** 2 + vectorA[2] ** 2);
    const magnitudeB = Math.sqrt(vectorB[0] ** 2 + vectorB[1] ** 2 + vectorB[2] ** 2);

    // Prevent division by zero
    if (magnitudeA === 0 || magnitudeB === 0) {
        throw new Error("Magnitude of one of the vectors is zero. Cannot calculate angle.");
    }
    if(magnitudeA * magnitudeB<dotProduct ){
        dotProduct=magnitudeA * magnitudeB
    }
    // Calculate the angle in radians
    const angleRadians = Math.acos(dotProduct / (magnitudeA * magnitudeB));

    // Convert to degrees if needed
    const angleDegrees = (angleRadians * 180) / Math.PI;
    // console.log('radian');
    // console.log(vectorA);
    // console.log(vectorB);
    // console.log(magnitudeA * magnitudeB);
    // console.log(dotProduct);
    
    
    // console.log(angleRadians);
    

    return { radians: angleRadians, degrees: angleDegrees };
}

// Example usage:
