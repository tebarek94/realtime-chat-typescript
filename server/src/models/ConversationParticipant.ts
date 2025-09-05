import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ConversationParticipantAttributes {
  id: number;
  conversation_id: number;
  user_id: number;
  joined_at: Date;
  left_at?: Date;
  is_admin: boolean;
}

interface ConversationParticipantCreationAttributes extends Optional<ConversationParticipantAttributes, 'id' | 'joined_at' | 'left_at' | 'is_admin'> {}

class ConversationParticipant extends Model<ConversationParticipantAttributes, ConversationParticipantCreationAttributes> implements ConversationParticipantAttributes {
  public id!: number;
  public conversation_id!: number;
  public user_id!: number;
  public joined_at!: Date;
  public left_at?: Date;
  public is_admin!: boolean;
}

ConversationParticipant.init(
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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    joined_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    left_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'conversation_participants',
    timestamps: false,
  }
);

export default ConversationParticipant;
