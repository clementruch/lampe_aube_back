# Lampe Aube — Backend (NestJS + MySQL)

Ce dépôt contient le **backend Node.js (NestJS)** du projet **Lampe Aube**, une lampe connectée intelligente avec simulation de lever de soleil, suivi des capteurs et gestion des réveils.

Le backend fournit une **API REST** permettant de gérer :
- L’authentification des utilisateurs (login/signup avec JWT)
- Les lampes (ajout, modification, suppression)
- Les contrôles manuels (puissance, couleur, modes Lecture / Relax / Nuit)
- Les réveils (simulation d’aube avec durée paramétrable)
- Les capteurs (température, luminosité)
- Les statistiques (moyennes journalières, historiques)

## Technologies utilisées

- [NestJS](https://nestjs.com/) (framework backend Node.js)
- [MySQL](https://www.mysql.com/) (base de données)
- [TypeORM](https://typeorm.io/) (ORM pour gérer les entités)
- [JWT](https://jwt.io/) (authentification sécurisée)
