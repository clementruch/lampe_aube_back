import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, Index } from 'typeorm';
import { Device } from './device.entity';

@Entity('telemetry')
export class Telemetry {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index()
  @ManyToOne(() => Device, { onDelete: 'CASCADE', eager: false })
  device: Device;

  @Column('float') lux: number;
  @Column('float') temp: number;

  @CreateDateColumn() createdAt: Date;
}
