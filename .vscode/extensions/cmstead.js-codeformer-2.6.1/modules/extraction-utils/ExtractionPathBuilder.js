const astNodeTypes = require('../constants/ast-node-types');
const { last, reverse, getNodeType } = require('../core-utils');

const {
    BLOCK_STATEMENT,
    PROGRAM
} = astNodeTypes;

class ExtractionPath {
    constructor() {
        this.path = [];
    }

    toArray() {
        return this.path.slice(0);
    }

    insertNodeSet(nodeSet) {
        if (nodeSet !== null) {
            this.path.push(nodeSet.toArray());
        }
    }
}

class NodeSet {
    constructor(node) {
        this.nodeSet = [node];
    }

    toArray() {
        return this.nodeSet.slice(0);
    }

    addNode(node) {
        this.nodeSet.push(node);
    }
}

class ExtractionPathBuilder {
    constructor(nodePath, acceptableNodeTypes) {
        this.acceptableNodeTypes = acceptableNodeTypes;

        this.extractionPath = new ExtractionPath();
        this.currentNodeSet = null;

        this.reversedNodePath = reverse(nodePath);
    }

    updateExtractionPath(nodeSet) {
        this.extractionPath.insertNodeSet(nodeSet);
    }

    resetCurrentNodeSet() {
        this.currentNodeSet = null;
    }

    createNodeSet(node) {
        return new NodeSet(node);
    }

    updateExtractionPathAndResetNodeSet() {
        this.updateExtractionPath(this.currentNodeSet);
        this.resetCurrentNodeSet();
    }

    buildExtractionPath(customTerminalNodeTypes = []) {
        this.reversedNodePath.forEach(node => {
            const seekingParentNode = this.currentNodeSet !== null;
            const nodeTypeIsAcceptable = this.acceptableNodeTypes.includes(getNodeType(node));
            const nodeTypeNotAcceptable = !nodeTypeIsAcceptable;

            if (nodeTypeNotAcceptable) {
                this.updateExtractionPathAndResetNodeSet();
            }

            if (
                getNodeType(node) === PROGRAM
                || customTerminalNodeTypes.includes(getNodeType(node))
            ) {
                this.updateExtractionPath(this.createNodeSet(node));
            } else if (getNodeType(node) === BLOCK_STATEMENT) {
                this.currentNodeSet = this.createNodeSet(node);
            } else if (seekingParentNode && nodeTypeIsAcceptable) {
                this.currentNodeSet.addNode(node);
            }
        });

        return this.extractionPath;
    }
}

function buildExtractionPath(
    nodePath,
    acceptableNodeTypes,
    customTerminalNodeTypes = []
) {
    return new ExtractionPathBuilder(nodePath, acceptableNodeTypes)
        .buildExtractionPath(customTerminalNodeTypes)
        .toArray()
        .filter(extractionNode => 
            getNodeType(last(extractionNode)) !== astNodeTypes.BLOCK_STATEMENT);
}

module.exports = {
    ExtractionPathBuilder,
    buildExtractionPath
};
