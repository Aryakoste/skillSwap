const sequelize = require('../config/db');
const User = require('./User');
const Request = require('./Request');
const Endorsement = require('./Endorsement');
const Post = require('./Post');
const Message = require('./Message');
const ChatGroup = require('./ChatGroup');
const GroupMember = require('./GroupMember');

// User <-> Request
User.hasMany(Request, { foreignKey: 'userId', as: 'requests' });
Request.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Request <-> User (Accepted By)
User.hasMany(Request, { foreignKey: 'acceptedById', as: 'acceptedRequests' });
Request.belongsTo(User, { foreignKey: 'acceptedById', as: 'acceptedBy' });

// User <-> Endorsement (Received)
User.hasMany(Endorsement, { foreignKey: 'receiverId', as: 'receivedEndorsements' });
Endorsement.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// User <-> Endorsement (Given)
User.hasMany(Endorsement, { foreignKey: 'giverId', as: 'givenEndorsements' });
Endorsement.belongsTo(User, { foreignKey: 'giverId', as: 'giver' });

// User <-> Post
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Message (Sent)
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// User <-> Message (Received - for Direct Messages)
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// ChatGroup Relationships
User.hasMany(ChatGroup, { foreignKey: 'createdById', as: 'createdGroups' });
ChatGroup.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

// User <-> ChatGroup (Many-to-Many for Group Members)
User.belongsToMany(ChatGroup, { through: GroupMember, foreignKey: 'userId', as: 'chatGroups' });
ChatGroup.belongsToMany(User, { through: GroupMember, foreignKey: 'groupId', as: 'members' });

// ChatGroup <-> Message
ChatGroup.hasMany(Message, { foreignKey: 'groupId', as: 'messages' });
Message.belongsTo(ChatGroup, { foreignKey: 'groupId', as: 'group' });

// Request <-> Message (Service-connected chats)
Request.hasMany(Message, { foreignKey: 'serviceRequestId', as: 'messages' });
Message.belongsTo(Request, { foreignKey: 'serviceRequestId', as: 'serviceRequest' });

const Skill = require('./Skill');

module.exports = { sequelize, User, Request, Endorsement, Post, Message, ChatGroup, GroupMember, Skill };
