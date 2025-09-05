import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MessageReadAttributes {
  id: number;
  message_id: number;
  user_id: number;
  read_at: Date;
}

interface MessageReadCreationAttributes extends Optional<MessageReadAttributes, 'id' | 'read_at'> {}

class MessageRead extends Model<MessageReadAttributes, MessageReadCreationAttributes> implements MessageReadAttributes {
  public id!: number;
  public message_id!: number;
  public user_id!: number;
  public read_at!: Date;
}

MessageRead.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    message_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    read_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'message_reads',
    timestamps: false,
  }
);

export default MessageRead;
