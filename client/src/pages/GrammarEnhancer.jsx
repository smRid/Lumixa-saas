import { CheckCircle, Sparkles } from 'lucide-react'
import { useState } from 'react'
import axios from "axios"
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GrammarEnhancer = () => {

    const tones = [
        'Formal',
        'Friendly',
        'Professional',
        'Casual',
        'Persuasive',
        'Academic',
        'Creative',
        'Conversational',
        'Assertive'
    ]

    const enhancementLevels = [
        'Light - Fix grammar only',
        'Medium - Fix grammar and improve clarity',
        'Heavy - Complete rewrite for better readability'
    ]

    const [formData, setFormData] = useState({
        text: '',
        tone: 'Professional',
        enhancement_level: 'Medium - Fix grammar and improve clarity'
    })
    const [loading, setLoading] = useState(false)
    const [enhancedText, setEnhancedText] = useState('')

    const { getToken } = useAuth()

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        if (!formData.text.trim()) {
            toast.error('Please enter some text to enhance')
            return
        }

        if (formData.text.trim().length < 5) {
            toast.error('Please enter at least 5 characters')
            return
        }

        try {
            setLoading(true)
            console.log('Sending request with data:', formData);

            const { data } = await axios.post('/api/ai/enhance-grammar', formData, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            console.log('Response received:', data);

            if (data.success) {
                setEnhancedText(data.content)
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.error('Request error:', error);
            toast.error(error.response?.data?.message || error.message || 'An error occurred')
        }
        setLoading(false)
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(enhancedText)
        toast.success('Enhanced text copied to clipboard!')
    }

    const wordCount = formData.text.trim() ? formData.text.trim().split(/\s+/).filter(word => word.length > 0).length : 0

    return (
        <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
            {/* Left Column - Form */}
            <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
                <div className='flex items-center gap-3 mb-6'>
                    <CheckCircle className='w-6 text-[#00AD25]' />
                    <h1 className='text-xl font-semibold'>Grammar Enhancer</h1>
                </div>

                {/* Text Input */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Text to Enhance *</label>
                    <textarea
                        name="text"
                        value={formData.text}
                        onChange={handleInputChange}
                        placeholder="Enter your text here. It can be an email, article, message, or any content you want to improve..."
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] focus:border-transparent h-32 resize-none'
                        required
                    />
                    <div className='text-xs text-gray-500 mt-1'>
                        {wordCount} words
                    </div>
                </div>

                {/* Tone */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Desired Tone</label>
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

                {/* Enhancement Level */}
                <div className='mb-6'>
                    <label className='block text-sm font-medium mb-2'>Enhancement Level</label>
                    <div className='space-y-2'>
                        {enhancementLevels.map((level) => (
                            <div key={level} className='flex items-center space-x-3'>
                                <input
                                    type="radio"
                                    id={level}
                                    name="enhancement_level"
                                    value={level}
                                    checked={formData.enhancement_level === level}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor={level} className='text-sm cursor-pointer flex-1'>
                                    {level}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type='submit'
                    disabled={loading || !formData.text.trim() || formData.text.trim().length < 5}
                    className='w-full py-2.5 bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                >
                    {loading ? (
                        <>
                            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                            Enhancing Text...
                        </>
                    ) : (
                        <>
                            <Sparkles className='w-4 h-4' />
                            Enhance Text
                        </>
                    )}
                </button>
            </form>

            {/* Right Column - Results */}
            <div className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 min-h-96'>
                <div className='flex items-center gap-3 mb-4'>
                    <CheckCircle className='w-5 h-5 text-[#00AD25]' />
                    <h1 className='text-xl font-semibold'>Enhanced Text</h1>
                </div>

                {!enhancedText ? (
                    <div className='flex-1 flex justify-center items-center min-h-80'>
                        <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
                            <CheckCircle className='w-9 h-9' />
                            <p>Enter text and click "Enhance Text" to get started</p>
                        </div>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {/* Before and After Comparison */}
                        <div className='space-y-4'>
                            <div>
                                <h3 className='text-sm font-medium mb-2 text-gray-600'>Original Text</h3>
                                <div className='border rounded-lg p-3 bg-red-50 text-sm'>
                                    {formData.text}
                                </div>
                            </div>
                            
                            <div>
                                <h3 className='text-sm font-medium mb-2 text-gray-600'>Enhanced Text</h3>
                                <div className='border rounded-lg p-3 bg-green-50 text-sm max-h-64 overflow-y-auto'>
                                    <ReactMarkdown>
                                        {enhancedText}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                        
                        {/* Enhancement Details */}
                        <div className='p-3 bg-blue-50 rounded-lg'>
                            <h3 className='font-medium text-sm mb-2'>Enhancement Settings:</h3>
                            <ul className='text-xs text-gray-600 space-y-1'>
                                <li><strong>Tone:</strong> {formData.tone}</li>
                                <li><strong>Level:</strong> {formData.enhancement_level}</li>
                                <li><strong>Original Words:</strong> {wordCount}</li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className='space-y-2'>
                            <button
                                onClick={copyToClipboard}
                                className='w-full px-4 py-2 bg-[#00AD25] text-white rounded-lg text-sm hover:bg-[#00AD25]/90 transition'
                            >
                                Copy Enhanced Text
                            </button>
                            <button
                                onClick={() => {
                                    setEnhancedText('');
                                    setFormData({
                                        text: '',
                                        tone: 'Professional',
                                        enhancement_level: 'Medium - Fix grammar and improve clarity'
                                    });
                                }}
                                className='w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition'
                            >
                                Enhance New Text
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default GrammarEnhancer
