import { createClient } from './client'

export async function uploadImage(
  file: File,
  bucket: string,
  path: string
): Promise<string> {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${path}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
  return data.publicUrl
}

export async function deleteImage(bucket: string, path: string): Promise<void> {
  const supabase = createClient()
  await supabase.storage.from(bucket).remove([path])
}
