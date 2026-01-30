import { FileText, Briefcase } from 'lucide-react'
import { useState } from 'react'
import axios from "axios"
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const CoverLetterGenerator = () => {

    const tones = [
        'Professional',
        'Enthusiastic', 
        'Confident',
        'Humble',
        'Friendly',
        'Formal',
        'Creative',
        'Direct'
    ]

    const experienceLevels = [
        'Entry Level',
        'Mid-Level',
        'Senior Level',
        'Executive Level',
        'Career Change'
    ]

    const [formData, setFormData] = useState({
        job_title: '',
        company_name: '',
        job_description: '',
        resume_highlights: '',
        tone: 'Professional',
        experience_level: 'Mid-Level'
    })
    const [loading, setLoading] = useState(false)
    const [generatedCoverLetter, setGeneratedCoverLetter] = useState('')

    const { getToken } = useAuth()

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        if (!formData.job_title.trim() || !formData.company_name.trim()) {
            toast.error('Please provide at least job title and company name')
            return
        }

        try {
            setLoading(true)

            const { data } = await axios.post('/api/ai/generate-cover-letter', formData, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (data.success) {
                setGeneratedCoverLetter(data.content)
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
        setLoading(false)
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedCoverLetter)
        toast.success('Cover letter copied to clipboard!')
    }

    const downloadCoverLetter = () => {
        const blob = new Blob([generatedCoverLetter], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${formData.job_title}_${formData.company_name}_Cover_Letter.txt`.replace(/\s+/g, '_')
        link.click()
        URL.revokeObjectURL(url)
        toast.success('Cover letter downloaded!')
    }

    return (
        <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
            {/* Left Column - Form */}
            <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
                <div className='flex items-center gap-3 mb-6'>
                    <Briefcase className='w-6 text-[#00AD25]' />
                    <h1 className='text-xl font-semibold'>Cover Letter Generator</h1>
                </div>

                {/* Job Title */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Job Title *</label>
                    <input
                        type="text"
                        name="job_title"
                        value={formData.job_title}
                        onChange={handleInputChange}
                        placeholder="e.g., Software Engineer, Marketing Manager"
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent'
                        required
                    />
                </div>

                {/* Company Name */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Company Name *</label>
                    <input
                        type="text"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleInputChange}
                        placeholder="e.g., Google, Microsoft"
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent'
                        required
                    />
                </div>

                {/* Job Description */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Job Description/Requirements</label>
                    <textarea
                        name="job_description"
                        value={formData.job_description}
                        onChange={handleInputChange}
                        placeholder="Paste the job description or key requirements here..."
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent h-24 resize-none'
                    />
                </div>

                {/* Resume Highlights */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Your Key Skills & Experience</label>
                    <textarea
                        name="resume_highlights"
                        value={formData.resume_highlights}
                        onChange={handleInputChange}
                        placeholder="List your relevant skills, experience, achievements..."
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent h-24 resize-none'
                    />
                </div>

                {/* Experience Level */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Experience Level</label>
                    <select
                        name="experience_level"
                        value={formData.experience_level}
                        onChange={handleInputChange}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent'
                    >
                        {experienceLevels.map((level) => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                </div>

                {/* Tone */}
                <div className='mb-6'>
                    <label className='block text-sm font-medium mb-2'>Tone</label>
                    <select
                        name="tone"
                        value={formData.tone}
                        onChange={handleInputChange}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent'
                    >
                        {tones.map((tone) => (
                            <option key={tone} value={tone}>{tone}</option>
                        ))}
                    </select>
                </div>

                <button
                    type='submit'
                    disabled={loading || !formData.job_title.trim() || !formData.company_name.trim()}
                    className='w-full py-2.5 bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                >
                    {loading ? (
                        <>
                            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                            Generating Cover Letter...
                        </>
                    ) : (
                        <>
                            <FileText className='w-4 h-4' />
                            Generate Cover Letter
                        </>
                    )}
                </button>
            </form>

            {/* Right Column - Results */}
            <div className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 min-h-96'>
                <div className='flex items-center gap-3 mb-4'>
                    <Briefcase className='w-5 h-5 text-[#00AD25]' />
                    <h1 className='text-xl font-semibold'>Generated Cover Letter</h1>
                </div>

                {!generatedCoverLetter ? (
                    <div className='flex-1 flex justify-center items-center min-h-80'>
                        <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
                            <Briefcase className='w-9 h-9' />
                            <p>Fill the form and click "Generate Cover Letter" to get started</p>
                        </div>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {/* Cover Letter Content */}
                        <div className='border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto'>
                            <ReactMarkdown>
                                {generatedCoverLetter}
                            </ReactMarkdown>
                        </div>
                        
                        {/* Application Details */}
                        <div className='p-3 bg-blue-50 rounded-lg'>
                            <h3 className='font-medium text-sm mb-2'>Application Details:</h3>
                            <ul className='text-xs text-gray-600 space-y-1'>
                                <li><strong>Position:</strong> {formData.job_title}</li>
                                <li><strong>Company:</strong> {formData.company_name}</li>
                                <li><strong>Experience Level:</strong> {formData.experience_level}</li>
                                <li><strong>Tone:</strong> {formData.tone}</li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className='space-y-2'>
                            <button
                                onClick={downloadCoverLetter}
                                className='w-full px-4 py-2 bg-[#00AD25] text-white rounded-lg text-sm hover:bg-[#00AD25]/90 transition'
                            >
                                Download Cover Letter
                            </button>
                            <button
                                onClick={copyToClipboard}
                                className='w-full px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition'
                            >
                                Copy to Clipboard
                            </button>
                            <button
                                onClick={() => {
                                    setGeneratedCoverLetter('');
                                    setFormData({
                                        job_title: '',
                                        company_name: '',
                                        job_description: '',
                                        resume_highlights: '',
                                        tone: 'Professional',
                                        experience_level: 'Mid-Level'
                                    });
                                }}
                                className='w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition'
                            >
                                Generate New Cover Letter
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CoverLetterGenerator
