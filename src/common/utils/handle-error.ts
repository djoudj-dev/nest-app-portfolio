import { InternalServerErrorException } from '@nestjs/common';

export function handleError(context: string, error: unknown): never {
  if (error instanceof Error) {
    throw new InternalServerErrorException(`${context} : ${error.message}`);
  }

  throw new InternalServerErrorException(`${context} : Erreur inattendue`);
}
