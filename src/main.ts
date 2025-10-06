import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Device } from './entities/device.entity';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const DEMO_EMAIL = 'demo@aube.app';

async function seed(app: any) {
  const ds = app.get(DataSource);
  const users = ds.getRepository(User);
  const devices = ds.getRepository(Device);

  let u = await users.findOne({ where: { email: DEMO_EMAIL } });
  if (!u) {
    const hash = await bcrypt.hash('demo', 10);
    u = users.create({ email: DEMO_EMAIL, passwordHash: hash });
    u = await users.save(u);
    console.log(`Compte démo: ${u.email} / demo`);
  }

  const count = await devices.count({ where: { owner: { id: u.id } } });
  if (count === 0) {
    const lampe1 = devices.create({
      name: 'Lampe Chambre',
      owner: u,
      targetLux: 120,
      apiKey: randomUUID(),
    });
    const lampe2 = devices.create({
      name: 'Lampe Salon',
      owner: u,
      targetLux: 150,
      apiKey: randomUUID(),
    });

    await devices.save([lampe1, lampe2]);
    console.log('Lampes démo créées :');
    console.log(`Lampe Chambre → id=${lampe1.id} apiKey=${lampe1.apiKey}`);
    console.log(`Lampe Salon   → id=${lampe2.id} apiKey=${lampe2.apiKey}`);
  } else {
    const existing = await devices.find({ where: { owner: { id: u.id } } });
    console.log('Lampes déjà existantes :');
    existing.forEach((d) =>
      console.log(`→ ${d.name} id=${d.id} apiKey=${d.apiKey || '(none)'}`),
    );
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  await app.init();
  await seed(app);
  await app.listen(3000, '0.0.0.0');
  console.log('API http://localhost:3000');
}
bootstrap();
