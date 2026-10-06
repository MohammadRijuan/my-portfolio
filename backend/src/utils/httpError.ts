/** Throw this from a controller/service to answer with a specific status and message: `{ error: message }`. */
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
