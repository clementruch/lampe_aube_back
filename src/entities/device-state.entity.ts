import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Device } from './device.entity';

@Entity('device_states')
export class DeviceState {
  @PrimaryGeneratedColumn('uuid') id: string;

  @OneToOne(() => Device, { onDelete: 'CASCADE', eager: true })
  @JoinColumn()
  device: Device;

  @Column({ default: false }) power: boolean;
  @Column('float', { default: 0.4 }) brightness: number;   // 0..1
  @Column('float', { default: 3200 }) colorTemp: number;   // K

  @UpdateDateColumn() updatedAt: Date;
}
