import { prisma } from "../../../config/prisma.js";

export const emailAutoriseRepository = {
  async findAll() {
    return prisma.emailAutorise.findMany({
      include: {
        ajoutePar: { select: { nom: true, prenom: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async findByEmail(email: string) {
    return prisma.emailAutorise.findUnique({ where: { email } });
  },

  async findById(id: string) {
    return prisma.emailAutorise.findUnique({ where: { id } });
  },

  async create(email: string, ajouteParId: string) {
    return prisma.emailAutorise.create({ data: { email, ajouteParId } });
  },

  async delete(id: string) {
    return prisma.emailAutorise.delete({ where: { id } });
  },
};
