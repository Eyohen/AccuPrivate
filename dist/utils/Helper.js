"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeSpacesFromString = exports.generateRandonNumbers = exports.generateRandomString = exports.generateRandomToken = void 0;
function generateRandomToken() {
    return `${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`;
}
exports.generateRandomToken = generateRandomToken;
function generateRandomString(length) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = length; i > 0; --i)
        result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}
exports.generateRandomString = generateRandomString;
function generateRandonNumbers(length) {
    const chars = '0123456789';
    let result = '';
    for (let i = length; i > 0; --i)
        result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}
exports.generateRandonNumbers = generateRandonNumbers;
function removeSpacesFromString(string) {
    return string.replace(/\s/g, '');
}
exports.removeSpacesFromString = removeSpacesFromString;
