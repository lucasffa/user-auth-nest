import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import * as clc from 'cli-color';

@Injectable()
export class CustomLoggerService extends Logger implements LoggerService {
    constructor(private readonly configService: ConfigService) {
        super();
    }

    private isDevelopment(): boolean {
        return this.configService.get<string>('NODE_ENV') === 'development';
    }

    private formatLog(context: string, method: string, requesterUuid: string, params: any, query: any, body: any): string {
        return `${clc.yellow(`[${context}]`)} ${clc.cyan(`[${method}]`)} ${clc.magenta(`[${requesterUuid}]`)} | params: ${JSON.stringify(params)} | queries: ${JSON.stringify(query)} | body: ${JSON.stringify(body)}`;
    }

    logRequest(req: Request, context: string, method: string): void {
        if (this.isDevelopment()) {
            const { user, body, params, query, originalUrl } = req;

            const logPayload = {
                timestamp: new Date().toISOString(),
                context,
                method,
                url: originalUrl,
                requesterUuid: user?.uuid,
                params,
                query,
                body,
            };

            const formattedLog = this.formatLog(context, method, logPayload.requesterUuid, logPayload.params, logPayload.query, logPayload.body);

            this.log(formattedLog);
        }
    }

    errorRequest(req: Request, context: string, method: string, error: any): void {
        if (this.isDevelopment()) {
            const { user, body, params, query, originalUrl } = req;

            const logPayload = {
                timestamp: new Date().toISOString(),
                context,
                method,
                url: originalUrl,
                requesterUuid: user?.uuid,
                params,
                query,
                body,
                error: error.message,
            };

            const formattedLog = this.formatLog(context, method, logPayload.requesterUuid, logPayload.params, logPayload.query, logPayload.body);

            this.error(formattedLog);
        }
    }

    logService(context: string, message: string): void {
        if (this.isDevelopment()) {
            const formattedLog = `${clc.yellow(`[${context}]`)} | ${message}`;
            this.log(formattedLog);
        }
    }

    errorService(context: string, message: string, error: any): void {
        if (this.isDevelopment()) {
            const formattedLog = `${clc.yellow(`[${context}]`)} | ${message} | error: ${error.message}`;
            this.error(formattedLog);
        }
    }
}
