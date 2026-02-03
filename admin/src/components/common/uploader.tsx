import { UploadIcon } from '@/components/icons/upload-icon';
import { useEffect, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Attachment } from '@/types';
import { CloseIcon } from '@/components/icons/close-icon';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { useUploadMutation } from '@/data/upload';
import { zipPlaceholder } from '@/utils/placeholders';
import { ACCEPTED_FILE_TYPES } from '@/utils/constants';
import classNames from 'classnames';
// import { processFileWithName } from '../product/form-utils';
import cn from 'classnames';

const getPreviewImage = (value: any) => {
  let images: any[] = [];
  if (value) {
    images = Array.isArray(value) ? value : [{ ...value }];
  }
  return images;
};
export default function Uploader({
  onChange,
  value,
  multiple,
  acceptFile,
  helperText,
  maxSize,
  maxFiles,
  disabled,
  accept,
  section,
  name,
  skipImmediateUpload = false,
}: any) {
  const { t } = useTranslation();
  const [files, setFiles] = useState<Attachment[]>(() => {
    if (skipImmediateUpload && value instanceof File) {
      return [{ thumbnail: URL.createObjectURL(value), original: URL.createObjectURL(value), id: 'local', file: value }];
    }
    return getPreviewImage(value);
  });
  const objectUrlRef = useRef<string[]>([]);
  const { mutate: upload, isPending: loading } = useUploadMutation();
  const [error, setError] = useState<string | null>(null);

  // Sync value from form (existing URL from API or File when skipImmediateUpload)
  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      objectUrlRef.current.push(url);
      setFiles([{ thumbnail: url, original: url, id: 'local', file_name: value.name, file: value } as any]);
      return () => {
        URL.revokeObjectURL(url);
        objectUrlRef.current = objectUrlRef.current.filter((u) => u !== url);
      };
    }
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof File)) {
      setFiles(getPreviewImage(value));
      return;
    }
    if (Array.isArray(value) && value.length > 0) {
      setFiles(getPreviewImage(value));
      return;
    }
    if (!value || (Array.isArray(value) && value.length === 0)) {
      setFiles([]);
    }
  }, [value, skipImmediateUpload]);

  // Helper to convert HTML accept string to react-dropzone object
  const resolveAccept = () => {
    if (accept) {
      // If specific SVG mime type
      if (accept === 'image/svg+xml') {
        return {
          'image/svg+xml': ['.svg'],
        };
      }
      // Provide a generic fallback for other strings if needed, or pass as is if it's already an object
      return typeof accept === 'string' ? { [accept]: [] } : accept;
    }

    // Default legacy logic
    if (!acceptFile) {
      return {
        'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.svg'],
        'image/svg+xml': ['.svg'],
      };
    }
    return { ...ACCEPTED_FILE_TYPES };
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: resolveAccept(),
    multiple,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length) {
        if (skipImmediateUpload) {
          setError(null);
          const file = acceptedFiles[0];
          const url = URL.createObjectURL(file);
          objectUrlRef.current.push(url);
          setFiles([{ thumbnail: url, original: url, id: 'local', file_name: file.name, file } as any]);
          onChange(multiple ? acceptedFiles : file);
          return;
        }
        upload(
          { files: acceptedFiles, section, field: name },
          {
            onSuccess: (data: any) => {
              // Normalize response: backend may return { data: [...] } or { data: {...} } or [...]
              const raw = data?.data !== undefined ? data.data : data;
              const filesData = Array.isArray(raw)
                ? raw
                : raw && typeof raw === 'object' && (raw.thumbnail || raw.original || raw.path)
                  ? [raw]
                  : [];

              if (filesData.length === 0) {
                console.warn('Upload response had no attachment data:', data);
                return;
              }

              // Process each file: ensure thumbnail/original/id and file_name
              const processed = filesData.map((file: any) => {
                const thumbnail = file.thumbnail || file.original || file.path;
                const original = file.original || file.thumbnail || file.path;
                if (!thumbnail && !original) {
                  console.warn('Upload response missing thumbnail/original:', file);
                  return null;
                }
                let filename = '';
                let fileType = '';
                const urlToParse = original || thumbnail || '';
                if (urlToParse) {
                  const urlParts = urlToParse.split('/');
                  const lastPart = urlParts[urlParts.length - 1] || '';
                  if (lastPart.includes('.')) {
                    const parts = lastPart.split('.');
                    fileType = parts.pop()?.toLowerCase() || '';
                    filename = parts.join('.');
                  } else {
                    filename = lastPart || file.id || 'uploaded-file';
                    const urlLower = urlToParse.toLowerCase();
                    if (urlLower.includes('.svg') || urlLower.includes('/svg')) fileType = 'svg';
                    else if (urlLower.includes('.png') || urlLower.includes('/png')) fileType = 'png';
                    else if (urlLower.includes('.jpg') || urlLower.includes('.jpeg') || urlLower.includes('/jpg') || urlLower.includes('/jpeg')) fileType = 'jpg';
                    else if (urlLower.includes('.webp') || urlLower.includes('/webp')) fileType = 'webp';
                    else if (urlLower.includes('.gif') || urlLower.includes('/gif')) fileType = 'gif';
                  }
                }
                const file_name = filename && fileType ? `${filename}.${fileType}` : filename || file.id;
                return {
                  id: file.id || file.filename || file.public_id,
                  thumbnail: thumbnail || original,
                  original: original || thumbnail,
                  ...(file_name && { file_name }),
                };
              }).filter(Boolean);

              if (processed.length === 0) return;

              const mergedData = multiple ? files.concat(processed) : processed[0];
              setFiles(multiple ? files.concat(processed) : processed);
              if (onChange) {
                onChange(mergedData);
              }
            },
            onError: (error: any) => {
              console.error('Upload error:', error);
              const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                t('error-upload-failed');
              // Alert the user to the specific error message for debugging
              alert(`Upload Failed: ${errorMessage}`);
              setError(errorMessage);
            },
          },
        );
      }
    },
    // maxFiles: 2,
    maxSize: maxSize,
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((file) => {
        file?.errors?.forEach((error) => {
          if (error?.code === 'file-too-large') {
            setError(t('error-file-too-large'));
          } else if (error?.code === 'file-invalid-type') {
            setError(t('error-invalid-file-type'));
          }
        });
      });
    },
  });

  const handleDelete = (image: string) => {
    if (skipImmediateUpload && objectUrlRef.current.includes(image)) {
      URL.revokeObjectURL(image);
      objectUrlRef.current = objectUrlRef.current.filter((u) => u !== image);
    }
    const images = files.filter((file) => file.thumbnail !== image);
    setFiles(images);
    if (onChange) {
      onChange(multiple ? images : undefined);
    }
  };
  const thumbs = files?.map((file: any, idx) => {
    const imgTypes = [
      'tif',
      'tiff',
      'bmp',
      'jpg',
      'jpeg',
      'webp',
      'gif',
      'png',
      'eps',
      'raw',
      'svg',
    ];
    // let filename, fileType, isImage;
    if (file && file.id) {
      // Extract file type and filename
      let fileType: string | undefined;
      let filename: string = '';

      // Try to get file type from file_name first
      if (file?.file_name) {
        const parts = file.file_name.split('.');
        if (parts.length > 1) {
          fileType = parts.pop()?.toLowerCase();
          filename = parts.join('.');
        } else {
          filename = file.file_name;
        }
      }
      // Fallback to extracting from thumbnail URL
      else if (file?.thumbnail) {
        const urlParts = file.thumbnail.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        const parts = lastPart.split('.');
        if (parts.length > 1) {
          fileType = parts.pop()?.toLowerCase();
          filename = parts.join('.');
        } else {
          filename = lastPart;
        }
      }
      // Fallback to extracting from original URL
      else if (file?.original) {
        const urlParts = file.original.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        const parts = lastPart.split('.');
        if (parts.length > 1) {
          fileType = parts.pop()?.toLowerCase();
          filename = parts.join('.');
        } else {
          filename = lastPart;
        }
      }

      // Check if it's an image type
      // Also check if thumbnail/original URL suggests it's an image (has image extension or cloudinary URL)
      const hasImageUrl =
        file?.thumbnail?.includes('cloudinary') ||
        file?.original?.includes('cloudinary') ||
        file?.thumbnail?.match(/\.(svg|png|jpg|jpeg|gif|webp)(\?|$)/i) ||
        file?.original?.match(/\.(svg|png|jpg|jpeg|gif|webp)(\?|$)/i);

      const isImage =
        (file?.thumbnail || file?.original) &&
        ((fileType && imgTypes.includes(fileType)) || hasImageUrl);

      // Old Code *******

      // const splitArray = file?.original?.split('/');
      // let fileSplitName = splitArray[splitArray?.length - 1]?.split('.'); // it will create an array of words of filename
      // const fileType = fileSplitName.pop(); // it will pop the last item from the fileSplitName arr which is the file ext
      // const filename = fileSplitName.join('.'); // it will join the array with dot, which restore the original filename
      // const isImage = file?.thumbnail && imgTypes.includes(fileType); // check if the original filename has the img ext

      return (
        <div
          className={cn(
            'relative mt-2 inline-flex flex-col overflow-hidden rounded me-2',
            isImage ? 'border border-border-200' : '',
            disabled ? 'cursor-not-allowed border-[#D4D8DD] bg-[#EEF1F4]' : '',
          )}
          key={idx}
        >
          {/* {file?.thumbnail && isImage ? ( */}
          {isImage ? (
            // Use regular img tag for SVG files or external URLs to avoid Next.js Image optimization issues
            // Always use thumbnail if available, fallback to original
            fileType === 'svg' ||
            file.thumbnail?.includes('cloudinary') ||
            file.thumbnail?.startsWith('http') ||
            file.thumbnail?.startsWith('blob:') ||
            file.original?.includes('cloudinary') ||
            file.original?.startsWith('http') ||
            file.original?.startsWith('blob:') ? (
              <div className="flex items-center justify-center w-16 h-16 min-w-0 overflow-hidden bg-gray-50 rounded">
                <img
                  src={file.thumbnail || file.original}
                  alt={filename || 'uploaded-image'}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    // Silently handle broken images - prevent error propagation
                    e.preventDefault();
                    e.stopPropagation();
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    // Remove src to prevent retry attempts
                    target.src = '';
                    // Also hide parent container if image fails
                    if (target.parentElement) {
                      target.parentElement.style.display = 'none';
                    }
                  }}
                />
              </div>
            ) : (
              <figure className="relative flex items-center justify-center h-16 w-28 aspect-square bg-gray-50 rounded">
                {/* Using regular img for non-SVG to avoid Next.js Image fetchPriority warning */}
                <img
                  src={file.thumbnail || file.original}
                  alt={filename || 'uploaded-image'}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Silently handle broken images - prevent error propagation
                    e.preventDefault();
                    e.stopPropagation();
                    const target = e.target as HTMLImageElement;
                    target.src = '';
                    if (target.parentElement) {
                      target.parentElement.style.display = 'none';
                    }
                  }}
                />
              </figure>
            )
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center min-w-0 overflow-hidden h-14 w-14">
                <img
                  src={
                    typeof zipPlaceholder === 'string'
                      ? zipPlaceholder
                      : zipPlaceholder.src
                  }
                  width={56}
                  height={56}
                  alt="upload placeholder"
                  className="object-contain"
                />
              </div>
              <p className="flex items-baseline p-1 text-xs cursor-default text-body">
                <span
                  className="inline-block max-w-[64px] overflow-hidden overflow-ellipsis whitespace-nowrap"
                  title={`${filename}.${fileType}`}
                >
                  {filename}
                </span>
                .{fileType}
              </p>
            </div>
          )}
          {/* {multiple ? (
          ) : null} */}
          {!disabled ? (
            <button
              className="absolute flex items-center justify-center w-4 h-4 text-xs bg-red-600 rounded-full shadow-xl outline-none top-1 text-light end-1"
              onClick={() => handleDelete(file.thumbnail)}
            >
              <CloseIcon width={10} height={10} />
            </button>
          ) : (
            ''
          )}
        </div>
      );
    }
  });

  useEffect(
    () => () => {
      // Reset error after upload new file
      setError(null);

      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach((file: any) => URL.revokeObjectURL(file.thumbnail));
    },
    [files],
  );

  return (
    <section className="upload">
      <div
        {...getRootProps({
          className: classNames(
            'border-dashed border-2 border-border-base h-36 rounded flex flex-col justify-center items-center cursor-pointer focus:border-accent-400 focus:outline-none relative',
            disabled
              ? 'pointer-events-none select-none opacity-80 bg-[#EEF1F4]'
              : 'cursor-pointer',
          ),
        })}
      >
        {!disabled ? <input {...getInputProps()} /> : ''}
        <UploadIcon className="text-muted-light" />
        <p className="mt-4 text-sm text-center text-body">
          {helperText ? (
            <span className="font-semibold text-gray-500">{helperText}</span>
          ) : (
            <>
              <span className="font-semibold text-accent">
                {t('text-upload-highlight')}
              </span>{' '}
              {t('text-upload-message')} <br />
              <span className="text-xs text-body">{t('text-img-format')}</span>
            </>
          )}
        </p>
        {error && (
          <p className="mt-4 text-sm text-center text-red-600">{error}</p>
        )}
      </div>

      {(!!thumbs.length || loading) && (
        <aside className="flex flex-wrap mt-2">
          {!!thumbs.length && thumbs}
          {loading && (
            <div className="flex items-center h-16 mt-2 ms-2">
              <Loader simple={true} className="w-6 h-6" />
            </div>
          )}
        </aside>
      )}
    </section>
  );
}
