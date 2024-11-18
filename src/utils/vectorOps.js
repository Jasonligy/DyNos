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