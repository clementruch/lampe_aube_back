import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Device } from './device.entity';

@Entity('telemetry')
export class Telemetry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Device, (d) => d.telemetry, {
    onDelete: 'CASCADE',
    eager: false,
    nullable: false,
  })
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @Column('float', { nullable: true })
  lux: number | null;

  @Column('float', { nullable: true })
  temp: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
