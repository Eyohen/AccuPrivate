"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomToken = void 0;
function generateRandomToken() {
    return `${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`;
}
exports.generateRandomToken = generateRandomToken;
