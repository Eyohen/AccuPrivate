"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Validator {
    static validateEmail(email) {
        const emailRegex = /\S+@\S+\.\S+/;
        return emailRegex.test(email);
    }
    static validatePhoneNumber(phoneNumber) {
        const phoneRegex = /^\+?[0-9]{10,14}$/;
        return phoneRegex.test(phoneNumber);
    }
    static validatePassword(password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        return passwordRegex.test(password);
    }
    static validateMeterNumber(meterNumber) {
        const meterRegex = /^[0-9]{11}$/;
        return meterRegex.test(meterNumber);
    }
    static validateUrl(url) {
        const urlRegex = /^(http|https):\/\/[^ "]+$/;
        return urlRegex.test(url);
    }
}
exports.default = Validator;
