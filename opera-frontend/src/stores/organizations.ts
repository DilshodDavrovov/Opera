import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  organizationsApi,
  type Organization,
  type CreateOrganizationDto,
} from '../api/organizations.api';

export const useOrganizationsStore = defineStore('organizations', () => {
  const organizations = ref<Organization[]>([]);
  const currentOrganizationId = ref<string | null>(
    localStorage.getItem('currentOrganizationId')
  );

  const currentOrganization = computed(() => {
    if (!currentOrganizationId.value) return null;
    return (
      organizations.value.find((org) => org.id === currentOrganizationId.value) ||
      null
    );
  });

  const loadOrganizations = async () => {
    try {
      const data = await organizationsApi.getAll();
      organizations.value = data;

      // Если текущая организация не найдена в списке, сбрасываем выбор
      if (
        currentOrganizationId.value &&
        !organizations.value.find((org) => org.id === currentOrganizationId.value)
      ) {
        currentOrganizationId.value = null;
        localStorage.removeItem('currentOrganizationId');
      }

      // Если нет выбранной организации и есть организации, выбираем первую
      if (!currentOrganizationId.value && organizations.value.length > 0) {
        setCurrentOrganization(organizations.value[0].id);
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
      throw error;
    }
  };

  const createOrganization = async (data: CreateOrganizationDto) => {
    try {
      const organization = await organizationsApi.create(data);
      organizations.value.push(organization);
      setCurrentOrganization(organization.id);
      return organization;
    } catch (error) {
      console.error('Failed to create organization:', error);
      throw error;
    }
  };

  const setCurrentOrganization = (organizationId: string) => {
    currentOrganizationId.value = organizationId;
    localStorage.setItem('currentOrganizationId', organizationId);
  };

  const clearCurrentOrganization = () => {
    currentOrganizationId.value = null;
    localStorage.removeItem('currentOrganizationId');
  };

  return {
    organizations,
    currentOrganizationId,
    currentOrganization,
    loadOrganizations,
    createOrganization,
    setCurrentOrganization,
    clearCurrentOrganization,
  };
});
