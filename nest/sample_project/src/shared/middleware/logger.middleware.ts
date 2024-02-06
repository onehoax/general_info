import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class LoggerMiddleWare implements NestMiddleware {
  private onStart(req: Request, res: Response): void {
    res.locals.startTime = Date.now();
    const { method, originalUrl } = req;
    const userAgent = req.get("user-agent") ?? "";

    Logger.debug(`Starting: ${method} ${originalUrl} ${userAgent}`);
  }

  private onFinish(req: Request, res: Response): void {
    const { method, originalUrl } = req;
    const { statusCode, statusMessage } = res;
    const responseTime = Date.now() - res.locals.startTime;

    Logger.debug(
      `Finishing: ${method} ${originalUrl} ${statusCode} ${statusMessage} - ${responseTime}ms`,
    );
  }

  public use(req: Request, res: Response, next: NextFunction): void {
    this.onStart(req, res);
    res.on("finish", () => this.onFinish(req, res));
    next();
  }
}
