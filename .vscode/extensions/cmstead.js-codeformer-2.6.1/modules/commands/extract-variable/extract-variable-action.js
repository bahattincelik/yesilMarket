const { asyncPrepareActionSetup } = require('../../action-setup');
const { buildExtractionPath } = require('../../extraction-utils/ExtractionPathBuilder');
const { buildInfoMessage, parseAndShowMessage } = require('../../ui-services/messageService');
const { validateUserInput } = require('../../validatorService');
const { openSelectList } = require('../../ui-services/inputService');
const { transformLocationToRange } = require('../../edit-utils/textEditTransforms');

const {
    selectExtractionLocation,
    retrieveExtractionLocation,
    buildCopyLocation,
    buildInsertionLocation
} = require('../../extraction-utils/extraction-location-service');

const {
    buildExtractionScopeList,
    selectExtractionScopes,
    acceptableNodeTypes,
    buildVariableDeclaration,
    getSourceSelection
} = require('./extract-variable');
const { last } = require('../../core-utils');
const { wrapJsxExpression } = require('../../react-service');
const { insertSnippet } = require('../../edit-utils/snippet-service');


function selectExtractionPoint(
    extractionScopeList,
    extractionPath
) {
    return openSelectList({
        values: extractionScopeList,
        title: 'Extract variable to where?'
    })

        .then(function (selectedScope) {
            validateUserInput({
                value: selectedScope,
                validator: (selectedScope) => selectedScope !== null,
                message: buildInfoMessage('Scope not selected; cannot extract variable')
            });

            return selectExtractionScopes(extractionPath, selectedScope);
        });
}

function extractVariable() {
    let actionSetup = null;
    let sourceSelection = null;

    let extractionPath = null;
    let extractionScopeList = null;

    let extractionLocation = null;

    let variableDeclaration = null;

    return asyncPrepareActionSetup()
        .then(function (newActionSetup) {
            actionSetup = newActionSetup;
            sourceSelection = getSourceSelection(actionSetup.source, actionSetup.location);

            extractionPath = buildExtractionPath(actionSetup.selectionPath, acceptableNodeTypes);
            extractionScopeList = buildExtractionScopeList(extractionPath);
        })

        .then(() => selectExtractionPoint(
            extractionScopeList,
            extractionPath
        ))
        .then((extractionPoint) =>
            extractionLocation = retrieveExtractionLocation(extractionPoint))


        .then(() => buildVariableDeclaration({
            variableName: '${1:newVariableName}',
            source: sourceSelection
        }))
        .then((newVariableDeclaration) =>
            variableDeclaration = newVariableDeclaration)

        .then(() => {
            const selectedNode = last(actionSetup.selectionPath)
            const variableNameString = wrapJsxExpression(selectedNode, '$1');

            const extractionPoint = selectExtractionLocation(actionSetup.selectionPath, extractionLocation);
            const copyLocation = buildCopyLocation(extractionPoint, actionSetup.location);
            const insertionLocation = buildInsertionLocation(extractionPoint, actionSetup.location);

            const copiedSource = getSourceSelection(actionSetup.source, copyLocation);
            
            const snippetText = `${variableDeclaration}\n${copiedSource}${variableNameString}`;
            const insertionRange = transformLocationToRange(insertionLocation);

            return insertSnippet(snippetText, insertionRange);
        })

        .then(() => 'Tab to select next input, escape to exit')

        .catch(function (error) {
            parseAndShowMessage(error);
        });
}


module.exports = {
    extractVariable
}