"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeightUnit = exports.ParcelType = exports.Priority = exports.Status = void 0;
var Status;
(function (Status) {
    Status["REQUESTED"] = "REQUESTED";
    Status["APPROVED"] = "APPROVED";
    Status["DISPATCHED"] = "DISPATCHED";
    Status["IN_TRANSIT"] = "IN_TRANSIT";
    Status["DELIVERED"] = "DELIVERED";
    Status["CANCELED"] = "CANCELED";
    Status["BLOCKED"] = "BLOCKED";
})(Status || (exports.Status = Status = {}));
var Priority;
(function (Priority) {
    Priority["LOW"] = "LOW";
    Priority["NORMAL"] = "NORMAL";
    Priority["HIGH"] = "HIGH";
    Priority["URGENT"] = "URGENT";
})(Priority || (exports.Priority = Priority = {}));
var ParcelType;
(function (ParcelType) {
    ParcelType["DOCUMENT"] = "DOCUMENT";
    ParcelType["PACKAGE"] = "PACKAGE";
    ParcelType["FRAGILE"] = "FRAGILE";
    ParcelType["PERISHABLE"] = "PERISHABLE";
})(ParcelType || (exports.ParcelType = ParcelType = {}));
var WeightUnit;
(function (WeightUnit) {
    WeightUnit["KG"] = "KG";
    WeightUnit["LB"] = "LB";
    WeightUnit["G"] = "G";
})(WeightUnit || (exports.WeightUnit = WeightUnit = {}));
