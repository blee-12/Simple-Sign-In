// error specifications for clarity in router logic
// please use in db level operations for expected errors

// generic error type
export class HttpError extends Error {

    constructor(message: string, public statusCode: number) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;

        //guarantee instanceof HttpError checks will work for subclasses
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

// inheriting custom errors

// invalid input (validation error)
export class BadInputError extends HttpError {
    constructor(message: string) { super(message, 400); }
}
// no valid credentials
export class UnauthenticatedError extends HttpError {
    constructor(message: string) { super(message, 401); }
}
// credentials but access not allowed
export class UnauthorizedError extends HttpError {
    constructor(message: string) { super(message, 403); }
}
// valid request but resource nowhere to be found
export class NotFoundError extends HttpError {
    constructor(message: string) { super(message, 404); }
}