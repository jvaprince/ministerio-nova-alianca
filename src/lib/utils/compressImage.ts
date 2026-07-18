import imageCompression from 'browser-image-compression'

export async function compressImage(file: File): Promise<File> {
  // Não comprime imagens pequenas
  if (file.size <= 300 * 1024) {
    return file
  }

  return await imageCompression(file, {
    maxSizeMB: 0.35,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    initialQuality: 0.8,
    fileType: file.type,
  })
}