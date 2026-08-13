import { Request } from "express";
import { AuthUser } from "./auth.types";

export interface AuthRequest extends Request {
  user?: AuthUser;
  
}