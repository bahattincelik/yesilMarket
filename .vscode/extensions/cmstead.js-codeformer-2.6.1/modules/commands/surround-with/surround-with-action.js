const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const jsonc = require('jsonc-parser');

const { asyncPrepareActionSetup } = require('../../action-setup');
const { openSelectList } = require('../../ui-services/inputService');
const { getLanguageSnippetName, getTemplateList, getSnippetText } = require('./surround-with');
const { buildInfoMessage, parseAndShowMessage } = require('../../ui-services/messageService');
const { validateUserInput } = require('../../validatorService');
const { transformLocationToRange } = require('../../edit-utils/textEditTransforms');
const { insertSnippet } = require('../../edit-utils/snippet-service');

const snippetBasePath = '../../../';

function getSnippetFilePath(actionSetup) {
    const snippetName = getLanguageSnippetName(actionSetup.activeTextEditor.document);
    const snippetFileName = `${snippetName}.code-snippets`;
    return path.join(__dirname, snippetBasePath, snippetFileName);

}

function surroundWith() {
    let actionSetup = null;
    let snippetJson = null;

    return asyncPrepareActionSetup()
        .then(function (renderedSetup) {
            actionSetup = renderedSetup;
        })

        .then(function () {
            const snippetFilePath = getSnippetFilePath(actionSetup);

            return promisify(fs.readFile)(snippetFilePath, { encoding: 'utf8' });
        })

        .then(function (snippetJsonText) {
            snippetJson = jsonc.parse(snippetJsonText);
        })

        .then(() => {
            const snippetPath = path.join(__dirname, 'snippets.json');

            return promisify(fs.readFile)(snippetPath, { encoding: 'utf8' });
        })

        .then((sharedSnippetJsonText) => {
            return jsonc.parse(sharedSnippetJsonText);
        })

        .then((sharedSnippets) => {
            snippetJson = {
                ...sharedSnippets,
                ...snippetJson
            };

            return getTemplateList(snippetJson);
        })

        .then((templateList) =>
            openSelectList({
                values: templateList,
                message: 'Surround with which?'
            }))

        .then((selectedOption) => validateUserInput({
            value: selectedOption,
            validator: (selectedOption) => selectedOption !== '',
            message: buildInfoMessage('No surround option selected; cannot surround selection')
        }))

        .then(function (selectedOption) {
            const snippetText = getSnippetText(selectedOption, snippetJson)
            const selectionRange = transformLocationToRange(actionSetup.location);

            return insertSnippet(snippetText, selectionRange);
        })

        .then(() => 'Tab to select next input, escape to exit')

        .catch(function (error) {
            parseAndShowMessage(error);
        });
}

module.exports = {
    surroundWith
};