import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../../../common/errors';
import axios from 'axios';

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

// ---- Email Logic ----

const ENDPOINT = "https://api.smtp2go.com/v3/email/send";

// IMPORTANT NOTE
// The API seems to wait until the email is actually sent
// This call could take several seconds to resolve
export async function sendEmail(to: string, subject: string, text_body: string) {
  const req = {
    api_key: process.env.EMAIL_API_KEY,
    sender: process.env.EMAIL_ADDRESS,
    to: to,
    subject: subject,
    text_body: text_body
  }
  return await axios.post(ENDPOINT, req);
}