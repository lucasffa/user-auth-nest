import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomLoggerService extends Logger implements LoggerService {
    constructor(private readonly configService: ConfigService) {
        super();
    }

    private isDevelopment(): boolean {
        return this.configService.get<string>('NODE_ENV') === 'development';
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

            const formattedLog = `[${context}] [${method}] [${logPayload.requesterUuid}] | params: ${JSON.stringify(logPayload.params)} | queries: ${JSON.stringify(logPayload.query)} | body: ${JSON.stringify(logPayload.body)}`;

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

            const formattedLog = `[${context}] [${method}] [${logPayload.requesterUuid}] | params: ${JSON.stringify(logPayload.params)} | queries: ${JSON.stringify(logPayload.query)} | body: ${JSON.stringify(logPayload.body)} | error: ${logPayload.error}`;

            this.error(formattedLog);
        }
    }

    logService(context: string, message: string): void {
        if (this.isDevelopment()) {
            const logPayload = {
                timestamp: new Date().toISOString(),
                context,
                message,
            };

            const formattedLog = `[${context}] | ${message}`;
            this.log(formattedLog);
        }
    }

    errorService(context: string, message: string, error: any): void {
        if (this.isDevelopment()) {
            const logPayload = {
                timestamp: new Date().toISOString(),
                context,
                message,
                error: error.message,
            };

            const formattedLog = `[${context}] | ${message} | error: ${error.message}`;
            this.error(formattedLog);
        }
    }
}
