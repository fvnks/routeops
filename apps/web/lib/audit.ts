import { prisma } from "./prisma";

interface AuditParams {
  userId?: string;
  entityType: string;
  entityId: string;
  action: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAudit(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action as any,
        oldValues: params.oldValues || undefined,
        newValues: params.newValues || undefined,
        description: params.description || undefined,
        ipAddress: params.ipAddress || undefined,
        userAgent: params.userAgent || undefined,
      },
    });
  } catch (error) {
    console.error("Error en registro de auditoría:", error);
  }
}
