import { HttpClient } from './http-client';
import { API_ENDPOINTS } from './api-endpoints';
import { Attachment } from '@/types';

export interface UploadVariables {
  files: File[];
  section?: string;
  field?: string;
}

export const uploadClient = {
  upload: async (variables: UploadVariables | File[]) => {
    const formData = new FormData();

    let files: File[];
    let section: string | undefined;
    let field: string | undefined;

    if (Array.isArray(variables)) {
      files = variables;
    } else {
      files = variables.files;
      section = variables.section;
      field = variables.field;
    }

    if (section) {
      formData.append('section', section);
    }

    if (field) {
      formData.append('field', field);
    }

    files.forEach((file) => {
      // Backend uses .any() so field name is flexible, but keeping 'icon' or 'attachment[]'
      // helps with logical separation if needed in future
      if (field === 'icon') {
        formData.append('icon', file);
      } else {
        formData.append('attachment[]', file);
      }
    });

    const options = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    const response = await HttpClient.post<Attachment[]>(
      API_ENDPOINTS.ATTACHMENTS,
      formData,
      options,
    );
    return response;
  },
};
