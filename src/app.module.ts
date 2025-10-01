import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3310),
        username: config.get<string>('DB_USER', 'root'),
        password: config.get<string>('DB_PASS', 'root'),
        database: config.get<string>('DB_NAME', 'lampe_aube'),
        autoLoadEntities: true,
        synchronize: true, // ⚠️ uniquement en dev
      }),
    }),
  ],
})
export class AppModule {}
