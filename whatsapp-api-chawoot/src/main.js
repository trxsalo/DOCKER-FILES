"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var bot_1 = require("@builderbot/bot");
var bot_2 = require("@builderbot/bot");
var provider_baileys_1 = require("@builderbot/provider-baileys");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var _a = process.env, PORT = _a.PORT, NUMBER = _a.NUMBER, TOKEN = _a.TOKEN;
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var adapterFlow, adapterProvider, adapterDB, _a, handleCtx, httpServer;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                adapterFlow = (0, bot_1.createFlow)([]);
                adapterProvider = (0, bot_1.createProvider)(provider_baileys_1.BaileysProvider);
                adapterDB = new bot_2.MemoryDB();
                return [4 /*yield*/, (0, bot_1.createBot)({
                        flow: adapterFlow,
                        provider: adapterProvider,
                        database: adapterDB,
                    })];
            case 1:
                _a = _c.sent(), handleCtx = _a.handleCtx, httpServer = _a.httpServer;
                adapterProvider.server.get('/hello', handleCtx(function (bot, req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var authHeader, e_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                authHeader = req.headers["authorization"].trim();
                                // Verifica si el token existe y es válido
                                if (!authHeader || authHeader !== "Bearer ".concat(TOKEN)) {
                                    return [2 /*return*/, res.end('Unauthorized: Invalid token')];
                                }
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, (bot === null || bot === void 0 ? void 0 : bot.sendMessage(NUMBER, "API FUNCIONANDO", {}))];
                            case 2:
                                _a.sent();
                                return [2 /*return*/, res.end('Enviado')];
                            case 3:
                                e_1 = _a.sent();
                                console.log(e_1);
                                return [2 /*return*/, res.end('Error')];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); }));
                adapterProvider.server.post("/send-message", handleCtx(function (bot, req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var authHeader, _a, number, message, urlMedia, error_1;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                authHeader = req.headers["authorization"];
                                if (!authHeader || authHeader !== "Bearer ".concat(TOKEN)) {
                                    return [2 /*return*/, res.end('Unauthorized: Invalid token')];
                                }
                                _a = req.body, number = _a.number, message = _a.message, urlMedia = _a.urlMedia;
                                _b.label = 1;
                            case 1:
                                _b.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, (bot === null || bot === void 0 ? void 0 : bot.sendMessage(number, message, { media: urlMedia !== null && urlMedia !== void 0 ? urlMedia : null }))];
                            case 2:
                                _b.sent();
                                return [2 /*return*/, res.end('Enviado')];
                            case 3:
                                error_1 = _b.sent();
                                console.error("Error sending message:", error_1);
                                return [2 /*return*/, res.end('Error')];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); }));
                adapterProvider.on('host', function (_a) {
                    var phone = _a.phone;
                    setTimeout(function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, adapterProvider.sendMessage(phone, "Chat me \"hello\" or \"hi =>\" ".concat(new Date().getTime()), {})];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }, 8000);
                });
                httpServer((_b = Number(PORT)) !== null && _b !== void 0 ? _b : 3000);
                return [2 /*return*/];
        }
    });
}); };
main();
