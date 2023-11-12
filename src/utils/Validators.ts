class Validator {
    static validateEmail(email: string): boolean {
        const emailRegex = /\S+@\S+\.\S+/;
        return emailRegex.test(email);
    }

    static validatePhoneNumber(phoneNumber: string): boolean {
        const phoneRegex = /^\+?[0-9]{10,14}$/;
        return phoneRegex.test(phoneNumber);
    }

    static validatePassword(password: string): boolean {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        return passwordRegex.test(password);
    }

    static validateMeterNumber(meterNumber: string): boolean {
        const meterRegex = /^[0-9]{11}$/;
        return meterRegex.test(meterNumber);
    }
}

export default Validator;