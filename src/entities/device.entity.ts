import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Alarm } from './alarm.entity';
import { Telemetry } from './telemetry.entity';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column()
  name: string;

  @Column({ type: 'float', default: 120 })
  targetLux: number;

  @ManyToOne(() => User, (u) => u.devices, { eager: true })
  owner: User;

  @OneToMany(() => Alarm, (a) => a.device)
  alarms: Alarm[];

  @OneToMany(() => Telemetry, (t) => t.device, { cascade: false })
  telemetry?: Telemetry[];

  @Column({ unique: true })
  apiKey: string;
}
