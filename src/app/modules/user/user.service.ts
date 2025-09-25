import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IsActive, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { userSearchableFields } from "./user.constants";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "../../utils/jwt";

// import { deleteImageFromCloudinary } from "../../config/cloudinary.config";

const createUser = async (payload: Partial<IUser>, token?: string) => {
  const { email, password, role, ...rest } = payload;
  const isUserExists = await User.findOne({ email });
  let currentUser = null;

  if (role === Role.ADMIN) {
    if (!token) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Authorization token required to create admin!"
      );
    }

    const verifiedToken = verifyToken(
      token,
      envVars.JWT_ACCESS_SECRET
    ) as JwtPayload;
    currentUser = await User.findOne({ email: verifiedToken.email });

    if (!currentUser || currentUser.role !== Role.ADMIN) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Unauthorized to create admin!"
      );
    }
  }

  if (isUserExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exists!!");
  }

  let userRole: Role;

  if (role === Role.ADMIN) {
    userRole = Role.ADMIN;
  } else if (role === Role.SENDER || role === Role.RECEIVER) {
    userRole = role;
  } else if (role === Role.DELIVERY_PERSONNEL) {
    userRole = Role.PENDING_DELIVERY;
  } else {
    userRole = Role.SENDER;
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const user = await User.create({
    email,
    password: hashedPassword,
    role: userRole,
    isVerified: true,
    auths: [authProvider],
    ...rest,
  });

  return user;
};

const updateUser = async (
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  const userId = decodedToken.userId;

  if (!userId) {
    throw new AppError(401, "Unauthorized");
  }

  const ifUserExist = await User.findById(userId);
  if (!ifUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  if (payload.email) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can't change your email address"
    );
  }

  if ("password" in payload) {
    delete payload.password;
  }

  if (payload.role) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You are not allowed to change your role"
    );
  }
  // if(payload.picture && ifUserExist.picture){
  //     await deleteImageFromCloudinary(ifUserExist.picture)
  // }

  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return updatedUser;
};

const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);
  const usersData = queryBuilder
    .filter()
    .search(userSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    usersData.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};
const getSingleUser = async (id: string) => {
  const user = await User.findById(id).select("-password");
  return {
    data: user,
  };
};
const deleteUser = async (id: string) => {
  const user = await User.deleteOne({ _id: id });
  return {
    data: user,
  };
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  return {
    data: user,
  };
};

const blockUser = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not Exists!!");
  }

  if (user.isActive === IsActive.INACTIVE) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is InActive!!");
  }

  if (user.isActive === IsActive.BLOCKED) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already blocked!!");
  }
  if (user.role === Role.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "you can't block admin!!");
  }

  const blockUser = await User.findByIdAndUpdate(
    userId,
    { $set: { isActive: IsActive.BLOCKED } },
    { new: true }
  ).select("-password");

  return blockUser;
};

const unblockUser = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not Exists!!");
  }

  if (user.isActive === IsActive.INACTIVE) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is InActive!!");
  }

  if (user.isActive === IsActive.ACTIVE) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already Active!!");
  }

  const unblockUser = await User.findByIdAndUpdate(
    userId,
    { $set: { isActive: IsActive.ACTIVE } },
    { new: true }
  ).select("-password");

  return unblockUser;
};

const senderList = async () => {
  const senders = await User.find({ role: "SENDER" }).select("name email _id");
  return senders;
};

const receiverList = async () => {
  const receivers = await User.find({ role: "RECEIVER" }).select(
    "name email _id"
  );
  return receivers;
};

const submitNid = async (Payload: Partial<IUser>, userId: string) => {
  const { nidNumber, nidImage } = Payload;
  const user = await User.findByIdAndUpdate(
    userId,
    { nidNumber, nidImage },
    { new: true }
  );
  return user;
};
const approveDeliveryPersonnels = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    return new AppError(httpStatus.BAD_REQUEST, "User not Exists!");
  }
  if (!user.nidImage) {
    return new AppError(httpStatus.NOT_FOUND, "Nid not Submitted yet!");
  }

  const approvedUser = await User.findByIdAndUpdate(
    userId,
    { role: Role.DELIVERY_PERSONNEL },
    { new: true, runValidators: true }
  );

  return approvedUser;
};
export const getAllDeliveryPersonnels = async (
  query: Record<string, string>
) => {
  const queryBuilder = new QueryBuilder(
    User.find({ role: Role.DELIVERY_PERSONNEL }).select("-password"),
    query
  );
  const deliveryPersons = queryBuilder
    .filter()
    .search(userSearchableFields)
    .sort()
    .fields()
    .paginate();
  const [data, meta] = await Promise.all([
    deliveryPersons.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};
export const getAllPendingDeliveryPersonnels = async (
  query: Record<string, string>
) => {
  const queryBuilder = new QueryBuilder(
    User.find({ role: Role.PENDING_DELIVERY }).select("-password"),
    query
  );
  const pendingDeliveryPersons = queryBuilder
    .filter()
    .search(userSearchableFields)
    .sort()
    .fields()
    .paginate();
  const [data, meta] = await Promise.all([
    pendingDeliveryPersons.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

export const UserServices = {
  createUser,
  updateUser,
  getAllUsers,
  getSingleUser,
  deleteUser,
  getMe,
  blockUser,
  unblockUser,
  senderList,
  receiverList,
  submitNid,
  approveDeliveryPersonnels,
  getAllDeliveryPersonnels,
  getAllPendingDeliveryPersonnels,
};
