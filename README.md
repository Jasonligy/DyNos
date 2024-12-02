1.implement interval tree(interpolation, now the interval must correspond to the appears)
2. visualize the trajectory in the cube
3.convert the coordinate system to fit the webgl
3.add function force
注意node position overlap的情况
上是y轴正方向
右是x轴正方向
前是z轴正方向
check postprocessing and premove



The possible way of improvement:
1. maintain TimeStraighting as the runtime is O(b)
2. Changing the node repulsion and edge contraction using matrix parallel computation


questions:
1. can first placement avoid the crossing
2. mirrorline为什么是interval data,
3. How the locator using multilevel structure tracking lines that inside the desired distance.




the difference between the original implementation and js:
1. the mirrorline of each dyNode in the original code is stored using interval tree but in js implementation using list.



the constriant output maybe either single value or a map
need to do the constriant with temperature update
