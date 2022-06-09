import $ from '../../externals/jquery.js';
import {imageUtil} from "../../util/imageUtil";
import {i18nService} from "../i18nService.js";
import {constants} from "../../util/constants.js";

let arasaacService = {};

let _lastChunkSize = 10;
let _lastChunkNr = 1;
let _lastSearchTerm = null;
let _lastRawResultList = null;
let _hasNextChunk = false;
let _lastOptions = null;

let searchProviderInfo = {
    name: "ARASAAC",
    url: "https://arasaac.org/",
    options: [
        {
            name: "plural",
            type: constants.OPTION_TYPES.BOOLEAN,
            value: false
        },
        {
            name: "color",
            type: constants.OPTION_TYPES.BOOLEAN,
            value: true
        },
        {
            name: "backgroundColor",
            type: constants.OPTION_TYPES.COLOR,
            value: undefined
        },
        {
            name: "action",
            type: constants.OPTION_TYPES.SELECT,
            value: undefined,
            options: ["past", "future"]
        },
        {
            name: "skin",
            type: constants.OPTION_TYPES.SELECT,
            value: undefined,
            options: ["white", "black", "assian", "mulatto", "aztec"]
        },
        {
            name: "hair",
            type: constants.OPTION_TYPES.SELECT,
            value: undefined,
            options: ["blonde", "brown", "darkBrown", "gray", "darkGray", "red", "black"]
        },
        {
            name: "identifier",
            type: constants.OPTION_TYPES.SELECT,
            value: undefined,
            options: ["classroom", "health", "library", "office"]
        },
        {
            name: "identifierPosition",
            type: constants.OPTION_TYPES.SELECT,
            value: undefined,
            options: ["left", "right"]
        },
    ]
}


arasaacService.getSearchProviderInfo = function () {
    let newInfo = JSON.parse(JSON.stringify(searchProviderInfo));
    newInfo.service = arasaacService;
    return newInfo;
}

/**
 * searches for images
 *
 * @param search the keyword to use for searching
 * @param chunkNr the chunk number to return, "1" means elements [0..chunkSize-1] are returned, "2" means
 *        elements [chunkSize..2*chunkSize-1] are returned.
 * @param chunkSize the number of elements that are returned in one bunch
 * @return list of search result objects with the following properties:
 *         element.base64 ... base64 encoded data string representing the image
 *         element.promise ... a promise that resolves as soon as element.base64 is available
 *         element.failed ... is 'true' is retrieving of base64 data failed
 *         element.author ... name of the author of the image
 *         additional all properties that are received from opensymbols.org API are available: https://www.opensymbols.org/api/v1/symbols/search?q=test
 */
arasaacService.query = function (search, options) {
    _lastOptions = options;
    return queryInternal(search, 1, _lastChunkSize);
};

/**
 * retrieves the next chunk of images for a search that was previously done by arasaacService.query()
 * @return same as arasaacService.query()
 */
arasaacService.nextChunk = function () {
    _lastChunkNr++;
    return queryInternal(_lastSearchTerm, _lastChunkNr, _lastChunkSize);
};

/**
 * returns true if there is a next chunk available that can be retrieved via arasaacService.nextChunk()
 *
 * @return {boolean}
 */
arasaacService.hasNextChunk = function () {
    return _hasNextChunk;
};

function queryInternal(search, chunkNr, chunkSize) {
    chunkSize = chunkSize || _lastChunkSize;
    chunkNr = chunkNr || 1;
    let queriedElements = [];
    return new Promise(resolve => {
        if (!search) {
            return resolve([]);
        }
        if (_lastSearchTerm !== search) {
            let url = `https://api.arasaac.org/api/pictograms/${i18nService.getCurrentLang()}/search/${search}`;
            $.get(url, null, function (resultList) {
                _lastRawResultList = resultList;
                processResultList(resultList);
            }, 'json').fail(() => {
                processResultList([]);
            });
        } else {
            processResultList(_lastRawResultList);
        }

        function processResultList(resultList) {
            if (!resultList || !resultList.length || resultList.length === 0) {
                resultList = [];
            }
            let startIndex = (chunkNr * chunkSize) - chunkSize;
            let endIndex = startIndex + chunkSize - 1;
            _hasNextChunk = resultList.length > (endIndex + 1);
            let paramSuffix = '';
            _lastOptions.forEach(option => {
                if (option.value !== undefined) {
                    paramSuffix += `&${option.name}=${encodeURIComponent(option.value)}`
                }
            });
            for (let i = startIndex; i <= endIndex; i++) {
                if (resultList[i]) {
                    let element = JSON.parse(JSON.stringify(resultList[i]));
                    element.promise = imageUtil.urlToBase64(`https://api.arasaac.org/api/pictograms/${element._id}?download=false${paramSuffix}`, 500, 'image/png');
                    element.promise.then((base64) => {
                        if (base64) {
                            element.base64 = base64;
                        } else {
                            element.failed = true;
                        }
                    });
                    queriedElements.push(element);
                }
            }
            _lastSearchTerm = search;
            resolve(queriedElements);
        }
    });
}


export {arasaacService};