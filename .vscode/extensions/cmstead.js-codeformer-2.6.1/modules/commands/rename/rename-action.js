const { asyncPrepareActionSetup } = require("../../action-setup");
const { IDENTIFIER, METHOD_DEFINITION, ASSIGNMENT_PATTERN } = require("../../constants/ast-node-types");
const { getNodeType, first, last } = require("../../core-utils");
const { splitOnAllLocations, compareLocations } = require("../../edit-utils/location-service");
const { insertSnippet } = require("../../edit-utils/snippet-service");
const { transformLocationToRange } = require("../../edit-utils/textEditTransforms");
const { buildCopyLocation, buildInsertionLocation } = require("../../extraction-utils/extraction-location-service");
const { getAllSourceSelections } = require("../../source-utilities");
const { buildInfoMessage, parseAndShowMessage } = require("../../ui-services/messageService");
const { validateUserInput } = require("../../validatorService");
const {
    getSurroundingScope,
    selectReplacementLocations,
    findSymbolToRename,
    getVariableDeclaratorLocation
} = require("./rename");

function getDeclaratorName(declarator) {
    const nodeType = getNodeType(declarator);

    if (nodeType === IDENTIFIER) {
        return declarator.name;
    } else if (nodeType === METHOD_DEFINITION) {
        return declarator.key.name;
    } else if (nodeType === ASSIGNMENT_PATTERN) {
        return declarator.left.name;
    }

    return declarator.id.name;
}

function locationsMatch(sourceLocation, testLocation) {
    return sourceLocation.start.line === testLocation.start.line
        && sourceLocation.start.column === testLocation.start.column
        && sourceLocation.end.line === testLocation.end.line
        && sourceLocation.end.column === testLocation.end.column;
}

function getDeclaratorElement(declaratorNode) {
    if (getNodeType(declaratorNode) === ASSIGNMENT_PATTERN) {
        return declaratorNode.left;
    }

    return declaratorNode;
}

function rename() {
    let actionSetup = null;
    let variableDeclarator = null;
    let surroundingScope = null;
    let replacementLocations = null;

    let originalName = null;

    return asyncPrepareActionSetup()
        .then((newActionSetup) =>
            actionSetup = newActionSetup)

        .then(() =>
            findSymbolToRename(actionSetup.selectionPath))
        .then((variableDeclarator) => validateUserInput({
            value: variableDeclarator,
            validator: (variableDeclarator) => variableDeclarator !== null,
            message: buildInfoMessage('No variable declaration selected, cannot rename')
        }))
        .then((newVariableDeclarator) => {
            variableDeclarator = newVariableDeclarator
        })

        .then(() => originalName = getDeclaratorName(variableDeclarator))

        .then(() =>
            getSurroundingScope(actionSetup.selectionPath, variableDeclarator))
        .then((newSurroundingScope) =>
            surroundingScope = newSurroundingScope)

        .then(() =>
            selectReplacementLocations(surroundingScope, getDeclaratorElement(variableDeclarator)))
        .then((newReplacementLocations) => {
            replacementLocations = newReplacementLocations
            replacementLocations.reverse();
        })

        .then(() => {
            let variableNameLocation = getVariableDeclaratorLocation(variableDeclarator);
            const variableNotInReplacements = !replacementLocations
                .find((location) =>
                    locationsMatch(location, variableNameLocation));

            if (variableDeclarator.shorthand) {
                variableNameLocation.shorthand = true;
            }

            if (variableNotInReplacements) {
                replacementLocations.unshift(variableNameLocation);
            }

            replacementLocations.sort(compareLocations);

            const tabStops = replacementLocations.map((location) => {
                const stopString = locationsMatch(variableNameLocation, location)
                    ? `\${1:${originalName}}`
                    : `$1`;

                return location.shorthand
                    ? `${originalName}: ${stopString}`
                    : stopString
            });

            const copyLocation = buildCopyLocation(
                first(replacementLocations),
                last(replacementLocations)
            );

            const locationPartitions = splitOnAllLocations(copyLocation, replacementLocations);

            const snippetLocations = locationPartitions.slice(0, locationPartitions.length - 1);
            const snippetPartitions = getAllSourceSelections(actionSetup.source, snippetLocations);

            const snippetText = snippetPartitions.reduce((finalText, section, index) => {
                return finalText + section + tabStops[index];
            }, '');

            const insertLocation = buildInsertionLocation(
                first(replacementLocations),
                last(replacementLocations)
            );

            const insertRange = transformLocationToRange(insertLocation);

            insertSnippet(snippetText, insertRange);
        })

        .then(() => 'Press tab or escape to exit')

        .catch(function (error) {
            parseAndShowMessage(error);
        });
}

module.exports = {
    rename
};