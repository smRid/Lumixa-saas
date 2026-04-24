import { Download, Image as ImageIcon, Sparkles, Wand2 } from 'lucide-react'
import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const styles = ['Anime', 'Oil Painting', 'Watercolor', 'Sketch', 'Cartoon', 'Cyberpunk']
const scopes = ['Full Image', 'Subject Only', 'Background Only']

const StyleTransfer = () => {
  const [image, setImage] = useState(null)
  const [referenceImage, setReferenceImage] = useState(null)
  const [preview, setPreview] = useState('')
  const [form, setForm] = useState({
    primary_style: 'Anime',
    secondary_style: '',
    tertiary_style: '',
    intensity: 65,
    preserve_details: true,
    face_aware: true,
    scope: 'Full Image',
    high_resolution: true,
    batch_count: 1,
    nft_export: false
  })
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const { getToken } = useAuth()

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleImage = (file) => {
    setImage(file)
    setResults([])
    if (!file) {
      setPreview('')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (!image) {
      toast.error('Please upload a photo first')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('image', image)
      if (referenceImage) formData.append('reference_image', referenceImage)
      Object.entries(form).forEach(([key, value]) => formData.append(key, value))

      const { data } = await axios.post('/api/ai/style-transfer', formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (data.success) {
        setResults(Array.isArray(data.content) ? data.content : [data.content])
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
    setLoading(false)
  }

  const downloadImage = (url, index) => {
    const link = document.createElement('a')
    link.href = url
    link.download = `style-transfer-${Date.now()}-${index + 1}.png`
    link.target = '_blank'
    link.click()
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-xl p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3 mb-6'>
          <Wand2 className='w-6 text-fuchsia-600' />
          <h1 className='text-xl font-semibold'>AI Style Transfer</h1>
        </div>

        <label className='block text-sm font-medium mb-2'>Upload Photo</label>
        <input type='file' accept='image/*' onChange={(e) => handleImage(e.target.files?.[0] || null)} className='w-full p-2 border border-gray-300 rounded-md text-sm' required />
        {preview && <img src={preview} alt='Preview' className='mt-3 max-h-48 rounded-lg border' />}

        <div className='mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3'>
          <div>
            <label className='block text-sm font-medium mb-2'>Primary Style</label>
            <select value={form.primary_style} onChange={(e) => updateForm('primary_style', e.target.value)} className='w-full p-2 border border-gray-300 rounded-md text-sm'>
              {styles.map((style) => <option key={style} value={style}>{style}</option>)}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>Blend Style</label>
            <select value={form.secondary_style} onChange={(e) => updateForm('secondary_style', e.target.value)} className='w-full p-2 border border-gray-300 rounded-md text-sm'>
              <option value=''>None</option>
              {styles.map((style) => <option key={style} value={style}>{style}</option>)}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>Third Style</label>
            <select value={form.tertiary_style} onChange={(e) => updateForm('tertiary_style', e.target.value)} className='w-full p-2 border border-gray-300 rounded-md text-sm'>
              <option value=''>None</option>
              {styles.map((style) => <option key={style} value={style}>{style}</option>)}
            </select>
          </div>
        </div>

        <div className='mt-5'>
          <label className='block text-sm font-medium mb-2'>Style Intensity: {form.intensity}%</label>
          <input type='range' min='1' max='100' value={form.intensity} onChange={(e) => updateForm('intensity', e.target.value)} className='w-full accent-fuchsia-600' />
        </div>

        <div className='mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <div>
            <label className='block text-sm font-medium mb-2'>Apply Style To</label>
            <select value={form.scope} onChange={(e) => updateForm('scope', e.target.value)} className='w-full p-2 border border-gray-300 rounded-md text-sm'>
              {scopes.map((scope) => <option key={scope} value={scope}>{scope}</option>)}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>Batch Exports: {form.batch_count}</label>
            <input type='range' min='1' max='4' value={form.batch_count} onChange={(e) => updateForm('batch_count', e.target.value)} className='w-full accent-fuchsia-600' />
          </div>
        </div>

        <label className='mt-5 block text-sm font-medium mb-2'>Custom Style Reference</label>
        <input type='file' accept='image/*' onChange={(e) => setReferenceImage(e.target.files?.[0] || null)} className='w-full p-2 border border-gray-300 rounded-md text-sm' />

        <div className='mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
          {[
            ['preserve_details', 'Preserve subject details'],
            ['face_aware', 'Face-aware stylization'],
            ['high_resolution', 'High-resolution export'],
            ['nft_export', 'NFT / digital art export']
          ].map(([key, label]) => (
            <label key={key} className='flex items-center gap-2'>
              <input type='checkbox' checked={form[key]} onChange={(e) => updateForm(key, e.target.checked)} className='accent-fuchsia-600' />
              {label}
            </label>
          ))}
        </div>

        <div className='mt-5 p-3 rounded-lg bg-fuchsia-50 text-xs text-fuchsia-700'>
          The local preview updates instantly as you choose a source photo; generated stylized exports appear after processing.
        </div>

        <button disabled={loading} className='w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60'>
          {loading ? <span className='w-4 h-4 rounded-full border-2 border-t-transparent animate-spin' /> : <Sparkles className='w-4 h-4' />}
          Apply Style Transfer
        </button>
      </form>

      <div className='w-full max-w-2xl p-4 bg-white rounded-lg border border-gray-200 min-h-96'>
        <div className='flex items-center gap-3 mb-4'>
          <ImageIcon className='w-5 h-5 text-fuchsia-600' />
          <h1 className='text-xl font-semibold'>Stylized Exports</h1>
        </div>

        {results.length === 0 ? (
          <div className='flex justify-center items-center min-h-80 text-sm text-gray-400'>
            Upload a photo and click "Apply Style Transfer"
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {results.map((url, index) => (
              <div key={`${url}-${index}`} className='border rounded-lg overflow-hidden bg-gray-50'>
                <img src={url} alt={`Stylized ${index + 1}`} className='w-full h-auto' />
                <button onClick={() => downloadImage(url, index)} className='w-full flex items-center justify-center gap-2 p-2 text-sm text-fuchsia-700 hover:bg-fuchsia-50'>
                  <Download className='w-4 h-4' />
                  Download Export
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StyleTransfer
