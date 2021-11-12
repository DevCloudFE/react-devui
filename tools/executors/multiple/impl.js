"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var devkit_1 = require("@nrwl/devkit");
var rxjs_1 = require("rxjs");
var rxjs_for_await_1 = require("rxjs-for-await");
function multipleExecutor(options, context) {
    var _a;
    return (0, tslib_1.__asyncGenerator)(this, arguments, function multipleExecutor_1() {
        var subject, _loop_1, _b, _c, task, e_1_1;
        var e_1, _d;
        return (0, tslib_1.__generator)(this, function (_e) {
            switch (_e.label) {
                case 0:
                    subject = new rxjs_1.Subject();
                    _loop_1 = function (task) {
                        var iterator;
                        return (0, tslib_1.__generator)(this, function (_f) {
                            switch (_f.label) {
                                case 0: return [4 /*yield*/, (0, tslib_1.__await)((0, devkit_1.runExecutor)(task.targetDescription, (_a = task.options) !== null && _a !== void 0 ? _a : {}, context))];
                                case 1:
                                    iterator = _f.sent();
                                    (function () {
                                        var e_2, _a;
                                        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
                                            var iterator_1, iterator_1_1, res, e_2_1;
                                            return (0, tslib_1.__generator)(this, function (_b) {
                                                switch (_b.label) {
                                                    case 0:
                                                        _b.trys.push([0, 5, 6, 11]);
                                                        iterator_1 = (0, tslib_1.__asyncValues)(iterator);
                                                        _b.label = 1;
                                                    case 1: return [4 /*yield*/, iterator_1.next()];
                                                    case 2:
                                                        if (!(iterator_1_1 = _b.sent(), !iterator_1_1.done)) return [3 /*break*/, 4];
                                                        res = iterator_1_1.value;
                                                        subject.next(res);
                                                        _b.label = 3;
                                                    case 3: return [3 /*break*/, 1];
                                                    case 4: return [3 /*break*/, 11];
                                                    case 5:
                                                        e_2_1 = _b.sent();
                                                        e_2 = { error: e_2_1 };
                                                        return [3 /*break*/, 11];
                                                    case 6:
                                                        _b.trys.push([6, , 9, 10]);
                                                        if (!(iterator_1_1 && !iterator_1_1.done && (_a = iterator_1.return))) return [3 /*break*/, 8];
                                                        return [4 /*yield*/, _a.call(iterator_1)];
                                                    case 7:
                                                        _b.sent();
                                                        _b.label = 8;
                                                    case 8: return [3 /*break*/, 10];
                                                    case 9:
                                                        if (e_2) throw e_2.error;
                                                        return [7 /*endfinally*/];
                                                    case 10: return [7 /*endfinally*/];
                                                    case 11: return [2 /*return*/];
                                                }
                                            });
                                        });
                                    })();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 6, 7, 8]);
                    _b = (0, tslib_1.__values)(options.tasks), _c = _b.next();
                    _e.label = 2;
                case 2:
                    if (!!_c.done) return [3 /*break*/, 5];
                    task = _c.value;
                    return [5 /*yield**/, _loop_1(task)];
                case 3:
                    _e.sent();
                    _e.label = 4;
                case 4:
                    _c = _b.next();
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 8];
                case 6:
                    e_1_1 = _e.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 8];
                case 7:
                    try {
                        if (_c && !_c.done && (_d = _b.return)) _d.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 8: return [5 /*yield**/, (0, tslib_1.__values)((0, tslib_1.__asyncDelegator)((0, tslib_1.__asyncValues)((0, rxjs_for_await_1.eachValueFrom)(subject))))];
                case 9: return [4 /*yield*/, tslib_1.__await.apply(void 0, [_e.sent()])];
                case 10: return [4 /*yield*/, tslib_1.__await.apply(void 0, [_e.sent()])];
                case 11: return [2 /*return*/, _e.sent()];
            }
        });
    });
}
exports.default = multipleExecutor;
