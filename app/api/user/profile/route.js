import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

// GET → get profile
export async function GET(req) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return new Response(JSON.stringify({ message: "User not found" }), {
      status: 404,
    });
  }

  const isComplete =
    user.name &&
    user.phoneNumber &&
    user.emergencyNumber &&
    user.birthdate &&
    user.gender;

  return new Response(
    JSON.stringify({
      isComplete: !!isComplete,
      user: {
        name: user.name,
        surname: user.surname,
        middleName: user.middleName,
        phoneNumber: user.phoneNumber,
        emergencyNumber: user.emergencyNumber,
        birthdate: user.birthdate,
        gender: user.gender,
        language: user.language,
      }
    }),
    {
      status: 200,
    }
  );
}

// ✅ PUT → update profile
export async function PUT(req) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const body = await req.json();

  const {
    name,
    surname,
    middleName,
    phoneNumber,
    emergencyNumber,
    birthdate,
    gender,
    language,
  } = body;

  const updated = await User.findOneAndUpdate(
    { email: session.user.email },
    {
      name,
      surname,
      middleName,
      phoneNumber,
      emergencyNumber,
      birthdate,
      gender,
      language,
    },
    { new: true }
  );

  if (!updated) {
    return new Response(JSON.stringify({ message: "User not found" }), {
      status: 404,
    });
  }

  return new Response(
    JSON.stringify({ message: "Profile updated successfully" }),
    {
      status: 200,
    }
  );
}