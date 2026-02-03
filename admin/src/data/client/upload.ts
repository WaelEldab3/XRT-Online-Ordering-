import { HttpClient } from './http-client';
import { API_ENDPOINTS } from './api-endpoints';
import { Attachment } from '@/types';

export const uploadClient = {
  upload: async (variables: any) => {
    let formData = new FormData();

    // Handle both old (array only) and new ({ files, section }) signatures
    const files = Array.isArray(variables) ? variables : variables.files;
    const section =
      !Array.isArray(variables) && variables.section ? variables.section : null;
    const field =
      !Array.isArray(variables) && variables.field ? variables.field : null;

    if (section) {
      formData.append('section', section);
    }

    if (field) {
      formData.append('field', field);
    }

    files.forEach((attachment: any) => {
      // If the field name is 'icon', use it as the key so the backend fileFilter can detect it.
      // Otherwise use the default 'attachment[]' which the backend controller handles as a list.
      // (Note: Backend route now uses .any() to accept this)
      if (field === 'icon') {
        formData.append('icon', attachment);
      } else {
        formData.append('attachment[]', attachment);
      }
    });

    // Inspect FormData (browser only)
    try {
      // @ts-ignore
      for (var pair of formData.entries()) {
      }
    } catch (e) {}

    const options = {
      headers: {
        'Content-Type': undefined, // Let Axios/browser set multipart/form-data with boundary
      },
      timeout: 300000, // 5 minutes
    };
    const response = await HttpClient.post<any>(
      API_ENDPOINTS.ATTACHMENTS,
      formData,
      options,
    );
    return response?.data || response;
  },
};
