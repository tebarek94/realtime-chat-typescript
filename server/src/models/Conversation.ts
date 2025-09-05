import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ConversationAttributes {
  id: number;
  name?: string;
  type: 'direct' | 'group';
  created_by?: number;
  created_at: Date;
  updated_at: Date;
}

interface ConversationCreationAttributes extends Optional<ConversationAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Conversation extends Model<ConversationAttributes, ConversationCreationAttributes> implements ConversationAttributes {
  public id!: number;
  public name?: string;
  public type!: 'direct' | 'group';
  public created_by?: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Conversation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('direct', 'group'),
      allowNull: false,
      defaultValue: 'direct',
    },
    created_by: {
      type: DataTypes.INTEGER,
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
    tableName: 'conversations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Conversation;
