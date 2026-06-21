import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

export async function uploadImage(
  file: string,
  folder = "ecommers/products"
): Promise<string> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "image",
  })
  return result.secure_url
}

export async function deleteImage(url: string): Promise<void> {
  const parts = url.split("/")
  const publicIdWithExt = parts[parts.length - 1]
  const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf("."))
  if (publicId && publicId !== "") {
    await cloudinary.uploader.destroy(`ecommers/products/${publicId}`)
  }
}
