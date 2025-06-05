import { NotFoundException } from '@nestjs/common';

export class BadgeNotFoundException extends NotFoundException {
  constructor(badgeId?: string) {
    super(
      badgeId ? `Badge avec l'ID ${badgeId} non trouvé` : 'Badge non trouvé',
    );
  }
}
