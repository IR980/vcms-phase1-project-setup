// import { Request, Response, NextFunction } from "express";
// import { ZodError, ZodTypeAny } from "zod";

// import { ApiError } from "../utils/ApiError";

// export const validateBody =
//   (schema: ZodTypeAny) =>
//   (req: Request, _res: Response, next: NextFunction) => {
//     try {
//       req.body = schema.parse(req.body);

//       next();
//     } catch (error) {
//       if (error instanceof ZodError) {
//         return next(new ApiError(400, "Validation failed", error.flatten()));
//       }

//       next(error);
//     }
//   };
// export default validateBody;
import { Request, Response, NextFunction } from "express";
import { ZodError, ZodTypeAny } from "zod";
import { ApiError } from "../utils/ApiError";

export const validateBody =
  (schema: ZodTypeAny) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (!parsed.success) {
        console.log("========== ZOD ERROR ==========");
        console.dir(parsed.error.flatten(), { depth: null });
        console.log("========== REQUEST BODY ==========");
        console.dir(req.body, { depth: null });

        return next(
          new ApiError(
            400,
            "Validation failed",
            parsed.error.flatten()
          )
        );
      }

      // parsed.data is typed as unknown by Zod when using ZodTypeAny.
      // Narrow it to a known shape before accessing properties.
      const data = parsed.data as {
        body?: unknown;
        params?: Record<string, unknown>;
        query?: Record<string, unknown>;
      };

      req.body = (data.body ?? req.body) as any;
      req.params = (data.params ?? req.params) as any;
      req.query = (data.query ?? req.query) as any;

      next();
    } catch (error) {
      next(error);
    }
  };
export default validateBody;