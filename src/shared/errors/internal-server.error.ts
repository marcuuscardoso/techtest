import { BaseError } from "./base.error";

export class InternalServerError extends BaseError {
    constructor(message: string) {
        super({
            name: "InternalServerError",
            message: message,
            status: 500
        });

        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
}