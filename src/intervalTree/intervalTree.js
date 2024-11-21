 export class Interval {
    constructor(start, end, valueStart=null, valueEnd=null) {
      this.start = start;         // The start of the interval
      this.end = end;             // The end of the interval
      this.valueStart = valueStart; // The value at the start of the interval
      this.valueEnd = valueEnd;   // The value at the end of the interval
      this.maxEnd = end;          // The maximum end in the subtree
      this.left = null;
      this.right = null;
    }
  }
  
  export class IntervalTree {
    constructor(defaultInterval=null) {
      this.root = null;
      this.defaultValue=defaultInterval;
    }
  
    // Rotate the tree left
    rotateLeft(node) {
      let rightChild = node.right;
      node.right = rightChild.left;
      if (rightChild.left) rightChild.left.parent = node;
      rightChild.parent = node.parent;
      if (!node.parent) {
        this.root = rightChild;
      } else if (node === node.parent.left) {
        node.parent.left = rightChild;
      } else {
        node.parent.right = rightChild;
      }
      rightChild.left = node;
      node.parent = rightChild;
      
      // Update maxEnd values
      node.maxEnd = Math.max(node.end, node.left ? node.left.maxEnd : -Infinity, node.right ? node.right.maxEnd : -Infinity);
      rightChild.maxEnd = Math.max(rightChild.end, rightChild.left ? rightChild.left.maxEnd : -Infinity, rightChild.right ? rightChild.right.maxEnd : -Infinity);
    }
  
    // Rotate the tree right
    rotateRight(node) {
      let leftChild = node.left;
      node.left = leftChild.right;
      if (leftChild.right) leftChild.right.parent = node;
      leftChild.parent = node.parent;
      if (!node.parent) {
        this.root = leftChild;
      } else if (node === node.parent.right) {
        node.parent.right = leftChild;
      } else {
        node.parent.left = leftChild;
      }
      leftChild.right = node;
      node.parent = leftChild;
      
      // Update maxEnd values
      node.maxEnd = Math.max(node.end, node.left ? node.left.maxEnd : -Infinity, node.right ? node.right.maxEnd : -Infinity);
      leftChild.maxEnd = Math.max(leftChild.end, leftChild.left ? leftChild.left.maxEnd : -Infinity, leftChild.right ? leftChild.right.maxEnd : -Infinity);
    }
  
    // Insert a new interval into the tree
    insert(interval) {
      const newNode = new Interval(interval.start, interval.end, interval.valueStart, interval.valueEnd);
      if (!this.root) {
        this.root = newNode;
        return;
      }
      
      let currentNode = this.root;
      while (true) {
        currentNode.maxEnd = Math.max(currentNode.maxEnd, interval.end);
        
        if (interval.start < currentNode.start) {
          if (!currentNode.left) {
            currentNode.left = newNode;
            newNode.parent = currentNode;
            break;
          } else {
            currentNode = currentNode.left;
          }
        } else {
          if (!currentNode.right) {
            currentNode.right = newNode;
            newNode.parent = currentNode;
            break;
          } else {
            currentNode = currentNode.right;
          }
        }
      }
    }
  
    // Interpolation function to get value within an interval
    interpolate(interval, x) {
      if (x < interval.start || x > interval.end) {
        throw new Error('x is out of the interval bounds');
      }
  
      // Linear interpolation formula
      let y =[0,0]
      y[0] = interval.valueStart[0] + ((x - interval.start) / (interval.end - interval.start)) * (interval.valueEnd[0] - interval.valueStart[0]);
      y[1] = interval.valueStart[1] + ((x - interval.start) / (interval.end - interval.start)) * (interval.valueEnd[1] - interval.valueStart[1]);

       return y;
    }
  
    // Query intervals that overlap with a given point (x)
    query(root, x) {
      let results = [];
      if (!root) return results;
  
      // Check if the query point lies within the current node's interval
      if (x >= root.start && x <= root.end) {
        results.push({ interval: root, interpolatedValue: this.interpolate(root, x) });
      }
  
      // If left child exists and its maxEnd is greater than or equal to x, search left
      if (root.left && root.left.maxEnd >= x) {
        results = results.concat(this.query(root.left, x));
      }
  
      // Always search the right child
      if (root.right && x >= root.start) {
        results = results.concat(this.query(root.right, x));
      }
  
      return results;
    }
    delete(interval) {
        this.root = this._deleteNode(this.root, interval);
    }
    
    _deleteNode(node, interval) {
        if (!node) return null;
    
        // Locate the node to delete
        if (interval.start < node.start) {
            node.left = this._deleteNode(node.left, interval);
        } else if (interval.start > node.start) {
            node.right = this._deleteNode(node.right, interval);
        } else if (interval.end === node.end && interval.valueStart === node.valueStart && interval.valueEnd === node.valueEnd) {
            // Node found and matches the interval
    
            // Case 1: Node has no children
            if (!node.left && !node.right) {
                return null;
            }
    
            // Case 2: Node has one child
            if (!node.left) return node.right;
            if (!node.right) return node.left;
    
            // Case 3: Node has two children
            let minLargerNode = this._getMin(node.right);
            node.start = minLargerNode.start;
            node.end = minLargerNode.end;
            node.valueStart = minLargerNode.valueStart;
            node.valueEnd = minLargerNode.valueEnd;
            node.right = this._deleteNode(node.right, minLargerNode);
        } else {
            node.right = this._deleteNode(node.right, interval);
        }
    
        // Update maxEnd after deletion
        node.maxEnd = Math.max(
            node.end,
            node.left ? node.left.maxEnd : -Infinity,
            node.right ? node.right.maxEnd : -Infinity
        );
    
        return node;
    }
    
    _getMin(node) {
        while (node.left) {
            node = node.left;
        }
        return node;
    }

    getAllIntervals(root) {
        let intervals = [];
        this._inOrderTraversal(root, intervals);
        return intervals;
    }
    
    // Helper function for in-order traversal
    _inOrderTraversal(node, intervals) {
        if (!node) return;
    
        // Traverse left subtree
        this._inOrderTraversal(node.left, intervals);
        
        // Visit current node
        intervals.push(node);
        
        // Traverse right subtree
        this._inOrderTraversal(node.right, intervals);
    }
    
    
  }



  
//   // Example usage
//   const tree = new IntervalTree();
  
//   // Insert intervals with start, end, and boundary values
//   tree.insert(new Interval(1, 5, 10, 20)); // Interval [1, 5] with values 10 at the start and 20 at the end
//   tree.insert(new Interval(6, 10, 25, 30)); // Interval [6, 10] with values 25 at the start and 30 at the end
  
//   // Query for interpolated values
//   const x = 3; // Query point
//   const results = tree.query(tree.root, x);
  
//   console.log(`Interpolated values at x = ${x}:`);
//   results.forEach(result => {
//     const interpolatedValue = result.interpolatedValue;
//     console.log(`Interval [${result.interval.start}, ${result.interval.end}] has value: ${interpolatedValue}`);
//   });
  