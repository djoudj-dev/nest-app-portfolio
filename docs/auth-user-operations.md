# Opérations d'Authentification et de Gestion des Utilisateurs

Ce document décrit toutes les opérations d'authentification et de gestion des utilisateurs disponibles dans l'API.

## URLs de Base

- Authentification: `/auth`
- Utilisateur: `/user`

## Modèle de Données

Une entité Utilisateur contient les champs suivants :

| Champ           | Type   | Description                                       |
|-----------------|--------|---------------------------------------------------|
| id              | string | Identifiant unique (généré automatiquement)       |
| email           | string | Adresse email de l'utilisateur (unique)           |
| password        | string | Mot de passe de l'utilisateur (hashé)             |
| role            | string | Rôle de l'utilisateur                             |
| accessToken     | string | Token d'accès JWT (optionnel)                     |
| refreshToken    | string | Token de rafraîchissement (optionnel)             |
| refreshTokenExp | Date   | Date d'expiration du token de rafraîchissement    |

## Points d'Accès API

### Authentification

#### Connexion

**Point d'accès:** `POST /auth/login`

**Description:** Authentifie un utilisateur et génère un token d'accès.

**Corps de la Requête:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Remarque:** Le mot de passe doit contenir au moins 6 caractères.

**Réponse:** Renvoie un token d'accès.

**Exemple:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Déconnexion

**Point d'accès:** `POST /auth/logout`

**Description:** Déconnecte l'utilisateur en invalidant tous ses tokens d'accès et de rafraîchissement.

**Authentification:** Requiert un token JWT valide.

**Réponse:** Renvoie un message de confirmation.

**Exemple:**

```json
{
  "message": "Logout successful"
}
```

**Remarque:** Cette opération invalide tous les tokens de l'utilisateur, le déconnectant effectivement de toutes les sessions.

### Gestion des Utilisateurs

#### Inscription

**Point d'accès:** `POST /user/register`

**Description:** Crée un nouvel utilisateur et génère un token d'accès.

**Corps de la Requête:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Remarque:** 
- L'email doit être valide et unique.
- Le mot de passe doit contenir au moins 6 caractères.

**Réponse:** Renvoie l'ID de l'utilisateur, son email et un token d'accès.

**Exemple:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "utilisateur@exemple.com",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Obtenir le Profil Utilisateur

**Point d'accès:** `GET /user/me`

**Description:** Récupère les informations du profil de l'utilisateur actuellement authentifié.

**Authentification:** Requiert un token JWT valide.

**Réponse:** Renvoie l'email, le rôle et l'ID de l'utilisateur.

**Exemple:**

```json
{
  "email": "utilisateur@exemple.com",
  "role": "user",
  "id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Erreur:** Renvoie une erreur 404 Not Found si l'utilisateur n'est pas trouvé.

#### Mettre à Jour le Mot de Passe

**Point d'accès:** `PATCH /user/password`

**Description:** Met à jour le mot de passe de l'utilisateur actuellement authentifié.

**Authentification:** Requiert un token JWT valide.

**Corps de la Requête:**

```json
{
  "newPassword": "string"
}
```

**Remarque:** Le nouveau mot de passe doit contenir au moins 6 caractères.

**Réponse:** Renvoie l'objet utilisateur mis à jour (sans le mot de passe).

**Exemple:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "utilisateur@exemple.com",
  "role": "user",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshTokenExp": "2023-12-31T23:59:59.999Z"
}
```

#### Mettre à Jour le Token de Rafraîchissement

**Point d'accès:** `PATCH /user/refresh-token`

**Description:** Met à jour le token de rafraîchissement de l'utilisateur actuellement authentifié.

**Authentification:** Requiert un token JWT valide.

**Corps de la Requête:**

```json
{
  "token": "string",
  "expires": "2023-12-31T23:59:59.999Z"
}
```

**Réponse:** Renvoie l'objet utilisateur mis à jour (sans le mot de passe).

**Exemple:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "utilisateur@exemple.com",
  "role": "user",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshTokenExp": "2023-12-31T23:59:59.999Z"
}
```
