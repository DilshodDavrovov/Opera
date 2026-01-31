import { apiClient } from './client';

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationDto {
  name: string;
}

export interface UpdateOrganizationDto {
  name?: string;
}

export interface AddUserToOrganizationDto {
  email: string;
  role: 'OWNER' | 'ACCOUNTANT' | 'VIEWER';
}

export const organizationsApi = {
  getAll: async (): Promise<Organization[]> => {
    const response = await apiClient.get<Organization[]>('/organizations');
    return response.data;
  },

  getById: async (id: string): Promise<Organization> => {
    const response = await apiClient.get<Organization>(`/organizations/${id}`);
    return response.data;
  },

  create: async (data: CreateOrganizationDto): Promise<Organization> => {
    const response = await apiClient.post<Organization>('/organizations', data);
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateOrganizationDto
  ): Promise<Organization> => {
    const response = await apiClient.patch<Organization>(
      `/organizations/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/organizations/${id}`);
  },

  addUser: async (
    organizationId: string,
    data: AddUserToOrganizationDto
  ): Promise<void> => {
    await apiClient.post(
      `/organizations/${organizationId}/users`,
      data
    );
  },

  removeUser: async (
    organizationId: string,
    userId: string
  ): Promise<void> => {
    await apiClient.delete(
      `/organizations/${organizationId}/users/${userId}`
    );
  },
};
