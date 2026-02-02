import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: Logger = new Logger();

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | any {
    const recordTime = Date.now();
    const requestType = context.getType<GqlContextType>();
    console.log('type:', requestType);
    if (requestType === 'http') {
      /** Develop if needed! **/
    } else if (requestType === 'graphql') {
      /** (1) Print Request **/
      const gqlContext = GqlExecutionContext.create(context);
      this.logger.log(
        `${this.stringify(gqlContext.getContext().req.body)}`,
        'REQUEST',
      );

      /** (2) Errors handling via GrraphQl **/

      /** (3) No Errors, giving Reponse below **/
      return next.handle().pipe(
        tap((context) => {
          const responseTime = Date.now() - recordTime;
          this.logger.log(
            `${this.stringify(context)} - ${responseTime}ms \n\n`,
            'RESPONSE',
          );
        }),
      );
    }
  }
  private stringify(context: ExecutionContext): string {
    return JSON.stringify(context).slice(0, 75);
  }
}
