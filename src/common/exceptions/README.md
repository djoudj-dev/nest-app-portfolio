# Système de Gestion des Exceptions

Ce dossier contient un système complet de gestion des exceptions pour l'application NestJS.

## Structure

- `all-exceptions.filter.ts` : Filtre global qui capture toutes les exceptions et les formate de manière uniforme
- `http-exception.filter.ts` : Filtre qui capture spécifiquement les exceptions HTTP
- `user-not-found.exception.ts` : Exception personnalisée pour les utilisateurs non trouvés
- `hero-not-found.exception.ts` : Exception personnalisée pour les héros non trouvés
- `cv-not-found.exception.ts` : Exception personnalisée pour les CV non trouvés
- `index.ts` : Exporte toutes les exceptions et filtres pour faciliter l'importation

## Utilisation

### Filtres d'Exception

Le filtre global `AllExceptionsFilter` est déjà configuré dans `main.ts` pour capturer toutes les exceptions lancées par l'application. Il n'est pas nécessaire de l'appliquer manuellement.

### Exceptions Personnalisées

Pour utiliser les exceptions personnalisées dans vos services ou contrôleurs :

```typescript
import { UserNotFoundException, HeroNotFoundException, CvNotFoundException } from '../common/exceptions';

// Dans une méthode de service ou de contrôleur
if (!user) {
  throw new UserNotFoundException(userId);
}

if (!hero) {
  throw new HeroNotFoundException(heroId);
}

if (!hero.cvPath) {
  throw new CvNotFoundException(heroId);
}

if (!fs.existsSync(hero.cvPath)) {
  throw new CvNotFoundException();
}
```

### Exceptions NestJS Natives

Vous pouvez également utiliser les exceptions HTTP natives de NestJS :

```typescript
import { 
  BadRequestException, 
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException 
} from '@nestjs/common';

// Exemples d'utilisation
throw new BadRequestException('Données invalides');
throw new UnauthorizedException('Non autorisé');
throw new ForbiddenException('Accès interdit');
throw new NotFoundException('Ressource non trouvée');
throw new ConflictException('Conflit de données');
throw new InternalServerErrorException('Erreur serveur');
```

## Format de Réponse

Toutes les exceptions sont formatées de manière uniforme avec la structure suivante :

```json
{
  "statusCode": 404,
  "message": "Utilisateur non trouvé",
  "timestamp": "2023-06-15T10:30:45.000Z",
  "path": "/api/users/123"
}
```

## Création de Nouvelles Exceptions Personnalisées

Pour créer une nouvelle exception personnalisée, suivez ce modèle :

```typescript
import { NotFoundException } from '@nestjs/common';

export class CustomNotFoundException extends NotFoundException {
  constructor(resourceId?: string) {
    super(
      resourceId
        ? `Ressource avec l'ID ${resourceId} non trouvée`
        : 'Ressource non trouvée'
    );
  }
}
```

N'oubliez pas d'ajouter l'exportation dans `index.ts` :

```typescript
export * from './custom-not-found.exception';
```
