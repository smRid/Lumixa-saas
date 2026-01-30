import { Mail, Send } from 'lucide-react'
import { useState } from 'react'
import axios from "axios"
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const EmailGenerator = () => {

    const emailPurposes = [
        'Cold Outreach',
        'Newsletter',
        'Customer Support',
        'Follow-up',
        'Sales Pitch',
        'Networking',
        'Job Application',
        'Meeting Request',
        'Thank You',
        'Apology'
    ]

    const emailTones = [
        'Professional',
        'Casual',
        'Friendly',
        'Formal',
        'Persuasive',
        'Enthusiastic',
        'Apologetic',
        'Urgent',
        'Informative'
    ]

    const [formData, setFormData] = useState({
        purpose: 'Cold Outreach',
        tone: 'Professional',
        recipient: '',
        subject: '',
        context: '',
        key_points: ''
    })
    const [loading, setLoading] = useState(false)
    const [generatedEmail, setGeneratedEmail] = useState('')

    const { getToken } = useAuth()

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        if (!formData.context.trim()) {
            toast.error('Please provide context for the email')
            return
        }

        try {
            setLoading(true)

            const { data } = await axios.post('/api/ai/generate-email', formData, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (data.success) {
                setGeneratedEmail(data.content)
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
        navigator.clipboard.writeText(generatedEmail)
        toast.success('Email copied to clipboard!')
    }

    return (
        <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
            {/* Left Column - Form */}
            <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
                <div className='flex items-center gap-3 mb-6'>
                    <Mail className='w-6 text-[#00AD25]' />
                    <h1 className='text-xl font-semibold'>AI Email Generator</h1>
                </div>

                {/* Purpose */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Email Purpose</label>
                    <select
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleInputChange}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent'
                    >
                        {emailPurposes.map((purpose) => (
                            <option key={purpose} value={purpose}>{purpose}</option>
                        ))}
                    </select>
                </div>

                {/* Tone */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Tone</label>
                    <select
                        name="tone"
                        value={formData.tone}
                        onChange={handleInputChange}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent'
                    >
                        {emailTones.map((tone) => (
                            <option key={tone} value={tone}>{tone}</option>
                        ))}
                    </select>
                </div>

                {/* Recipient */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Recipient (Optional)</label>
                    <input
                        type="text"
                        name="recipient"
                        value={formData.recipient}
                        onChange={handleInputChange}
                        placeholder="e.g., John Doe, HR Manager"
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent'
                    />
                </div>

                {/* Subject */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Subject (Optional)</label>
                    <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Email subject line"
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent'
                    />
                </div>

                {/* Context */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Context *</label>
                    <textarea
                        name="context"
                        value={formData.context}
                        onChange={handleInputChange}
                        placeholder="Provide context for the email (e.g., purpose, background, situation)"
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent h-20 resize-none'
                        required
                    />
                </div>

                {/* Key Points */}
                <div className='mb-6'>
                    <label className='block text-sm font-medium mb-2'>Key Points to Include</label>
                    <textarea
                        name="key_points"
                        value={formData.key_points}
                        onChange={handleInputChange}
                        placeholder="List the main points you want to cover in the email"
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent h-20 resize-none'
                    />
                </div>

                <button
                    type='submit'
                    disabled={loading || !formData.context.trim()}
                    className='w-full py-2.5 bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                >
                    {loading ? (
                        <>
                            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                            Generating Email...
                        </>
                    ) : (
                        <>
                            <Send className='w-4 h-4' />
                            Generate Email
                        </>
                    )}
                </button>
            </form>

            {/* Right Column - Results */}
            <div className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 min-h-96'>
                <div className='flex items-center gap-3 mb-4'>
                    <Mail className='w-5 h-5 text-[#00AD25]' />
                    <h1 className='text-xl font-semibold'>Generated Email</h1>
                </div>

                {!generatedEmail ? (
                    <div className='flex-1 flex justify-center items-center min-h-80'>
                        <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
                            <Mail className='w-9 h-9' />
                            <p>Fill the form and click "Generate Email" to get started</p>
                        </div>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {/* Email Content */}
                        <div className='border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto'>
                            <ReactMarkdown>
                                {generatedEmail}
                            </ReactMarkdown>
                        </div>
                        
                        {/* Email Details */}
                        <div className='p-3 bg-blue-50 rounded-lg'>
                            <h3 className='font-medium text-sm mb-2'>Email Settings:</h3>
                            <ul className='text-xs text-gray-600 space-y-1'>
                                <li><strong>Purpose:</strong> {formData.purpose}</li>
                                <li><strong>Tone:</strong> {formData.tone}</li>
                                {formData.recipient && <li><strong>Recipient:</strong> {formData.recipient}</li>}
                                {formData.subject && <li><strong>Subject:</strong> {formData.subject}</li>}
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className='space-y-2'>
                            <button
                                onClick={copyToClipboard}
                                className='w-full px-4 py-2 bg-[#00AD25] text-white rounded-lg text-sm hover:bg-[#00AD25]/90 transition'
                            >
                                Copy Email
                            </button>
                            <button
                                onClick={() => setGeneratedEmail('')}
                                className='w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition'
                            >
                                Generate New Email
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default EmailGenerator
