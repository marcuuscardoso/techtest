import { BaseError } from "./base.error";

export class NotFoundError extends BaseError {
    constructor(message: string) {
        super({
            name: "NotFoundError",
            message: message,
            status: 404
        });

        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}