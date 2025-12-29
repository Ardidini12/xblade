'use server';

import { connectToDatabase } from "@/database/mongoose";
import User, { UserDocument } from "@/lib/models/user.model";
import { getSession } from "@/lib/actions/auth.actions";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/better-auth/auth";

// Types
export interface UserData {
  id?: string;
  name?: string;
  email: string;
  role?: "admin" | "user";
  gamertag?: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: "admin" | "user" | "all";
  sortBy?: "name" | "email" | "role" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface GetUsersResult {
  success: boolean;
  users?: UserData[];
  total?: number;
  page?: number;
  totalPages?: number;
  error?: string;
}

// Helper function to check if user is admin and get user ID
async function ensureAdmin() {
  const result = await getSession();
  if (!result.success || !result.session?.user) {
    throw new Error("Unauthorized: Please sign in");
  }
  
  const userRole = (result.session.user as { role?: string })?.role;
  if (userRole !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }
  
  // Get the MongoDB user ID by looking up the user by email
  await connectToDatabase();
  const userEmail = result.session.user.email;
  if (!userEmail) {
    throw new Error("User email not found");
  }
  
  const dbUser = await User.findOne({ email: userEmail.toLowerCase().trim() });
  if (!dbUser) {
    throw new Error("User not found in database");
  }
  
  return {
    ...result.session.user,
    id: dbUser._id?.toString() || (dbUser as any).id,
  };
}

// GET: Fetch all users with pagination, search, and filtering
export async function getUsers(params: GetUsersParams = {}): Promise<GetUsersResult> {
  try {
    await ensureAdmin();
    // Note: ensureAdmin already connects to database, but we need to ensure it's connected for the query
    await connectToDatabase();

    const {
      page = 1,
      limit = 10,
      search = "",
      role = "all",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    // Build query
    const query: any = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { gamertag: { $regex: search, $options: "i" } },
      ];
    }

    // Role filter
    if (role !== "all") {
      query.role = role;
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password") // Exclude password
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    // Transform users
    const transformedUsers: UserData[] = users.map((user: any) => ({
      id: user._id?.toString() || user.id,
      name: user.name,
      email: user.email,
      role: user.role || "user",
      gamertag: user.gamertag,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      users: transformedUsers,
      total,
      page,
      totalPages,
    };
  } catch (error) {
    console.error("Get users failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Failed to fetch users: ${message}`,
    };
  }
}

// CHECK: Check if email is available
export async function checkEmailAvailability(
  email: string,
  excludeUserId?: string
): Promise<{
  available: boolean;
  error?: string;
}> {
  try {
    await ensureAdmin();
    await connectToDatabase();

    if (!email || !email.trim()) {
      return { available: true }; // Empty email is handled by form validation
    }

    const normalizedEmail = email.toLowerCase().trim();
    const query: any = { email: normalizedEmail };
    
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }

    const existingUser = await User.findOne(query);
    
    return {
      available: !existingUser,
      error: existingUser
        ? "Email already in use. Each email can only have one account."
        : undefined,
    };
  } catch (error) {
    console.error("Check email availability failed:", error);
    return { available: true }; // Fail open - don't block user on error
  }
}

// CHECK: Check if gamertag is available
export async function checkGamertagAvailability(
  gamertag: string,
  excludeUserId?: string
): Promise<{
  available: boolean;
  error?: string;
}> {
  try {
    await ensureAdmin();
    await connectToDatabase();

    if (!gamertag || !gamertag.trim()) {
      return { available: true }; // Empty gamertag is handled by form validation
    }

    const normalizedGamertag = gamertag.trim();
    const query: any = { gamertag: normalizedGamertag };
    
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }

    const existingUser = await User.findOne(query);
    
    return {
      available: !existingUser,
      error: existingUser
        ? "Gamertag already taken. Each gamertag can only be used once."
        : undefined,
    };
  } catch (error) {
    console.error("Check gamertag availability failed:", error);
    return { available: true }; // Fail open - don't block user on error
  }
}

// GET: Fetch a single user by ID
export async function getUserById(userId: string): Promise<{
  success: boolean;
  user?: UserData;
  error?: string;
}> {
  try {
    await ensureAdmin();
    // Note: ensureAdmin already connects to database
    await connectToDatabase();

    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const transformedUser: UserData = {
      id: user._id?.toString() || (user as any).id,
      name: (user as any).name,
      email: (user as any).email,
      role: (user as any).role || "user",
      gamertag: (user as any).gamertag,
      image: (user as any).image,
      createdAt: (user as any).createdAt,
      updatedAt: (user as any).updatedAt,
    };

    return {
      success: true,
      user: transformedUser,
    };
  } catch (error) {
    console.error("Get user failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Failed to fetch user: ${message}`,
    };
  }
}

// CREATE: Create a new user
export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "user";
  gamertag: string; 
}): Promise<{
  success: boolean;
  user?: UserData;
  error?: string;
}> {
  try {
    await ensureAdmin();
    // Note: ensureAdmin already connects to database
    await connectToDatabase();

    // Validate gamertag is provided
    if (!data.gamertag || !data.gamertag.trim()) {
      return {
        success: false,
        error: "Gamertag is required",
      };
    }

    const email = data.email.toLowerCase().trim();
    const gamertag = data.gamertag.trim();

    // Check if email already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return {
        success: false,
        error: "Email already in use. Each email can only have one account.",
      };
    }

    // Check if gamertag already exists
    const existingUserByGamertag = await User.findOne({ gamertag });
    if (existingUserByGamertag) {
      return {
        success: false,
        error: "Gamertag already taken. Each gamertag can only be used once.",
      };
    }

    // Ensure one email = one gamertag relationship
    // (This check is redundant but ensures data integrity)
    const emailWithDifferentGamertag = await User.findOne({
      email,
      gamertag: { $ne: gamertag },
    });
    if (emailWithDifferentGamertag) {
      return {
        success: false,
        error: "This email is already associated with a different gamertag",
      };
    }

    // Create user using better-auth (gamertag is required)
    const signUpBody = {
      email: data.email.toLowerCase().trim(),
      password: data.password,
      name: data.name,
      gamertag: data.gamertag.trim(),
    };

    let response;
    try {
      response = await auth.api.signUpEmail({ body: signUpBody });
    } catch (error: any) {
      console.error("Better-auth signup error:", error);
      const errorMessage = error?.message || error?.toString() || "Unknown error";
      return {
        success: false,
        error: `Failed to create user: ${errorMessage}`,
      };
    }

    if (!response || !response.user) {
      return {
        success: false,
        error: "Failed to create user: No user returned from authentication service",
      };
    }

    // Update role if provided (better-auth might not handle custom roles)
    if (data.role && data.role !== "user") {
      await User.findOneAndUpdate(
        { email: data.email.toLowerCase().trim() },
        { role: data.role },
        { new: true }
      );
    }

    // Fetch the created user
    const createdUser = await User.findOne({ email: data.email.toLowerCase().trim() })
      .select("-password")
      .lean();

    if (!createdUser) {
      return {
        success: false,
        error: "User created but could not be retrieved",
      };
    }

    const transformedUser: UserData = {
      id: createdUser._id?.toString() || (createdUser as any).id,
      name: (createdUser as any).name,
      email: (createdUser as any).email,
      role: (createdUser as any).role || "user",
      gamertag: (createdUser as any).gamertag,
      image: (createdUser as any).image,
      createdAt: (createdUser as any).createdAt,
      updatedAt: (createdUser as any).updatedAt,
    };

    revalidatePath("/users");
    revalidatePath("/admin/users");

    return {
      success: true,
      user: transformedUser,
    };
  } catch (error) {
    console.error("Create user failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Failed to create user: ${message}`,
    };
  }
}

// UPDATE: Update user information
export async function updateUser(
  userId: string,
  data: {
    name?: string;
    email?: string;
    role?: "admin" | "user";
    gamertag?: string; 
  }
): Promise<{
  success: boolean;
  user?: UserData;
  error?: string;
}> {
  try {
    await ensureAdmin();
    // Note: ensureAdmin already connects to database
    await connectToDatabase();

    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Check if gamertag is being changed and if it's already taken
    if (data.gamertag && data.gamertag.trim() !== existingUser.gamertag) {
      const newGamertag = data.gamertag.trim();
      
      // Check if gamertag already exists
      const gamertagExists = await User.findOne({
        gamertag: newGamertag,
        _id: { $ne: userId },
      });
      if (gamertagExists) {
        return {
          success: false,
          error: "Gamertag already taken by another user",
        };
      }
    }

    // Check if email is being changed and if it's already taken
    if (data.email && data.email.toLowerCase().trim() !== existingUser.email) {
      const newEmail = data.email.toLowerCase().trim();
      
      // Check if email already exists
      const emailExists = await User.findOne({
        email: newEmail,
        _id: { $ne: userId },
      });
      if (emailExists) {
        return {
          success: false,
          error: "Email already in use by another user",
        };
      }

      // Ensure the new email doesn't have a different gamertag
      // (One email = one gamertag rule)
      const emailWithDifferentGamertag = await User.findOne({
        email: newEmail,
        gamertag: { $ne: existingUser.gamertag },
        _id: { $ne: userId },
      });
      if (emailWithDifferentGamertag) {
        return {
          success: false,
          error: "This email is already associated with a different gamertag",
        };
      }
    }

    // Build update object
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email.toLowerCase().trim();
    if (data.role !== undefined) updateData.role = data.role;
    if (data.gamertag !== undefined) updateData.gamertag = data.gamertag.trim();

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password").lean();

    if (!updatedUser) {
      return {
        success: false,
        error: "Failed to update user",
      };
    }

    const transformedUser: UserData = {
      id: updatedUser._id?.toString() || (updatedUser as any).id,
      name: (updatedUser as any).name,
      email: (updatedUser as any).email,
      role: (updatedUser as any).role || "user",
      gamertag: (updatedUser as any).gamertag,
      image: (updatedUser as any).image,
      createdAt: (updatedUser as any).createdAt,
      updatedAt: (updatedUser as any).updatedAt,
    };

    revalidatePath("/users");
    revalidatePath("/admin/users");

    return {
      success: true,
      user: transformedUser,
    };
  } catch (error) {
    console.error("Update user failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Failed to update user: ${message}`,
    };
  }
}

// DELETE: Delete a user
export async function deleteUser(userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Prevent deleting yourself
    const currentUser = await ensureAdmin();
    const currentUserId = currentUser.id;
    if (userId === currentUserId) {
      return {
        success: false,
        error: "You cannot delete your own account",
      };
    }

    await connectToDatabase();

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    revalidatePath("/users");
    revalidatePath("/admin/users");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete user failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Failed to delete user: ${message}`,
    };
  }
}

// BULK DELETE: Delete multiple users
export async function deleteUsers(userIds: string[]): Promise<{
  success: boolean;
  deletedCount?: number;
  error?: string;
}> {
  try {
    await ensureAdmin();
    await connectToDatabase();

    // Prevent deleting yourself
    const currentUser = await ensureAdmin();
    const currentUserId = (currentUser as any).id;
    const filteredIds = userIds.filter((id) => id !== currentUserId);

    if (filteredIds.length === 0) {
      return {
        success: false,
        error: "Cannot delete your own account",
      };
    }

    // Delete users
    const result = await User.deleteMany({ _id: { $in: filteredIds } });

    revalidatePath("/users");
    revalidatePath("/admin/users");

    return {
      success: true,
      deletedCount: result.deletedCount,
    };
  } catch (error) {
    console.error("Bulk delete users failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Failed to delete users: ${message}`,
    };
  }
}

// BULK UPDATE ROLE: Update role for multiple users
export async function updateUsersRole(
  userIds: string[],
  role: "admin" | "user"
): Promise<{
  success: boolean;
  updatedCount?: number;
  error?: string;
}> {
  try {
    // Prevent changing your own role
    const currentUser = await ensureAdmin();
    const currentUserId = currentUser.id;
    const filteredIds = userIds.filter((id) => id !== currentUserId);

    await connectToDatabase();

    if (filteredIds.length === 0) {
      return {
        success: false,
        error: "Cannot change your own role",
      };
    }

    // Update roles
    const result = await User.updateMany(
      { _id: { $in: filteredIds } },
      { $set: { role } }
    );

    revalidatePath("/users");
    revalidatePath("/admin/users");

    return {
      success: true,
      updatedCount: result.modifiedCount,
    };
  } catch (error) {
    console.error("Bulk update role failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Failed to update roles: ${message}`,
    };
  }
}

