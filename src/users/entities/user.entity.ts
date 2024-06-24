import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../../common/enums/roles.enum';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    @Exclude()
    password: string;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.PATIENT
    })
    role: Role;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    isDeleted: boolean;

    @Column({ type: 'timestamp', nullable: true })
    lastActiveStatusAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastDeletionAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastLoginAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastLogoutAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastUpdateAt: Date;

    tempPassword: string;

    @BeforeInsert()
    async hashPasswordBeforeInsert() {
        const salt = await bcrypt.genSalt();
        this.password = await bcrypt.hash(this.password, salt);
    }

    @BeforeUpdate()
    async hashPasswordBeforeUpdate() {
        if (this.tempPassword) {
            const salt = await bcrypt.genSalt();
            this.password = await bcrypt.hash(this.tempPassword, salt);
        }
    }

    async validatePassword(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password);
    }

    deactivate() {
        this.isActive = false;
        this.lastActiveStatusAt = new Date();
    }

    activate() {
        this.isActive = true;
        this.isDeleted = false;
        this.lastActiveStatusAt = new Date();
    }

    markAsDeleted() {
        this.isDeleted = true;
        this.deactivate();
        this.lastDeletionAt = new Date();
    }

    setLastLogin() {
        this.lastLoginAt = new Date();
    }

    setLastLogout() {
        this.lastLogoutAt = new Date();
    }
}
