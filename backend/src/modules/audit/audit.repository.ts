import { prisma } from '../../config/prisma.js';
import { Prisma } from '@prisma/client';
import type { AuditQueryParams } from './audit.interface.js';

export const auditRepository = {
  async findAll(params: AuditQueryParams) {
    const {
      page = 1,
      limit = 10,
      action,
      userId,
      entity,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;
    const where: Prisma.AuditLogWhereInput = {};

    if (action) {
      where.action = action as any;
    }
    if (userId) {
      where.userId = userId;
    }
    if (entity) {
      where.entity = entity;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, nom: true, prenom: true },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total, page, limit };
  },

  async findById(id: string) {
    return prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, nom: true, prenom: true },
        },
      },
    });
  },
};