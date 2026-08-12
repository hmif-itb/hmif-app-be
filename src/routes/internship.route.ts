import { createRoute, z } from '@hono/zod-openapi';
import {
  CreateInternshipDepartmentSchema,
  CreateInternshipDivisionSchema,
  InternshipDepartmentSchema,
  InternshipDivisionSchema,
  InternshipIdParamSchema,
  InternshipSubmissionSchema,
  ListInternshipSubmissionsQuerySchema,
  ListInternshipSubmissionsSchema,
  UpdateInternshipDepartmentSchema,
  UpdateInternshipDivisionSchema,
  UpsertInternshipSubmissionSchema,
} from '~/types/internship.types';
import {
  errorResponse,
  ErrorSchema,
  validationErrorResponse,
  ValidationErrorSchema,
} from '~/types/responses.type';

export const getInternshipDepartmentsRoute = createRoute({
  operationId: 'getInternshipDepartments',
  tags: ['internship'],
  method: 'get',
  path: '/internship/departments',
  responses: {
    200: {
      description: 'List of internship departments with divisions',
      content: {
        'application/json': {
          schema: z.object({
            departments: z.array(InternshipDepartmentSchema),
          }),
        },
      },
    },
    401: errorResponse,
  },
});

export const createInternshipDepartmentRoute = createRoute({
  operationId: 'createInternshipDepartment',
  tags: ['internship'],
  method: 'post',
  path: '/internship/departments',
  request: {
    body: {
      content: {
        'application/json': { schema: CreateInternshipDepartmentSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'Created department',
      content: {
        'application/json': { schema: InternshipDepartmentSchema },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.union([ValidationErrorSchema, ErrorSchema]),
        },
      },
    },
  },
});

export const updateInternshipDepartmentRoute = createRoute({
  operationId: 'updateInternshipDepartment',
  tags: ['internship'],
  method: 'put',
  path: '/internship/departments/{id}',
  request: {
    params: InternshipIdParamSchema,
    body: {
      content: {
        'application/json': { schema: UpdateInternshipDepartmentSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Updated department',
      content: {
        'application/json': { schema: InternshipDepartmentSchema },
      },
    },
    404: errorResponse,
  },
});

export const deleteInternshipDepartmentRoute = createRoute({
  operationId: 'deleteInternshipDepartment',
  tags: ['internship'],
  method: 'delete',
  path: '/internship/departments/{id}',
  request: { params: InternshipIdParamSchema },
  responses: {
    200: {
      description: 'Deleted department',
      content: {
        'application/json': { schema: InternshipDepartmentSchema },
      },
    },
    404: errorResponse,
  },
});

export const createInternshipDivisionRoute = createRoute({
  operationId: 'createInternshipDivision',
  tags: ['internship'],
  method: 'post',
  path: '/internship/divisions',
  request: {
    body: {
      content: {
        'application/json': { schema: CreateInternshipDivisionSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'Created division',
      content: {
        'application/json': { schema: InternshipDivisionSchema },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.union([ValidationErrorSchema, ErrorSchema]),
        },
      },
    },
  },
});

export const updateInternshipDivisionRoute = createRoute({
  operationId: 'updateInternshipDivision',
  tags: ['internship'],
  method: 'put',
  path: '/internship/divisions/{id}',
  request: {
    params: InternshipIdParamSchema,
    body: {
      content: {
        'application/json': { schema: UpdateInternshipDivisionSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Updated division',
      content: {
        'application/json': { schema: InternshipDivisionSchema },
      },
    },
    404: errorResponse,
  },
});

export const deleteInternshipDivisionRoute = createRoute({
  operationId: 'deleteInternshipDivision',
  tags: ['internship'],
  method: 'delete',
  path: '/internship/divisions/{id}',
  request: { params: InternshipIdParamSchema },
  responses: {
    200: {
      description: 'Deleted division',
      content: {
        'application/json': { schema: InternshipDivisionSchema },
      },
    },
    404: errorResponse,
  },
});

export const getMyInternshipSubmissionRoute = createRoute({
  operationId: 'getMyInternshipSubmission',
  tags: ['internship'],
  method: 'get',
  path: '/internship/submission',
  responses: {
    200: {
      description: 'My submission (null if not yet created)',
      content: {
        'application/json': {
          schema: InternshipSubmissionSchema.nullable(),
        },
      },
    },
    401: errorResponse,
  },
});

export const upsertMyInternshipSubmissionRoute = createRoute({
  operationId: 'upsertMyInternshipSubmission',
  tags: ['internship'],
  method: 'put',
  path: '/internship/submission',
  request: {
    body: {
      content: {
        'application/json': { schema: UpsertInternshipSubmissionSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Saved submission draft',
      content: {
        'application/json': { schema: InternshipSubmissionSchema },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.union([ValidationErrorSchema, ErrorSchema]),
        },
      },
    },
    401: errorResponse,
    409: {
      description: 'Submission already locked/finalized',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

export const submitMyInternshipSubmissionRoute = createRoute({
  operationId: 'submitMyInternshipSubmission',
  tags: ['internship'],
  method: 'post',
  path: '/internship/submission/submit',
  request: {
    body: {
      content: {
        'application/json': { schema: UpsertInternshipSubmissionSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Final submitted & locked submission',
      content: {
        'application/json': { schema: InternshipSubmissionSchema },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.union([ValidationErrorSchema, ErrorSchema]),
        },
      },
    },
    401: errorResponse,
    409: {
      description: 'Submission already locked/finalized',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

export const listInternshipSubmissionsRoute = createRoute({
  operationId: 'listInternshipSubmissions',
  tags: ['internship'],
  method: 'get',
  path: '/internship/submissions',
  request: { query: ListInternshipSubmissionsQuerySchema },
  responses: {
    200: {
      description: 'List of submissions (admin only)',
      content: {
        'application/json': { schema: ListInternshipSubmissionsSchema },
      },
    },
    401: errorResponse,
    400: validationErrorResponse,
  },
});

export const getInternshipSubmissionByIdRoute = createRoute({
  operationId: 'getInternshipSubmissionById',
  tags: ['internship'],
  method: 'get',
  path: '/internship/submissions/{id}',
  request: { params: InternshipIdParamSchema },
  responses: {
    200: {
      description: 'Submission detail (admin only)',
      content: {
        'application/json': { schema: InternshipSubmissionSchema },
      },
    },
    401: errorResponse,
    404: errorResponse,
  },
});
