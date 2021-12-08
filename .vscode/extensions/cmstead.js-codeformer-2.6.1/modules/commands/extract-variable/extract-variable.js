const { getSourceSelection } = require('../../source-utilities');
const { selectExtractionLocation } = require('../../extraction-utils/extraction-location-service');

const {
    buildExtractionScopeList,
    selectExtractionScopes
} = require('./variableExtractionScopeService');

const astNodeTypes = require('../../constants/ast-node-types');
const { getNewVariableBuilder, variableTypes } = require('../../builders/VariableBuilder');

const acceptableNodeTypes = [
    astNodeTypes.FUNCTION_DECLARATION,
    astNodeTypes.ARROW_FUNCTION_EXPRESSION,
    astNodeTypes.FUNCTION_EXPRESSION,
    astNodeTypes.FUNCTION,
    astNodeTypes.IF_STATEMENT,
    astNodeTypes.FOR_STATEMENT,
    astNodeTypes.FOR_IN_STATEMENT,
    astNodeTypes.WHILE_STATEMENT,
    astNodeTypes.DO_WHILE_STATEMENT,
    astNodeTypes.METHOD_DEFINITION
];

const acceptableVariableTypes = variableTypes;

const variableTypeList = Object
    .keys(acceptableVariableTypes)
    .map(key => acceptableVariableTypes[key]);

function buildVariableDeclaration({
    variableName,
    source
}) {
    return getNewVariableBuilder({
        type: variableTypes.SELECT,
        name: variableName,
        value: source
    }).buildVariableDeclaration();
}

module.exports = {
    acceptableNodeTypes,
    acceptableVariableTypes,
    buildExtractionScopeList,
    buildVariableDeclaration,
    selectExtractionScopes,
    selectExtractionLocation,
    getSourceSelection,
    variableTypeList
};