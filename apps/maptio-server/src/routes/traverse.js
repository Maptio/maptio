function traverse(node, callback) {
  if (node.children) {
    node.children.forEach(function (child) {
      callback.apply(this, [child]);
      traverse(child, callback);
    });
  }
}

function getDepth(dataset) {
  console;
  var depth = 0;
  if (dataset.initiative) {
    traverse(dataset.initiative, function (node) {
      depth++;
    });
  }

  return depth;
}

module.exports = getDepth;
