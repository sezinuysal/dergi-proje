import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const prismaTransaction = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({
        model,
        operation,
        args,
        query,
      }: {
        model: string;
        operation: string;
        args: any;
        query: (args: any) => Promise<any>;
      }) {
        return query(args);
      },
    },
  },
});

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use"
>;
