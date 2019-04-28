

function traverse(node, callback) {
    if (node.children) {
        node.children.forEach(function (child) {
            callback.apply(this, [child]);
            traverse(child, callback);
        });
    }
}

function getDepth(dataset) {
    var depth = 0;
    if (dataset.initiative) {
        traverse(dataset.initiative, function (node) {
            depth++;
        });
    }

    return depth;
}

function linkUsers(dataset, members) {
    if (dataset.initiative) {
        traverse(dataset.initiative, function (node) {
            if (node.accountable) {
                
                let a = members.find(u => u.user_id === node.accountable.user_id);
                if (a) {
                    node.accountable.picture = a.picture;
                    node.accountable.name = a.name;
                    node.accountable.shortid = a.shortid;
                }
            }
            if (node.helpers) {
                
                node.helpers.forEach(helper => {
                    let h = members.find(u => u.user_id === helper.user_id);
                    if (h) {
                        helper.picture = h.picture;
                        helper.name = h.name;
                        helper.shortid = h.shortid;
                    }
                })
            }

        });
    }

    return dataset;
}


module.exports = { getDepth, linkUsers};