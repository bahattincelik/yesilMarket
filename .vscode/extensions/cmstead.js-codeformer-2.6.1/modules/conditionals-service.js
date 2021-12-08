const { getNodeType } = require("./core-utils");
const { getSourceSelection } = require("./source-utilities");

function invertTestExpression(source, testNode) {
    if (getNodeType(testNode) === 'UnaryExpression' && testNode.operator === '!') {
        return getSourceSelection(source, testNode.argument.loc);
    } else {
        const originalExpression = getSourceSelection(source, testNode.loc);

        return `!(${originalExpression})`;
    }
}

module.exports = {
    invertTestExpression
};