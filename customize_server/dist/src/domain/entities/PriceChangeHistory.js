"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceUpdateTarget = exports.PriceChangeStatus = exports.PriceValueType = exports.PriceChangeType = void 0;
var PriceChangeType;
(function (PriceChangeType) {
    PriceChangeType["INCREASE"] = "INCREASE";
    PriceChangeType["DECREASE"] = "DECREASE";
})(PriceChangeType || (exports.PriceChangeType = PriceChangeType = {}));
var PriceValueType;
(function (PriceValueType) {
    PriceValueType["PERCENTAGE"] = "PERCENTAGE";
    PriceValueType["FIXED"] = "FIXED";
})(PriceValueType || (exports.PriceValueType = PriceValueType = {}));
var PriceChangeStatus;
(function (PriceChangeStatus) {
    PriceChangeStatus["COMPLETED"] = "COMPLETED";
    PriceChangeStatus["ROLLED_BACK"] = "ROLLED_BACK";
    PriceChangeStatus["FAILED"] = "FAILED";
})(PriceChangeStatus || (exports.PriceChangeStatus = PriceChangeStatus = {}));
var PriceUpdateTarget;
(function (PriceUpdateTarget) {
    PriceUpdateTarget["ITEMS"] = "ITEMS";
    PriceUpdateTarget["MODIFIERS"] = "MODIFIERS";
})(PriceUpdateTarget || (exports.PriceUpdateTarget = PriceUpdateTarget = {}));
