import {GridElement} from "./GridElement.js";
import {GridActionCollectElement} from "./GridActionCollectElement.js";

class GridElementCollect extends GridElement.extend({
    showLabels: [Boolean],
    imageHeightPercentage: [Number],
    mode: [String],
    singleLine: [Boolean]
}) {
    constructor(props) {
        props = props || {};
        props.showLabels = true;
        props.singleLine = true;
        props.imageHeightPercentage = 85;
        props.mode = GridElementCollect.MODE_AUTO;
        props.type = GridElement.ELEMENT_TYPE_COLLECT;
        props.actions = props.actions || [new GridActionCollectElement({action: GridActionCollectElement.COLLECT_ACTION_SPEAK})]
        super(props);
    }
}

GridElementCollect.MODE_AUTO = 'MODE_AUTO';
GridElementCollect.MODE_COLLECT_SEPARATED = 'MODE_COLLECT_SEPARATED';
GridElementCollect.MODE_COLLECT_TEXT = 'MODE_COLLECT_TEXT';
GridElementCollect.MODES = [GridElementCollect.MODE_AUTO, GridElementCollect.MODE_COLLECT_SEPARATED, GridElementCollect.MODE_COLLECT_TEXT];

export {GridElementCollect};