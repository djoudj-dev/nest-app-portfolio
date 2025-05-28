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