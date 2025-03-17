import { BaseError } from "./base.error";

export class UnauthorizedError extends BaseError {
    constructor(message: string) {
        super({
            name: "UnauthorizedError",
            message: message,
            status: 401
        });

        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}