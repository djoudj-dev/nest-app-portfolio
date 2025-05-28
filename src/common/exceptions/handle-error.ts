import {
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  HttpException,
} from '@nestjs/common';

/**
 * Gère les erreurs de manière cohérente dans toute l'application.
 * Associe différents types d'erreurs aux exceptions HTTP appropriées.
 *
 * @param context Le contexte où l'erreur s'est produite (par exemple, 'créer utilisateur')
 * @param error L'erreur qui a été capturée
 * @returns never - Cette fonction lance toujours une exception
 */
export function handleError(context: string, error: unknown): never {
  // Si c'est déjà une exception HTTP, la relancer simplement
  if (error instanceof HttpException) {
    throw error;
  }

  // Gérer les erreurs spécifiques à Prisma
  if (error instanceof Error) {
    const errorMessage = `${context} : ${error.message}`;

    // Vérifier les modèles d'erreur courants
    if (error.message.includes('Unique constraint failed')) {
      throw new ConflictException(
        `${context} : Contrainte d'unicité non respectée`,
      );
    }

    if (
      error.message.includes('Record not found') ||
      (error.message.includes('No ') && error.message.includes(' found'))
    ) {
      throw new NotFoundException(`${context} : Enregistrement non trouvé`);
    }

    if (
      error.message.includes('Invalid') ||
      error.message.includes('validation')
    ) {
      throw new BadRequestException(`${context} : Données invalides`);
    }

    // Par défaut, erreur de serveur interne pour les autres erreurs
    throw new InternalServerErrorException(errorMessage);
  }

  // Pour les erreurs inconnues
  throw new InternalServerErrorException(`${context} : Erreur inattendue`);
}
