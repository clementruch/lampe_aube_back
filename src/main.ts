import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Device } from './entities/device.entity';
import * as bcrypt from 'bcrypt';

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
    await devices.save(devices.create({ name: 'Lampe Chambre', owner: u, targetLux: 120 }));
    await devices.save(devices.create({ name: 'Lampe Salon', owner: u, targetLux: 150 }));
    console.log('Lampes démo créées');
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  await app.init();
  await seed(app);
  await app.listen(3000);
  console.log('API http://localhost:3000');
}
bootstrap();
