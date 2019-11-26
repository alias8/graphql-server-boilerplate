import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  PrimaryColumn
} from "typeorm";
import uuidv4 from "uuid/v4";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column("varchar", { length: 255 })
  email: string;

  @Column("text")
  password: string;

  @BeforeInsert()
  addID() {
    this.id = uuidv4();
  }
}
