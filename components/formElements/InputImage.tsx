import { IconX, IconUpload, IconPhoto } from '@tabler/icons-react';
import { uploadImage, validateImageFile, resizeImageIfNeeded } from '@/services/images';
import { Button } from '@heroui/react';
import { useState } from 'react';
import { toast } from 'sonner';

const handleImageUpload = async (
  event: React.ChangeEvent<HTMLInputElement>,
  stateUpdater: (newState: boolean) => void,
  changeHandler: (name: string, value: string) => void,
  directory: string,
  keyObjectName: string
) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    stateUpdater(true);

    // Validar el archivo
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error || 'Archivo no válido');
      return;
    }

    // Redimensionar si es necesario
    const resizedFile = await resizeImageIfNeeded(file, 800, 600, 0.8);

    // Subir la imagen
    const imageUrl = await uploadImage(resizedFile, directory);

    changeHandler(keyObjectName, imageUrl);
    toast.success('Imagen cargada correctamente');
  } catch (error: any) {
    console.error('Error uploading image:', error);
    toast.error(error.message || 'Error al cargar la imagen');
  } finally {
    stateUpdater(false);
  }
};

export default function InputImage({
  required,
  inputTitle,
  pathImg,
  keyObjectName,
  directory,
  changeHandler,
}: {
  required: boolean;
  inputTitle: string;
  pathImg: string;
  keyObjectName: string;
  directory: string;
  changeHandler: (name: string, value: string) => void;
}) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  console.log(pathImg);

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">{inputTitle}{required ? <span className="text-red-700"> *</span> : ''}</label>
      <div className="space-y-3">
        {/* Zona de subida */}
        <div className="relative">
          <input
            required={required}
            type="file"
            accept="image/*"
            onChange={(event) => handleImageUpload(event, setIsUploadingImage, changeHandler, directory, keyObjectName)}
            disabled={isUploadingImage}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg
                        transition-colors cursor-pointer
                        ${
                          isUploadingImage
                            ? 'border-primary-300 bg-primary-50 cursor-not-allowed'
                            : 'border-default-300 hover:border-primary-400 hover:bg-default-50'
                        }
                        `}
          >
            <div className="text-center">
              {isUploadingImage ? (
                <>
                  <IconUpload size={24} className="mx-auto mb-2 text-primary-500 animate-pulse" />
                  <p className="text-sm text-primary-600 font-medium">Subiendo imagen...</p>
                </>
              ) : (
                <>
                  <IconPhoto size={24} className="mx-auto mb-2 text-default-400" />
                  <p className="text-sm text-foreground font-medium">Click para seleccionar una imagen</p>
                  <p className="text-xs text-default-500 mt-1">JPG, PNG o WebP (máx. 5MB)</p>
                </>
              )}
            </div>
          </label>
        </div>

        {/* Preview de la imagen */}
        {pathImg && (
          <div className="relative">
            <img src={pathImg} alt="Preview del día" className="w-full h-40 object-cover rounded-lg border border-default-200" />
            <Button
              isIconOnly
              size="sm"
              color="danger"
              variant="flat"
              className="absolute top-2 right-2"
              onPress={() => {
                changeHandler(keyObjectName, '');
                toast.success('Imagen eliminada');
              }}
            >
              <IconX size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
