import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../../../common/errors';

// higher order wrapper to resolve promise rejections caused by errors in async routes
// express by default does not resolve errors thrown by async functions
export const asyncRoute = (fn: Function) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next)

// error middleware logic
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {

	// serve HTTP response based on error code
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ error: err.message })
  }

  console.error(err)
  return res.status(500).json({ error: "Internal server error" })
}

// require auth for protected routes
export function requireAuth(
	req: Request,
	res: Response,
	next: NextFunction
) {
	if (!req.session || !req.session._id) {
		return res.status(401).json({ error: "You must be logged in to access this resource" })
	}
	return next()
}