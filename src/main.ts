import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Device } from './entities/device.entity';

const DEMO_EMAIL = 'demo@aube.app';

async function seed(app: any) {
  const ds = app.get(DataSource);
  const userRepo = ds.getRepository(User);
  const deviceRepo = ds.getRepository(Device);

  // Crée un utilisateur de test si inexistant
  let user = await userRepo.findOne({ where: { email: DEMO_EMAIL } });
  if (!user) {
    user = userRepo.create({
      email: DEMO_EMAIL,
      passwordHash: 'demo', // mot de passe en clair pour test uniquement
    });
    user = await userRepo.save(user);
    console.log(`👤 Compte démo créé: ${user.email}`);
  }

  // Crée 2 lampes si aucune
  const count = await deviceRepo.count({ where: { owner: { id: user.id } } });
  if (count === 0) {
    await deviceRepo.save([
      deviceRepo.create({ name: 'Lampe Chambre', owner: user, targetLux: 120 }),
      deviceRepo.create({ name: 'Lampe Salon', owner: user, targetLux: 150 }),
    ]);
    console.log('💡 Lampes démo créées');
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // On initialise l’application
  await app.init();

  // Lancement du seed
  await seed(app);

  // Démarrage du serveur HTTP
  const port = 3000;
  await app.listen(port);
  console.log(`API démarrée sur http://localhost:${port}`);
}

bootstrap();
