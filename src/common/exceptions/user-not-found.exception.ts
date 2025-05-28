import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor(userId?: string) {
    super(
      userId
        ? `Utilisateur avec l'ID ${userId} non trouvé`
        : 'Utilisateur non trouvé',
    );
  }
}
