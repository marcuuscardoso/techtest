import { BaseError } from "./base.error";

export class ValidationError extends BaseError {
    constructor(message: string, status?: number) {
        super({
            name: "ValidationError",
            message: message,
            status: status || 400
        });

        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}