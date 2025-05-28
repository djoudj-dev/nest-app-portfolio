import { NotFoundException } from '@nestjs/common';

export class CvNotFoundException extends NotFoundException {
  constructor(heroId?: string) {
    super(
      heroId
        ? `CV pour le héro avec l'ID ${heroId} non trouvé`
        : 'CV non trouvé',
    );
  }
}
