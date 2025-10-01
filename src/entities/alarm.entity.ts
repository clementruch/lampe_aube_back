import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Device } from './device.entity';

@Entity('alarms')
export class Alarm {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Device, (d) => d.alarms, { onDelete: 'CASCADE' })
  device: Device;

  @Column('int') hour: number; // 0..23
  @Column('int') minute: number; // 0..59
  @Column({ type: 'simple-array', default: '' })
  days: number[]; // 1..7 (Lu..Di)
  @Column('int', { default: 15 }) durationMinutes: number;
  @Column({ default: true }) enabled: boolean;
}
