const CLOUD_NAME = 'dnvczkdzu';
const UPLOAD_PRESET = 'desapariciones_preset';

export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error al subir la imagen');
  }

  const data = await response.json();
  return data.secure_url; // URL pública de la imagen
};
