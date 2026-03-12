// To run:
// cd backend
// npx ts-node src/scripts/createAdmin.ts
import mongoose from "mongoose";

import UserModel from "../models/user";
import { firebaseAdminAuth } from "../util/firebase";

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI!);

  const firebaseUser = await firebaseAdminAuth.createUser({
    email: "<test@gmail.com>",
    password: "password",
  });

  const user = await UserModel.create({
    _id: firebaseUser.uid,
    firstName: "Admin",
    lastName: "User",
    personalEmail: "<test@gmail.com>",
    meemliEmail: "<test@gmail.com>",
    phoneNumber: "1234567890",
    admin: true,
  });

  console.info("Admin created:", user);
  process.exit();
}

void createAdmin();
