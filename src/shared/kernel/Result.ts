export type Ok<T> = { ok: true; value: T };
export type Err<E = Error> = { ok: false; error: E };
export type Result<T, E = Error> = Ok<T> | Err<E>;

export const Result = {
  ok<T>(value: T): Ok<T> { return { ok: true, value }; },
  err<E = Error>(error: E): Err<E> { return { ok: false, error }; }
};
