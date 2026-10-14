var layoutInfo = {
    startTab: "none",
    startNavTab: "tree-tab",
	showTree: true,

    // Act 1's tree. Act 2 has its own tree, opened from the "Life" node.
    treeLayout: [["p"], ["at", "gr"], ["st", "fu", "pl"], ["ga", "de", "hz", "bh"]]

    
}


// A "ghost" layer which offsets other layers in the tree
addNode("blank", {
    layerShown: "ghost",
}, 
)


addLayer("tree-tab", {
    tabFormat: [["tree", function() {return (layoutInfo.treeLayout ? layoutInfo.treeLayout : TREE_LAYERS)}]],
    previousTab: "",
    leftTab: true,
})