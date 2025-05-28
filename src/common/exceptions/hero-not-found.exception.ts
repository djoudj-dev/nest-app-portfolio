import { NotFoundException } from '@nestjs/common';

export class HeroNotFoundException extends NotFoundException {
  constructor(heroId?: string) {
    super(heroId ? `Héro avec l'ID ${heroId} non trouvé` : 'Héro non trouvé');
  }
}
