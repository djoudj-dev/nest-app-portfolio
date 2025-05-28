# Opérations CRUD pour les Héros

Ce document décrit toutes les opérations CRUD (Création, Lecture, Mise à jour, Suppression) disponibles pour l'entité Héro dans l'API.

## URL de Base

Tous les points d'accès sont préfixés par `/heroes`.

## Modèle de Données

Une entité Héro contient les champs suivants :

| Champ           | Type   | Description                                       |
|-----------------|--------|---------------------------------------------------|
| id              | string | Identifiant unique (généré automatiquement)       |
| firstName       | string | Prénom du héro                                    |
| lastName        | string | Nom de famille du héro                            |
| jobTitle        | string | Titre du poste du héro                            |
| jobDescription  | string | Description du travail du héro                    |
| cvPath          | string | Chemin vers le fichier CV du héro (optionnel)     |

## Points d'Accès API

### Créer un Héro

**Point d'accès:** `POST /heroes`

**Description:** Crée un nouveau héro.

**Corps de la Requête:**

```json
{
  "firstName": "string",
  "lastName": "string",
  "jobTitle": "string",
  "jobDescription": "string",
  "cvPath": "string"
}
```

**Remarque:** Le champ `cvPath` est optionnel.

**Réponse:** Renvoie l'objet héro créé.

**Exemple:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "firstName": "John",
  "lastName": "Doe",
  "jobTitle": "Software Engineer",
  "jobDescription": "Develops web applications",
  "cvPath": ""
}
```

### Obtenir Tous les Héros

**Point d'accès:** `GET /heroes`

**Description:** Récupère une liste de tous les héros.

**Réponse:** Renvoie un tableau d'objets héro.

**Exemple:**

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "firstName": "John",
    "lastName": "Doe",
    "jobTitle": "Software Engineer",
    "jobDescription": "Develops web applications",
    "cvPath": ""
  },
  {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "firstName": "Jane",
    "lastName": "Smith",
    "jobTitle": "UX Designer",
    "jobDescription": "Designs user interfaces",
    "cvPath": "uploads/cv-123456.pdf"
  }
]
```

### Obtenir un Héro par ID

**Point d'accès:** `GET /heroes/:id`

**Description:** Récupère un héro spécifique par son ID.

**Paramètres:**
- `id` (paramètre de chemin): L'identifiant unique du héro.

**Réponse:** Renvoie l'objet héro s'il est trouvé.

**Exemple:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "firstName": "John",
  "lastName": "Doe",
  "jobTitle": "Software Engineer",
  "jobDescription": "Develops web applications",
  "cvPath": ""
}
```

**Erreur:** Renvoie une erreur 404 Not Found si le héro avec l'ID spécifié n'existe pas.

### Mettre à Jour un Héro

**Point d'accès:** `PATCH /heroes/:id`

**Description:** Met à jour un héro spécifique par son ID.

**Paramètres:**
- `id` (paramètre de chemin): L'identifiant unique du héro.

**Corps de la Requête:** Tous les champs sont optionnels.

```json
{
  "firstName": "string",
  "lastName": "string",
  "jobTitle": "string",
  "jobDescription": "string",
  "cvPath": "string"
}
```

**Remarque:** Tous les champs dans la requête de mise à jour sont optionnels.

**Réponse:** Renvoie l'objet héro mis à jour.

**Exemple:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "firstName": "John",
  "lastName": "Doe",
  "jobTitle": "Senior Software Engineer",
  "jobDescription": "Develops web applications",
  "cvPath": ""
}
```

**Remarque:** Dans cet exemple, le champ `jobTitle` a été mis à jour.

**Erreur:** Renvoie une erreur 404 Not Found si le héro avec l'ID spécifié n'existe pas.

### Supprimer un Héro

**Point d'accès:** `DELETE /heroes/:id`

**Description:** Supprime un héro spécifique par son ID.

**Paramètres:**
- `id` (paramètre de chemin): L'identifiant unique du héro.

**Réponse:** Renvoie l'objet héro supprimé.

**Exemple:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "firstName": "John",
  "lastName": "Doe",
  "jobTitle": "Software Engineer",
  "jobDescription": "Develops web applications",
  "cvPath": ""
}
```

**Erreur:** Renvoie une erreur 404 Not Found si le héro avec l'ID spécifié n'existe pas.

## Téléchargement de CV

**Point d'accès:** `POST /heroes/upload-cv`

**Description:** Télécharge un fichier CV.

**Requête:** Données de formulaire multipart avec un champ de fichier nommé 'file'.

**Réponse:** Renvoie des informations sur le fichier téléchargé.

**Exemple:**

```json
{
  "filename": "cv-123456.pdf",
  "path": "uploads/cv-123456.pdf",
  "mimetype": "application/pdf"
}
```

## Mise à jour du CV d'un Héro

**Point d'accès:** `PATCH /heroes/:id/cv`

**Description:** Remplace le CV existant d'un héro par un nouveau fichier CV.

**Paramètres:**
- `id` (paramètre de chemin): L'identifiant unique du héro.

**Requête:** Données de formulaire multipart avec un champ de fichier nommé 'file'.

**Réponse:** Renvoie l'objet héro mis à jour avec le nouveau chemin du CV.

**Exemple:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "firstName": "John",
  "lastName": "Doe",
  "jobTitle": "Software Engineer",
  "jobDescription": "Develops web applications",
  "cvPath": "uploads/1234567890-cv.pdf"
}
```

**Erreurs:**
- Renvoie une erreur 404 Not Found si le héro avec l'ID spécifié n'existe pas.
- Renvoie une erreur 400 Bad Request si le fichier n'est pas valide (taille maximale: 5MB, formats acceptés: PDF, DOC, DOCX).

**Remarque:** Cette opération supprime automatiquement l'ancien fichier CV du serveur s'il existe.

## Obtenir les Informations du CV pour Prévisualisation

**Point d'accès:** `GET /heroes/:id/cv`

**Description:** Récupère les informations du fichier CV d'un héro spécifique pour permettre sa prévisualisation côté client.

**Paramètres:**
- `id` (paramètre de chemin): L'identifiant unique du héro.

**Réponse:** Renvoie des informations détaillées sur le fichier CV, y compris l'URL pour accéder au fichier.

**Exemple:**

```json
{
  "filename": "1234567890-cv.pdf",
  "fileUrl": "/uploads/1234567890-cv.pdf",
  "fileType": "pdf",
  "fileSize": 1234567,
  "lastModified": "2023-06-15T10:30:45.000Z",
  "mimetype": "application/pdf"
}
```

**Erreurs:**
- Renvoie une erreur 404 Not Found si le héro avec l'ID spécifié n'existe pas.
- Renvoie une erreur 404 Not Found si le héro n'a pas de CV associé.
- Renvoie une erreur 404 Not Found si le fichier CV n'existe pas sur le serveur.

**Remarque:** L'URL retournée dans `fileUrl` peut être utilisée directement dans un navigateur ou dans un composant de prévisualisation côté client pour afficher le CV.
