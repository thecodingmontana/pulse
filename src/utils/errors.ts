export class PublicError extends Error {}

export class AuthenticationError extends PublicError {
  constructor() {
    super("You must be logged in to view this content");
    this.name = "AuthenticationError";
  }
}

export class EmailInUseError extends PublicError {
  constructor() {
    super("Email is already in use");
    this.name = "EmailInUseError";
  }
}

export class EmailNotInUseError extends PublicError {
  constructor() {
    super("Email not found");
    this.name = "EmailNotInUseError";
  }
}

export class NotFoundError extends PublicError {
  constructor() {
    super("Resource not found");
    this.name = "NotFoundError";
  }
}

export class TokenExpiredError extends PublicError {
  constructor() {
    super("Token has expired");
    this.name = "TokenExpiredError";
  }
}

export class LoginError extends PublicError {
  constructor() {
    super("Invalid email or password");
    this.name = "LoginError";
  }
}

export class InvalidCredentialsError extends Error {
  constructor(message = "Invalid credentials provided") {
    super(message);
    this.name = "InvalidCredentialsError";
  }
}

export class ExpiredCodeError extends Error {
  constructor(message = "The unique code has expired. Please request a new one.") {
    super(message);
    this.name = "ExpiredCodeError";
  }
}

export class SessionError extends Error {
  constructor(message = "Failed to create session") {
    super(message);
    this.name = "SessionError";
  }
}
