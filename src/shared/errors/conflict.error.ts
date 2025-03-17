import { BaseError } from "./base.error";

export class ConflictError extends BaseError {
    constructor(message: string) {
        super({
            name: "ConflictError",
            message: message,
            status: 409
        });

        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}