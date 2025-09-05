import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MessageAttributes {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  message_type: 'text' | 'image' | 'file';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  is_edited: boolean;
  edited_at?: Date;
  is_deleted: boolean;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

interface MessageCreationAttributes extends Optional<MessageAttributes, 'id' | 'message_type' | 'is_edited' | 'is_deleted' | 'created_at' | 'updated_at'> {}

class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: number;
  public conversation_id!: number;
  public sender_id!: number;
  public content!: string;
  public message_type!: 'text' | 'image' | 'file';
  public file_url?: string;
  public file_name?: string;
  public file_size?: number;
  public is_edited!: boolean;
  public edited_at?: Date;
  public is_deleted!: boolean;
  public deleted_at?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    message_type: {
      type: DataTypes.ENUM('text', 'image', 'file'),
      defaultValue: 'text',
    },
    file_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_edited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    edited_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Message;
