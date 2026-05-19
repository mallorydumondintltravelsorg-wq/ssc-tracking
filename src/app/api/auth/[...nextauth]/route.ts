import NextAuth from "next-auth";

import CredentialsProvider
from "next-auth/providers/credentials";

import { PrismaClient }
from "@prisma/client";

import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const handler = NextAuth({

  providers: [

    CredentialsProvider({

      name: "credentials",

      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {

        if (
          !credentials?.email ||
          !credentials?.password
        ) {
          return null;
        }

        const user =
          await prisma.user.findUnique({
            where: {
              email:
                credentials.email,
            },
          });

        if (!user) {
          return null;
        }

        const passwordMatch =
          await bcrypt.compare(
            credentials.password,
            user.password
          );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],

  secret:
    process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },
});

export {
  handler as GET,
  handler as POST,
};