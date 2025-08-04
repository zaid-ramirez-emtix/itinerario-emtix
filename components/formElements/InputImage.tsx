import { IconX, IconUpload, IconPhoto } from '@tabler/icons-react';
import { uploadImage, validateImageFile, resizeImageIfNeeded, getDirectoryFromContext, deleteImage } from '@/services/images';
import { Button } from '@heroui/react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

const handleImageUpload = async (
  event: React.ChangeEvent<HTMLInputElement>,
  stateUpdater: (newState: boolean) => void,
  changeHandler: (name: string, value: string) => void,
  keyObjectName: string,
  currentImageUrl?: string
) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    stateUpdater(true);

    console.log(`🔄 Iniciando subida de imagen para ${keyObjectName}:`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      currentImageUrl
    });

    // Validar el archivo
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      console.error('❌ Validación de archivo falló:', validation.error);
      toast.error(validation.error || 'Archivo no válido');
      return;
    }

    console.log('✅ Archivo validado correctamente');

    // Redimensionar si es necesario
    console.log('🔄 Redimensionando imagen...');
    const resizedFile = await resizeImageIfNeeded(file, 800, 600, 0.8);
    console.log('✅ Imagen redimensionada:', {
      originalSize: file.size,
      newSize: resizedFile.size
    });

    // Determinar el directorio basado en el nombre del campo
    const directory = getDirectoryFromContext(keyObjectName);
    console.log('🔄 Directorio determinado:', directory);

    // Subir la imagen a Supabase Storage
    console.log('🔄 Subiendo a Supabase Storage...');
    const imageUrl = await uploadImage(resizedFile, directory, currentImageUrl);

    console.log(`✅ Imagen subida exitosamente para ${keyObjectName}:`, imageUrl);
    changeHandler(keyObjectName, imageUrl);
    console.log(`✅ changeHandler llamado para ${keyObjectName} con valor:`, imageUrl);
    toast.success('Imagen cargada correctamente');
  } catch (error: any) {
    console.error('❌ Error completo uploading image:', {
      error,
      message: error.message,
      stack: error.stack,
      keyObjectName,
      fileName: file?.name
    });
    toast.error(error.message || 'Error al cargar la imagen');
  } finally {
    stateUpdater(false);
    // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
    event.target.value = '';
  }
};

export default function InputImage({
  required,
  inputTitle,
  pathImg,
  keyObjectName,
  changeHandler,
}: {
  required: boolean;
  inputTitle: string;
  pathImg: string;
  keyObjectName: string;
  changeHandler: (name: string, value: string) => void;
}) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">{inputTitle}{required ? <span className="text-red-700"> *</span> : ''}</label>
      
      {/* Campo oculto para validación de formulario */}
      {required && (
        <input
          type="hidden"
          name={`${keyObjectName}_validation`}
          value={pathImg}
          required={required}
        />
      )}
      
      <div className="space-y-3">
        {/* Zona de subida */}
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(event) => handleImageUpload(event, setIsUploadingImage, changeHandler, keyObjectName, pathImg)}
            disabled={isUploadingImage}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            id={`image-upload-${keyObjectName}`}
          />
          <label
            htmlFor={`image-upload-${keyObjectName}`}
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
              onPress={async () => {
                try {
                  // Primero eliminar la imagen del bucket de Supabase
                  if (pathImg) {
                    await deleteImage(pathImg);
                  }
                  
                  // Limpiar el estado local
                  changeHandler(keyObjectName, '');
                  
                  // Limpiar el input file para permitir seleccionar archivos de nuevo
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                  
                  toast.success('Imagen eliminada correctamente');
                } catch (error: any) {
                  console.error('Error deleting image:', error);
                  // Aún así limpiamos el estado local y el input
                  changeHandler(keyObjectName, '');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                  toast.success('Imagen removida (error al eliminar del servidor)');
                }
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
