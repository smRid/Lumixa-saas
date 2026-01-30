import { Palette, Sparkles } from 'lucide-react'
import { useState } from 'react'
import axios from "axios"
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const LogoGenerator = () => {

    const logoStyles = ['Modern', 'Minimalist', 'Vintage', 'Geometric', 'Abstract', 'Corporate', 'Creative', 'Classic']
    const colorSchemes = ['Blue & White', 'Black & White', 'Red & Gold', 'Green & Black', 'Purple & Silver', 'Orange & Dark Blue', 'Custom Colors', 'Multicolor']
    const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Food & Beverage', 'Real Estate', 'Marketing', 'Construction', 'Entertainment', 'Sports', 'Other']

    const [formData, setFormData] = useState({
        company_name: '',
        industry: 'Technology',
        style: 'Modern',
        colors: 'Blue & White',
        description: ''
    })
    const [loading, setLoading] = useState(false)
    const [generatedLogo, setGeneratedLogo] = useState('')

    const { getToken } = useAuth()

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        if (!formData.company_name.trim()) {
            toast.error('Please enter a company name')
            return
        }

        try {
            setLoading(true)

            const { data } = await axios.post('/api/ai/generate-logo', formData, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (data.success) {
                setGeneratedLogo(data.content)
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
        setLoading(false)
    }

    const downloadLogo = () => {
        const link = document.createElement('a')
        link.href = generatedLogo
        link.download = `${formData.company_name.replace(/\s+/g, '_').toLowerCase()}_logo.png`
        link.click()
    }

    return (
        <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
            {/* Left Column - Form */}
            <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
                <div className='flex items-center gap-3 mb-6'>
                    <Palette className='w-6 text-[#00AD25]' />
                    <h1 className='text-xl font-semibold'>AI Logo Generator</h1>
                </div>

                {/* Company Name */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Company Name *</label>
                    <input
                        type="text"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleInputChange}
                        placeholder="Enter your company name"
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent'
                        required
                    />
                </div>

                {/* Industry */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Industry</label>
                    <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent'
                    >
                        {industries.map((industry) => (
                            <option key={industry} value={industry}>{industry}</option>
                        ))}
                    </select>
                </div>

                {/* Logo Style */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Logo Style</label>
                    <select
                        name="style"
                        value={formData.style}
                        onChange={handleInputChange}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent'
                    >
                        {logoStyles.map((style) => (
                            <option key={style} value={style}>{style}</option>
                        ))}
                    </select>
                </div>

                {/* Color Scheme */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Color Scheme</label>
                    <select
                        name="colors"
                        value={formData.colors}
                        onChange={handleInputChange}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent'
                    >
                        {colorSchemes.map((color) => (
                            <option key={color} value={color}>{color}</option>
                        ))}
                    </select>
                </div>

                {/* Description */}
                <div className='mb-6'>
                    <label className='block text-sm font-medium mb-2'>Additional Description (Optional)</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe what you want your logo to convey (e.g., trustworthy, innovative, friendly)"
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent h-20 resize-none'
                    />
                </div>

                <button
                    type='submit'
                    disabled={loading || !formData.company_name.trim()}
                    className='w-full py-2.5 bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                >
                    {loading ? (
                        <>
                            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                            Generating Logo...
                        </>
                    ) : (
                        <>
                            <Sparkles className='w-4 h-4' />
                            Generate Logo
                        </>
                    )}
                </button>

                <p className='text-xs text-gray-500 mt-2 text-center'>
                    This feature is available for Premium users only
                </p>
            </form>

            {/* Right Column - Results */}
            <div className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 min-h-96'>
                <div className='flex items-center gap-3 mb-4'>
                    <Palette className='w-5 h-5 text-[#00AD25]' />
                    <h1 className='text-xl font-semibold'>Generated Logo</h1>
                </div>

                {!generatedLogo ? (
                    <div className='flex-1 flex justify-center items-center min-h-80'>
                        <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
                            <Palette className='w-9 h-9' />
                            <p>Enter company details and click "Generate Logo" to get started</p>
                        </div>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {/* Logo Display */}
                        <div className='border rounded-lg overflow-hidden bg-gray-50 p-8 text-center'>
                            <img 
                                src={generatedLogo} 
                                alt="Generated Logo" 
                                className='max-w-full max-h-64 mx-auto'
                            />
                        </div>
                        
                        {/* Logo Details */}
                        <div className='p-3 bg-gray-50 rounded-lg'>
                            <h3 className='font-medium text-sm mb-2'>Logo Details:</h3>
                            <ul className='text-xs text-gray-600 space-y-1'>
                                <li><strong>Company:</strong> {formData.company_name}</li>
                                <li><strong>Industry:</strong> {formData.industry}</li>
                                <li><strong>Style:</strong> {formData.style}</li>
                                <li><strong>Colors:</strong> {formData.colors}</li>
                                {formData.description && (
                                    <li><strong>Description:</strong> {formData.description}</li>
                                )}
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className='space-y-2'>
                            <button
                                onClick={downloadLogo}
                                className='w-full px-4 py-2 bg-[#00AD25] text-white rounded-lg text-sm hover:bg-[#00AD25]/90 transition'
                            >
                                Download Logo
                            </button>
                            <button
                                onClick={() => {
                                    setGeneratedLogo('');
                                    setFormData({
                                        company_name: '',
                                        industry: 'Technology',
                                        style: 'Modern',
                                        colors: 'Blue & White',
                                        description: ''
                                    });
                                }}
                                className='w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition'
                            >
                                Generate New Logo
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default LogoGenerator
