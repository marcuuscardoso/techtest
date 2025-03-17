interface IErrorData {
    name: string;
    message: string;
    status: number;
}

export class BaseError extends Error {
    public status: number;
  
    constructor({ name, message, status }: IErrorData) {
        super(message);
  
        this.name = name;
        this.status = status;
  
        Object.setPrototypeOf(this, new.target.prototype);
    }
}