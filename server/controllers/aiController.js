import OpenAI from "openai";
import sql from "../config/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";


const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

const clampNumber = (value, min, max, fallback) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
}

const getImageDimensions = (aspectRatio = '1:1', customWidth, customHeight) => {
    if (aspectRatio === '16:9') return { width: 1280, height: 720 };
    if (aspectRatio === '9:16') return { width: 720, height: 1280 };
    if (aspectRatio === 'Custom') {
        return {
            width: clampNumber(customWidth, 256, 2048, 1024),
            height: clampNumber(customHeight, 256, 2048, 1024)
        };
    }
    return { width: 1024, height: 1024 };
}

const buildImagePrompt = ({
    prompt,
    style,
    negative_prompt,
    seed,
    brand_name,
    brand_colors,
    brand_notes,
    face_consistency,
    transparent_background,
    commercial_license
}) => {
    const parts = [
        prompt,
        style ? `Style preset: ${style}.` : '',
        brand_name ? `Brand/campaign: ${brand_name}.` : '',
        brand_colors ? `Use brand colors: ${brand_colors}.` : '',
        brand_notes ? `Brand direction: ${brand_notes}.` : '',
        face_consistency ? 'Keep faces consistent, natural, and recognizable across variations.' : '',
        transparent_background ? 'Isolate the subject for transparent PNG output.' : '',
        commercial_license ? 'Design as a polished commercial-use visual.' : '',
        seed ? `Seed reference: ${seed}.` : '',
        negative_prompt ? `Avoid: ${negative_prompt}.` : ''
    ];

    return parts.filter(Boolean).join(' ');
}


export const generateArticle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue." })
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{
                role: "user",
                content: prompt,
            },
            ],
            temperature: 0.7,
            max_tokens: length,
        });

        const content = response.choices[0].message.content

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'article');`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({
            success: true,
            message: "Article generated successfully",
            content: content,
            usage: plan !== 'premium' ? free_usage + 1 : 'unlimited'
        });

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue." })
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{
                role: "user",
                content: prompt,
            },
            ],
            temperature: 0.7,
            max_tokens: 100,
        });

        const content = response.choices[0].message.content

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'blog-title');`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({
            success: true,
            message: "Blog generated successfully",
            content: content,
            usage: plan !== 'premium' ? free_usage + 1 : 'unlimited'
        });

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export const generateImage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const {
            prompt,
            publish,
            aspect_ratio,
            custom_width,
            custom_height,
            batch_count,
            transparent_background
        } = req.body;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions." })
        }

        if (!prompt || !prompt.trim()) {
            return res.json({ success: false, message: "Please provide an image prompt." })
        }

        const count = clampNumber(batch_count, 1, 4, 1);
        const { width, height } = getImageDimensions(aspect_ratio, custom_width, custom_height);
        const imagePrompt = buildImagePrompt(req.body);
        const isTransparent = transparent_background === true || transparent_background === 'true';
        const generatedImages = [];

        for (let index = 0; index < count; index += 1) {
            const formData = new FormData()
            formData.append('prompt', count > 1 ? `${imagePrompt} Variation ${index + 1}.` : imagePrompt)
            const { data } = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
                headers: { 'x-api-key': process.env.SECRET_API_KEY },
                responseType: "arraybuffer",
            })

            const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;
            const uploadOptions = {
                transformation: [
                    { width, height, crop: "fill", gravity: "auto" },
                    ...(isTransparent ? [{ effect: 'background_removal', background_removal: 'remove_the_background' }] : []),
                    { quality: "auto:best" },
                    { fetch_format: "png" }
                ]
            }

            const { secure_url } = await cloudinary.uploader.upload(base64Image, uploadOptions)
            generatedImages.push(secure_url)

            await sql` INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${imagePrompt}, ${secure_url}, 'image', ${publish ?? false}) `;
        }

        res.json({
            success: true,
            content: count === 1 ? generatedImages[0] : generatedImages,
            message: count === 1 ? "Image generated successfully" : `${count} image variations generated successfully`
        });

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export const removeImageBackground = async (req, res) => {
    try {
        const { userId } = req.auth();
        const uploadedImages = req.files?.images || req.files?.image || (req.file ? [req.file] : []);
        const backgroundImage = req.files?.background_image?.[0];
        const {
            subject_type = 'Auto',
            edge_refinement = 'Auto',
            output_format = 'transparent_png',
            background_color = '#ffffff',
            shadow_preservation = true
        } = req.body;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions." })
        }

        if (!uploadedImages.length) {
            return res.json({ success: false, message: "Please upload at least one image." })
        }

        const processedImages = [];

        for (const image of uploadedImages) {
            let transformation = [
                {
                    effect: 'background_removal',
                    background_removal: 'remove_the_background'
                }
            ];

            if (edge_refinement === 'Hair/Fur') {
                transformation.push({ effect: "sharpen:30" });
            } else if (edge_refinement === 'Glass') {
                transformation.push({ effect: "improve" });
            } else if (edge_refinement === 'Crisp Product') {
                transformation.push({ effect: "sharpen:80" }, { effect: "auto_contrast" });
            }

            if (output_format === 'solid_color') {
                transformation.push({ background: background_color.replace('#', '') });
            } else if (output_format === 'custom_image' && backgroundImage) {
                const bgUpload = await cloudinary.uploader.upload(backgroundImage.path);
                transformation.push({ underlay: bgUpload.public_id, crop: "fill", gravity: "auto" });
            }

            if (shadow_preservation === 'true' || shadow_preservation === true) {
                transformation.push({ effect: "dropshadow:30" });
            }

            transformation.push({ quality: "auto:best" }, { fetch_format: "png" });

            const { secure_url } = await cloudinary.uploader.upload(image.path, { transformation })
            processedImages.push(secure_url)

            const prompt = `Remove background from image - Subject: ${subject_type}, Edge: ${edge_refinement}, Output: ${output_format}`;
            await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${secure_url}, 'image') `;
        }

        res.json({
            success: true,
            content: processedImages.length === 1 ? processedImages[0] : processedImages,
            message: processedImages.length === 1 ? "Background removed successfully" : `${processedImages.length} backgrounds removed successfully`
        });

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export const removeImageObject = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { object, texture_fill = true, edge_control = 50 } = req.body;
        const image = req.file;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions." })
        }

        if (!image) {
            return res.json({ success: false, message: "Please upload an image file." })
        }

        const objects = object
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 8);

        if (!objects.length) {
            return res.json({ success: false, message: "Please describe at least one object to remove." })
        }

        const { public_id } = await cloudinary.uploader.upload(image.path)

        const transformation = objects.map((item) => ({ effect: `gen_remove:${item}` }));

        if (texture_fill === 'true' || texture_fill === true) {
            transformation.push({ effect: "improve" });
        }

        if (Number(edge_control) > 60) {
            transformation.push({ effect: "sharpen:40" });
        }

        transformation.push({ quality: "auto:best" }, { fetch_format: "auto" });

        const imageUrl = cloudinary.url(public_id, {
            transformation,
            resource_type: 'image'
        })

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${`Removed ${objects.join(', ')} from image`}, ${imageUrl}, 'image')
        `;

        res.json({
            success: true,
            content: imageUrl,
            message: objects.length === 1 ? "Object removed successfully" : `${objects.length} objects removed successfully`
        });

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export const resumeReview = async (req, res) => {
    try {
        const { userId } = req.auth();
        const resume = req.file;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions." })
        }

        if (resume.size > 5 * 1024 * 1024) {
            return res.json({ success: false, message: "Resume file size exceeds allowed size (5MB)." })
        }

        const dataBuffer = fs.readFileSync(resume.path);
        const pdfData = await pdf(dataBuffer);

        const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume Content:\n\n${pdfData.text}`

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{
                role: "user",
                content: prompt,
            },
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        const content = response.choices[0].message.content

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')
        `;

        res.json({
            success: true,
            content,
            message: "Review resume successfully"
        });

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export const enhanceImage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const image = req.file;
        const { enhancement_type } = req.body;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions." })
        }

        if (image.size > 10 * 1024 * 1024) {
            return res.json({ success: false, message: "Image file size exceeds allowed size (10MB)." })
        }

        let transformation = {};

        switch (enhancement_type) {
            case 'upscale_2x':
                transformation = {
                    transformation: [
                        { quality: "auto:best" },
                        { fetch_format: "auto" },
                        { width: "iw_mul_2.0", crop: "scale" }
                    ]
                };
                break;
            case 'upscale_4x':
                transformation = {
                    transformation: [
                        { quality: "auto:best" },
                        { fetch_format: "auto" },
                        { width: "iw_mul_4.0", crop: "scale" }
                    ]
                };
                break;
            case 'sharpen':
                transformation = {
                    transformation: [
                        { effect: "sharpen:100" },
                        { quality: "auto:best" },
                        { fetch_format: "auto" }
                    ]
                };
                break;
            case 'denoise':
                transformation = {
                    transformation: [
                        { effect: "improve" },
                        { effect: "auto_contrast" },
                        { quality: "auto:best" },
                        { fetch_format: "auto" }
                    ]
                };
                break;
            case 'face_enhance':
                transformation = {
                    transformation: [
                        { effect: "gen_face_enhance" },
                        { quality: "auto:best" },
                        { fetch_format: "auto" }
                    ]
                };
                break;
            case 'low_light':
                transformation = {
                    transformation: [
                        { effect: "auto_brightness:90" },
                        { effect: "auto_contrast" },
                        { effect: "improve" },
                        { quality: "auto:best" },
                        { fetch_format: "auto" }
                    ]
                };
                break;
            case 'color_correction':
                transformation = {
                    transformation: [
                        { effect: "auto_color" },
                        { effect: "auto_contrast" },
                        { quality: "auto:best" },
                        { fetch_format: "auto" }
                    ]
                };
                break;
            case 'old_photo_restore':
                transformation = {
                    transformation: [
                        { effect: "gen_restore" },
                        { effect: "auto_color" },
                        { quality: "auto:best" },
                        { fetch_format: "auto" }
                    ]
                };
                break;
            case 'auto_enhance':
                transformation = {
                    transformation: [
                        { effect: "auto_brightness" },
                        { effect: "auto_contrast" },
                        { effect: "auto_color" },
                        { quality: "auto:best" },
                        { fetch_format: "auto" }
                    ]
                };
                break;
            default:
                transformation = {
                    transformation: [
                        { effect: "auto_brightness" },
                        { effect: "auto_contrast" },
                        { quality: "auto:best" },
                        { fetch_format: "auto" }
                    ]
                };
        }

        const { secure_url } = await cloudinary.uploader.upload(image.path, transformation)

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${`Enhanced image with ${enhancement_type}`}, ${secure_url}, 'image-enhancement')
        `;

        res.json({
            success: true,
            content: secure_url,
            message: "Image enhanced successfully"
        });

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export const generateLogo = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { company_name, industry, style, colors, description } = req.body;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions." })
        }

        const prompt = `Create a professional logo for a company called "${company_name}" in the ${industry} industry. Style: ${style}. Color scheme: ${colors}. Additional description: ${description}. The logo should be modern, clean, and suitable for business use. Make it vector-style and professional.`

        const formData = new FormData()
        formData.append('prompt', prompt)
        const { data } = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
            headers: { 'x-api-key': process.env.SECRET_API_KEY },
            responseType: "arraybuffer",
        })

        const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;

        const { secure_url } = await cloudinary.uploader.upload(base64Image, {
            transformation: [
                { quality: "auto:best" },
                { fetch_format: "auto" }
            ]
        })

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${secure_url}, 'logo')
        `;

        res.json({
            success: true,
            content: secure_url,
            message: "Logo generated successfully"
        });

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export const generateEmail = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { purpose, tone, recipient, context, subject, key_points } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue." })
        }

        const prompt = `Generate a ${tone} email for ${purpose}. 
        Recipient: ${recipient}
        Subject: ${subject}
        Context: ${context}
        Key points to include: ${key_points}
        
        Please generate both the subject line and the email body. Make it engaging, appropriate for the tone, and suitable for the purpose.`

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{
                role: "user",
                content: prompt,
            },
            ],
            temperature: 0.7,
            max_tokens: 800,
        });

        const content = response.choices[0].message.content

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'email');`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({
            success: true,
            message: "Email generated successfully",
            content: content,
            usage: plan !== 'premium' ? free_usage + 1 : 'unlimited'
        });

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export const generateReadme = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { project_title, description, tech_stack, installation, usage, features, license } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue." })
        }

        const prompt = `Generate a comprehensive README.md file for a project with the following details:
        
        Project Title: ${project_title}
        Description: ${description}
        Tech Stack: ${tech_stack}
        Installation Instructions: ${installation}
        Usage Instructions: ${usage}
        Features: ${features}
        License: ${license}
        
        Please include:
        - Appropriate badges for the tech stack
        - Table of contents
        - Proper markdown formatting
        - Professional structure
        - Contributing guidelines
        - Installation and usage sections
        - License section
        
        Make it clean, professional, and developer-friendly.`

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{
                role: "user",
                content: prompt,
            },
            ],
            temperature: 0.7,
            max_tokens: 1500,
        });

        const content = response.choices[0].message.content

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'readme');`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({
            success: true,
            message: "README generated successfully",
            content: content,
            usage: plan !== 'premium' ? free_usage + 1 : 'unlimited'
        });

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export const enhanceGrammar = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { text, tone, enhancement_level } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        console.log('Grammar Enhancement Request:', {
            userId,
            textLength: text ? text.length : 0,
            tone,
            enhancement_level,
            plan,
            free_usage
        });

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue." })
        }

        if (!text || !text.trim()) {
            return res.json({ success: false, message: "Please provide text to enhance." })
        }

        if (text.trim().length < 5) {
            return res.json({ success: false, message: "Text must be at least 5 characters long." })
        }

        const prompt = `Please enhance the following text by fixing grammar, improving readability, and adjusting the tone to be ${tone}. Enhancement level: ${enhancement_level}.
        
        Original text:
        "${text}"
        
        Please provide:
        1. The enhanced text
        2. A brief summary of the main improvements made
        
        Make sure the enhanced text maintains the original meaning while improving clarity, grammar, and tone.`

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{
                role: "user",
                content: prompt,
            },
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        const content = response.choices[0].message.content

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'grammar-enhancement');`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({
            success: true,
            message: "Text enhanced successfully",
            content: content,
            usage: plan !== 'premium' ? free_usage + 1 : 'unlimited'
        });

    } catch (error) {
        console.log('Grammar Enhancement Error:', error.message)
        res.json({ success: false, message: error.message })
    }
}

export const generateCoverLetter = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { job_title, company_name, job_description, resume_highlights, tone, experience_level } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue." })
        }

        const prompt = `Generate a professional cover letter for a ${job_title} position at ${company_name}. 
        
        Job Description/Requirements: ${job_description}
        Resume Highlights/Key Skills: ${resume_highlights}
        Tone: ${tone}
        Experience Level: ${experience_level}
        
        Please create a compelling cover letter that:
        - Opens with a strong hook
        - Highlights relevant experience and skills
        - Shows knowledge of the company/role
        - Demonstrates value proposition
        - Includes a strong closing call-to-action
        - Maintains the specified tone throughout
        - Is appropriate for the experience level
        
        Format it properly for a professional cover letter.`

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{
                role: "user",
                content: prompt,
            },
            ],
            temperature: 0.7,
            max_tokens: 1200,
        });

        const content = response.choices[0].message.content

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'cover-letter');`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({
            success: true,
            message: "Cover letter generated successfully",
            content: content,
            usage: plan !== 'premium' ? free_usage + 1 : 'unlimited'
        });

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export const imageToText = async (req, res) => {
    try {
        const { userId } = req.auth();
        const image = req.file;
        const { extract_format, language } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue." })
        }

        if (!image) {
            return res.json({ success: false, message: "Please upload an image file." })
        }

        if (image.size > 10 * 1024 * 1024) {
            return res.json({ success: false, message: "Image file size exceeds allowed size (10MB)." })
        }

        // Upload image to Cloudinary first
        const { secure_url } = await cloudinary.uploader.upload(image.path)

        // Use Tesseract.js for actual OCR with error handling
        let extractedText = '';

        try {
            const { recognize } = await import('tesseract.js');

            // Perform OCR on the image with basic options
            const result = await recognize(secure_url, 'eng', {
                logger: m => console.log(m) // Optional: log progress
            });

            extractedText = result.data.text.trim();

        } catch (ocrError) {
            console.log('OCR processing failed:', ocrError.message);
            // Fallback: provide a helpful error message
            return res.json({
                success: false,
                message: "OCR processing failed. Please ensure the image contains clear, readable text and try again."
            });
        }

        if (!extractedText || extractedText.length === 0) {
            return res.json({
                success: false,
                message: "No text could be extracted from this image. Please make sure the image contains readable text."
            });
        }

        // Format the extracted text based on the requested format
        if (extract_format && extract_format !== 'plain text') {
            const formatPrompt = `Please format the following OCR-extracted text according to the specified format:

Original extracted text:
${extractedText}

Format the text as: ${extract_format}

Instructions:
${getFormatInstructions(extract_format)}

Only return the formatted text, no explanations.`;

            const response = await AI.chat.completions.create({
                model: "gemini-2.0-flash",
                messages: [{
                    role: "user",
                    content: formatPrompt
                }],
                temperature: 0.1,
                max_tokens: 2000,
            });

            const formattedText = response.choices[0].message.content;
            if (formattedText && formattedText.trim().length > 0) {
                extractedText = formattedText.trim();
            }
        }

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${`OCR text extraction from image - Format: ${extract_format || 'plain text'}, Language: ${language || 'English'}`}, ${extractedText}, 'image-to-text')
        `;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({
            success: true,
            content: extractedText,
            image_url: secure_url,
            message: "Text extracted successfully from image",
            usage: plan !== 'premium' ? free_usage + 1 : 'unlimited'
        });

    } catch (error) {
        console.log('Image to Text Error:', error.message)
        res.json({ success: false, message: `OCR Error: ${error.message}` })
    }
}

// Helper function to get format-specific instructions
function getFormatInstructions(format) {
    switch (format) {
        case 'code format':
            return 'Format as code with proper indentation, syntax highlighting structure, and preserve any programming language syntax. Maintain line breaks and indentation.';
        case 'structured markdown':
            return 'Format with proper markdown syntax including headers, lists, emphasis, and code blocks where appropriate.';
        case 'formatted document':
            return 'Format as a well-structured document with proper paragraphs, spacing, and organization.';
        case 'table format':
            return 'If the text appears to be tabular data, format it as a proper table. Otherwise, organize the text in a structured way.';
        case 'bullet points':
            return 'Organize the text into logical bullet points and sub-points with proper hierarchy.';
        default:
            return 'Clean up the text and present it in a readable format.';
    }
}


// Photo Restoration Controller
export const restorePhoto = async (req, res) => {
    try {
        const { userId } = req.auth();
        const image = req.file;
        const { restoration_type } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions." })
        }

        if (!image) {
            return res.json({ success: false, message: "Please upload an image file." })
        }

        if (image.size > 10 * 1024 * 1024) {
            return res.json({ success: false, message: "Image file size exceeds allowed size (10MB)." })
        }

        let transformation = {};
        let prompt = '';
        switch (restoration_type) {
            case 'scratch_removal':
                transformation = {
                    transformation: [
                        { effect: "gen_restore:scratches" },
                        { quality: "auto:best" },
                        { fetch_format: "auto" }
                    ]
                };
                prompt = 'Remove scratches and creases from photo';
                break;
            case 'colorize':
                transformation = {
                    transformation: [
                        { effect: "gen_colorize" },
                        { quality: "auto:best" },
                        { fetch_format: "auto" }
                    ]
                };
                prompt = 'Colorize black & white photo';
                break;
            case 'deblur':
                transformation = {
                    transformation: [
                        { effect: "gen_deblur" },
                        { quality: "auto:best" },
                        { fetch_format: "auto" }
                    ]
                };
                prompt = 'Enhance sharpness and detail in blurred photo';
                break;
            case 'face_repair':
                transformation = {
                    transformation: [
                        { effect: "gen_face_enhance" },
                        { quality: "auto:best" },
                        { fetch_format: "auto" }
                    ]
                };
                prompt = 'Repair and enhance face clarity for vintage portrait';
                break;
            default:
                return res.json({ success: false, message: "Invalid restoration type." });
        }

        const { secure_url } = await cloudinary.uploader.upload(image.path, transformation);

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${secure_url}, 'photo-restoration') `;

        res.json({
            success: true,
            content: secure_url,
            message: "Photo restored successfully",
            restoration_type
        });

    } catch (error) {
        console.log('Photo Restoration Error:', error.message)
        res.json({ success: false, message: error.message })
    }
}

// Background Blur (DSLR Effect) Controller
export const blurBackground = async (req, res) => {
    try {
        const { userId } = req.auth();
        const image = req.file;
        const {
            blur_intensity = 50,
            bokeh_style = 'soft',
            subject_mode = 'portrait',
            preset = 'none',
            replace_background = false,
            background_color = '#000000',
            background_scene = 'none',
            custom_bokeh_prompt = '',
            edge_refinement = 'hair',
            focus_control = 65
        } = req.body;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions." })
        }

        if (!image) {
            return res.json({ success: false, message: "Please upload an image file." })
        }

        if (image.size > 10 * 1024 * 1024) {
            return res.json({ success: false, message: "Image file size exceeds allowed size (10MB)." })
        }

        // Calculate blur strength based on intensity (1-100) -> Cloudinary blur (100-2000)
        const intensity = parseInt(blur_intensity) || 50;
        const blurStrength = Math.round(100 + (intensity * 19)); // Maps 1-100 to 100-2000

        // Build transformation based on options
        let transformation = [];

        // Apply portrait preset adjustments
        switch (preset) {
            case 'studio':
                transformation.push(
                    { effect: "auto_brightness:80" },
                    { effect: "auto_contrast" },
                    { effect: "sharpen:50" }
                );
                break;
            case 'outdoor':
                transformation.push(
                    { effect: "auto_brightness" },
                    { effect: "saturation:10" },
                    { effect: "vibrance:20" }
                );
                break;
            case 'office':
                transformation.push(
                    { effect: "auto_brightness:70" },
                    { effect: "auto_contrast" },
                    { effect: "improve" }
                );
                break;
        }

        // Background replacement or blur effect
        const isReplacingBackground = replace_background === 'true' || replace_background === true;

        if (isReplacingBackground) {
            // Remove background completely and add solid color
            transformation.push(
                { effect: 'background_removal' }
            );

            // Add background color
            const colorHex = background_color ? background_color.replace('#', '') : '000000';
            transformation.push({ background: colorHex });
        } else {
            // Use gen_background_replace to blur the background while keeping the subject
            // This creates a DSLR-like depth of field effect
            const blurPrompt = bokeh_style === 'custom' && custom_bokeh_prompt
                ? custom_bokeh_prompt
                : bokeh_style === 'cinematic'
                ? 'soft blurred cinematic background with bokeh lights'
                : bokeh_style === 'circular'
                    ? 'smooth blurred background with circular bokeh'
                    : 'softly blurred dreamy background';

            transformation.push(
                { effect: `gen_background_replace:prompt_${blurPrompt}` }
            );

            // Add vignette for cinematic style
            if (bokeh_style === 'cinematic') {
                transformation.push({ effect: 'vignette:30' });
            }
        }

        // Subject mode optimizations
        if (subject_mode === 'portrait') {
            transformation.push(
                { effect: "sharpen:30" }
            );
        } else if (subject_mode === 'product') {
            transformation.push(
                { effect: "sharpen:50" },
                { effect: "auto_contrast" }
            );
        }

        if (edge_refinement === 'hair') {
            transformation.push({ effect: "sharpen:20" });
        } else if (edge_refinement === 'product') {
            transformation.push({ effect: "sharpen:60" });
        }

        const focusStrength = clampNumber(focus_control, 1, 100, 65);
        if (focusStrength > 75) {
            transformation.push({ effect: "sharpen:40" });
        }

        // Add quality settings
        transformation.push(
            { quality: "auto:best" },
            { fetch_format: "auto" }
        );

        // Upload with transformations applied
        const { secure_url } = await cloudinary.uploader.upload(image.path, {
            transformation: transformation
        });

        // Also upload original for comparison
        const originalUpload = await cloudinary.uploader.upload(image.path);

        // Construct description for database
        const description = `Background blur effect - Intensity: ${intensity}%, Style: ${bokeh_style}, Mode: ${subject_mode}${preset !== 'none' ? `, Preset: ${preset}` : ''}${isReplacingBackground ? ', Background replaced' : ''}`;

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${description}, ${secure_url}, 'background-blur') `;

        res.json({
            success: true,
            content: secure_url,
            original: originalUpload.secure_url,
            message: "Background blur applied successfully",
            settings: {
                blur_intensity: intensity,
                bokeh_style,
                subject_mode,
                preset,
                replace_background: isReplacingBackground,
                edge_refinement,
                focus_control: focusStrength
            }
        });

    } catch (error) {
        console.log('Background Blur Error:', error.message)
        res.json({ success: false, message: error.message })
    }
}


