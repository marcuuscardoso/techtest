import { BaseError } from "./base.error";

export class TooManyRequestsError extends BaseError {
    constructor(message: string) {
        super({
            name: "TooManyRequestsError",
            message: message,
            status: 429
        });

        Object.setPrototypeOf(this, TooManyRequestsError.prototype);
    }
}