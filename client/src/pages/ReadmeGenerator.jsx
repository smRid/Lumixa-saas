import { FileText, Code } from 'lucide-react'
import { useState } from 'react'
import axios from "axios"
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReadmeGenerator = () => {

    const [formData, setFormData] = useState({
        project_title: '',
        description: '',
        tech_stack: '',
        installation: '',
        usage: '',
        features: '',
        license: 'MIT'
    })
    const [loading, setLoading] = useState(false)
    const [generatedReadme, setGeneratedReadme] = useState('')

    const { getToken } = useAuth()

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        if (!formData.project_title.trim() || !formData.description.trim()) {
            toast.error('Please provide at least project title and description')
            return
        }

        try {
            setLoading(true)

            const { data } = await axios.post('/api/ai/generate-readme', formData, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (data.success) {
                setGeneratedReadme(data.content)
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
        navigator.clipboard.writeText(generatedReadme)
        toast.success('README copied to clipboard!')
    }

    const downloadReadme = () => {
        const blob = new Blob([generatedReadme], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'README.md'
        link.click()
        URL.revokeObjectURL(url)
        toast.success('README.md downloaded!')
    }

    return (
        <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
            {/* Left Column - Form */}
            <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
                <div className='flex items-center gap-3 mb-6'>
                    <FileText className='w-6 text-[#00AD25]' />
                    <h1 className='text-xl font-semibold'>README Generator</h1>
                </div>

                {/* Project Title */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Project Title *</label>
                    <input
                        type="text"
                        name="project_title"
                        value={formData.project_title}
                        onChange={handleInputChange}
                        placeholder="My Awesome Project"
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent'
                        required
                    />
                </div>

                {/* Description */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Project Description *</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Brief description of what your project does and why it's useful"
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent h-20 resize-none'
                        required
                    />
                </div>

                {/* Tech Stack */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Tech Stack</label>
                    <input
                        type="text"
                        name="tech_stack"
                        value={formData.tech_stack}
                        onChange={handleInputChange}
                        placeholder="React, Node.js, MongoDB, Express"
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent'
                    />
                </div>

                {/* Installation */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Installation Instructions</label>
                    <textarea
                        name="installation"
                        value={formData.installation}
                        onChange={handleInputChange}
                        placeholder="How to install and setup the project"
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent h-20 resize-none'
                    />
                </div>

                {/* Usage */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Usage Instructions</label>
                    <textarea
                        name="usage"
                        value={formData.usage}
                        onChange={handleInputChange}
                        placeholder="How to use the project after installation"
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent h-20 resize-none'
                    />
                </div>

                {/* Features */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Features</label>
                    <textarea
                        name="features"
                        value={formData.features}
                        onChange={handleInputChange}
                        placeholder="List the key features of your project"
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent h-16 resize-none'
                    />
                </div>

                {/* License */}
                <div className='mb-6'>
                    <label className='block text-sm font-medium mb-2'>License</label>
                    <select
                        name="license"
                        value={formData.license}
                        onChange={handleInputChange}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent'
                    >
                        <option value="MIT">MIT</option>
                        <option value="Apache 2.0">Apache 2.0</option>
                        <option value="GPL v3">GPL v3</option>
                        <option value="BSD 3-Clause">BSD 3-Clause</option>
                        <option value="None">None</option>
                    </select>
                </div>

                <button
                    type='submit'
                    disabled={loading || !formData.project_title.trim() || !formData.description.trim()}
                    className='w-full py-2.5 bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                >
                    {loading ? (
                        <>
                            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                            Generating README...
                        </>
                    ) : (
                        <>
                            <Code className='w-4 h-4' />
                            Generate README
                        </>
                    )}
                </button>
            </form>

            {/* Right Column - Results */}
            <div className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 min-h-96'>
                <div className='flex items-center gap-3 mb-4'>
                    <FileText className='w-5 h-5 text-[#00AD25]' />
                    <h1 className='text-xl font-semibold'>Generated README</h1>
                </div>

                {!generatedReadme ? (
                    <div className='flex-1 flex justify-center items-center min-h-80'>
                        <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
                            <FileText className='w-9 h-9' />
                            <p>Fill the form and click "Generate README" to get started</p>
                        </div>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {/* README Preview */}
                        <div className='border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto'>
                            <ReactMarkdown>
                                {generatedReadme}
                            </ReactMarkdown>
                        </div>
                        
                        {/* Project Details */}
                        <div className='p-3 bg-blue-50 rounded-lg'>
                            <h3 className='font-medium text-sm mb-2'>Project Info:</h3>
                            <ul className='text-xs text-gray-600 space-y-1'>
                                <li><strong>Title:</strong> {formData.project_title}</li>
                                {formData.tech_stack && <li><strong>Tech Stack:</strong> {formData.tech_stack}</li>}
                                <li><strong>License:</strong> {formData.license}</li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className='space-y-2'>
                            <button
                                onClick={downloadReadme}
                                className='w-full px-4 py-2 bg-[#00AD25] text-white rounded-lg text-sm hover:bg-[#00AD25]/90 transition'
                            >
                                Download README.md
                            </button>
                            <button
                                onClick={copyToClipboard}
                                className='w-full px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition'
                            >
                                Copy to Clipboard
                            </button>
                            <button
                                onClick={() => {
                                    setGeneratedReadme('');
                                    setFormData({
                                        project_title: '',
                                        description: '',
                                        tech_stack: '',
                                        installation: '',
                                        usage: '',
                                        features: '',
                                        license: 'MIT'
                                    });
                                }}
                                className='w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition'
                            >
                                Generate New README
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ReadmeGenerator
