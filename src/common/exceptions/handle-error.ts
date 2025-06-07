import { HttpException, HttpStatus, Logger } from '@nestjs/common';

export function handleError(
  context: string,
  error: unknown,
  status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
): never {
  const logger = new Logger('ErreurService');

  let message = `Une erreur est survenue dans ${context}`;

  if (error instanceof Error) {
    message += ` : ${error.message}`;
    logger.error(message, error.stack);
  } else {
    logger.error(`${message} (type inconnu)`, JSON.stringify(error));
  }

  throw new HttpException(
    {
      statusCode: status,
      message: message,
      context,
    },
    status,
  );
}
