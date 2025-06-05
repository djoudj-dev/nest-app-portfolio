import { NotFoundException } from '@nestjs/common';

export class CvNotFoundException extends NotFoundException {
  constructor(cvId?: string) {
    super(cvId ? `CV avec l'ID ${cvId} non trouvé` : 'CV non trouvé');
  }
}
