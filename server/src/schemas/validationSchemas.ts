import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(60).optional(),
  role: z.enum(['citizen', 'security_analyst', 'admin']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

export const demoAuthSchema = z.object({
  role: z.enum(['citizen', 'analyst', 'admin']).default('citizen'),
});

export const communityReportSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  threatType: z.string().min(1),
  content: z.string().min(10, 'Sample content must be at least 10 characters').max(5000),
  reportingReason: z.string().max(300).optional(),
});

export const incidentReportSchema = z.object({
  threatCategory: z.string().min(1),
  financialLossAmount: z.coerce.number().min(0).default(0),
  transactionReference: z.string().max(100).optional(),
  suspectContactOrHandle: z.string().max(150).optional(),
});

export const moderationReviewSchema = z.object({
  reportId: z.string().min(1, 'Report ID is required'),
  action: z.enum(['approve', 'reject']),
});
